const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'papaleta',
  port: process.env.DB_PORT || 3306
});

const setupDatabase = async () => {
  try {
    // Crear la base de datos si no existe
    await new Promise((resolve, reject) => {
      db.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'registro'}`, (err) => {
        if (err) {
          console.error('Error al crear la base de datos:', err);
          reject(err);
        } else {
          console.log(`Base de datos ${process.env.DB_NAME || 'registro'} creada exitosamente`);
          resolve();
        }
      });
    });

    // Usar la base de datos
    await new Promise((resolve, reject) => {
      db.query(`USE ${process.env.DB_NAME || 'registro'}`, (err) => {
        if (err) {
          console.error('Error al seleccionar la base de datos:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    // Crear la tabla users si no existe
    await new Promise((resolve, reject) => {
      db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `, (err) => {
        if (err) {
          console.error('Error al crear la tabla users:', err);
          reject(err);
        } else {
          console.log('Tabla users creada exitosamente');
          resolve();
        }
      });
    });

    // Crear la tabla attendance si no existe
    await new Promise((resolve, reject) => {
      db.query(`
        CREATE TABLE IF NOT EXISTS attendance (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          entry_time DATETIME,
          exit_time DATETIME,
          lunch_start DATETIME,
          lunch_end DATETIME,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `, (err) => {
        if (err) {
          console.error('Error al crear la tabla attendance:', err);
          reject(err);
        } else {
          console.log('Tabla attendance creada exitosamente');
          resolve();
        }
      });
    });

    console.log('Configuración de la base de datos completada exitosamente');

  } catch (error) {
    console.error('Error en la configuración de la base de datos:', error);
  } finally {
    db.end();
  }
};

setupDatabase();
