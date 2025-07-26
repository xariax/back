const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ścieżka do bazy danych
const dbPath = path.join(__dirname, 'db.db');

// Tworzenie połączenia z bazą danych
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Błąd podczas otwierania bazy danych:', err.message);
  } else {
    console.log('Połączono z bazą danych SQLite.');
  }
});

module.exports = db;
