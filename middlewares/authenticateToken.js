const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  // Jeśli zapytanie jest do /logout, pomijamy weryfikację tokena
  if (req.path === '/logout') {
    return next();
  }

  const token = req.cookies?.authToken;
  if (!token) {
    return res.status(401).json({ message: 'Brak tokena autoryzacyjnego' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Nieprawidłowy lub wygasły token' });
    }
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
