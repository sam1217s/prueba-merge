const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ✅ IMPLEMENTADO - Responsabilidad del Desarrollador 2
exports.register = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    
    // Validar campos requeridos
    if (!username || !password) {
      return res.status(400).json({ msg: 'Username and password are required' });
    }
    
    // Validar longitud del username
    if (username.length < 3) {
      return res.status(400).json({ msg: 'Username must be at least 3 characters long' });
    }
    
    if (username.length > 20) {
      return res.status(400).json({ msg: 'Username cannot exceed 20 characters' });
    }
    
    // Validar caracteres del username
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ msg: 'Username can only contain letters, numbers and underscores' });
    }
    
    // Validar longitud del password
    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters long' });
    }
    
    if (password.length > 50) {
      return res.status(400).json({ msg: 'Password cannot exceed 50 characters' });
    }
    
    // Validar fortaleza del password
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (!hasLetter || !hasNumber) {
      return res.status(400).json({ 
        msg: 'Password must contain at least one letter and one number' 
      });
    }
    
    // Validar email si se proporciona
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ msg: 'Please provide a valid email address' });
      }
    }
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ 
      $or: [
        { username: username.toLowerCase() },
        ...(email ? [{ email: email.toLowerCase() }] : [])
      ]
    });
    
    if (existingUser) {
      if (existingUser.username === username.toLowerCase()) {
        return res.status(400).json({ msg: 'Username already exists' });
      }
      if (existingUser.email === email?.toLowerCase()) {
        return res.status(400).json({ msg: 'Email already registered' });
      }
    }
    
    // Hash de la contraseña
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Crear nuevo usuario
    const newUser = new User({
      username: username.toLowerCase(),
      password: hashedPassword,
      email: email ? email.toLowerCase() : null,
      createdAt: new Date(),
      isActive: true
    });
    
    // Guardar en la base de datos
    await newUser.save();
    
    // Respuesta exitosa (sin incluir la contraseña)
    res.status(201).json({ 
      msg: 'User registered successfully',
      user: { 
        id: newUser._id, 
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    
    // Manejar errores específicos de MongoDB
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ 
        msg: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
      });
    }
    
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

