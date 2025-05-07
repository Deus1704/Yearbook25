/**
 * Backup Routes
 * 
 * This module provides API routes for managing database backups.
 */

const express = require('express');
const router = express.Router();
const backupService = require('../services/backupService');

// Get all backups
router.get('/', async (req, res) => {
  try {
    const backups = await backupService.listBackups();
    res.json(backups);
  } catch (err) {
    console.error('Error listing backups:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Create a new backup
router.post('/', async (req, res) => {
  try {
    const result = await backupService.createBackup();
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating backup:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Restore from a backup
router.post('/restore/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    
    if (!fileId) {
      return res.status(400).json({ error: 'File ID is required' });
    }
    
    const result = await backupService.restoreFromBackup(fileId);
    res.json(result);
  } catch (err) {
    console.error('Error restoring from backup:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
