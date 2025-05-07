/**
 * Schedule Backup Script
 *
 * This script schedules automatic backups of the database to Google Drive.
 * It can be run as a standalone script or as part of the server startup.
 */

const backupService = require('../services/backupService');
require('dotenv').config();

// Default backup interval in hours
const DEFAULT_BACKUP_INTERVAL = 24; // Once per day

// Get backup interval from environment variable or use default
const backupIntervalHours = parseFloat(process.env.BACKUP_INTERVAL_HOURS || DEFAULT_BACKUP_INTERVAL);
const backupIntervalMs = backupIntervalHours * 60 * 60 * 1000;

// Flag to track if backup service is initialized
let isInitialized = false;

/**
 * Initialize the backup service
 */
async function initializeBackupService() {
  if (isInitialized) return;

  try {
    await backupService.initBackupService();
    isInitialized = true;
    console.log('Backup service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize backup service:', error.message);
  }
}

/**
 * Perform a backup
 */
async function performBackup() {
  try {
    if (!isInitialized) {
      await initializeBackupService();
    }

    console.log(`Starting scheduled backup at ${new Date().toISOString()}`);
    const result = await backupService.createBackup();
    console.log(`Backup completed successfully. File ID: ${result.fileId}`);

    // List existing backups
    const backups = await backupService.listBackups();
    console.log(`Total backups: ${backups.length}`);

    // Keep only the last 10 backups to save space
    if (backups.length > 10) {
      console.log('Cleaning up old backups...');
      const oldBackups = backups.slice(10);
      for (const backup of oldBackups) {
        try {
          await googleDrive.deleteFile(backup.id);
          console.log(`Deleted old backup: ${backup.name}`);
        } catch (deleteError) {
          console.error(`Failed to delete old backup ${backup.name}:`, deleteError.message);
        }
      }
    }
  } catch (error) {
    console.error('Error performing backup:', error.message);
  }
}

/**
 * Schedule regular backups
 */
function scheduleBackups() {
  const intervalMinutes = backupIntervalHours * 60;
  console.log(`Scheduling automatic backups every ${backupIntervalHours} hours (${intervalMinutes} minutes)`);

  // Perform an initial backup
  performBackup();

  // Schedule regular backups
  setInterval(performBackup, backupIntervalMs);
}

// If this script is run directly, schedule backups
if (require.main === module) {
  (async () => {
    try {
      await initializeBackupService();
      scheduleBackups();
    } catch (error) {
      console.error('Error scheduling backups:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = {
  initializeBackupService,
  performBackup,
  scheduleBackups
};
