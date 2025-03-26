const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { pool } = require('../utils/db');

// Aplicar middleware de autenticación y rol de admin a todas las rutas
router.use(authMiddleware.verifyToken);
router.use(authMiddleware.isAdmin);

// Obtener todos los usuarios
router.get('/users', async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users'
    );
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
});

// Obtener todos los registros de asistencia
router.get('/attendance', async (req, res) => {
  try {
    const [records] = await pool.query(
      `SELECT a.*, u.name, u.email 
       FROM attendance a 
       JOIN users u ON a.user_id = u.id 
       ORDER BY a.check_in DESC`
    );
    res.json(records);
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
    const [todayStats] = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN check_in IS NOT NULL THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN check_in IS NULL THEN 1 ELSE 0 END) as absent
       FROM attendance 
       WHERE DATE(check_in) = ?`,
      [today]
    );

    // Obtener total de usuarios
    const [userCount] = await pool.query(
      'SELECT COUNT(*) as total FROM users WHERE role = "user"'
    );

    res.json({
      today: todayStats[0],
      users: userCount[0]
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
});

module.exports = router;
