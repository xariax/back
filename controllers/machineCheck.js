const db = require('../db'); // Import połączenia z bazą danych

// Pobierz aktualnie wybraną maszynę użytkownika
exports.getUserMachine =(req, res) => {
  const login = req.user.login;
  const sql = `SELECT currentMachine FROM users WHERE login = ?`;

  db.get(sql, [login], (err, row) => {
    if (err) {
      console.error('Błąd pobierania maszyny:', err.message);
      return res.status(500).json({ message: 'Błąd serwera' });
    }
    if (!row) {
      return res.json({ machine: null });
    }
    res.json({ machine: row.currentMachine });
  });
}

// Aktualizuj wybraną maszynę użytkownika
exports.updateUserMachine=(req, res)=> {
  const login = req.user.login;
  const { machine } = req.body;

  if (!machine || typeof machine !== 'string') {
    return res.status(400).json({ message: 'Nieprawidłowa maszyna' });
  }

  const sql = `UPDATE users SET currentMachine = ? WHERE login = ?`;

  db.run(sql, [machine, login], function(err) {
    if (err) {
      console.error('Błąd przy zapisie maszyny:', err.message);
      return res.status(500).json({ message: 'Błąd serwera' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
    }
    res.json({ success: true, machine });
  });
}


