const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

async function hashExistingPasswords() {
  const users = [
    { login: 'Rafał', pass: 'tajnehaslo' },
    { login: 'jan', pass: 'jan123' },
    { login: 'anna', pass: 'anna123' }
  ];

  for (const user of users) {
    try {
      const hashedPassword = await bcrypt.hash(user.pass, 10);
      
      db.run(
        'UPDATE users SET pass = ? WHERE login = ?',
        [hashedPassword, user.login],
        function(err) {
          if (err) {
            console.error(`Błąd aktualizacji dla ${user.login}:`, err.message);
          } else {
            console.log(`Hasło zaktualizowane dla: ${user.login}`);
          }
        }
      );
    } catch (error) {
      console.error(`Błąd hashowania dla ${user.login}:`, error);
    }
  }
}

hashExistingPasswords();

setTimeout(() => {
  db.close();
  console.log('Aktualizacja zakończona');
}, 2000);
