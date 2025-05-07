import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Modal, Spinner } from 'react-bootstrap';
import { getBackups, createBackup, restoreFromBackup } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbardesk from './Navbar';
import './BackupManager.css';

const BackupManager = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  // Check if user is admin
  const isAdmin = currentUser && currentUser.email &&
    (currentUser.email === 'admin@iitgn.ac.in' ||
     currentUser.email === 'yearbook@iitgn.ac.in' ||
     currentUser.email === 'maprc@iitgn.ac.in' ||
     currentUser.email === 'jayraj.jayraj@iitgn.ac.in');

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      navigate('/');
      return;
    }

    fetchBackups();
  }, [isAdmin, navigate]);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const data = await getBackups();
      setBackups(data);
      setError('');
    } catch (err) {
      console.error('Error fetching backups:', err);
      setError('Failed to load backups. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setActionInProgress(true);
      setSuccess('');
      setError('');

      const result = await createBackup();

      setSuccess('Backup created successfully!');
      await fetchBackups();
    } catch (err) {
      console.error('Error creating backup:', err);
      setError('Failed to create backup. Please try again.');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleRestoreClick = (backup) => {
    setSelectedBackup(backup);
    setShowRestoreModal(true);
  };

  const handleRestoreConfirm = async () => {
    try {
      setActionInProgress(true);
      setShowRestoreModal(false);
      setSuccess('');
      setError('');

      await restoreFromBackup(selectedBackup.id);

      setSuccess('Database restored successfully!');
      await fetchBackups();
    } catch (err) {
      console.error('Error restoring backup:', err);
      setError('Failed to restore from backup. Please try again.');
    } finally {
      setActionInProgress(false);
      setSelectedBackup(null);
    }
  };

  const formatDate = (dateString) => {
    // Extract date from filename like "yearbook-backup-2023-05-15T12-30-45.123Z.json"
    const match = dateString.match(/yearbook-backup-(.*?)\.json/);
    if (match && match[1]) {
      const timestamp = match[1].replace(/-/g, ':');
      return new Date(timestamp).toLocaleString();
    }
    return 'Unknown date';
  };

  if (!isAdmin) {
    return null; // Don't render anything if not admin
  }

  return (
    <>
      <Navbardesk />
      <Container className="backup-manager-container">
        <h2 className="text-center mb-4">Database Backup Manager</h2>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <div className="d-flex justify-content-between mb-4">
          <Button
            variant="primary"
            onClick={handleCreateBackup}
            disabled={actionInProgress}
          >
            {actionInProgress ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Creating Backup...</span>
              </>
            ) : (
              'Create New Backup'
            )}
          </Button>

          <Button
            variant="outline-secondary"
            onClick={fetchBackups}
            disabled={actionInProgress}
          >
            Refresh List
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3">Loading backups...</p>
          </div>
        ) : (
          <div className="backup-table-container">
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Backup Name</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {backups.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center">No backups found</td>
                  </tr>
                ) : (
                  backups.map((backup) => (
                    <tr key={backup.id}>
                      <td>{backup.name}</td>
                      <td>{formatDate(backup.name)}</td>
                      <td>
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handleRestoreClick(backup)}
                          disabled={actionInProgress}
                        >
                          Restore
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        )}

        {/* Restore Confirmation Modal */}
        <Modal show={showRestoreModal} onHide={() => setShowRestoreModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Restore</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to restore the database from this backup?</p>
            <p><strong>Warning:</strong> This will replace all current data with the data from the backup.</p>
            {selectedBackup && (
              <p>Backup: {selectedBackup.name} ({formatDate(selectedBackup.name)})</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRestoreModal(false)}>
              Cancel
            </Button>
            <Button variant="warning" onClick={handleRestoreConfirm}>
              Restore
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default BackupManager;
