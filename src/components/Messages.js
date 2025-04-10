import React, { useState, useEffect } from 'react';
import './Messages.css';
import { Link } from 'react-router-dom';
import Navbardesk from './Navbar';
import { getMessages, addMessage } from '../services/api';
import { Button, Form, Spinner, Alert, Container } from 'react-bootstrap';
import { FaPlus, FaTimes } from 'react-icons/fa';

const Messages = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState({
    author: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).displayName : 'Anonymous',
    content: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

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
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMessages();
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMessage(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.content.trim()) return;

    setSubmitting(true);
    try {
      await addMessage(newMessage);
      setNewMessage({
        ...newMessage,
        content: ''
      });
      // Refresh the messages list
      fetchMessages();
      // Close the form after successful submission
      setShowForm(false);
    } catch (err) {
      console.error('Error adding message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle form visibility
  const toggleForm = () => {
    setShowForm(!showForm);
  };

  // Sample graduation-themed messages to display if there are no messages in the database
  const fallbackMessages = [
    { id: 'f1', author: 'John D.', content: 'Congratulations to all graduates! The world is waiting for your brilliance.', created_at: new Date() },
    { id: 'f2', author: 'Sarah M.', content: 'Remember all those late nights in the library? They were worth every minute!', created_at: new Date() },
    { id: 'f3', author: 'Michael T.', content: 'To the class that made the impossible possible. So proud of you all!', created_at: new Date() },
    { id: 'f4', author: 'Emma L.', content: 'Four years of friendship, laughter, and growth. Cherish these memories forever.', created_at: new Date() },
    { id: 'f5', author: 'David K.', content: 'The end of one chapter is the beginning of something even more beautiful.', created_at: new Date() },
    { id: 'f6', author: 'Jessica R.', content: 'You\'ve earned every moment of this celebration. Shine bright, graduates!', created_at: new Date() },
    { id: 'f7', author: 'Alex P.', content: 'From freshmen to graduates - what an incredible transformation to witness!', created_at: new Date() },
    { id: 'f8', author: 'Olivia W.', content: 'May your future be as bright as your graduation gown and as shiny as your achievements.', created_at: new Date() },
    { id: 'f9', author: 'Ryan H.', content: 'The bonds we formed here will last a lifetime. So grateful for each of you.', created_at: new Date() },
  ];

  // Function to create a longer array of messages for infinite scroll effect
  // without repeating the same messages in multiple rows
  const createScrollMessages = (originalMessages) => {
    // If there are no messages, use fallback messages
    const messagesToUse = originalMessages.length === 0 ? fallbackMessages : originalMessages;

    // Create a longer array by repeating the messages, but we'll use different
    // messages in different rows to avoid repetition
    return [...messagesToUse, ...messagesToUse];
  };

  // Render message item in memory wall style
  const renderMessageItem = (message, index, rowId) => (
    <div className="message-item" key={`row${rowId}-${message.id}-${index}`}>
      <p className="message-content">{message.content}</p>
      <h5 className="message-author">{message.author}</h5>
    </div>
  );

  // Render testimonial wall
  const renderTestimonialWall = () => {
    const messagesToUse = messages.length === 0 ? fallbackMessages : messages;

    // Split messages into three groups to avoid repetition across rows
    const splitMessages = (msgs) => {
      if (msgs.length <= 3) {
        // If we have 3 or fewer messages, just use what we have
        return [msgs, msgs, msgs];
      }

      // Divide messages into three roughly equal groups
      const third = Math.ceil(msgs.length / 3);
      const firstGroup = msgs.slice(0, third);
      const secondGroup = msgs.slice(third, 2 * third);
      const thirdGroup = msgs.slice(2 * third);

      return [firstGroup, secondGroup, thirdGroup];
    };

    const [firstRowMsgs, secondRowMsgs, thirdRowMsgs] = splitMessages(messagesToUse);

    return (
      <>
        <div className="testimonial-wall">
          {/* First row - left to right */}
          <div className="testimonial-row">
            <div className="testimonial-track">
              {createScrollMessages(firstRowMsgs).map((message, index) =>
                renderMessageItem(message, index, 1)
              )}
            </div>
          </div>

          {/* Second row - right to left (reversed) */}
          <div className="testimonial-row">
            <div className="testimonial-track" style={{ animation: 'scroll 50s linear infinite reverse' }}>
              {createScrollMessages(secondRowMsgs).map((message, index) =>
                renderMessageItem(message, index, 2)
              )}
            </div>
          </div>

          {/* Third row - left to right (different speed) */}
          <div className="testimonial-row">
            <div className="testimonial-track" style={{ animation: 'scroll 70s linear infinite' }}>
              {createScrollMessages(thirdRowMsgs).map((message, index) =>
                renderMessageItem(message, index, 3)
              )}
            </div>
          </div>
        </div>

        {messages.length === 0 && (
          <div className="text-center mt-3 mb-4">
            <Alert variant="info">
              <p className="mb-0">These are example messages. Be the first to leave your own memory by clicking the + button!</p>
            </Alert>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      {!isMobile && <Navbardesk />}
      <div className="messages-container">
        <Container>
          <Link to="/" className="back-button">
            <i className="fas fa-arrow-left"></i> Back
          </Link>
          <h2 className="messages-title">Wall of Memories</h2>
          <p className="messages-subtitle">A place for seniors and juniors to share heartfelt messages and memories with each other.</p>

          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : error ? (
            <Alert variant="danger" className="m-3">{error}</Alert>
          ) : (
            renderTestimonialWall()
          )}

          {/* Floating add button */}
          <button className="add-message-btn" onClick={toggleForm}>
            <FaPlus />
          </button>

          {/* Message form popup */}
          <div className={`message-form-overlay ${showForm ? 'active' : ''}`}>
            <div className="message-form-container">
              <button className="close-form-btn" onClick={toggleForm}>
                <FaTimes />
              </button>
              <h3 className="message-form-title">Leave a Memory</h3>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Your Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="author"
                    value={newMessage.author}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Your Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="content"
                    value={newMessage.content}
                    onChange={handleInputChange}
                    placeholder="Write your message here..."
                    rows={3}
                    required
                  />
                </Form.Group>

                <Button
                  variant="success"
                  type="submit"
                  className="w-100"
                  disabled={!newMessage.content.trim() || submitting}
                >
                  {submitting ? 'Saving...' : 'Add to Memory Wall'}
                </Button>
              </Form>
            </div>
          </div>
        </Container>
      </div>
      {isMobile && <Navbardesk />}
    </>
  );
};

export default Messages;
