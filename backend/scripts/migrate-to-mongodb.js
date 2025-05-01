/**
 * Migration script to move data from SQLite to MongoDB
 * 
 * This script reads data from the SQLite database and inserts it into MongoDB.
 * It's a one-time migration script to help transition from SQLite to MongoDB.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');
const { connectDB, disconnectDB } = require('../models/mongodb');
const Profile = require('../models/Profile');
const Confession = require('../models/Confession');
const Message = require('../models/Message');
const Memory = require('../models/Memory');

// Path to the SQLite database file
const DB_PATH = path.join(__dirname, '../data/yearbook.db');

// Function to initialize SQLite database
async function initSqlite() {
  try {
    // Check if the database file exists
    if (!fs.existsSync(DB_PATH)) {
      console.error(`SQLite database file not found at ${DB_PATH}`);
      return null;
    }

    // Read the database file
    const filebuffer = fs.readFileSync(DB_PATH);
    
    // Initialize SQL.js
    const SQL = await initSqlJs();
    
    // Create a database instance from the file
    const db = new SQL.Database(filebuffer);
    console.log('SQLite database loaded successfully');
    
    return db;
  } catch (error) {
    console.error('Error initializing SQLite database:', error.message);
    return null;
  }
}

// Function to migrate profiles
async function migrateProfiles(sqliteDb) {
  try {
    console.log('Migrating profiles...');
    
    // Get all profiles from SQLite
    const result = sqliteDb.exec('SELECT * FROM profiles');
    
    if (!result || result.length === 0) {
      console.log('No profiles found in SQLite database');
      return;
    }
    
    const columns = result[0].columns;
    const values = result[0].values;
    
    // Convert to array of objects
    const profiles = values.map(row => {
      const profile = {};
      columns.forEach((col, i) => {
        profile[col] = row[i];
      });
      return profile;
    });
    
    console.log(`Found ${profiles.length} profiles in SQLite database`);
    
    // Insert profiles into MongoDB
    for (const profile of profiles) {
      // Map SQLite fields to MongoDB fields
      const mongoProfile = new Profile({
        userId: profile.user_id,
        name: profile.name,
        department: profile.designation.split(',')[1]?.trim() || 'Department',
        degree: profile.designation.split(',')[0]?.trim() || 'Degree',
        quote: profile.description,
        image: profile.image,
        createdAt: new Date(profile.created_at || Date.now())
      });
      
      // Save to MongoDB
      await mongoProfile.save();
    }
    
    console.log('Profiles migration completed successfully');
  } catch (error) {
    console.error('Error migrating profiles:', error.message);
  }
}

// Function to migrate confessions
async function migrateConfessions(sqliteDb) {
  try {
    console.log('Migrating confessions...');
    
    // Get all confessions from SQLite
    const result = sqliteDb.exec('SELECT * FROM confessions');
    
    if (!result || result.length === 0) {
      console.log('No confessions found in SQLite database');
      return;
    }
    
    const columns = result[0].columns;
    const values = result[0].values;
    
    // Convert to array of objects
    const confessions = values.map(row => {
      const confession = {};
      columns.forEach((col, i) => {
        confession[col] = row[i];
      });
      return confession;
    });
    
    console.log(`Found ${confessions.length} confessions in SQLite database`);
    
    // Insert confessions into MongoDB
    for (const confession of confessions) {
      // Map SQLite fields to MongoDB fields
      const mongoConfession = new Confession({
        text: confession.message,
        anonymous: confession.author === 'Anonymous',
        name: confession.author !== 'Anonymous' ? confession.author : undefined,
        createdAt: new Date(confession.created_at || Date.now())
      });
      
      // Save to MongoDB
      await mongoConfession.save();
    }
    
    console.log('Confessions migration completed successfully');
  } catch (error) {
    console.error('Error migrating confessions:', error.message);
  }
}

// Function to migrate messages
async function migrateMessages(sqliteDb) {
  try {
    console.log('Migrating messages...');
    
    // Get all messages from SQLite
    const result = sqliteDb.exec('SELECT * FROM messages');
    
    if (!result || result.length === 0) {
      console.log('No messages found in SQLite database');
      return;
    }
    
    const columns = result[0].columns;
    const values = result[0].values;
    
    // Convert to array of objects
    const messages = values.map(row => {
      const message = {};
      columns.forEach((col, i) => {
        message[col] = row[i];
      });
      return message;
    });
    
    console.log(`Found ${messages.length} messages in SQLite database`);
    
    // Insert messages into MongoDB
    for (const message of messages) {
      // Map SQLite fields to MongoDB fields
      const mongoMessage = new Message({
        userId: 'legacy-user',
        name: message.author,
        text: message.content,
        createdAt: new Date(message.created_at || Date.now())
      });
      
      // Save to MongoDB
      await mongoMessage.save();
    }
    
    console.log('Messages migration completed successfully');
  } catch (error) {
    console.error('Error migrating messages:', error.message);
  }
}

// Function to migrate memories
async function migrateMemories(sqliteDb) {
  try {
    console.log('Migrating memories...');
    
    // Get all memories from SQLite
    const result = sqliteDb.exec('SELECT * FROM memories');
    
    if (!result || result.length === 0) {
      console.log('No memories found in SQLite database');
      return;
    }
    
    const columns = result[0].columns;
    const values = result[0].values;
    
    // Convert to array of objects
    const memories = values.map(row => {
      const memory = {};
      columns.forEach((col, i) => {
        memory[col] = row[i];
      });
      return memory;
    });
    
    console.log(`Found ${memories.length} memories in SQLite database`);
    
    // Insert memories into MongoDB
    for (const memory of memories) {
      // Map SQLite fields to MongoDB fields
      const mongoMemory = new Memory({
        name: memory.name || 'Memory',
        image: memory.image,
        contentType: 'image/jpeg', // Assume JPEG for legacy images
        createdAt: new Date(memory.created_at || Date.now())
      });
      
      // Save to MongoDB
      await mongoMemory.save();
    }
    
    console.log('Memories migration completed successfully');
  } catch (error) {
    console.error('Error migrating memories:', error.message);
  }
}

// Main migration function
async function migrate() {
  let sqliteDb = null;
  
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');
    
    // Initialize SQLite database
    sqliteDb = await initSqlite();
    
    if (!sqliteDb) {
      console.error('Failed to initialize SQLite database');
      return;
    }
    
    // Migrate data
    await migrateProfiles(sqliteDb);
    await migrateConfessions(sqliteDb);
    await migrateMessages(sqliteDb);
    await migrateMemories(sqliteDb);
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    // Close database connections
    if (sqliteDb) {
      sqliteDb.close();
      console.log('SQLite database connection closed');
    }
    
    await disconnectDB();
    console.log('MongoDB connection closed');
  }
}

// Run the migration
migrate();
