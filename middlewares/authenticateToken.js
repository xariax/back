const jwt = require('jsonwebtoken');

/**
 * Middleware do autoryzacji użytkownika za pomocą JWT.
 * Oczekuje nagłówka Authorization: Bearer <token>
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Brak tokena autoryzacyjnego' });
  }
 
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Nieprawidłowy albo wygasły token' });
    }
    req.user = user; // Dołącza dane użytkownika do żądania
    next();
  });
};

module.exports = authenticateToken;
