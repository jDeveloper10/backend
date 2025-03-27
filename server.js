const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_7KkRFDotQT1X@ep-small-snowflake-a5re8byp-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

// Verificar la conexión
pool.connect()
  .then(() => console.log('Conectado a PostgreSQL'))
  .catch(err => console.error('Error al conectar a PostgreSQL:', err));

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const buttonControlRoutes = require('./routes/buttonControlRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Configuración de CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://elaborate-torte-d3511a.netlify.app',
  'https://backend-4nzgjdv57-jdeveloper10s-projects.vercel.app'
];

app.use(cors({
  origin: '*', // Temporalmente permitimos todos los orígenes para pruebas
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de EmpleadosHorario' });
});

// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({ 
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/buttons', buttonControlRoutes);
app.use('/api/admin', adminRoutes);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'Not allowed by CORS',
      origin: req.headers.origin,
      allowedOrigins
    });
  }

  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message
  });
});

const path = require('path');

module.exports = app;
```

```javascript
const express = require('express');
const app = express();
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_7KkRFDotQT1X@ep-small-snowflake-a5re8byp-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

// Verificar la conexión
pool.connect()
  .then(() => console.log('Conectado a PostgreSQL'))
  .catch(err => console.error('Error al conectar a PostgreSQL:', err));

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const buttonControlRoutes = require('./routes/buttonControlRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Configuración de CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://elaborate-torte-d3511a.netlify.app',
  'https://backend-4nzgjdv57-jdeveloper10s-projects.vercel.app'
];

app.use(cors({
  origin: '*', // Temporalmente permitimos todos los orígenes para pruebas
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware para parsear JSON
app.use(express.json());

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de EmpleadosHorario' });
});

// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({ 
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/buttons', buttonControlRoutes);
app.use('/api/admin', adminRoutes);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'Not allowed by CORS',
      origin: req.headers.origin,
      allowedOrigins
    });
  }

  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message
  });
});

module.exports = app;
```

```javascript
const app = require('./api');
const path = require('path');
const express = require('express');

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 10000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Host: ${HOST}`);
});