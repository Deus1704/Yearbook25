import React, { useState, useEffect } from 'react';
import { Toast as BootstrapToast, ToastContainer } from 'react-bootstrap';
import './Toast.css';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';

/**
 * Custom Toast component for displaying notifications
 * @param {Object} props - Component props
 * @param {string} props.message - The message to display in the toast
 * @param {string} props.type - The type of toast (success, error, info)
 * @param {boolean} props.show - Whether to show the toast
 * @param {function} props.onClose - Function to call when the toast is closed
 * @param {number} props.autoHideDelay - Delay in ms before auto-hiding the toast (default: 5000)
 * @param {string} props.position - Position of the toast (default: 'top-center')
 */
const Toast = ({
  message,
  type = 'success',
  show,
  onClose,
  autoHideDelay = 5000,
  position = 'top-center'
}) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    setVisible(show);
  }, [show]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  // Determine the icon based on the toast type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="toast-icon success" />;
      case 'error':
        return <FaExclamationCircle className="toast-icon error" />;
      case 'info':
      default:
        return <FaInfoCircle className="toast-icon info" />;
    }
  };

  // Determine the background color based on the toast type
  const getBackgroundClass = () => {
    switch (type) {
      case 'success':
        return 'bg-success-light';
      case 'error':
        return 'bg-danger-light';
      case 'info':
      default:
        return 'bg-info-light';
    }
  };

  return (
    <ToastContainer position={position} className="p-3 toast-container">
      <BootstrapToast
        show={visible}
        onClose={handleClose}
        delay={autoHideDelay}
        autohide
        className={`custom-toast ${getBackgroundClass()}`}
      >
        <BootstrapToast.Header closeButton>
          <div className="toast-header-content">
            {getIcon()}
            <strong className="me-auto">
              {type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Information'}
            </strong>
          </div>
        </BootstrapToast.Header>
        <BootstrapToast.Body>{message}</BootstrapToast.Body>
      </BootstrapToast>
    </ToastContainer>
  );
};

export default Toast;
