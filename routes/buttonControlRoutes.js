const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { pool } = require('../utils/db');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware.verifyToken);

// Ruta para obtener el estado actual de los botones
router.get('/status', async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Obtener el registro de asistencia de hoy
    const [records] = await pool.query(
      'SELECT * FROM attendance WHERE user_id = ? AND DATE(check_in) = ?',
      [userId, today]
    );

    // Determinar el estado de los botones
    const buttonState = {
      entry: !records.length,
      exit: records.length > 0 && !records[0].check_out,
      lunch_start: records.length > 0 && !records[0].lunch_start && !records[0].check_out,
      lunch_end: records.length > 0 && records[0].lunch_start && !records[0].lunch_end && !records[0].check_out
    };

    res.json(buttonState);
  } catch (error) {
    console.error('Error al obtener estado de botones:', error);
    res.status(500).json({ message: 'Error al obtener estado de botones', error: error.message });
  }
});

module.exports = router;
