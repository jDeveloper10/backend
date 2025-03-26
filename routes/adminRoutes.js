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
  console.log('GET /admin/users - Iniciando consulta');
  try {
    console.log('Consultando usuarios en la base de datos...');
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users'
    );
    console.log('Usuarios encontrados:', result.rows.length);
    
    // Por ahora, asumimos que todos los botones están habilitados
    const usersWithButtons = result.rows.map(user => ({
      ...user,
      checkInEnabled: true,
      checkOutEnabled: true
    }));
    
    console.log('Respuesta exitosa con', usersWithButtons.length, 'usuarios');
    res.json(usersWithButtons);
  } catch (error) {
    console.error('Error detallado al obtener usuarios:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Error al obtener usuarios', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Toggle button state
router.post('/toggle-button', async (req, res) => {
  const { userId, buttonType } = req.body;
  
  if (!userId || !buttonType) {
    return res.status(400).json({ message: 'Se requiere userId y buttonType' });
  }
  
  // Por ahora, solo retornamos una respuesta simulada
  res.json({
    user_id: userId,
    check_in_enabled: buttonType === 'checkIn' ? false : true,
    check_out_enabled: buttonType === 'checkOut' ? false : true
  });
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
