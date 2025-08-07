const express = require('express');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');

const app = express();

const allowedOrigins = ['http://localhost:3000', 'https://elp-indol.vercel.app', 'https://back-xycb.onrender.com'];

app.use(cors({
  origin: function(origin, callback) {
    // Dopuszczamy zapytania ZAWSZE, gdy origin jest undefined (Electron, file://, Postman itp.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware do parsowania ciasteczek - musi być przed trasami
app.use(cookieParser());

// Middleware do parsowania JSON - też przed trasami
app.use(express.json());

// **Twoja prośba: logger nagłówków origin i cookie, WSTAWIAMY TUŻ PRZED trasami**
app.use((req, res, next) => {
  console.log('Origin:', req.headers.origin);
  console.log('Cookies in request:', req.headers.cookie);
  next();
});

// Podpinamy moduły tras
app.use('/api', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));

// // wyjątkowo dla Vercel eksportujemy app
// module.exports = app;
