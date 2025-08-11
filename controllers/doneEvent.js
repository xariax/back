const { v4: uuidv4 } = require('uuid');
const db = require('../db'); // Import połączenia z bazą danych


// // 🛠 Automatyczne generowanie 10 eventów
// const machineList = ["psg1", "psg2", "psg3"];
// const EventsTable = [];

// for (let i = 0; i < 20; i++) {
//   EventsTable.push({
//     id: uuidv4(),
//     time: `${String(6 + i).padStart(2, "0")}:00`,     // np. 06:00, 07:00 itd.
//     duration: `${5 + i} min`,                         // np. 5 min, 6 min, ...
//     reason: "",                                       // puste – do uzupełnienia z frontend
//     status: "true",                                   // true = do uzupełnienia
//     machine: machineList[i % machineList.length],     // cyklicznie: psg1, psg2, ...
//   });
// }


/// ✅ Zwraca 10 ostatnich:
const getRecentEvents = (req, res) => {
  const { machine } = req.query;

  if (!machine) {
    return res.status(400).json({ message: "Brakuje parametru ?machine=" });
  }

  // Query do bazy danych
  const query = 'SELECT * FROM events where Machine= ?';
  db.all(query, [machine], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Błąd bazy danych' });
    }
    // rows to tablica z wynikami
    res.json(data);
  });
};


/// ✅ Zmienia powód danego eventu (po ID)
const updateEventReason = (req, res) => {
  const { id } = req.params;
  const { Discribe } = req.body;


  const query = `UPDATE events SET Discribe = ? WHERE id = ?`;

  db.run(query, [ Discribe, id], function(err) {
    if (err) {
      console.error('Błąd bazy danych:', err);
      return res.status(500).json({ error: 'Błąd bazy danych' });
    }
    // this.lastID zawiera id wstawionego rekordu (jeśli masz auto increment ID)
    res.json({ message: 'Item dodany do koszyka', id: this.lastID });
  });
};


module.exports = {
  getRecentEvents,
  updateEventReason,
};
