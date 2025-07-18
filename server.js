const express = require('express');
const cors = require('cors');
require('dotenv').config();


const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Podpinamy nasze „moduły tras”
app.use('/api', authRoutes);



app.listen(PORT, () => {
  console.log(`🚀 Serwer Express działa na porcie ${PORT}`);
});


//tylko pod vercel
//module.exports = app;