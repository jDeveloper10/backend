const bcrypt = require('bcrypt');
const { queryDatabase } = require('../utils/db');

// Obtener estadísticas del dashboard
const getDashboardStats = async (req, res) => {
  try {
    const stats = {
      totalEmployees: 0,
      presentToday: 0,
      lateToday: 0,
      absentToday: 0
    };

    // Obtener total de empleados
    const employeesResult = await queryDatabase(
      'SELECT COUNT(*) as total FROM users WHERE role = ?',
      ['user']
    );
    stats.totalEmployees = employeesResult[0].total;

    // Obtener estadísticas de asistencia del día
    const today = new Date().toISOString().split('T')[0];
    const attendanceResult = await queryDatabase(`
      SELECT 
        COUNT(DISTINCT u.id) as total_employees,
        COUNT(DISTINCT CASE WHEN a.entry_time IS NOT NULL THEN u.id END) as present,
        COUNT(DISTINCT CASE 
          WHEN a.entry_time IS NOT NULL 
          AND a.entry_time > CONCAT(?, ' ', s.start_time) 
          THEN u.id END) as late,
        COUNT(DISTINCT CASE WHEN a.entry_time IS NULL THEN u.id END) as absent
      FROM users u
      LEFT JOIN attendance a ON u.id = a.user_id AND DATE(a.entry_time) = ?
      LEFT JOIN schedules s ON u.id = s.user_id
      WHERE u.role = 'user'
    `, [today, today]);

    stats.presentToday = attendanceResult[0].present || 0;
    stats.lateToday = attendanceResult[0].late || 0;
    stats.absentToday = attendanceResult[0].absent || 0;

    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};

// Obtener alertas del dashboard
const getDashboardAlerts = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const alerts = await queryDatabase(`
      SELECT 
        u.name,
        a.entry_time,
        s.start_time as scheduled_time,
        CASE
          WHEN a.entry_time IS NULL THEN 'Ausente'
          WHEN a.entry_time > CONCAT(?, ' ', s.start_time) THEN 'Tardanza'
          ELSE 'A tiempo'
        END as status
      FROM users u
      LEFT JOIN attendance a ON u.id = a.user_id AND DATE(a.entry_time) = ?
      LEFT JOIN schedules s ON u.id = s.user_id
      WHERE u.role = 'user'
      HAVING status IN ('Ausente', 'Tardanza')
      ORDER BY 
        FIELD(status, 'Ausente', 'Tardanza'),
        a.entry_time DESC
    `, [today, today]);

    res.json(alerts);
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({ message: 'Error al obtener alertas' });
  }
};

// Obtener lista de empleados
const getEmployees = async (req, res) => {
  try {
    const employees = await queryDatabase(`
      SELECT u.id, u.name, u.email, 
             s.start_time, s.end_time, s.lunch_start, s.lunch_end
      FROM users u
      LEFT JOIN schedules s ON u.id = s.user_id
      WHERE u.role = 'user'
      ORDER BY u.name
    `);

    res.json(employees);
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ message: 'Error al obtener empleados' });
  }
};

// Crear empleado
const createEmployee = async (req, res) => {
  const { name, email, password, schedule } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  try {
    // Verificar si el correo ya existe
    const existingUser = await queryDatabase('SELECT id FROM users WHERE email = ?', [email]);

    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Iniciar transacción
    await queryDatabase('START TRANSACTION');

    try {
      // Insertar usuario
      const userResult = await queryDatabase(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, 'user']
      );
      const userId = userResult.insertId;

      // Insertar horario
      await queryDatabase(`
        INSERT INTO schedules (
          user_id, 
          start_time, 
          end_time, 
          lunch_start, 
          lunch_end
        ) VALUES (?, ?, ?, ?, ?)
      `, [
        userId,
        schedule?.startTime || '09:00',
        schedule?.endTime || '18:00',
        schedule?.lunchStart || '13:00',
        schedule?.lunchEnd || '14:00'
      ]);

      // Confirmar transacción
      await queryDatabase('COMMIT');

      res.status(201).json({
        message: 'Empleado creado exitosamente',
        id: userId
      });
    } catch (error) {
      // Revertir transacción en caso de error
      await queryDatabase('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error al crear empleado:', error);
    res.status(500).json({ message: 'Error al crear empleado' });
  }
};

