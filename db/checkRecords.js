const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'papaleta',
  database: 'registro',
  port: 3306
});

const checkRecords = async () => {
  try {
    // Obtener todos los registros de asistencia
    await new Promise((resolve, reject) => {
      db.query('SELECT * FROM attendance ORDER BY id DESC', (err, results) => {
        if (err) {
          console.error('Error al obtener registros:', err);
          reject(err);
        } else {
          console.log('Registros de asistencia:');
          results.forEach(record => {
            console.log(`ID: ${record.id}`);
            console.log(`Usuario ID: ${record.user_id}`);
            console.log(`Hora de entrada: ${record.entry_time}`);
            console.log(`Hora de salida: ${record.exit_time}`);
            console.log(`Inicio de almuerzo: ${record.lunch_start}`);
            console.log(`Fin de almuerzo: ${record.lunch_end}`);
            console.log('---');
          });
          resolve();
        }
      });
    });

  } catch (error) {
    console.error('Error en la verificación:', error);
  } finally {
    db.end();
  }
};

checkRecords();
