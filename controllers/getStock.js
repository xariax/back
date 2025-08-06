const db = require('../db'); // Import połączenia z bazą danych

const getStock = (req, res) => {
    
  const query = 'SELECT * FROM stock';

  db.all(query, [], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Błąd bazy danych' });
    }
    // rows to tablica z wynikami
    res.json(data);
  });
};


module.exports = { getStock };