// Obtener horario de empleado
const getEmployeeSchedule = async (req, res) => {
  const { id } = req.params;

  try {
    const schedule = await queryDatabase(
      'SELECT * FROM schedules WHERE user_id = ?',
      [id]
    );

    if (!schedule || schedule.length === 0) {
      // Devolver un horario por defecto
      return res.json({
        user_id: id,
        start_time: '09:00:00',
        end_time: '18:00:00',
        lunch_start: '13:00:00',
        lunch_end: '14:00:00'
      });
    }

    res.json(schedule[0]);
  } catch (error) {
    console.error('Error al obtener horario:', error);
    res.status(500).json({ message: 'Error al obtener horario' });
  }
};

// Actualizar horario de empleado
const updateEmployeeSchedule = async (req, res) => {
  const { id } = req.params;
  const { startTime, endTime, lunchStart, lunchEnd } = req.body;

  try {
    await queryDatabase(`
      UPDATE schedules 
      SET start_time = ?, 
          end_time = ?, 
          lunch_start = ?, 
          lunch_end = ?
      WHERE user_id = ?
    `, [startTime, endTime, lunchStart, lunchEnd, id]);

    res.json({ message: 'Horario actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar horario:', error);
    res.status(500).json({ message: 'Error al actualizar horario' });
  }
};

// Obtener asistencia por fecha
const getAttendanceByDate = async (req, res) => {
  const { date } = req.params;

  try {
    // Primero obtenemos todos los empleados con sus horarios
    const attendance = await queryDatabase(`
      SELECT 
        u.id,
        u.name as employeeName,
        s.start_time as scheduledStart,
        s.end_time as scheduledEnd,
        a.entry_time,
        a.exit_time,
        a.lunch_start as lunchStartTime,
        a.lunch_end as lunchEndTime,
        CASE
          WHEN a.entry_time IS NULL AND CURRENT_DATE() = ? THEN 'PENDIENTE'
          WHEN a.entry_time IS NULL AND CURRENT_DATE() > ? THEN 'AUSENTE'
          WHEN a.entry_time > CONCAT(?, ' ', COALESCE(s.start_time, '09:00:00')) THEN 'TARDANZA'
          ELSE 'PRESENTE'
        END as status,
        CASE
          WHEN a.entry_time IS NOT NULL THEN 
            a.entry_time > CONCAT(?, ' ', COALESCE(s.start_time, '09:00:00'))
          ELSE false
        END as isLate
      FROM users u
      LEFT JOIN schedules s ON u.id = s.user_id
      LEFT JOIN attendance a ON u.id = a.user_id AND DATE(a.entry_time) = ?
      WHERE u.role = 'user'
      ORDER BY u.name
    `, [date, date, date, date, date]);

    // Asegurarnos de que cada empleado tenga un estado válido
    const formattedAttendance = attendance.map(record => ({
      ...record,
      status: record.status || 'PENDIENTE',
      isLate: record.isLate || false,
      entryTime: record.entry_time || null,
      exitTime: record.exit_time || null,
      lunchStartTime: record.lunchStartTime || null,
      lunchEndTime: record.lunchEndTime || null
    }));

    res.json(formattedAttendance);
  } catch (error) {
    console.error('Error al obtener asistencia:', error);
    res.status(500).json({ message: 'Error al obtener asistencia' });
  }
};

// Obtener todos los usuarios
const getAllUsers = async (req, res) => {
  try {
    const users = await queryDatabase(
      'SELECT id, email, role FROM users WHERE role = ?',
      ['user']
    );
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

module.exports = {
  getDashboardStats,
  getDashboardAlerts,
  getEmployees,
  createEmployee,
  getEmployeeSchedule,
  updateEmployeeSchedule,
  getAttendanceByDate,
  getAllUsers
};
