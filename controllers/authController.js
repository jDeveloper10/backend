const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_7KkRFDotQT1X@ep-small-snowflake-a5re8byp-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

const authController = {
  async register(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    try {
      // Verificar si el correo ya está registrado
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
        [name, email, hashedPassword, 'user']
      );

      res.status(201).json({ 
        message: 'Usuario registrado exitosamente',
        userId: result.rows[0].id 
      });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
    }
  },

  async login(req, res) {
    console.log('Login attempt:', req.body); // Debug log

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Correo electrónico y contraseña son requeridos' });
    }

    try {
      console.log('Querying database for user:', email); // Debug log

      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      console.log('Database result:', result.rows); // Debug log

      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const user = result.rows[0];
      
      // Para pruebas, permitir el login con el hash directo
      const isDirectHash = password === user.password;
      const isValidPassword = isDirectHash || await bcrypt.compare(password, user.password);

      console.log('Password validation:', { isDirectHash, isValidPassword }); // Debug log

      if (!isValidPassword) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const token = jwt.sign(
        { 
          id: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET || 'tu_secreto_jwt',
        { expiresIn: '24h' }
      );

      const response = {
        message: 'Login exitoso',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      };

      console.log('Sending response:', response); // Debug log
      res.json(response);
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
    }
  }
};

module.exports = authController;