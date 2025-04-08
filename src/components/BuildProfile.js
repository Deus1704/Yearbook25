import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { createProfile } from '../services/api';
import './BuildProfile.css';
import Navbardesk from './Navbar';

const BuildProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    description: '',
    image: null
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await createProfile(formData);
      setSuccess(true);
      // Reset form
      setFormData({
        name: '',
        designation: '',
        description: '',
        image: null
      });
      setPreview(null);
    } catch (err) {
      setError('Failed to create profile. Please try again.');
      console.error('Error creating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbardesk />
      <Container className="build-profile-container">
        <h2 className="text-center mb-4">Build Your Profile</h2>
        
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">Profile created successfully!</Alert>}
        
        <Form onSubmit={handleSubmit} className="build-profile-form">
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter your name"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Department</Form.Label>
            <Form.Control
              type="text"
              name="designation"
              value={formData.designation}
              onChange={handleInputChange}
              required
              placeholder="Enter your department"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Your Quote</Form.Label>
            <Form.Control
              as="textarea"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="Share a memorable quote or message"
              rows={3}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Profile Photo</Form.Label>
            <div className="image-upload-container">
              {preview && (
                <div className="image-preview">
                  <img src={preview} alt="Preview" />
                </div>
              )}
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
            </div>
          </Form.Group>

          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading}
            className="w-100"
          >
            {loading ? 'Creating Profile...' : 'Create Profile'}
          </Button>
        </Form>
      </Container>
    </>
  );
};

export default BuildProfile; 