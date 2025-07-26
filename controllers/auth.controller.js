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

    return res.json({
      success: true,
      token,
      user: {
        login: user.login,
        role: user.role,
        name: user.login
      }
    });
  });
};
