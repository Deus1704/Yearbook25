/**
 * Auto Restore Service
 *
 * This service automatically restores data from the most recent backup
 * when the server starts, ensuring data persistence across Render restarts.
 */

const backupService = require('./backupService');
require('dotenv').config();

// Flag to track if auto-restore is enabled
const AUTO_RESTORE_ENABLED = process.env.ENABLE_AUTO_RESTORE !== 'false';

/**
 * Initialize the auto-restore service
 * This will check for the most recent backup and restore it if found
 * @param {number} retryCount - Number of retries attempted (default: 0)
 * @returns {Promise<boolean>} - Whether the auto-restore was successful
 */
async function initAutoRestore(retryCount = 0) {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 30000; // 30 seconds

  if (!AUTO_RESTORE_ENABLED) {
    console.log('Auto-restore is disabled. Set ENABLE_AUTO_RESTORE=true to enable.');
    return false;
  }

  try {
    console.log(`Initializing auto-restore service... (Attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);

    // Initialize the backup service first
    await backupService.initBackupService();

    // Get the most recent backup
    const mostRecentBackup = await backupService.getMostRecentBackup();

    if (!mostRecentBackup) {
      console.log('No backups found. Skipping auto-restore.');
      return false;
    }

    console.log(`Found most recent backup: ${mostRecentBackup.name} (ID: ${mostRecentBackup.id})`);

    // Validate the backup file exists and is accessible
    try {
      // Restore from the most recent backup
      console.log(`Auto-restoring from backup: ${mostRecentBackup.name}`);
      await backupService.restoreFromBackup(mostRecentBackup.id);

      console.log('Auto-restore completed successfully');
      return true;
    } catch (restoreError) {
      console.error(`Error restoring from backup: ${restoreError.message}`);

      // If this is a specific error related to the backup file not being found or corrupted,
      // try the next most recent backup if available
      if (restoreError.message.includes('not found') ||
          restoreError.message.includes('parse') ||
          restoreError.message.includes('invalid')) {

        console.log('Trying to find an alternative backup...');
        const backups = await backupService.listBackups();

        // Skip the first one (which just failed) and try the next one if available
        if (backups.length > 1) {
          const alternativeBackup = backups[1];
          console.log(`Attempting to restore from alternative backup: ${alternativeBackup.name}`);

          try {
            await backupService.restoreFromBackup(alternativeBackup.id);
            console.log('Auto-restore from alternative backup completed successfully');
            return true;
          } catch (altRestoreError) {
            console.error(`Error restoring from alternative backup: ${altRestoreError.message}`);
            throw altRestoreError; // Let the retry logic handle it
          }
        } else {
          console.log('No alternative backups available');
          throw restoreError; // Let the retry logic handle it
        }
      } else {
        throw restoreError; // Let the retry logic handle it
      }
    }
  } catch (error) {
    console.error(`Error during auto-restore: ${error.message}`);

    // Retry logic
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying auto-restore in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return initAutoRestore(retryCount + 1);
    } else {
      console.error(`Failed to auto-restore after ${MAX_RETRIES + 1} attempts`);
      return false;
    }
  }
}

module.exports = {
  initAutoRestore
};
