import React, { useState, useEffect, useRef } from 'react';
import { Dropdown, Badge, Button, Modal, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  getAdminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  approveMemoryImage,
  rejectMemoryImage,
  getMemoryImageUrl
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import './AdminNotifications.css';
import { FaBell, FaCheck, FaTimes, FaEye } from 'react-icons/fa';

const AdminNotifications = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);
  const dropdownRef = useRef(null);

  // Check if user is admin
  const isAdmin = currentUser && currentUser.email &&
    (currentUser.email === 'admin@iitgn.ac.in' ||
     currentUser.email === 'yearbook@iitgn.ac.in' ||
     currentUser.email === 'maprc@iitgn.ac.in' ||
     currentUser.email === 'jayraj.jayraj@iitgn.ac.in');

  // Fetch notifications on component mount and when currentUser changes
  useEffect(() => {
    if (isAdmin) {
      fetchNotifications();

      // Set up polling to check for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);

      return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch notifications from the API
  const fetchNotifications = async () => {
    if (!isAdmin || !currentUser?.email) return;

    try {
      setLoading(true);
      const data = await getAdminNotifications(currentUser.email);
      setNotifications(data);

      // Count unread notifications
      const unread = data.filter(notification => !notification.read).length;
      setUnreadCount(unread);

      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Mark a notification as read
  const handleMarkAsRead = async (notification) => {
    if (!isAdmin || !currentUser?.email) return;

    try {
      await markNotificationAsRead(notification.id, currentUser.email);

      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(n =>
          n.id === notification.id ? { ...n, read: true } : n
        )
      );

      // Update unread count
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    if (!isAdmin || !currentUser?.email) return;

    try {
      await markAllNotificationsAsRead(currentUser.email);

      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(n => ({ ...n, read: true }))
      );

      // Update unread count
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  // View memory image details
  const handleViewMemory = (notification) => {
    setSelectedNotification(notification);
    setShowImageModal(true);

    // Mark as read when viewing
    if (!notification.read) {
      handleMarkAsRead(notification);
    }
  };

  // Approve memory image
  const handleApproveMemory = async () => {
    if (!selectedNotification || !currentUser?.email) return;

    setProcessingAction(true);

    try {
      await approveMemoryImage(selectedNotification.memoryId, currentUser.email);

      // Close modal
      setShowImageModal(false);
      setSelectedNotification(null);

      // Refresh notifications
      fetchNotifications();

      // Show success message
      alert('Memory image approved successfully!');
    } catch (err) {
      console.error('Error approving memory image:', err);
      alert('Failed to approve memory image. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  // Reject memory image
  const handleRejectMemory = async () => {
    if (!selectedNotification || !currentUser?.email) return;

    setProcessingAction(true);

    try {
      await rejectMemoryImage(selectedNotification.memoryId, currentUser.email);

      // Close modal
      setShowImageModal(false);
      setSelectedNotification(null);

      // Refresh notifications
      fetchNotifications();

      // Show success message
      alert('Memory image rejected successfully!');
    } catch (err) {
      console.error('Error rejecting memory image:', err);
      alert('Failed to reject memory image. Please try again.');
    } finally {
      setProcessingAction(false);
    }
  };

  // If not admin, don't render anything
  if (!isAdmin) return null;

  return (
    <div className="admin-notifications" ref={dropdownRef}>
      <div
        className="notification-icon"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <FaBell />
        {unreadCount > 0 && (
          <Badge pill bg="danger" className="notification-badge">
            {unreadCount}
          </Badge>
        )}
      </div>

      {showDropdown && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h5>Notifications</h5>
            <div className="notifications-actions">
              {notifications.length > 0 && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all as read
                </Button>
              )}
              <Link
                to="/pending-approvals"
                className="btn btn-link btn-sm"
                onClick={() => setShowDropdown(false)}
              >
                View All
              </Link>
            </div>
          </div>

          <div className="notifications-body">
            {loading && (
              <div className="text-center p-3">
                <Spinner animation="border" size="sm" />
              </div>
            )}

            {error && (
              <div className="notification-error">
                {error}
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="no-notifications">
                No notifications
              </div>
            )}

            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                onClick={() => handleViewMemory(notification)}
              >
                {notification.type === 'memory_upload' && (
                  <>
                    <div className="notification-content">
                      <strong>New memory image uploaded</strong>
                      <p>
                        {notification.uploadedBy || 'Anonymous'} uploaded a new memory image.
                      </p>
                      <small className="notification-time">
                        {new Date(notification.timestamp).toLocaleString()}
                      </small>
                    </div>
                    <div className="notification-actions">
                      <Button
                        variant="link"
                        size="sm"
                        className="view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewMemory(notification);
                        }}
                      >
                        <FaEye />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image approval modal */}
      <Modal
        show={showImageModal}
        onHide={() => setShowImageModal(false)}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Memory Image Approval</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedNotification && (
            <div className="memory-approval-content">
              <div className="memory-image-container">
                <img
                  src={selectedNotification.imageUrl || getMemoryImageUrl(selectedNotification.memoryId)}
                  alt="Memory"
                  className="memory-preview-image"
                />
              </div>
              <div className="memory-details">
                <p><strong>Uploaded by:</strong> {selectedNotification.uploadedBy || 'Anonymous'}</p>
                <p><strong>Name:</strong> {selectedNotification.name || 'Memory'}</p>
                <p><strong>Uploaded at:</strong> {new Date(selectedNotification.timestamp).toLocaleString()}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowImageModal(false)}
            disabled={processingAction}
          >
            Close
          </Button>
          <Button
            variant="danger"
            onClick={handleRejectMemory}
            disabled={processingAction}
          >
            <FaTimes className="me-1" /> Reject
          </Button>
          <Button
            variant="success"
            onClick={handleApproveMemory}
            disabled={processingAction}
          >
            <FaCheck className="me-1" /> Approve
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminNotifications;
