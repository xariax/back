// const jwt = require('jsonwebtoken');

// function authenticateToken(req, res, next) {
//   // Jeśli zapytanie jest do /logout, pomijamy weryfikację tokena
// //  if (req.path === '/logout') {
//   //  return next();
//   //}

//   const token = req.cookies?.authToken;
//   if (!token) {
//     return res.status(401).json({ message: 'Brak tokena autoryzacyjnego' });
//   }

//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) {
//       return res.status(403).json({ message: 'Nieprawidłowy lub wygasły token' });
//     }
//     req.user = user;
//     next();
//   });
// }

// module.exports = authenticateToken;


const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  // Jeśli zapytanie jest do /logout, to próbujemy odczytać token jeśli jest,
  // ale nie blokujemy żądania, nawet jeśli token jest brak lub jest nieważny.

  console.log('PATH:', req.path);
console.log('Cookie authToken:', req.cookies?.authToken);

  if (req.path === '/logout') {
    const token = req.cookies?.authToken;
    if (!token) {
      // Brak tokena — ale dla /logout zezwalamy przejść dalej bez req.user
      return next();
    }
    // Jeśli token jest, weryfikujemy go i ustawiamy req.user
    return jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
      // W każdym przypadku przechodzimy dalej (nie blokujemy logout)
      next();
    });
  }

  // Dla reszty endpointów wymagamy ważnego tokena
  const token = req.cookies?.authToken;
  if (!token) return res.status(401).json({ message: 'Brak tokena autoryzacyjnego' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Nieprawidłowy lub wygasły token' });
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
