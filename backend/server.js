require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware global
app.use(cors());
app.use(express.json());

// Logger básico para cada petición
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Rutas principales
app.use('/api/auth', authRoutes);
app.use(express.static('public'));

// Ruta raíz
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html'); // Cambia por dashboard.html si es necesario
});

// Manejo de errores internos
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Ruta no encontrada
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Conexión a MongoDB y levantar servidor
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log('📁 Proyecto completo con LOGIN, REGISTRO y DASHBOARD');
      console.log('🔒 /api/auth/login');
      console.log('🆕 /api/auth/register');
      console.log('📊 /api/auth/dashboard');
    });
  })
  .catch((error) => {
    console.error('❌ Error al conectar a la base de datos:', error);
    process.exit(1);
  });

// Cierre controlado del servidor
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await mongoose.connection.close();
  console.log('✅ Conexión a MongoDB cerrada');
  process.exit(0);
});
