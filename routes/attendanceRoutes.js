const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { pool } = require('../utils/db');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware.verifyToken);

// Registrar entrada, salida o almuerzo
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { action } = req.body;
    const now = new Date();

    if (!action) {
      return res.status(400).json({ message: 'Acción requerida' });
    }

    // Obtener el registro de hoy
    const [records] = await pool.query(
      'SELECT * FROM attendance WHERE user_id = ? AND DATE(check_in) = CURDATE()',
      [userId]
    );

    switch (action) {
      case 'entry':
        if (records.length > 0) {
          return res.status(400).json({ message: 'Ya registraste tu entrada hoy' });
        }
        await pool.query(
          'INSERT INTO attendance (user_id, check_in) VALUES (?, ?)',
          [userId, now]
        );
        return res.json({ message: 'Entrada registrada exitosamente' });

      case 'exit':
        if (records.length === 0) {
          return res.status(400).json({ message: 'No has registrado entrada hoy' });
        }
        if (records[0].check_out) {
          return res.status(400).json({ message: 'Ya registraste tu salida hoy' });
        }
        await pool.query(
          'UPDATE attendance SET check_out = ? WHERE id = ?',
          [now, records[0].id]
        );
        return res.json({ message: 'Salida registrada exitosamente' });

      case 'lunch_start':
        if (records.length === 0) {
          return res.status(400).json({ message: 'No has registrado entrada hoy' });
        }
        if (records[0].lunch_start) {
          return res.status(400).json({ message: 'Ya registraste el inicio de tu almuerzo' });
        }
        await pool.query(
          'UPDATE attendance SET lunch_start = ? WHERE id = ?',
          [now, records[0].id]
        );
        return res.json({ message: 'Inicio de almuerzo registrado exitosamente' });

      case 'lunch_end':
        if (records.length === 0) {
          return res.status(400).json({ message: 'No has registrado entrada hoy' });
        }
        if (!records[0].lunch_start) {
          return res.status(400).json({ message: 'No has registrado el inicio de tu almuerzo' });
        }
        if (records[0].lunch_end) {
          return res.status(400).json({ message: 'Ya registraste el fin de tu almuerzo' });
        }
        await pool.query(
          'UPDATE attendance SET lunch_end = ? WHERE id = ?',
          [now, records[0].id]
        );
        return res.json({ message: 'Fin de almuerzo registrado exitosamente' });

      default:
        return res.status(400).json({ message: 'Acción no válida' });
    }
  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    res.status(500).json({ message: 'Error al registrar asistencia', error: error.message });
  }
});

// Obtener registros del usuario actual
router.get('/my-records', async (req, res) => {
  try {
    const userId = req.user.id;
    const [records] = await pool.query(
      'SELECT * FROM attendance WHERE user_id = ? ORDER BY check_in DESC',
      [userId]
    );
    res.json(records);
  } catch (error) {
    console.error('Error al obtener registros:', error);
    res.status(500).json({ message: 'Error al obtener registros', error: error.message });
  }
});

module.exports = router;