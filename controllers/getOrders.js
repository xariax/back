const db = require('../db'); // Import połączenia z bazą danych

const getOrders = (req, res) => {
    
  const query = 'SELECT * FROM basketOrders';

  db.all(query, [], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Błąd bazy danych' });
    }
    // rows to tablica z wynikami
    res.json(data);
  });
};


module.exports = { getOrders };