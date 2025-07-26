const express = require('express');
const cors = require('cors');
require('dotenv').config();


const authRoutes = require('./routes/auth.routes');

const app = express();



app.use(cors({
  origin: ['https://elp-indol.vercel.app',
   'http://localhost:3000'],
   
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // tylko jeśli potrzebujesz np. sesji/cookies
}));
app.use(express.json());

// Podpinamy nasze „moduły tras”
app.use('/api', authRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));

//tylko pod vercel
//module.exports = app;