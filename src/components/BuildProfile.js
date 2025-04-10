import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { createProfile, getProfileByUserId, updateProfile } from '../services/api';
import './BuildProfile.css';
import Navbardesk from './Navbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BuildProfile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    description: '',
    image: null,
    user_id: ''
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);
  const [isUpdate, setIsUpdate] = useState(false);

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

  // Check if user already has a profile
  useEffect(() => {
    const checkExistingProfile = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        console.log('Checking if user has a profile, UID:', currentUser.uid);
        const profile = await getProfileByUserId(currentUser.uid);

        if (profile) {
          console.log('Found existing profile:', profile);
          // User already has a profile, set it for editing
          setExistingProfile(profile);
          setIsUpdate(true);
          setFormData({
            name: profile.name,
            designation: profile.designation,
            description: profile.description,
            image: null, // Can't set the image directly, user needs to reupload if they want to change it
            user_id: currentUser.uid
          });
        } else {
          console.log('No existing profile found, creating new profile');
          // New profile
          setFormData(prev => ({
            ...prev,
            user_id: currentUser.uid
          }));
          setIsUpdate(false);
        }
        setError(''); // Clear any previous errors
      } catch (err) {
        console.error('Error checking for existing profile:', err);
        // More specific error message based on the error
        if (err.response && err.response.status === 500) {
          setError(`Server error: ${err.response.data?.error || 'Unknown error'}`)
        } else {
          setError('Failed to check if you already have a profile. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    checkExistingProfile();
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      console.log('Submitting profile form, isUpdate:', isUpdate);

      if (isUpdate && existingProfile) {
        console.log('Updating existing profile ID:', existingProfile.id);
        // Update existing profile
        const result = await updateProfile(existingProfile.id, formData);
        console.log('Profile updated successfully:', result);
        setSuccess(true);
        setError('');
      } else {
        console.log('Creating new profile');
        // Create new profile
        const result = await createProfile(formData);
        console.log('Profile created successfully:', result);
        setSuccess(true);
        setIsUpdate(true); // Now it's an update for future submissions

        // Get the updated profile to set existingProfile
        console.log('Fetching newly created profile');
        const updatedProfile = await getProfileByUserId(currentUser.uid);
        console.log('Retrieved updated profile:', updatedProfile);
        setExistingProfile(updatedProfile);
      }
    } catch (err) {
      console.error(`Error ${isUpdate ? 'updating' : 'creating'} profile:`, err);

      if (err.response && err.response.data) {
        if (err.response.data.error === 'User already has a profile') {
          console.log('User already has a profile, profileId:', err.response.data.profileId);
          setError('You already have a profile. Please refresh the page to update it.');

          // Try to fetch the existing profile
          try {
            const existingProfile = await getProfileByUserId(currentUser.uid);
            if (existingProfile) {
              setExistingProfile(existingProfile);
              setIsUpdate(true);
            }
          } catch (fetchErr) {
            console.error('Error fetching existing profile:', fetchErr);
          }
        } else {
          setError(`Failed to ${isUpdate ? 'update' : 'create'} profile: ${err.response.data.error}`);
        }
      } else {
        setError(`Failed to ${isUpdate ? 'update' : 'create'} profile. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbardesk />
      <Container className="build-profile-container">
        <h2 className="text-center mb-4">{isUpdate ? 'Update Your Profile' : 'Build Your Profile'}</h2>

        {loading ? (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Checking profile status...</p>
          </div>
        ) : (
          <>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{isUpdate ? 'Profile updated successfully!' : 'Profile created successfully!'}</Alert>}
          </>
        )}

        {!loading && (
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
                required={!isUpdate} // Only required for new profiles
              />
            </div>
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            className="w-100"
          >
            {loading ? (isUpdate ? 'Updating Profile...' : 'Creating Profile...') : (isUpdate ? 'Update Profile' : 'Create Profile')}
          </Button>
        </Form>
        )}
      </Container>
    </>
  );
};

export default BuildProfile;