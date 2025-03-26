const { queryDatabase } = require('../utils/db');

const getButtonControls = async (req, res) => {
  try {
    const { userId, date } = req.query;

    if (!userId || !date) {
      return res.status(400).json({ message: 'Se requiere userId y date' });
    }

    // Verificar si existe un control para la fecha específica
    const controls = await queryDatabase(
      'SELECT * FROM button_controls WHERE user_id = ? AND date = ?',
      [userId, date]
    );

    // Si no existe, crear uno con valores predeterminados
    if (!controls || controls.length === 0) {
      await queryDatabase(
        `INSERT INTO button_controls 
         (user_id, date, can_mark_entry, can_mark_exit, can_mark_lunch_start, can_mark_lunch_end)
         VALUES (?, ?, true, true, true, true)`,
        [userId, date]
      );

      return res.json({
        can_mark_entry: true,
        can_mark_exit: true,
        can_mark_lunch_start: true,
        can_mark_lunch_end: true
      });
    }

    res.json(controls[0]);
  } catch (error) {
    console.error('Error al obtener control de botones:', error);
    res.status(500).json({ message: 'Error al obtener control de botones' });
  }
};

const updateButtonControls = async (req, res) => {
  try {
    const { userId, date } = req.params;
    const { 
      can_mark_entry, 
      can_mark_exit, 
      can_mark_lunch_start, 
      can_mark_lunch_end 
    } = req.body;

    if (!userId || !date) {
      return res.status(400).json({ message: 'Se requiere userId y date' });
    }

    // Verificar si el usuario existe
    const users = await queryDatabase('SELECT id FROM users WHERE id = ?', [userId]);
    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar o insertar control de botones
    await queryDatabase(
      `INSERT INTO button_controls 
       (user_id, date, can_mark_entry, can_mark_exit, can_mark_lunch_start, can_mark_lunch_end)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       can_mark_entry = VALUES(can_mark_entry),
       can_mark_exit = VALUES(can_mark_exit),
       can_mark_lunch_start = VALUES(can_mark_lunch_start),
       can_mark_lunch_end = VALUES(can_mark_lunch_end)`,
      [
        userId, 
        date, 
        can_mark_entry, 
        can_mark_exit, 
        can_mark_lunch_start, 
        can_mark_lunch_end
      ]
    );

    res.json({ message: 'Control de botones actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar control de botones:', error);
    res.status(500).json({ message: 'Error al actualizar control de botones' });
  }
};

const getAllUserControls = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Se requiere date' });
    }

    // Obtener todos los controles de botones para la fecha específica
    const controls = await queryDatabase(
      `SELECT 
        bc.*,
        u.email,
        u.role,
        a.entry_time,
        a.exit_time,
        a.lunch_start,
        a.lunch_end
       FROM button_controls bc
       JOIN users u ON bc.user_id = u.id
       LEFT JOIN attendance a ON bc.user_id = a.user_id AND DATE(a.entry_time) = bc.date
       WHERE bc.date = ?`,
      [date]
    );

    res.json(controls);
  } catch (error) {
    console.error('Error al obtener controles de usuarios:', error);
    res.status(500).json({ message: 'Error al obtener controles de usuarios' });
  }
};

module.exports = {
  getButtonControls,
  updateButtonControls,
  getAllUserControls
};
