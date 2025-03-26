const { pool } = require('../utils/db');

const attendanceController = {
  // Registrar entrada
  async registerEntry(req, res) {
    try {
      const userId = req.user.id;
      const now = new Date();

      // Verificar si ya existe un registro para hoy
      const [existingRecord] = await pool.query(
        'SELECT * FROM attendance WHERE user_id = ? AND DATE(check_in) = CURDATE()',
        [userId]
      );

      if (existingRecord.length > 0) {
        return res.status(400).json({ message: 'Ya registraste tu entrada hoy' });
      }

      // Registrar entrada
      await pool.query(
        'INSERT INTO attendance (user_id, check_in, status) VALUES (?, ?, ?)',
        [userId, now, 'present']
      );

      res.json({ message: 'Entrada registrada exitosamente' });
    } catch (error) {
      console.error('Error al registrar entrada:', error);
      res.status(500).json({ message: 'Error al registrar entrada', error: error.message });
    }
  },

  // Registrar salida
  async registerExit(req, res) {
    try {
      const userId = req.user.id;
      const now = new Date();

      // Buscar el registro de hoy
      const [record] = await pool.query(
        'SELECT * FROM attendance WHERE user_id = ? AND DATE(check_in) = CURDATE() AND check_out IS NULL',
        [userId]
      );

      if (record.length === 0) {
        return res.status(400).json({ message: 'No hay registro de entrada para hoy' });
      }

      // Registrar salida
      await pool.query(
        'UPDATE attendance SET check_out = ? WHERE id = ?',
        [now, record[0].id]
      );

      res.json({ message: 'Salida registrada exitosamente' });
    } catch (error) {
      console.error('Error al registrar salida:', error);
      res.status(500).json({ message: 'Error al registrar salida', error: error.message });
    }
  },

  // Registrar inicio de almuerzo
  async registerLunchStart(req, res) {
    try {
      const userId = req.user.id;
      const now = new Date();

      // Buscar el registro de hoy
      const [record] = await pool.query(
        'SELECT * FROM attendance WHERE user_id = ? AND DATE(check_in) = CURDATE() AND lunch_start IS NULL',
        [userId]
      );

      if (record.length === 0) {
        return res.status(400).json({ message: 'No hay registro de entrada para hoy' });
      }

      // Registrar inicio de almuerzo
      await pool.query(
        'UPDATE attendance SET lunch_start = ? WHERE id = ?',
        [now, record[0].id]
      );

      res.json({ message: 'Inicio de almuerzo registrado exitosamente' });
    } catch (error) {
      console.error('Error al registrar inicio de almuerzo:', error);
      res.status(500).json({ message: 'Error al registrar inicio de almuerzo', error: error.message });
    }
  },

  // Registrar fin de almuerzo
  async registerLunchEnd(req, res) {
    try {
      const userId = req.user.id;
      const now = new Date();

      // Buscar el registro de hoy
      const [record] = await pool.query(
        'SELECT * FROM attendance WHERE user_id = ? AND DATE(check_in) = CURDATE() AND lunch_start IS NOT NULL AND lunch_end IS NULL',
        [userId]
      );

      if (record.length === 0) {
        return res.status(400).json({ message: 'No hay registro de inicio de almuerzo' });
      }

      // Registrar fin de almuerzo
      await pool.query(
        'UPDATE attendance SET lunch_end = ? WHERE id = ?',
        [now, record[0].id]
      );

      res.json({ message: 'Fin de almuerzo registrado exitosamente' });
    } catch (error) {
      console.error('Error al registrar fin de almuerzo:', error);
      res.status(500).json({ message: 'Error al registrar fin de almuerzo', error: error.message });
    }
  },

  // Obtener registros de un usuario específico
  async getUserAttendance(userId) {
    try {
      const [records] = await pool.query(
        `SELECT a.*, u.name, u.email 
         FROM attendance a 
         JOIN users u ON a.user_id = u.id 
         WHERE a.user_id = ? 
         ORDER BY a.check_in DESC`,
        [userId]
      );
      return records;
    } catch (error) {
      console.error('Error al obtener registros de usuario:', error);
      throw error;
    }
  },

  // Obtener todos los registros (para admin)
  async getAllAttendance() {
    try {
      const [records] = await pool.query(
        `SELECT a.*, u.name, u.email 
         FROM attendance a 
         JOIN users u ON a.user_id = u.id 
         ORDER BY a.check_in DESC`
      );
      return records;
    } catch (error) {
      console.error('Error al obtener todos los registros:', error);
      throw error;
    }
  }
};

module.exports = attendanceController;