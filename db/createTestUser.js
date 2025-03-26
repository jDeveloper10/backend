const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createTestUser() {
  try {
    // Crear la tabla users si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'user'
      );
    `);

    // Crear usuario de prueba
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET password = $3 RETURNING id',
      ['Admin', 'admin@example.com', hashedPassword, 'admin']
    );

    console.log('Usuario de prueba creado/actualizado con ID:', result.rows[0].id);
    console.log('Email: admin@example.com');
    console.log('Contraseña: admin123');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

createTestUser();
