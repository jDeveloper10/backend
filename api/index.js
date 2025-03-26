const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Configuración de CORS
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Configuración de la conexión a PostgreSQL con manejo de errores
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Prueba de conexión a la base de datos
pool.connect()
  .then(() => {
    console.log('Conectado exitosamente a PostgreSQL');
  })
  .catch(err => {
    console.error('Error al conectar a PostgreSQL:', err.message);
  });

// Ruta de prueba
app.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      res.json({ 
        message: 'API funcionando correctamente',
        database: 'Conectada',
        timestamp: new Date().toISOString()
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error en la ruta de prueba:', error);
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

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message
  });
});

// Puerto
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;
