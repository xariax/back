const db = require('../db'); // Import połączenia z bazą danych

exports.addItemToBasket = (req, res) => {
  const { ShortName, Name, Quantity, Operator, Machine } = req.body;

  const query = `INSERT INTO basket  (ShortName, Name, Quantity, Operator, Machine)
                 VALUES (?, ?, ?, ?, ?)`;

  db.run(query, [ ShortName, Name, Quantity, Operator, Machine], function(err) {
    if (err) {
      console.error('Błąd bazy danych:', err);
      return res.status(500).json({ error: 'Błąd bazy danych' });
    }
    // this.lastID zawiera id wstawionego rekordu (jeśli masz auto increment ID)
    res.json({ message: 'Item dodany do koszyka', id: this.lastID });
  });
};



exports.getBasket = (req, res) => {
    
  const query = 'SELECT * FROM basket';

  db.all(query, [], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Błąd bazy danych' });
    }
    // rows to tablica z wynikami
    res.json(data);
  });
};

exports.DeleteId = (req, res) => {

  
  const id = req.params.id;

  db.run('DELETE FROM basket WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Element o podanym id nie istnieje' });
    }
    res.status(200).json({ message: 'Usunięto element', id });
  });
};


