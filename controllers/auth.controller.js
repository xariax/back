const jwt = require('jsonwebtoken');
const db = require('../db'); // Import połączenia z bazą danych

exports.login = (req, res) => {
  const { login, pass } = req.body;
  const now = Date.now();
db.run(
  `UPDATE users SET timestapSession = ? WHERE login = ?`,
  [now, login],
  (err) => {
    if (err) console.error('Błąd ustawiania timestapSession przy logowaniu:', err);
  }
);

  // Query do bazy danych
  const query = 'SELECT * FROM users WHERE login = ? AND pass = ?';
  
  db.get(query, [login, pass], (err, user) => {
    if (err) {
      console.error('Błąd bazy danych:', err.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Błąd serwera' 
      });
    }

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Nieprawidłowe dane logowania' 
      });
    }

        if (user.currentMachine && user.currentMachine.trim() !== '') {
      return res.status(403).json({
        success: false,
        message: 'Jesteś już zalogowany na innym urządzeniu'
      });
    }

    // Tworzenie tokena JWT
    const token = jwt.sign(
      {
        login: user.login,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN
      }
    );
        // Ustawiamy cookie HttpOnly, secure w prod, z odpowiednim czasem życia
  res.cookie('authToken', token, {
httpOnly: true,
  secure: true,
  sameSite: 'none',
  path: '/',

});


    return res.json({
      success: true,
      user: {
        login: user.login,
        role: user.role,
        name: user.login
      }
    });
  });


};


// exports.checkAuth = (req, res) => {
//   const token = req.cookies.authToken;

//   if (!token) {
//     return res.status(401).json({ success: false, message: 'Brak tokena autoryzacji' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     return res.json({
//       success: true,
//       user: {
//         login: decoded.login,
//         role: decoded.role,
//         name: decoded.login
//       }
//     });
//   } catch (err) {
//     return res.status(401).json({ success: false, message: 'Niepoprawny lub wygasły token' });
//   }
// };

  
// exports.logout = (req, res) => {
//   const login = req.user?.login;

//   if (!login) {
//     res.clearCookie('authToken', {
//  httpOnly: true,
//   secure: true,
//   sameSite: 'none',
//   path: '/',

//     });
//     return res.status(200).json({ success: true, message: 'Logged out' });
//   }

//   const sql = `UPDATE users SET currentMachine = NULL WHERE login = ?`;
//   db.run(sql, [login], function(err) {
//     if (err) console.error('Błąd przy czyszczeniu currentMachine:', err.message);

//     res.clearCookie('authToken', {
// httpOnly: true,
//   secure: true,
//   sameSite: 'none',
//   path: '/',

//     });
//     res.status(200).json({ success: true, message: 'Logged out' });
//   });
// };

// przykładowa implementacja checkAuth z zapytaniem do bazy SQLite
// exports.checkAuth = (req, res) => {
//   const token = req.cookies.authToken;
//   if (!token) {
//     return res
//       .status(401)
//       .json({ success: false, message: 'Brak tokena autoryzacji' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const now = Date.now();
//     const SESSION_TIMEOUT = 60 * 1000; // 15 minut

//     // Pobranie użytkownika po loginie z JWT
//     db.get(
//       `SELECT login, role, timestapSession, currentMachine 
//        FROM users 
//        WHERE login = ?`,
//       [decoded.login],
//       (err, user) => {
//         if (err) {
//           return res
//             .status(500)
//             .json({ success: false, message: 'Błąd bazy danych' });
//         }

//         if (!user) {
//           return res
//             .status(401)
//             .json({ success: false, message: 'Użytkownik nie znaleziony' });
//         }

//         const lastActivity = Number(user.timestapSession) || 0;

//         // Sesja nieaktywna — czyścimy timestapSession i currentMachine
//         if (now - lastActivity > SESSION_TIMEOUT) {
//           db.run(
//             `UPDATE users 
//              SET timestapSession = NULL, currentMachine = NULL 
//              WHERE login = ?`,
//             [decoded.login],
//             (delErr) => {
//               if (delErr) {
//                 console.error(
//                   'Błąd czyszczenia timestapSession/currentMachine:',
//                   delErr
//                 );
//               }
//               return res
//                 .status(401)
//                 .json({ success: false, message: 'Sesja wygasła' });
//             }
//           );
//         } else {
//           // Sesja aktywna — odświeżamy timestapSession
//           db.run(
//             `UPDATE users SET timestapSession = ? WHERE login = ?`,
//             [now, decoded.login],
//             (updateErr) => {
//               if (updateErr) {
//                 console.error(
//                   'Błąd aktualizacji timestapSession:',
//                   updateErr
//                 );
//                 // nawet jeśli update się nie uda — kontynuujemy
//               }
//               return res.json({
//                 success: true,
//                 user: {
//                   login: user.login,
//                   role: user.role,
//                   name: user.login,
//                   currentMachine: user.currentMachine
//                 }
//               });
//             }
//           );
//         }
//       }
//     );
//   } catch (err) {
//     return res
//       .status(401)
//       .json({ success: false, message: 'Niepoprawny lub wygasły token' });
//   }
// };

exports.checkAuth = (req, res) => {
  // req.user pochodzi już z authenticateToken
  return res.json({
    success: true,
    user: {
      login: req.user.login,
      role: req.user.role,
      currentMachine: req.user.currentMachine || null
    }
  });
};

exports.logout = (req, res) => {
   console.log('req.user w logout:', req.user);
  const login = req.user?.login;

  // Tu możesz użyć login, jeśli jest dostępny (np. czyszczenie w bazie itd.)
  if (login) {
    // Przykład operacji na bazie, jeśli chcesz (opcjonalne)
    const sql = `UPDATE users SET currentMachine = NULL, timestapSession = NULL, sessionId = NULL WHERE login = ?`;
    db.run(sql, [login], function(err) {
      if (err) console.error('Błąd przy czyszczeniu currentMachine:', err.message);
      // Nawet jeśli jest błąd, usuwamy cookie i zwracamy odpowiedź
      _clearAndRespond();
    });
  } else {
    // Jeśli login niezdefiniowany, po prostu usuwamy cookie
    _clearAndRespond();
  }

  function _clearAndRespond() {
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',  // zalecane zabezpieczenia https
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      path: '/',
    });
    res.status(200).json({ success: true, message: 'Logged out' });
  }
};

