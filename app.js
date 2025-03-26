const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json()); // Para parsear JSON
app.use(bodyParser.urlencoded({ extended: true })); // Para parsear datos de formularios

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});

// Ruta de prueba
app.get('/api/attendance/test', (req, res) => {
  res.json({ message: 'Ruta de asistencia funcionando correctamente' });
});

module.exports = app;