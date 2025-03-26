const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Configuración de CORS
const allowedOrigins = [
  'http://localhost:5173',
  'https://elaborate-torte-d3511a.netlify.app'
];

app.use(cors({
  origin: function(origin, callback) {
    // Permitir solicitudes sin origin (como las de Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('No permitido por CORS'));
    }
    return callback(null, true);
  },
  credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());

// Configurar el pool de conexiones
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error('Error middleware:', err);
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Test de conexión a la base de datos
pool.connect()
  .then(() => {
    console.log('Conectado a PostgreSQL');
  })
  .catch(err => {
    console.error('Error al conectar a PostgreSQL:', err);
  });

// Rutas
const authRoutes = require('../routes/authRoutes');
const adminRoutes = require('../routes/adminRoutes');
const attendanceRoutes = require('../routes/attendanceRoutes');

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/attendance', attendanceRoutes);

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

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Puerto - Render requiere que usemos process.env.PORT
const port = process.env.PORT || 10000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
  console.log('Ambiente:', process.env.NODE_ENV);
  console.log('Host:', '0.0.0.0');
});

module.exports = app;
