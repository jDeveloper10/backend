const mysql = require('mysql2');

// Crear la conexión
const connection = mysql.createConnection({
  host: 'caboose.proxy.rlwy.net',
  user: 'root',
  password: 'aXOWebERFJnyQiMVsfjtoFtDezweVwUF',
  database: 'railway',
  port: 31322
});

// Conectar a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error de conexión:', err);
    console.error('Stack:', err.stack);
    return;
  }
  console.log('Conectado a la base de datos como ID ' + connection.threadId);

  // Mostrar las tablas existentes
  connection.query('SHOW TABLES', (err, results) => {
    if (err) {
      console.error('Error en la consulta:', err);
      console.error('Stack:', err.stack);
    } else {
      console.log('Tablas en la base de datos:');
      results.forEach(row => {
        console.log('-', row[`Tables_in_railway`]);
      });
    }

    // Cerrar la conexión después de la consulta
    connection.end((err) => {
      if (err) {
        console.error('Error al cerrar la conexión:', err);
      } else {
        console.log('Conexión cerrada correctamente');
      }
    });
  });
});
