/**
 * Schedule Backup Script
 *
 * This script schedules automatic backups of the database to Google Drive.
 * It can be run as a standalone script or as part of the server startup.
 */

const backupService = require('../services/backupService');
const googleDrive = require('../services/googleDrive');
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

    // Try to create the backup with retry logic built into the backup service
    const result = await backupService.createBackup();
    console.log(`Backup completed successfully. File ID: ${result.fileId}`);

    // List existing backups
    const backups = await backupService.listBackups();
    console.log(`Total backups: ${backups.length}`);

    // Keep only the last 20 backups to save space (approximately 3.3 hours of backups at 10-minute intervals)
    // This ensures we have enough history while preventing Google Drive from filling up
    const MAX_BACKUPS_TO_KEEP = 20;

    if (backups.length > MAX_BACKUPS_TO_KEEP) {
      console.log(`Cleaning up old backups... Keeping the ${MAX_BACKUPS_TO_KEEP} most recent backups`);
      const oldBackups = backups.slice(MAX_BACKUPS_TO_KEEP);

      // Delete old backups in parallel with a limit of 3 concurrent deletions
      const deletePromises = [];
      const MAX_CONCURRENT_DELETIONS = 3;

      for (let i = 0; i < oldBackups.length; i += MAX_CONCURRENT_DELETIONS) {
        const batch = oldBackups.slice(i, i + MAX_CONCURRENT_DELETIONS);
        const batchPromises = batch.map(async (backup) => {
          try {
            await googleDrive.deleteFile(backup.id);
            console.log(`Deleted old backup: ${backup.name}`);
            return { success: true, name: backup.name };
          } catch (deleteError) {
            console.error(`Failed to delete old backup ${backup.name}:`, deleteError.message);
            return { success: false, name: backup.name, error: deleteError.message };
          }
        });

        // Wait for the current batch to complete before starting the next batch
        const results = await Promise.all(batchPromises);
        deletePromises.push(...results);
      }

      // Log summary of deletion results
      const successfulDeletions = deletePromises.filter(r => r.success).length;
      console.log(`Successfully deleted ${successfulDeletions} of ${oldBackups.length} old backups`);
    }
  } catch (error) {
    console.error('Error performing backup:', error.message);

    // Log detailed error information for debugging
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }

    // Even if there's an error, we don't want to crash the application
    // The next scheduled backup will try again
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
