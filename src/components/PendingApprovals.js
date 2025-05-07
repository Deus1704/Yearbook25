import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getPendingMemoryImages, 
  getMemoryImageUrl, 
  approveMemoryImage, 
  rejectMemoryImage 
} from '../services/api';
import Navbardesk from './Navbar';
import './PendingApprovals.css';
import { FaCheck, FaTimes } from 'react-icons/fa';

const PendingApprovals = () => {
  const { currentUser } = useAuth();
  const [pendingImages, setPendingImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingItems, setProcessingItems] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  // Check if user is admin
  const isAdmin = currentUser && currentUser.email &&
    (currentUser.email === 'admin@iitgn.ac.in' ||
     currentUser.email === 'yearbook@iitgn.ac.in' ||
     currentUser.email === 'maprc@iitgn.ac.in' ||
     currentUser.email === 'jayraj.jayraj@iitgn.ac.in');

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Fetch pending approvals on component mount
  useEffect(() => {
    if (isAdmin) {
      fetchPendingApprovals();
    }
  }, [isAdmin]);

  // Fetch pending approvals from the API
  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const data = await getPendingMemoryImages();
      setPendingImages(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching pending approvals:', err);
      setError('Failed to load pending approvals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle approve memory image
  const handleApprove = async (id) => {
    if (!currentUser?.email) return;
    
    // Set processing state for this item
    setProcessingItems(prev => ({ ...prev, [id]: 'approving' }));
    
    try {
      await approveMemoryImage(id, currentUser.email);
      
      // Remove the approved item from the list
      setPendingImages(prev => prev.filter(item => item.id !== id));
      
      // Show success message
      alert('Memory image approved successfully!');
    } catch (err) {
      console.error('Error approving memory image:', err);
      alert('Failed to approve memory image. Please try again.');
    } finally {
      // Clear processing state
      setProcessingItems(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  // Handle reject memory image
  const handleReject = async (id) => {
    if (!currentUser?.email) return;
    
    // Set processing state for this item
    setProcessingItems(prev => ({ ...prev, [id]: 'rejecting' }));
    
    try {
      await rejectMemoryImage(id, currentUser.email);
      
      // Remove the rejected item from the list
      setPendingImages(prev => prev.filter(item => item.id !== id));
      
      // Show success message
      alert('Memory image rejected successfully!');
    } catch (err) {
      console.error('Error rejecting memory image:', err);
      alert('Failed to reject memory image. Please try again.');
    } finally {
      // Clear processing state
      setProcessingItems(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  // If not admin, redirect or show access denied
  if (!isAdmin) {
    return (
      <>
        {!isMobile && <Navbardesk />}
        <Container className="pending-approvals-container">
          <div className="access-denied">
            <h2>Access Denied</h2>
            <p>You do not have permission to view this page.</p>
            <Link to="/" className="btn btn-primary">
              Go to Home
            </Link>
          </div>
        </Container>
        {isMobile && <Navbardesk />}
      </>
    );
  }

  return (
    <>
      {!isMobile && <Navbardesk />}
      <Container className="pending-approvals-container">
        <div className="page-header">
          <h2>Pending Memory Approvals</h2>
          <Button 
            variant="outline-primary" 
            onClick={fetchPendingApprovals}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center p-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3">Loading pending approvals...</p>
          </div>
        ) : pendingImages.length === 0 ? (
          <div className="no-pending-approvals">
            <div className="empty-state-icon">
              <FaCheck size={50} />
            </div>
            <h3>No Pending Approvals</h3>
            <p>All memory images have been reviewed.</p>
          </div>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4 mt-3">
            {pendingImages.map(image => (
              <Col key={image.id}>
                <Card className="memory-approval-card">
                  <div className="card-img-container">
                    <Card.Img 
                      variant="top" 
                      src={getMemoryImageUrl(image.id)} 
                      alt={image.name || 'Memory Image'}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                      }}
                    />
                  </div>
                  <Card.Body>
                    <Card.Title>{image.name || 'Memory Image'}</Card.Title>
                    <Card.Text>
                      <small className="text-muted">
                        Uploaded by: {image.uploaded_by || 'Anonymous'}<br />
                        Date: {new Date(image.created_at).toLocaleString()}
                      </small>
                    </Card.Text>
                    <div className="approval-actions">
                      <Button
                        variant="danger"
                        onClick={() => handleReject(image.id)}
                        disabled={!!processingItems[image.id]}
                      >
                        {processingItems[image.id] === 'rejecting' ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-1"
                            />
                            Rejecting...
                          </>
                        ) : (
                          <>
                            <FaTimes className="me-1" /> Reject
                          </>
                        )}
                      </Button>
                      <Button
                        variant="success"
                        onClick={() => handleApprove(image.id)}
                        disabled={!!processingItems[image.id]}
                      >
                        {processingItems[image.id] === 'approving' ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-1"
                            />
                            Approving...
                          </>
                        ) : (
                          <>
                            <FaCheck className="me-1" /> Approve
                          </>
                        )}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
      {isMobile && <Navbardesk />}
    </>
  );
};

export default PendingApprovals;
