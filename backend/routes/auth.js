const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Middleware de autenticación (simulado para el desarrollador 3)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ msg: 'Token de acceso requerido' });
  }
  
  // Para desarrollo, simular usuario autenticado
  req.user = { id: '507f1f77bcf86cd799439011', username: 'Filip Martin Jose' };
  next();
};

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/dashboard', authenticateToken, authController.getDashboardData);

module.exports = router;