const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ✅ IMPLEMENTADO - Responsabilidad del Desarrollador 1
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validar que los campos existan
    if (!username || !password) {
      return res.status(400).json({ msg: 'Username and password are required' });
    }
    
    // Buscar el usuario en la base de datos
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    // Verificar la contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    // Generar token JWT
    const token = jwt.sign(
      { id: user._id, username: user.username }, 
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Retornar token y datos del usuario
    res.json({ 
      token, 
      user: { id: user._id, username: user.username }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
