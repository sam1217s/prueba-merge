require('dotenv').config();


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');

const app = express();


app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use(express.static('public'))

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(4000, () => {
      console.log('Server is running on http://localhost:4000');
    });
  })
  .catch((error) => {
    console.error('Database connection error:', error);
  });
