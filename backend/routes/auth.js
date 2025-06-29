const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Middleware de autenticación (temporal/simulado para desarrollo)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ msg: 'Token de acceso requerido' });
  }

  // ⚠️ Simulación de usuario autenticado (reemplazar por JWT en producción)
  req.user = { id: '507f1f77bcf86cd799439011', username: 'Filip Martin Jose' };
  next();
};

// Rutas
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/dashboard', authenticateToken, authController.getDashboardData);

module.exports = router;
