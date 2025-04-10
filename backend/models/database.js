const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../yearbook.db'));

// Create tables
db.serialize(() => {
  console.log('Initializing database...');

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
  `, function(err) {
    if (err) {
      console.error('Error creating profiles table:', err.message);
      return;
    }

    // Check if user_id column exists
    db.all("PRAGMA table_info(profiles)", [], (err, rows) => {
      if (err) {
        console.error('Error checking profiles table schema:', err.message);
        return;
      }

      // Check if user_id column exists
      const userIdExists = rows.some(row => row.name === 'user_id');

      if (!userIdExists) {
        console.log('Adding user_id column to profiles table...');
        // Add user_id column if it doesn't exist (without UNIQUE constraint)
        db.run(`ALTER TABLE profiles ADD COLUMN user_id TEXT`, (err) => {
          if (err) {
            console.error('Error adding user_id column:', err.message);
          } else {
            console.log('user_id column added successfully');

            // Create a new table with the desired schema
            db.run(`
              CREATE TABLE IF NOT EXISTS profiles_new (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT UNIQUE,
                name TEXT NOT NULL,
                designation TEXT NOT NULL,
                description TEXT NOT NULL,
                image BLOB,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
              )
            `, function(err) {
              if (err) {
                console.error('Error creating new profiles table:', err.message);
                return;
              }

              // Copy data from old table to new table
              db.run(`INSERT INTO profiles_new (id, user_id, name, designation, description, image, created_at)
                      SELECT id, user_id, name, designation, description, image, created_at FROM profiles`, function(err) {
                if (err) {
                  console.error('Error copying profile data:', err.message);
                  return;
                }

                // Rename tables to replace the old one with the new one
                db.run(`DROP TABLE profiles`, function(err) {
                  if (err) {
                    console.error('Error dropping old profiles table:', err.message);
                    return;
                  }

                  db.run(`ALTER TABLE profiles_new RENAME TO profiles`, function(err) {
                    if (err) {
                      console.error('Error renaming profiles table:', err.message);
                    } else {
                      console.log('Successfully migrated profiles table with UNIQUE constraint on user_id');
                    }
                  });
                });
              });
            });
          }
        });
      } else {
        console.log('user_id column already exists in profiles table');
      }
    });
  });

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

  // Memories table
  db.run(`
    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      image BLOB NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Confessions table
  db.run(`
    CREATE TABLE IF NOT EXISTS confessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      author TEXT DEFAULT 'Anonymous',
      recipient TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Messages table (for general messages not tied to profiles)
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;