const { pool } = require('../utils/db');

// Obtener controles de botones para un usuario y fecha específica
const getButtonControls = async (req, res) => {
  const { userId, date } = req.query;

  if (!userId || !date) {
    return res.status(400).json({ message: 'Se requiere userId y date' });
  }

  try {
    // Verificar que el usuario existe
    const userQuery = 'SELECT id FROM users WHERE id = ?';
    const [userExists] = await pool.query(userQuery, [userId]);
    
    if (userExists.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar que el usuario solicitando los datos sea el mismo usuario o un admin
    if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ message: 'No tienes permiso para ver estos datos' });
    }

    const query = `
      SELECT * FROM button_controls 
      WHERE user_id = ? AND date = ?
    `;
    
    const [results] = await pool.query(query, [userId, date]);

    if (results.length === 0) {
      // Si no existe registro, crear uno con valores por defecto
      const insertQuery = `
        INSERT INTO button_controls (user_id, date, can_mark_entry, can_mark_exit, can_mark_lunch_start, can_mark_lunch_end)
        VALUES (?, ?, 1, 1, 1, 1)
      `;
      await pool.query(insertQuery, [userId, date]);
      
      return res.json({
        can_mark_entry: true,
        can_mark_exit: true,
        can_mark_lunch_start: true,
        can_mark_lunch_end: true
      });
    }

    // Convertir los valores numéricos a booleanos
    const controls = {
      can_mark_entry: Boolean(results[0].can_mark_entry),
      can_mark_exit: Boolean(results[0].can_mark_exit),
      can_mark_lunch_start: Boolean(results[0].can_mark_lunch_start),
      can_mark_lunch_end: Boolean(results[0].can_mark_lunch_end)
    };

    res.json(controls);
  } catch (error) {
    console.error('Error al obtener estado de botones:', error);
    res.status(500).json({ message: 'Error al obtener estado de los botones' });
  }
};

// Actualizar controles de botones para un usuario y fecha específica
const updateButtonControls = async (req, res) => {
  const { userId, date, can_mark_entry, can_mark_exit, can_mark_lunch_start, can_mark_lunch_end } = req.body;

  if (!userId || !date) {
    return res.status(400).json({ message: 'Se requiere userId y date' });
  }

  try {
    // Verificar que el usuario actualizando sea admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo los administradores pueden actualizar los controles' });
    }

    // Verificar que el usuario existe
    const userQuery = 'SELECT id FROM users WHERE id = ?';
    const [userExists] = await pool.query(userQuery, [userId]);
    
    if (userExists.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si ya existe un registro para esta fecha
    const checkQuery = 'SELECT id FROM button_controls WHERE user_id = ? AND date = ?';
    const [existingControl] = await pool.query(checkQuery, [userId, date]);

    let query;
    let params;

    if (existingControl.length === 0) {
      // Si no existe, insertar nuevo registro
      query = `
        INSERT INTO button_controls (user_id, date, can_mark_entry, can_mark_exit, can_mark_lunch_start, can_mark_lunch_end)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      params = [
        userId,
        date,
        can_mark_entry ? 1 : 0,
        can_mark_exit ? 1 : 0,
        can_mark_lunch_start ? 1 : 0,
        can_mark_lunch_end ? 1 : 0
      ];
    } else {
      // Si existe, actualizar
      query = `
        UPDATE button_controls 
        SET can_mark_entry = ?,
            can_mark_exit = ?,
            can_mark_lunch_start = ?,
            can_mark_lunch_end = ?
        WHERE user_id = ? AND date = ?
      `;
      params = [
        can_mark_entry ? 1 : 0,
        can_mark_exit ? 1 : 0,
        can_mark_lunch_start ? 1 : 0,
        can_mark_lunch_end ? 1 : 0,
        userId,
        date
      ];
    }

    await pool.query(query, params);

    res.json({ 
      message: 'Estado de botones actualizado correctamente',
      controls: {
        can_mark_entry: Boolean(can_mark_entry),
        can_mark_exit: Boolean(can_mark_exit),
        can_mark_lunch_start: Boolean(can_mark_lunch_start),
        can_mark_lunch_end: Boolean(can_mark_lunch_end)
      }
    });
  } catch (error) {
    console.error('Error al actualizar estado de botones:', error);
    res.status(500).json({ message: 'Error al actualizar estado de los botones' });
  }
};

module.exports = {
  getButtonControls,
  updateButtonControls
};
