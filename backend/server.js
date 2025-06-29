require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use(express.static('public'));

// Ruta por defecto
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Conectar a MongoDB y iniciar servidor
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    app.listen(4000, () => {
      console.log('🚀 Servidor corriendo en http://localhost:4000');
      console.log('📁 Proyecto del Desarrollador 1 - LOGIN');
      console.log('✅ Funcionalidad implementada: LOGIN');
      console.log('❌ Funcionalidad pendiente: REGISTRO (Desarrollador 2)');
    });
  })
  .catch((error) => {
    console.error('❌ Error de conexión a la base de datos:', error);
  });
