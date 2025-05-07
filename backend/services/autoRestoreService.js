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
 * @returns {Promise<boolean>} - Whether the auto-restore was successful
 */
async function initAutoRestore() {
  if (!AUTO_RESTORE_ENABLED) {
    console.log('Auto-restore is disabled. Set ENABLE_AUTO_RESTORE=true to enable.');
    return false;
  }

  try {
    console.log('Initializing auto-restore service...');
    
    // Initialize the backup service first
    await backupService.initBackupService();
    
    // Get the most recent backup
    const mostRecentBackup = await backupService.getMostRecentBackup();
    
    if (!mostRecentBackup) {
      console.log('No backups found. Skipping auto-restore.');
      return false;
    }
    
    console.log(`Found most recent backup: ${mostRecentBackup.name}`);
    
    // Restore from the most recent backup
    console.log(`Auto-restoring from backup: ${mostRecentBackup.name}`);
    await backupService.restoreFromBackup(mostRecentBackup.id);
    
    console.log('Auto-restore completed successfully');
    return true;
  } catch (error) {
    console.error('Error during auto-restore:', error.message);
    return false;
  }
}

module.exports = {
  initAutoRestore
};
