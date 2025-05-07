/**
 * Notification Service
 * 
 * This service handles sending notifications to admins for various events
 * in the application, such as when a new memory image is uploaded and needs approval.
 */

// List of admin emails
const ADMIN_EMAILS = [
  'admin@iitgn.ac.in',
  'yearbook@iitgn.ac.in',
  'maprc@iitgn.ac.in',
  'jayraj.jayraj@iitgn.ac.in'
];

// In-memory store for notifications (will be lost on server restart)
// In a production environment, these should be stored in the database
const notifications = {
  // Map of admin email to array of notifications
  byAdmin: {},
  // Array of all notifications
  all: []
};

/**
 * Send a notification to all admins
 * @param {Object} notification - The notification object
 * @returns {Promise<boolean>} - Whether the notification was sent successfully
 */
async function sendAdminNotification(notification) {
  try {
    // Add timestamp if not provided
    if (!notification.timestamp) {
      notification.timestamp = new Date().toISOString();
    }
    
    // Add a unique ID to the notification
    notification.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Add read status
    notification.read = false;
    
    // Add the notification to the global list
    notifications.all.push(notification);
    
    // Add the notification to each admin's list
    for (const adminEmail of ADMIN_EMAILS) {
      if (!notifications.byAdmin[adminEmail]) {
        notifications.byAdmin[adminEmail] = [];
      }
      notifications.byAdmin[adminEmail].push(notification);
    }
    
    console.log(`Notification sent to ${ADMIN_EMAILS.length} admins:`, notification);
    
    return true;
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return false;
  }
}

/**
 * Get all notifications for an admin
 * @param {string} adminEmail - The admin's email
 * @returns {Array} - Array of notifications
 */
function getAdminNotifications(adminEmail) {
  return notifications.byAdmin[adminEmail] || [];
}

/**
 * Get unread notifications count for an admin
 * @param {string} adminEmail - The admin's email
 * @returns {number} - Number of unread notifications
 */
function getUnreadNotificationsCount(adminEmail) {
  const adminNotifications = notifications.byAdmin[adminEmail] || [];
  return adminNotifications.filter(notification => !notification.read).length;
}

/**
 * Mark a notification as read
 * @param {string} adminEmail - The admin's email
 * @param {string} notificationId - The notification ID
 * @returns {boolean} - Whether the notification was marked as read
 */
function markNotificationAsRead(adminEmail, notificationId) {
  const adminNotifications = notifications.byAdmin[adminEmail] || [];
  const notification = adminNotifications.find(n => n.id === notificationId);
  
  if (notification) {
    notification.read = true;
    return true;
  }
  
  return false;
}

/**
 * Mark all notifications as read for an admin
 * @param {string} adminEmail - The admin's email
 * @returns {number} - Number of notifications marked as read
 */
function markAllNotificationsAsRead(adminEmail) {
  const adminNotifications = notifications.byAdmin[adminEmail] || [];
  let count = 0;
  
  for (const notification of adminNotifications) {
    if (!notification.read) {
      notification.read = true;
      count++;
    }
  }
  
  return count;
}

module.exports = {
  sendAdminNotification,
  getAdminNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead
};
