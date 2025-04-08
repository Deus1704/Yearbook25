const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../yearbook.db'));

// Create tables
db.serialize(() => {
  // Profiles table
  db.run(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      designation TEXT NOT NULL,
      description TEXT NOT NULL,
      image BLOB,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Comments table
  db.run(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id INTEGER,
      author TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (profile_id) REFERENCES profiles (id)
    )
  `);
});

module.exports = db; 