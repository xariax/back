const express = require('express');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const db = require('./db');
const authRoutes = require('./routes/auth.routes');

const app = express();
app.use(cookieParser());
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


// Middleware do parsowania JSON - też przed trasami
app.use(express.json());

// **Twoja prośba: logger nagłówków origin i cookie, WSTAWIAMY TUŻ PRZED trasami**
app.use((req, res, next) => {
  console.log('Origin:', req.headers.origin);
  console.log('Cookies in request:', req.headers.cookie);
  next();
});



const SESSION_TIMEOUT = 300000; // 5 minut (albo 600000 dla 10 min)
const CLEANUP_INTERVAL = 60000; // sprawdzanie co minutę

function cleanExpiredSessions() {
  const now = Date.now();
  const expiryThreshold = now - SESSION_TIMEOUT;

  const sql = `
    UPDATE users
    SET timestapSession = NULL,
        currentMachine = NULL,
        sessionId = NULL
    WHERE timestapSession IS NOT NULL
      AND timestapSession < ?
  `;

  db.run(sql, [expiryThreshold], function (err) {
    if (err) {
      console.error("Błąd czyszczenia sesji:", err.message);
    } else if (this.changes > 0) {
      console.log(`Wyczyszczono ${this.changes} wygasłych sesji.`);
    }
  });
}

setInterval(cleanExpiredSessions, CLEANUP_INTERVAL);



// Podpinamy moduły tras
app.use('/api', authRoutes);






const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));

// // wyjątkowo dla Vercel eksportujemy app
// module.exports = app;
