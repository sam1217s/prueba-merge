require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Middleware para logging de requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Rutas
app.use('/api/auth', authRoutes);
app.use(express.static('public'));

// Ruta por defecto - redirigir a register
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/register.html');
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Conectar a MongoDB y iniciar servidor
const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    console.log('📊 Base de datos:', mongoose.connection.name);
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log('📁 Proyecto del Desarrollador 2 - REGISTRO');
      console.log('✅ Funcionalidad implementada: REGISTRO');
      console.log('❌ Funcionalidad pendiente: LOGIN (Desarrollador 1)');
      console.log('🎯 Ruta principal: /register.html');
    });
  })
  .catch((error) => {
    console.error('❌ Error de conexión a la base de datos:', error);
    process.exit(1);
  });

// Manejar cierre graceful
process.on('SIGINT', async () => {
  console.log('\\n🛑 Cerrando servidor...');
  await mongoose.connection.close();
  console.log('✅ Conexión a MongoDB cerrada');
  process.exit(0);
});