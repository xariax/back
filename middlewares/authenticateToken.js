

// const jwt = require('jsonwebtoken');

// function authenticateToken(req, res, next) {
//   // Jeśli zapytanie jest do /logout, to próbujemy odczytać token jeśli jest,
//   // ale nie blokujemy żądania, nawet jeśli token jest brak lub jest nieważny.

//   console.log('PATH:', req.path);
// console.log('Cookie authToken:', req.cookies?.authToken);

//   if (req.path === '/logout') {
//     const token = req.cookies?.authToken;
//     if (!token) {
//       // Brak tokena — ale dla /logout zezwalamy przejść dalej bez req.user
//       return next();
//     }
//     // Jeśli token jest, weryfikujemy go i ustawiamy req.user
//     return jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//       if (!err) {
//         req.user = user;
//       }
//       // W każdym przypadku przechodzimy dalej (nie blokujemy logout)
//       next();
//     });
//   }

//   // Dla reszty endpointów wymagamy ważnego tokena
//   const token = req.cookies?.authToken;
//   if (!token) return res.status(401).json({ message: 'Brak tokena autoryzacyjnego' });

//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) return res.status(403).json({ message: 'Nieprawidłowy lub wygasły token' });
//     req.user = user;
//     next();
//   });
// }

// module.exports = authenticateToken;
const jwt = require('jsonwebtoken');
const db = require('../db');

const SESSION_TIMEOUT =600000; // 5 minut

function authenticateToken(req, res, next) {
  console.log('Req path:', req.path);
  console.log('Cookies:', req.cookies);

  const token = req.cookies?.authToken;

  if (req.path === '/logout') {
    if (!token) {
      console.log('No token on logout, passing through');
      return next();
    }
    return jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.warn('JWT error on logout:', err.message);
      } else {
        console.log('JWT decoded on logout:', decoded);
        req.user = decoded;
      }
      return next();
    });
  }

  if (!token) {
    console.warn('No token provided');
    return res.status(401).json({ success: false, message: 'Brak tokena autoryzacyjnego' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.warn('JWT verify failed:', err.message);
      return res.status(403).json({ success: false, message: 'Nieprawidłowy lub wygasły token' });
    }
    console.log('JWT verify success:', decoded);

    db.get(
      `SELECT login, role, timestapSession, currentMachine FROM users WHERE login = ?`,
      [decoded.login],
      (dbErr, user) => {
        if (dbErr) {
          console.error('DB error:', dbErr.message);
          return res.status(500).json({ success: false, message: 'Błąd bazy danych' });
        }
        if (!user) {
          console.warn('User not found:', decoded.login);
          return res.status(401).json({ success: false, message: 'Użytkownik nie znaleziony' });
        }
        console.log('User found:', user.login, 'Last activity:', user.timestapSession);

        const now = Date.now();
        const lastActivity = Number(user.timestapSession) || 0;

        if (now - lastActivity > SESSION_TIMEOUT) {
          console.log('Session expired for user:', user.login);
          db.run(
            `UPDATE users SET timestapSession = NULL, currentMachine = NULL WHERE login = ?`,
            [user.login],
            (cleanErr) => {
              if (cleanErr) console.error('Session cleanup error:', cleanErr);
              return res.status(401).json({ success: false, message: 'Sesja wygasła' });
            }
          );
        } else {
          db.run(
            `UPDATE users SET timestapSession = ? WHERE login = ?`,
            [now, user.login],
            (updateErr) => {
              if (updateErr) console.error('Session update error:', updateErr);
              req.user = {
                login: user.login,
                role: user.role,
                currentMachine: user.currentMachine,
              };
              next();
            }
          );
        }
      }
    );
  });
}

module.exports = authenticateToken;
