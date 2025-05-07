/**
 * Database Manager
 * 
 * This module provides a unified interface for database operations,
 * supporting both SQLite and MongoDB backends.
 */

const dotenv = require('dotenv');
dotenv.config();

// Import database modules
const sqliteDb = require('./database');
const mongoDb = require('./mongodb');

// Import MongoDB models
const Profile = require('./Profile');
const Message = require('./Message');
const Confession = require('./Confession');
const Memory = require('./Memory');

// Determine which database to use
const USE_MONGODB = process.env.USE_MONGODB === 'true';

/**
 * Initialize the database
 */
async function init() {
  if (USE_MONGODB) {
    console.log('Initializing MongoDB database');
    return await mongoDb.connectDB();
  } else {
    console.log('Initializing SQLite database');
    return await sqliteDb.init();
  }
}

/**
 * Get the appropriate routes based on the database type
 */
function getRoutes() {
  if (USE_MONGODB) {
    return {
      profiles: require('../routes/mongodb/profiles'),
      confessions: require('../routes/mongodb/confessions'),
      messages: require('../routes/mongodb/messages'),
      memories: require('../routes/mongodb/memories')
    };
  } else {
    return {
      profiles: require('../routes/profiles'),
      confessions: require('../routes/confessions'),
      messages: require('../routes/messages'),
      memories: require('../routes/memories')
    };
  }
}

/**
 * Convert SQLite data to MongoDB format
 * This is useful for migrating data from SQLite to MongoDB
 */
async function migrateToMongoDB() {
  if (!USE_MONGODB) {
    console.error('MongoDB is not enabled. Set USE_MONGODB=true to enable migration.');
    return false;
  }

  try {
    // Initialize both databases
    await sqliteDb.init();
    await mongoDb.connectDB();

    console.log('Migration started: SQLite to MongoDB');

    // Migrate profiles
    const profiles = sqliteDb.all('SELECT * FROM profiles');
    console.log(`Migrating ${profiles.length} profiles`);
    
    for (const profile of profiles) {
      const newProfile = new Profile({
        userId: profile.user_id,
        name: profile.name,
        department: profile.designation.split(' ')[0] || 'Department',
        degree: profile.designation.split(' ').slice(1).join(' ') || 'Degree',
        quote: profile.description,
        imageId: profile.image_id,
        imageUrl: profile.image_url,
        image: profile.image,
        createdAt: new Date(profile.created_at),
        updatedAt: new Date()
      });

      // Migrate comments for this profile
      const comments = sqliteDb.all('SELECT * FROM comments WHERE profile_id = ?', [profile.id]);
      
      if (comments && comments.length > 0) {
        for (const comment of comments) {
          newProfile.comments.push({
            userId: 'migrated-' + comment.id,
            name: comment.author,
            text: comment.content,
            createdAt: new Date(comment.created_at)
          });
        }
      }

      await newProfile.save();
    }

    // Migrate confessions
    const confessions = sqliteDb.all('SELECT * FROM confessions');
    console.log(`Migrating ${confessions.length} confessions`);
    
    for (const confession of confessions) {
      const newConfession = new Confession({
        text: confession.message,
        anonymous: confession.author === 'Anonymous',
        name: confession.author !== 'Anonymous' ? confession.author : null,
        createdAt: new Date(confession.created_at)
      });

      await newConfession.save();
    }

    // Migrate messages
    const messages = sqliteDb.all('SELECT * FROM messages');
    console.log(`Migrating ${messages.length} messages`);
    
    for (const message of messages) {
      const newMessage = new Message({
        userId: 'migrated-' + message.id,
        name: message.author,
        text: message.content,
        createdAt: new Date(message.created_at)
      });

      await newMessage.save();
    }

    // Migrate memories
    const memories = sqliteDb.all('SELECT * FROM memories');
    console.log(`Migrating ${memories.length} memories`);
    
    for (const memory of memories) {
      const newMemory = new Memory({
        name: memory.name,
        imageId: memory.image_id,
        imageUrl: memory.image_url,
        createdAt: new Date(memory.created_at)
      });

      await newMemory.save();
    }

    console.log('Migration completed successfully');
    return true;
  } catch (error) {
    console.error('Error during migration:', error);
    return false;
  }
}

module.exports = {
  init,
  getRoutes,
  migrateToMongoDB,
  USE_MONGODB
};
