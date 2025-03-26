const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'papaleta',
  port: 3306
});

const initNewDatabase = async () => {
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
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Insertar un usuario de prueba
    const hashedPassword = await new Promise((resolve, reject) => {
      require('bcryptjs').hash('password123', 10, (err, hash) => {
        if (err) reject(err);
        else resolve(hash);
      });
    });

    await new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['John Doe', 'john.doe@example.com', hashedPassword, 'user'],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    console.log('Base de datos inicializada correctamente');

  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  } finally {
    db.end();
  }
};

initNewDatabase();
