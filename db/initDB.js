const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'papaleta',
  port: 3306
});

const initDatabase = async () => {
  try {
    // Crear la base de datos si no existe
    await new Promise((resolve, reject) => {
      db.query('CREATE DATABASE IF NOT EXISTS registro', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Usar la base de datos
    await new Promise((resolve, reject) => {
      db.query('USE registro', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Crear tabla users
    await new Promise((resolve, reject) => {
      db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role ENUM('user', 'admin') NOT NULL DEFAULT 'user'
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Crear tabla attendance
    await new Promise((resolve, reject) => {
      db.query(`
        CREATE TABLE IF NOT EXISTS attendance (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          entry_time DATETIME,
          exit_time DATETIME,
          lunch_start DATETIME,
          lunch_end DATETIME,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Insertar un usuario de prueba si no existe
    await new Promise((resolve, reject) => {
      db.query(`
        INSERT INTO users (name, email, password, role)
        SELECT 'John Doe', 'john.doe@example.com', 'password123', 'user'
        WHERE NOT EXISTS (
          SELECT 1 FROM users WHERE email = 'john.doe@example.com'
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('Base de datos inicializada correctamente');

  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  } finally {
    db.end();
  }
};

initDatabase();
