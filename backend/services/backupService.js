/**
 * Database Backup Service
 *
 * This service provides functionality to backup database data to Google Drive
 * and restore data from backups if needed.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const googleDrive = require('./googleDrive');
const db = require('../models/database');
const mongoose = require('mongoose');
require('dotenv').config();

// Import MongoDB models if MongoDB is enabled
const Profile = mongoose.models.Profile || require('../models/Profile');
const Message = mongoose.models.Message || require('../models/Message');
const Confession = mongoose.models.Confession || require('../models/Confession');
const Memory = mongoose.models.Memory || require('../models/Memory');

// Determine which database to use
const USE_MONGODB = process.env.USE_MONGODB === 'true';

// Folder ID for backups in Google Drive
let backupsFolderId;

/**
 * Initialize the backup service
 * Creates the necessary folders in Google Drive
 */
async function initBackupService() {
  try {
    // Initialize Google Drive
    await googleDrive.initGoogleDrive();

    // Get or create the backups folder
    const backupsFolder = await googleDrive.createFolder('Backups');
    backupsFolderId = backupsFolder.id;
    console.log(`Backups folder ID: ${backupsFolderId}`);

    return true;
  } catch (error) {
    console.error('Error initializing backup service:', error.message);
    throw error;
  }
}

/**
 * Create a backup of the database
 * @param {number} retryCount - Number of retries attempted (default: 0)
 * @returns {Promise<Object>} - The backup metadata
 */
