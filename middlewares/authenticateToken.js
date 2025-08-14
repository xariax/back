const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid'); // generator unikalnych sessionId
const db = require('../db');

const SESSION_TIMEOUT = 300000; // 10 minut

function authenticateToken(req, res, next) {
  console.log('Req path:', req.path);
  console.log('Cookies:', req.cookies);

  const token = req.cookies?.authToken;
  const clientSessionId = req.cookies?.sessionId; // DODANE – stały identyfikator sesji urządzenia

  // Obsługa logout – przechodzimy dalej nawet bez tokena
  if (req.path === '/logout') {
    if (!token) {
      console.log('No token on logout, passing through');
      return next();
    }
    return jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (!err) {
        req.user = decoded;
      }
      return next();
    });
  }

  // Jeśli brak tokena lub sesji → odrzucamy
  if (!token && !clientSessionId) {
    console.warn('No token and no sessionId provided');
    return res.status(401).json({ success: false, message: 'Brak autoryzacji' });
  }

  // Jeżeli mamy token, weryfikujemy JWT
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.warn('JWT verify failed:', err.message);
        return res.status(403).json({ success: false, message: 'Nieprawidłowy lub wygasły token' });
      }

      console.log('JWT verify success:', decoded);

      // Pobieramy użytkownika po loginie LUB sessionId
      db.get(
        `SELECT login, role, timestapSession, currentMachine, sessionId FROM users WHERE login = ?`,
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

          const now = Date.now();
          const lastActivity = Number(user.timestapSession) || 0;

          if (now - lastActivity > SESSION_TIMEOUT) {
            console.log('Session expired for user:', user.login);
            db.run(
              `UPDATE users SET timestapSession = NULL, currentMachine = NULL, sessionId = NULL WHERE login = ?`,
              [user.login],
              (cleanErr) => {
                if (cleanErr) console.error('Session cleanup error:', cleanErr);
                return res.status(401).json({ success: false, message: 'Sesja wygasła' });
              }
            );
          } else {
            const newSessionId = user.sessionId || uuidv4();
            db.run(
              `UPDATE users SET timestapSession = ?, sessionId = ? WHERE login = ?`,
              [now, newSessionId, user.login],
              (updateErr) => {
                if (updateErr) console.error('Session update error:', updateErr);

                // Ustawiamy cookie sessionId, jeśli nowe
                if (!clientSessionId) {
                  res.cookie('sessionId', newSessionId, {
                    httpOnly: false, // dostępne w JS jeśli trzeba
                    sameSite: 'Lax',
                  });
                }

                req.user = {
                  login: user.login,
                  role: user.role,
                  currentMachine: user.currentMachine,
                  sessionId: newSessionId,
                };
                next();
              }
            );
          }
        }
      );
    });
  } else {
    // Brak JWT – próbujemy zidentyfikować tylko po sessionId
    db.get(
      `SELECT login, role, timestapSession, currentMachine FROM users WHERE sessionId = ?`,
      [clientSessionId],
      (dbErr, user) => {
        if (dbErr) {
          console.error('DB error:', dbErr.message);
          return res.status(500).json({ success: false, message: 'Błąd bazy danych' });
        }
        if (!user) {
          console.warn('No user for given sessionId');
          return res.status(401).json({ success: false, message: 'Sesja nie znaleziona' });
        }

        const now = Date.now();
        if (now - user.timestapSession > SESSION_TIMEOUT) {
          console.log('Session expired for user:', user.login);
          db.run(
            `UPDATE users SET timestapSession = NULL, currentMachine = NULL, sessionId = NULL WHERE login = ?`,
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
            () => {
              req.user = user;
              next();
            }
          );
        }
      }
    );
  }
}

module.exports = authenticateToken;
