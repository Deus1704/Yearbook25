import React, { useState, useEffect } from 'react';
import './Messages.css';
import { Link } from 'react-router-dom';
import Navbardesk from './Navbar';
import { getMessages, addMessage } from '../services/api';
import { Button, Form, Spinner, Alert } from 'react-bootstrap';

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
    } catch (err) {
      console.error('Error adding message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {!isMobile && <Navbardesk />}
      <div className="messages-container">
        <Link to="/" className="back-button">
          <i className="fas fa-arrow-left"></i>
        </Link>
        <h2 className="messages-title">Messages Board</h2>

        {loading ? (
          <div className="text-center p-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : error ? (
          <Alert variant="danger" className="m-3">{error}</Alert>
        ) : (
          <div className="messages-list">
            {messages.length === 0 ? (
              <div className="text-center p-5">
                <p>No messages yet. Be the first to leave a message!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div className="message-item" key={message.id}>
                  <div className="message-header">
                    <h5 className="message-author">{message.author}</h5>
                    <span className="message-date">
                      {new Date(message.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="message-content">{message.content}</p>
                </div>
              ))
            )}
          </div>
        )}

        <div className="message-form-container">
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
              {submitting ? 'Sending...' : 'Send Message'}
            </Button>
          </Form>
        </div>
      </div>
      {isMobile && <Navbardesk />}
    </>
  );
};

export default Messages;
