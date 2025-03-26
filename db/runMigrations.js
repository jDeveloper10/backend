const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: 'caboose.proxy.rlwy.net',
    user: 'root',
    password: 'aXOWebERFJnyQiMVsfjtoFtDezweVwUF',
    database: 'railway',
    port: 31322,
    multipleStatements: true
  });

  try {
    console.log('Conectado a la base de datos');

    // Leer el archivo SQL
    const sqlFile = await fs.readFile(path.join(__dirname, 'setup.sql'), 'utf8');
    
    // Ejecutar las queries
    console.log('Ejecutando migraciones...');
    const queries = sqlFile.split(';');
    for (const query of queries) {
      if (query.trim() !== '') {
        await connection.query(query);
      }
    }
    
    console.log('Migraciones completadas exitosamente');
  } catch (error) {
    console.error('Error al ejecutar las migraciones:', error);
  } finally {
    await connection.end();
    console.log('Conexión cerrada');
  }
}

runMigrations();
