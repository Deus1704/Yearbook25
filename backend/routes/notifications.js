/**
 * Notification Routes
 * 
 * This module provides API routes for managing notifications.
 */

const express = require('express');
const router = express.Router();
const {
  getAdminNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead
} = require('../services/notificationService');

// Get all notifications for an admin
router.get('/', async (req, res) => {
  const { adminEmail } = req.query;
  
  if (!adminEmail) {
    return res.status(400).json({ error: 'Admin email is required' });
  }
  
  // Check if the user is an admin
  const isAdmin = adminEmail === 'admin@iitgn.ac.in' || 
                  adminEmail === 'yearbook@iitgn.ac.in' || 
                  adminEmail === 'maprc@iitgn.ac.in' || 
                  adminEmail === 'jayraj.jayraj@iitgn.ac.in';
  
  if (!isAdmin) {
    return res.status(403).json({ error: 'Only admins can access notifications' });
  }
  
  try {
    const notifications = getAdminNotifications(adminEmail);
    res.json(notifications);
  } catch (err) {
    console.error('Error getting admin notifications:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Get unread notifications count for an admin
router.get('/unread/count', async (req, res) => {
  const { adminEmail } = req.query;
  
  if (!adminEmail) {
    return res.status(400).json({ error: 'Admin email is required' });
  }
  
  // Check if the user is an admin
  const isAdmin = adminEmail === 'admin@iitgn.ac.in' || 
                  adminEmail === 'yearbook@iitgn.ac.in' || 
                  adminEmail === 'maprc@iitgn.ac.in' || 
                  adminEmail === 'jayraj.jayraj@iitgn.ac.in';
  
  if (!isAdmin) {
    return res.status(403).json({ error: 'Only admins can access notifications' });
  }
  
  try {
    const count = getUnreadNotificationsCount(adminEmail);
    res.json({ count });
  } catch (err) {
    console.error('Error getting unread notifications count:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Mark a notification as read
router.put('/:id/read', async (req, res) => {
  const { id } = req.params;
  const { adminEmail } = req.body;
  
  if (!adminEmail) {
    return res.status(400).json({ error: 'Admin email is required' });
  }
  
  // Check if the user is an admin
  const isAdmin = adminEmail === 'admin@iitgn.ac.in' || 
                  adminEmail === 'yearbook@iitgn.ac.in' || 
                  adminEmail === 'maprc@iitgn.ac.in' || 
                  adminEmail === 'jayraj.jayraj@iitgn.ac.in';
  
  if (!isAdmin) {
    return res.status(403).json({ error: 'Only admins can mark notifications as read' });
  }
  
  try {
    const success = markNotificationAsRead(adminEmail, id);
    
    if (!success) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Mark all notifications as read
router.put('/read/all', async (req, res) => {
  const { adminEmail } = req.body;
  
  if (!adminEmail) {
    return res.status(400).json({ error: 'Admin email is required' });
  }
  
  // Check if the user is an admin
  const isAdmin = adminEmail === 'admin@iitgn.ac.in' || 
                  adminEmail === 'yearbook@iitgn.ac.in' || 
                  adminEmail === 'maprc@iitgn.ac.in' || 
                  adminEmail === 'jayraj.jayraj@iitgn.ac.in';
  
  if (!isAdmin) {
    return res.status(403).json({ error: 'Only admins can mark notifications as read' });
  }
  
  try {
    const count = markAllNotificationsAsRead(adminEmail);
    res.json({ message: `${count} notifications marked as read` });
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
