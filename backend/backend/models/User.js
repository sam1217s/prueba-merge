const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    maxlength: [100, 'Password is too long']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    default: null,
    sparse: true // Permite múltiples documentos con email null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true // No se puede modificar después de crear
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  registrationIP: {
    type: String,
    default: null
  }
});

// Índices para mejorar rendimiento
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ createdAt: 1 });

// Middleware pre-save para validaciones adicionales
userSchema.pre('save', function(next) {
  // Convertir username a minúsculas
  if (this.username) {
    this.username = this.username.toLowerCase().trim();
  }
  
  // Convertir email a minúsculas si existe
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  
  next();
});

// Método para obtener información pública del usuario
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin,
    isActive: this.isActive
  };
};

// Método estático para buscar por username o email
userSchema.statics.findByUsernameOrEmail = function(identifier) {
  return this.findOne({
    $or: [
      { username: identifier.toLowerCase() },
      { email: identifier.toLowerCase() }
    ]
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
