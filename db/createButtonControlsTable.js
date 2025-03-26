require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createButtonControlsTable() {
  try {
    // Crear la tabla button_controls
    await pool.query(`
      CREATE TABLE IF NOT EXISTS button_controls (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id),
        check_in_enabled BOOLEAN DEFAULT true,
        check_out_enabled BOOLEAN DEFAULT true,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Tabla button_controls creada exitosamente');

    // Insertar registros por defecto para todos los usuarios existentes
    await pool.query(`
      INSERT INTO button_controls (user_id, check_in_enabled, check_out_enabled)
      SELECT id, true, true
      FROM users
      WHERE id NOT IN (SELECT user_id FROM button_controls)
    `);

    console.log('Registros por defecto insertados exitosamente');

    // Verificar los registros
    const result = await pool.query('SELECT * FROM button_controls');
    console.log('Registros actuales:', result.rows);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

createButtonControlsTable();
