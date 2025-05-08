/**
 * Scheduled tasks service for the Yearbook25 application
 * Handles periodic tasks like checking for deleted images
 */
const axios = require('axios');
const db = require('../models/database');
const fileStorage = require('./fileStorage');
const googleDrive = require('./googleDrive');

// Configuration
const CHECK_DELETED_IMAGES_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Initialize scheduled tasks
 */
function initScheduledTasks() {
  console.log('Initializing scheduled tasks...');
  
  // Schedule tasks
  scheduleCheckDeletedImages();
  
  console.log('Scheduled tasks initialized');
}

/**
 * Schedule the task to check for deleted images
 */
function scheduleCheckDeletedImages() {
  console.log('Scheduling check for deleted images every', CHECK_DELETED_IMAGES_INTERVAL / (60 * 1000), 'minutes');
  
  // Run immediately on startup
  checkDeletedImages();
  
  // Then schedule to run periodically
  setInterval(checkDeletedImages, CHECK_DELETED_IMAGES_INTERVAL);
}

/**
 * Check for deleted images in Google Drive and update their status in the database
 */
async function checkDeletedImages() {
  console.log('Checking for deleted images in Google Drive...');
  
  try {
    // Get all memories with Google Drive images
    const memories = db.all(`
      SELECT id, name, image_id, image_url, status
      FROM memories
      WHERE image_id IS NOT NULL
    `);
    
    // Get all profiles with Google Drive images
    const profiles = db.all(`
      SELECT id, name, image_id, image_url, status
      FROM profiles
      WHERE image_id IS NOT NULL
    `);
    
    console.log(`Found ${memories.length} memories and ${profiles.length} profiles with Google Drive images`);
    
    // Check if the files exist in Google Drive
    const checkedMemories = await fileStorage.checkFilesExistence(memories);
    const checkedProfiles = await fileStorage.checkFilesExistence(profiles);
    
    // Update the status of each memory
    let updatedMemoriesCount = 0;
    
    for (const memory of checkedMemories) {
      // If the file doesn't exist and the status is not already 'deleted'
      if (!memory.exists && memory.status !== 'deleted') {
        db.run(
          'UPDATE memories SET status = ? WHERE id = ?',
          ['deleted', memory.id]
        );
        updatedMemoriesCount++;
      }
      // If the file exists but the status is 'deleted', update it back to 'active'
      else if (memory.exists && memory.status === 'deleted') {
        db.run(
          'UPDATE memories SET status = ? WHERE id = ?',
          ['active', memory.id]
        );
        updatedMemoriesCount++;
      }
    }
    
    // Update the status of each profile
    let updatedProfilesCount = 0;
    
    for (const profile of checkedProfiles) {
      // If the file doesn't exist and the status is not already 'deleted'
      if (!profile.exists && profile.status !== 'deleted') {
        db.run(
          'UPDATE profiles SET status = ? WHERE id = ?',
          ['deleted', profile.id]
        );
        updatedProfilesCount++;
      }
      // If the file exists but the status is 'deleted', update it back to 'active'
      else if (profile.exists && profile.status === 'deleted') {
        db.run(
          'UPDATE profiles SET status = ? WHERE id = ?',
          ['active', profile.id]
        );
        updatedProfilesCount++;
      }
    }
    
    console.log(`Updated ${updatedMemoriesCount} memories and ${updatedProfilesCount} profiles`);
  } catch (error) {
    console.error('Error checking for deleted images:', error.message);
  }
}

module.exports = {
  initScheduledTasks,
  checkDeletedImages
};
