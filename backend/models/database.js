const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const fileStorage = require('../services/fileStorage');

// Wrapper for sql.js to provide a more consistent API
class Database {
  constructor() {
    this.db = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    try {
      // Initialize SQL.js
      const SQL = await initSqlJs();

      // Create a new database in memory
      this.db = new SQL.Database();
      this.initialized = true;

      console.log('SQL.js database initialized in memory');

      // Create tables
      this.exec(`
        CREATE TABLE IF NOT EXISTS profiles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT UNIQUE,
          name TEXT NOT NULL,
          designation TEXT NOT NULL,
          description TEXT NOT NULL,
          image_id TEXT,
          image_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      this.exec(`
        CREATE TABLE IF NOT EXISTS comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          profile_id INTEGER,
          author TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (profile_id) REFERENCES profiles (id)
        )
      `);

      this.exec(`
        CREATE TABLE IF NOT EXISTS memories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          image_id TEXT NOT NULL,
          image_url TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      this.exec(`
        CREATE TABLE IF NOT EXISTS confessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          message TEXT NOT NULL,
          author TEXT DEFAULT 'Anonymous',
          recipient TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      this.exec(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          author TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('Database tables created successfully');

      // Initialize file storage
      await fileStorage.initFileStorage();
      console.log('File storage initialized successfully');
    } catch (err) {
      console.error('Error initializing database:', err.message);
      throw err;
    }
  }

  // Execute SQL without returning results
  exec(sql, params = []) {
    if (!this.initialized) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db.exec(sql, params);
  }

  // Prepare and execute a statement, returning all results
  all(sql, params = []) {
    if (!this.initialized) {
      throw new Error('Database not initialized. Call init() first.');
    }
    const stmt = this.db.prepare(sql);
    stmt.bind(params);

    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  }

  // Prepare and execute a statement, returning the first result
  get(sql, params = []) {
    if (!this.initialized) {
      throw new Error('Database not initialized. Call init() first.');
    }
    const stmt = this.db.prepare(sql);
    stmt.bind(params);

    if (stmt.step()) {
      const result = stmt.getAsObject();
      stmt.free();
      return result;
    }
    stmt.free();
    return null;
  }

  // Run a statement and return info about the changes
  run(sql, params = []) {
    if (!this.initialized) {
      throw new Error('Database not initialized. Call init() first.');
    }
    const stmt = this.db.prepare(sql);
    stmt.bind(params);
    stmt.step();
    stmt.free();

    // Get the last inserted row ID
    const lastId = this.get('SELECT last_insert_rowid() as id').id;

    // Get the number of changes
    const changes = this.get('SELECT changes() as count').count;

    return {
      lastInsertRowid: lastId,
      changes: changes
    };
  }
}

const db = new Database();

module.exports = db;