async function createBackup(retryCount = 0) {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 30000; // 30 seconds

  try {
    console.log(`Creating database backup... (Attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);

    // Create a timestamp for the backup
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupDir = path.join(os.tmpdir(), `yearbook-backup-${timestamp}`);

    // Create the backup directory
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    let backupData = {};

    if (USE_MONGODB) {
      // Backup MongoDB data
      backupData = await backupMongoDB(backupDir);
    } else {
      // Backup SQLite data
      backupData = await backupSQLite(backupDir);
    }

    // Validate backup data
    if (!backupData || Object.keys(backupData).length === 0) {
      throw new Error('Backup data is empty or invalid');
    }

    // Create a metadata file
    const metadataPath = path.join(backupDir, 'metadata.json');
    const metadata = {
      timestamp,
      database: USE_MONGODB ? 'MongoDB' : 'SQLite',
      tables: Object.keys(backupData),
      counts: Object.entries(backupData).reduce((acc, [key, value]) => {
        acc[key] = Array.isArray(value) ? value.length : 0;
        return acc;
      }, {})
    };

    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    // Create a backup file
    const backupFileName = `yearbook-backup-${timestamp}.json`;
    const backupFilePath = path.join(backupDir, backupFileName);

    // Write the backup data to a file
    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2));

    // Upload the backup to Google Drive with retry logic
    console.log(`Uploading backup to Google Drive: ${backupFileName}`);
    const fileBuffer = fs.readFileSync(backupFilePath);

    let uploadResult;
    try {
      uploadResult = await googleDrive.uploadFile(
        fileBuffer,
        backupFileName,
        'application/json',
        backupsFolderId
      );
      console.log(`Backup uploaded to Google Drive with ID: ${uploadResult.id}`);
    } catch (uploadError) {
      console.error(`Error uploading backup to Google Drive: ${uploadError.message}`);

      // Clean up temporary files before retrying
      try {
        if (fs.existsSync(backupFilePath)) fs.unlinkSync(backupFilePath);
        if (fs.existsSync(metadataPath)) fs.unlinkSync(metadataPath);
        if (fs.existsSync(backupDir)) fs.rmdirSync(backupDir);
      } catch (cleanupError) {
        console.error(`Error cleaning up temporary files: ${cleanupError.message}`);
      }

      // Retry logic for upload failures
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying backup in ${RETRY_DELAY / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return createBackup(retryCount + 1);
      } else {
        throw new Error(`Failed to upload backup after ${MAX_RETRIES + 1} attempts: ${uploadError.message}`);
      }
    }

    // Clean up temporary files
    try {
      fs.unlinkSync(backupFilePath);
      fs.unlinkSync(metadataPath);
      fs.rmdirSync(backupDir);
    } catch (cleanupError) {
      console.error(`Warning: Error cleaning up temporary files: ${cleanupError.message}`);
      // Continue despite cleanup errors
    }

    return {
      fileId: uploadResult.id,
      fileName: uploadResult.name,
      timestamp,
      metadata
    };
  } catch (error) {
    console.error(`Error creating backup: ${error.message}`);

    // Retry logic for general failures
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying backup in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return createBackup(retryCount + 1);
    } else {
      throw new Error(`Failed to create backup after ${MAX_RETRIES + 1} attempts: ${error.message}`);
    }
  }
}

/**
 * Backup MongoDB data
 * @param {string} backupDir - The directory to store the backup
 * @returns {Promise<Object>} - The backup data
 */
async function backupMongoDB(backupDir) {
  try {
    console.log('Backing up MongoDB data...');

    // Get all data from MongoDB
    const profiles = await Profile.find().lean();
    const messages = await Message.find().lean();
    const confessions = await Confession.find().lean();
    const memories = await Memory.find().lean();

    console.log(`Found ${profiles.length} profiles, ${messages.length} messages, ${confessions.length} confessions, ${memories.length} memories`);

    // Return the data
    return {
      profiles,
      messages,
      confessions,
      memories
    };
  } catch (error) {
    console.error('Error backing up MongoDB data:', error.message);
    throw error;
  }
}

/**
 * Backup SQLite data
 * @param {string} backupDir - The directory to store the backup
 * @returns {Promise<Object>} - The backup data
 */
async function backupSQLite(backupDir) {
  try {
    console.log('Backing up SQLite data...');

    // Get all data from SQLite
    const profiles = db.all('SELECT * FROM profiles');
    const comments = db.all('SELECT * FROM comments');
    const confessions = db.all('SELECT * FROM confessions');
    const messages = db.all('SELECT * FROM messages');
    const memories = db.all('SELECT * FROM memories');

    console.log(`Found ${profiles.length} profiles, ${comments.length} comments, ${confessions.length} confessions, ${messages.length} messages, ${memories.length} memories`);

    // Return the data
    return {
      profiles,
      comments,
      confessions,
      messages,
      memories
    };
  } catch (error) {
    console.error('Error backing up SQLite data:', error.message);
    throw error;
  }
}

/**
 * List all backups
 * @returns {Promise<Array>} - The list of backups
 */
async function listBackups() {
  try {
    console.log('Listing backups...');

    // List all files in the backups folder
    const files = await googleDrive.listFiles(backupsFolderId);

    // Sort by creation time (newest first)
    files.sort((a, b) => {
      const aTime = a.name.match(/yearbook-backup-(.*).json/)?.[1] || '';
      const bTime = b.name.match(/yearbook-backup-(.*).json/)?.[1] || '';
      return bTime.localeCompare(aTime);
    });

    return files;
  } catch (error) {
    console.error('Error listing backups:', error.message);
    throw error;
  }
}

/**
 * Get the most recent backup
 * @returns {Promise<Object|null>} - The most recent backup or null if none exists
 */
async function getMostRecentBackup() {
  try {
    console.log('Getting most recent backup...');

    // Get all backups
    const backups = await listBackups();

    // Return the first backup (newest) or null if no backups exist
    return backups.length > 0 ? backups[0] : null;
  } catch (error) {
    console.error('Error getting most recent backup:', error.message);
    return null;
  }
}

/**
 * Restore data from a backup
 * @param {string} fileId - The ID of the backup file in Google Drive
 * @returns {Promise<Object>} - The restore result
 */
async function restoreFromBackup(fileId) {
  try {
    console.log(`Restoring from backup with ID: ${fileId}`);

    // Get the backup file from Google Drive
    const file = await googleDrive.getFile(fileId);

    // Parse the backup data
    const backupData = JSON.parse(file.content.toString('utf8'));

    // Restore the data
    if (USE_MONGODB) {
      // Restore MongoDB data
      await restoreToMongoDB(backupData);
    } else {
      // Restore SQLite data
      await restoreToSQLite(backupData);
    }

    console.log('Restore completed successfully');

    return {
      success: true,
      message: 'Restore completed successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error restoring from backup:', error.message);
    throw error;
  }
}

/**
 * Restore data to MongoDB
 * @param {Object} backupData - The backup data
 * @returns {Promise<void>}
 */
async function restoreToMongoDB(backupData) {
  try {
    console.log('Restoring data to MongoDB...');

    // Clear existing data
    await Profile.deleteMany({});
    await Message.deleteMany({});
    await Confession.deleteMany({});
    await Memory.deleteMany({});

    // Restore profiles
    if (backupData.profiles && backupData.profiles.length > 0) {
      console.log(`Restoring ${backupData.profiles.length} profiles...`);
      await Profile.insertMany(backupData.profiles);
    }

    // Restore messages
    if (backupData.messages && backupData.messages.length > 0) {
      console.log(`Restoring ${backupData.messages.length} messages...`);
      await Message.insertMany(backupData.messages);
    }

    // Restore confessions
    if (backupData.confessions && backupData.confessions.length > 0) {
      console.log(`Restoring ${backupData.confessions.length} confessions...`);
      await Confession.insertMany(backupData.confessions);
    }

    // Restore memories
    if (backupData.memories && backupData.memories.length > 0) {
      console.log(`Restoring ${backupData.memories.length} memories...`);
      await Memory.insertMany(backupData.memories);
    }

    console.log('MongoDB data restored successfully');
  } catch (error) {
    console.error('Error restoring to MongoDB:', error.message);
    throw error;
  }
}

/**
 * Restore data to SQLite
 * @param {Object} backupData - The backup data
 * @returns {Promise<void>}
 */
async function restoreToSQLite(backupData) {
  try {
    console.log('Restoring data to SQLite...');

    // Clear existing data
    db.exec('DELETE FROM profiles');
    db.exec('DELETE FROM comments');
    db.exec('DELETE FROM confessions');
    db.exec('DELETE FROM messages');
    db.exec('DELETE FROM memories');

    // Restore profiles
    if (backupData.profiles && backupData.profiles.length > 0) {
      console.log(`Restoring ${backupData.profiles.length} profiles...`);
      for (const profile of backupData.profiles) {
        db.run(
          'INSERT INTO profiles (id, user_id, name, designation, description, image_id, image_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [profile.id, profile.user_id, profile.name, profile.designation, profile.description, profile.image_id, profile.image_url, profile.created_at]
        );
      }
    }

    // Restore comments
    if (backupData.comments && backupData.comments.length > 0) {
      console.log(`Restoring ${backupData.comments.length} comments...`);
      for (const comment of backupData.comments) {
        db.run(
          'INSERT INTO comments (id, profile_id, author, content, created_at) VALUES (?, ?, ?, ?, ?)',
          [comment.id, comment.profile_id, comment.author, comment.content, comment.created_at]
        );
      }
    }

    // Restore confessions
    if (backupData.confessions && backupData.confessions.length > 0) {
      console.log(`Restoring ${backupData.confessions.length} confessions...`);
      for (const confession of backupData.confessions) {
        db.run(
          'INSERT INTO confessions (id, message, author, recipient, created_at) VALUES (?, ?, ?, ?, ?)',
          [confession.id, confession.message, confession.author, confession.recipient, confession.created_at]
        );
      }
    }

    // Restore messages
    if (backupData.messages && backupData.messages.length > 0) {
      console.log(`Restoring ${backupData.messages.length} messages...`);
      for (const message of backupData.messages) {
        db.run(
          'INSERT INTO messages (id, author, content, created_at) VALUES (?, ?, ?, ?)',
          [message.id, message.author, message.content, message.created_at]
        );
      }
    }

    // Restore memories
    if (backupData.memories && backupData.memories.length > 0) {
      console.log(`Restoring ${backupData.memories.length} memories...`);
      for (const memory of backupData.memories) {
        db.run(
          'INSERT INTO memories (id, name, image_id, image_url, created_at) VALUES (?, ?, ?, ?, ?)',
          [memory.id, memory.name, memory.image_id, memory.image_url, memory.created_at]
        );
      }
    }

    console.log('SQLite data restored successfully');
  } catch (error) {
    console.error('Error restoring to SQLite:', error.message);
    throw error;
  }
}

module.exports = {
  initBackupService,
  createBackup,
  listBackups,
  getMostRecentBackup,
  restoreFromBackup
};
