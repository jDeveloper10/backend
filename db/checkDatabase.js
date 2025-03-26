const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'your_password_here',
  database: process.env.DB_NAME || 'registro'
});

const checkDatabase = async () => {
  try {
    // Verificar si la base de datos existe
    await new Promise((resolve, reject) => {
      db.query('SHOW DATABASES LIKE ?', [process.env.DB_NAME], (err, results) => {
        if (err) {
          console.error('Error al verificar la base de datos:', err);
          reject(err);
        } else {
          console.log(`Base de datos ${process.env.DB_NAME} ${results.length > 0 ? 'existe' : 'no existe'}`);
          resolve(results);
        }
      });
    });

    // Verificar si la tabla attendance existe
    await new Promise((resolve, reject) => {
      db.query('SHOW TABLES LIKE ?', ['attendance'], (err, results) => {
        if (err) {
          console.error('Error al verificar la tabla attendance:', err);
          reject(err);
        } else {
          console.log(`Tabla attendance ${results.length > 0 ? 'existe' : 'no existe'}`);
          resolve(results);
        }
      });
    });

    // Verificar las columnas de la tabla
    await new Promise((resolve, reject) => {
      db.query('DESCRIBE attendance', (err, results) => {
        if (err) {
          console.error('Error al verificar las columnas:', err);
          reject(err);
        } else {
          console.log('Columnas de la tabla attendance:');
          results.forEach(column => {
            console.log(`- ${column.Field} (${column.Type})`);
          });
          resolve(results);
        }
      });
    });

  } catch (error) {
    console.error('Error en la verificación:', error);
  } finally {
    db.end();
  }
};

checkDatabase();
