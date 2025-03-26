const mysql = require('mysql2');
require('dotenv').config();

// Crear el pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

// Manejar desconexiones
process.on('SIGINT', async () => {
  try {
    await pool.end();
    console.log('Conexión a la base de datos cerrada');
    process.exit(0);
  } catch (error) {
    console.error('Error al cerrar la conexión:', error);
    process.exit(1);
  }
});

module.exports = { pool };