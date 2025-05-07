import React, { useState, useEffect } from 'react';
import './Confessions.css';
import { Link } from 'react-router-dom';
import Navbardesk from './Navbar';
import { getConfessions, addConfession } from '../services/api';
import { Button, Form, Modal, Spinner, Alert, Card, Container, Row, Col } from 'react-bootstrap';
import { FaHeart, FaRegHeart, FaUser, FaCalendarAlt, FaPaperPlane } from 'react-icons/fa';

const Confessions = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newConfession, setNewConfession] = useState({
    message: '',
    author: 'Anonymous',
    recipient: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  useEffect(() => {
    fetchConfessions();
  }, []);

  const fetchConfessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getConfessions();
      setConfessions(data);
    } catch (err) {
      console.error('Error fetching confessions:', err);
      setError('Failed to load confessions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewConfession(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newConfession.message.trim()) return;

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await addConfession(newConfession);
      setSubmitSuccess(true);
      setNewConfession({
        message: '',
        author: 'Anonymous',
        recipient: ''
      });
      // Refresh the confessions list
      fetchConfessions();
      // Close the modal after a short delay
      setTimeout(() => {
        setShowModal(false);
        setSubmitSuccess(false);
      }, 1500);
    } catch (err) {
      console.error('Error adding confession:', err);
      setSubmitError('Failed to submit confession. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Function to handle liking a confession
  const [likedConfessions, setLikedConfessions] = useState({});

  const handleLike = (id) => {
    setLikedConfessions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Format date in a more readable way
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      {!isMobile && <Navbardesk />}
      <div className="confessions-container">
        <Container>
          <div className="header-section">
            <div className="back-link-container">
              <Link to="/" className="back-button">
                <i className="fas fa-arrow-left"></i> Back to Home
              </Link>
            </div>
            <div className="title-container">
              <h1 className="confessions-title">Yearbook 2025 Confessions</h1>
              <p className="confessions-subtitle">Share your thoughts, memories, and messages anonymously</p>
            </div>
          </div>

          <div className="action-section mb-4">
            <Button
              variant="primary"
              size="lg"
              className="add-confession-btn"
              onClick={() => setShowModal(true)}
            >
              <FaPaperPlane className="me-2" /> Share Your Confession
            </Button>
          </div>

          {loading ? (
            <div className="text-center p-5 loading-container">
              <Spinner animation="border" role="status" variant="primary" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-3">Loading confessions...</p>
            </div>
          ) : error ? (
            <Alert variant="danger" className="m-3 error-alert">
              <h4>Error Loading Confessions</h4>
              <p>{error}</p>
              <Button variant="outline-danger" onClick={fetchConfessions}>Try Again</Button>
            </Alert>
          ) : confessions.length === 0 ? (
            <div className="empty-state">
              <div className="text-center p-5">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png"
                  alt="No confessions"
                  className="empty-state-image"
                />
                <h3 className="mt-4">No confessions yet</h3>
                <p className="text-muted">Be the first to share your thoughts!</p>
                <Button
                  variant="primary"
                  onClick={() => setShowModal(true)}
                  className="mt-3"
                >
                  Add the First Confession
                </Button>
              </div>
            </div>
          ) : (
            <Row className="confessions-list">
              {confessions.map((confession) => (
                <Col xs={12} md={6} lg={4} className="mb-4" key={confession.id}>
                  <Card className="confession-card h-100">
                    <Card.Body>
                      {confession.recipient && (
                        <div className="confession-recipient">
                          <span className="recipient-label">To:</span> {confession.recipient}
                        </div>
                      )}
                      <Card.Text className="confession-message">{confession.message}</Card.Text>
                      <div className="confession-footer">
                        <div className="confession-author">
                          <FaUser className="me-1" /> {confession.author || 'Anonymous'}
                        </div>
                        <div className="confession-date">
                          <FaCalendarAlt className="me-1" /> {formatDate(confession.created_at)}
                        </div>
                      </div>
                    </Card.Body>
                    <Card.Footer className="text-end bg-white border-top-0">
                      <Button
                        variant="link"
                        className={`like-button ${likedConfessions[confession.id] ? 'liked' : ''}`}
                        onClick={() => handleLike(confession.id)}
                      >
                        {likedConfessions[confession.id] ? <FaHeart /> : <FaRegHeart />}
                        <span className="ms-1">
                          {likedConfessions[confession.id] ? 'Liked' : 'Like'}
                        </span>
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </div>

      {/* Add Confession Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg" className="confession-modal">
        <Modal.Header closeButton className="confession-modal-header">
          <Modal.Title>
            <FaPaperPlane className="me-2" /> Share Your Confession
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="confession-modal-body">
          {submitSuccess && (
            <Alert variant="success" className="success-alert">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <i className="fas fa-check-circle fa-2x"></i>
                </div>
                <div>
                  <h5 className="mb-1">Success!</h5>
                  <p className="mb-0">Your confession has been shared successfully.</p>
                </div>
              </div>
            </Alert>
          )}
          {submitError && (
            <Alert variant="danger" className="error-alert">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <i className="fas fa-exclamation-circle fa-2x"></i>
                </div>
                <div>
                  <h5 className="mb-1">Error</h5>
                  <p className="mb-0">{submitError}</p>
                </div>
              </div>
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label><FaUser className="me-1" /> Your Name (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="author"
                    value={newConfession.author}
                    onChange={handleInputChange}
                    placeholder="Anonymous"
                    className="confession-input"
                  />
                  <Form.Text className="text-muted">
                    Leave as 'Anonymous' if you prefer not to share your name.
                  </Form.Text>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label><i className="fas fa-user-friends me-1"></i> Recipient (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="recipient"
                    value={newConfession.recipient}
                    onChange={handleInputChange}
                    placeholder="Who is this confession for?"
                    className="confession-input"
                  />
                  <Form.Text className="text-muted">
                    Enter the name of the person this message is for.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label><i className="fas fa-comment-alt me-1"></i> Your Confession</Form.Label>
              <Form.Control
                as="textarea"
                name="message"
                value={newConfession.message}
                onChange={handleInputChange}
                placeholder="Write your confession, memory, or message here..."
                rows={6}
                required
                className="confession-textarea"
              />
              <Form.Text className="text-muted">
                Share your thoughts, memories, or messages. Be respectful and kind.
              </Form.Text>
            </Form.Group>

            <div className="mt-4">
              <div className="confession-privacy-note mb-3">
                <i className="fas fa-lock me-1"></i> Your confession will be shared anonymously unless you provide your name.
              </div>
              <div className="d-flex justify-content-between">
                <Button
                  variant="outline-secondary"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  className="submit-btn"
                  disabled={!newConfession.message.trim() || submitting}
                >
                  {submitting ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="me-2" /> Share Confession
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {isMobile && <Navbardesk />}
    </>
  );
};

export default Confessions;
