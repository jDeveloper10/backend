const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const authRoutes = require('../routes/authRoutes');
const adminRoutes = require('../routes/adminRoutes');
const attendanceRoutes = require('../routes/attendanceRoutes');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Configuración de CORS
app.use(cors({
  origin: ['https://elaborate-torte-d3511a.netlify.app', 'http://localhost:5173', 'http://127.0.0.1:5500', 'http://localhost:5500'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware para logging
app.use(morgan('combined'));

// Middleware para parsear JSON
app.use(express.json());

// Configurar el pool de conexiones
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Verificar conexión a la base de datos
pool.connect()
  .then(() => console.log('Conectado a PostgreSQL'))
  .catch(err => console.error('Error conectando a PostgreSQL:', err));

// Rutas
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/attendance', attendanceRoutes);

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Ruta raíz - redirigir a tables.html
app.get('/', (req, res) => {
  res.redirect('/tables.html');
});

// Ruta de API
app.get('/api', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
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
