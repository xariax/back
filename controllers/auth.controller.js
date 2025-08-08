const jwt = require('jsonwebtoken');
const db = require('../db'); // Import połączenia z bazą danych

exports.login = (req, res) => {
  const { login, pass } = req.body;

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
  sameSite: 'None',
  path: '/',
  maxAge: 43200000,

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


exports.checkAuth = (req, res) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Brak tokena autoryzacji' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({
      success: true,
      user: {
        login: decoded.login,
        role: decoded.role,
        name: decoded.login
      }
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Niepoprawny lub wygasły token' });
  }
};

  
exports.logout = (req, res) => {
  const login = req.user?.login;

  if (!login) {
    res.clearCookie('authToken', {
 httpOnly: true,
  secure: true,
  sameSite: 'None',
  path: '/',

    });
    return res.status(200).json({ success: true, message: 'Logged out' });
  }

  const sql = `UPDATE users SET currentMachine = NULL WHERE login = ?`;
  db.run(sql, [login], function(err) {
    if (err) console.error('Błąd przy czyszczeniu currentMachine:', err.message);

    res.clearCookie('authToken', {
httpOnly: true,
  secure: true,
  sameSite: 'None',
  path: '/',

    });
    res.status(200).json({ success: true, message: 'Logged out' });
  });
};

