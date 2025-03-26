const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { Pool } = require('pg');

// Configurar el pool de conexiones
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Aplicar middleware de autenticación y rol de admin a todas las rutas
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.isAdmin);

// Obtener todos los usuarios
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users'
    );
    
    // Obtener el estado de los botones para cada usuario
    const usersWithButtons = await Promise.all(result.rows.map(async (user) => {
      const buttonResult = await pool.query(
        'SELECT check_in_enabled, check_out_enabled FROM button_controls WHERE user_id = $1',
        [user.id]
      );
      
      return {
        ...user,
        checkInEnabled: buttonResult.rows[0]?.check_in_enabled ?? true,
        checkOutEnabled: buttonResult.rows[0]?.check_out_enabled ?? true
      };
    }));
    
    res.json(usersWithButtons);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
});

// Toggle button state
router.post('/toggle-button', async (req, res) => {
  const { userId, buttonType } = req.body;
  
  if (!userId || !buttonType) {
    return res.status(400).json({ message: 'Se requiere userId y buttonType' });
  }
  
  const columnName = buttonType === 'checkIn' ? 'check_in_enabled' : 'check_out_enabled';
  
  try {
    // Crear la tabla si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS button_controls (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id),
        check_in_enabled BOOLEAN DEFAULT true,
        check_out_enabled BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Insertar o actualizar el control
    const result = await pool.query(`
      INSERT INTO button_controls (user_id, ${columnName})
      VALUES ($1, NOT COALESCE((SELECT ${columnName} FROM button_controls WHERE user_id = $1), true))
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        ${columnName} = NOT COALESCE(button_controls.${columnName}, true),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `, [userId]);
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al cambiar estado del botón:', error);
    res.status(500).json({ message: 'Error al cambiar estado del botón', error: error.message });
  }
});

// Obtener todos los registros de asistencia
router.get('/attendance', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name, u.email 
       FROM attendance a 
       JOIN users u ON a.user_id = u.id 
       ORDER BY a.check_in DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener registros:', error);
    res.status(500).json({ message: 'Error al obtener registros', error: error.message });
  }
});

// Obtener estadísticas del dashboard
router.get('/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Obtener estadísticas de asistencia de hoy
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN check_in IS NOT NULL THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN check_in IS NULL THEN 1 ELSE 0 END) as absent
       FROM attendance 
       WHERE DATE(check_in) = $1`,
      [today]
    );
    
    // Obtener total de usuarios
    const userResult = await pool.query('SELECT COUNT(*) as total FROM users');
    
    res.json({
      attendance: result.rows[0],
      totalUsers: userResult.rows[0].total
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
});

// Obtener alertas (por ejemplo, usuarios que no han marcado entrada)
router.get('/alerts', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await pool.query(
      `SELECT u.name, u.email 
       FROM users u 
       LEFT JOIN attendance a ON u.id = a.user_id AND DATE(a.check_in) = $1
       WHERE a.id IS NULL`,
      [today]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({ message: 'Error al obtener alertas', error: error.message });
  }
});

module.exports = router;
