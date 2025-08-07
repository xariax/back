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


exports.BasketOrder = async (req, res) => {
  const data = req.body.data;
  const insertQuery = `INSERT INTO basketOrders (ShortName, Quantity, Operator, Machine, Name, status) VALUES (?, ?, ?, ?, ?,?)`;
  const deleteQuery = `DELETE FROM basket`;
  const clearAutoIncrement = "DELETE FROM sqlite_sequence WHERE name = 'basket';"

  try {
    // Wstawianie danych jeden po drugim w pętli asynchronicznej
    for (const item of data) {
      await new Promise((resolve, reject) => {
        db.run(insertQuery, [item.ShortName, item.Quantity, item.Operator, item.Machine, item.Name, 'waiting'], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }

    // Po wszystkich insertach wykonaj delete z basket
    await new Promise((resolve, reject) => {
      db.run(deleteQuery, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    await new Promise((resolve, reject) => {
  db.run(clearAutoIncrement, function(err) {
    if (err) reject(err);
    else resolve();
  });
});

    console.log('📝 Znaleziono:', data);
    res.status(200).json({ message: "✅ Wszystkie dane zapisane i koszyk wyczyszczony" });
  } catch (error) {
    console.error("Błąd przy zapisie/usuwaniu:", error.message);
    res.status(500).json({ message: "Błąd w trakcie zapisu/usuwania danych" });
  }
};
