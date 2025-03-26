const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'papaleta',
  port: 3306
});

const setupDatabase = async () => {
  try {
    // Eliminar la base de datos existente si existe
    await new Promise((resolve, reject) => {
      db.query('DROP DATABASE IF EXISTS registro', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Crear nueva base de datos
    await new Promise((resolve, reject) => {
      db.query('CREATE DATABASE registro', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Usar la nueva base de datos
    await new Promise((resolve, reject) => {
      db.query('USE registro', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Crear tabla users
    await new Promise((resolve, reject) => {
      db.query(`
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Crear tabla schedules
    await new Promise((resolve, reject) => {
      db.query(`
        CREATE TABLE schedules (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          start_time TIME NOT NULL DEFAULT '09:00:00',
          end_time TIME NOT NULL DEFAULT '18:00:00',
          lunch_start TIME NOT NULL DEFAULT '13:00:00',
          lunch_end TIME NOT NULL DEFAULT '14:00:00',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Crear tabla attendance
    await new Promise((resolve, reject) => {
      db.query(`
        CREATE TABLE attendance (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          entry_time DATETIME,
          exit_time DATETIME,
          lunch_start DATETIME,
          lunch_end DATETIME,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Crear tabla button_controls
    await new Promise((resolve, reject) => {
      db.query(`
        CREATE TABLE button_controls (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          date DATE NOT NULL,
          can_mark_entry BOOLEAN DEFAULT true,
          can_mark_exit BOOLEAN DEFAULT true,
          can_mark_lunch_start BOOLEAN DEFAULT true,
          can_mark_lunch_end BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          UNIQUE KEY unique_user_date (user_id, date)
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Insertar usuarios de prueba
    const users = [
      { name: 'John Doe', email: 'john.doe@example.com', role: 'user' },
      { name: 'Jane Smith', email: 'jane.smith@example.com', role: 'user' },
      { name: 'Admin User', email: 'admin@example.com', role: 'admin' }
    ];

    // Insertar usuarios
    for (const user of users) {
      const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.hash('password123', 10, (err, hash) => {
          if (err) reject(err);
          else resolve(hash);
        });
      });

      await new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
          [user.name, user.email, hashedPassword, user.role],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    console.log('Base de datos inicializada correctamente');
    console.log('Usuarios creados con la contraseña: password123');

  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  } finally {
    db.end();
  }
};

setupDatabase();
