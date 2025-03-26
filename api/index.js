const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Configuración de CORS
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_7KkRFDotQT1X@ep-small-snowflake-a5re8byp-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

// Ruta de prueba
app.get('/', async (req, res) => {
  try {
    await pool.connect();
    res.json({ 
      message: 'API funcionando correctamente',
      database: 'Conectada',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error al conectar con la base de datos',
      details: error.message
    });
  }
});

// Importar rutas
const authRoutes = require('../routes/authRoutes');
const attendanceRoutes = require('../routes/attendanceRoutes');
const buttonControlRoutes = require('../routes/buttonControlRoutes');
const adminRoutes = require('../routes/adminRoutes');

// Rutas
app.use('/auth', authRoutes);
app.use('/attendance', attendanceRoutes);
app.use('/buttons', buttonControlRoutes);
app.use('/admin', adminRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message
  });
});

module.exports = app;
