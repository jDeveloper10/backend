const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = {
  verifyToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Formato de token inválido' });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
      } catch (error) {
        console.error('Error al verificar token:', error);
        return res.status(401).json({ message: 'Token inválido o expirado' });
      }
    } catch (error) {
      console.error('Error en middleware de autenticación:', error);
      return res.status(500).json({ message: 'Error en la autenticación' });
    }
  },

  isAdmin(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Acceso denegado: se requiere rol de administrador' });
      }

      next();
    } catch (error) {
      console.error('Error en middleware de admin:', error);
      return res.status(500).json({ message: 'Error al verificar permisos' });
    }
  }
};

module.exports = authMiddleware;