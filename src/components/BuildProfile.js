import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { createProfile, getProfileByUserId, updateProfile } from '../services/api';
import './BuildProfile.css';
import Navbardesk from './Navbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BuildProfile = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    description: '',
    image: null,
    user_id: '',
    email: ''
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
      console.log('Selected image file:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)} KB`
      });

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPG, PNG, GIF, etc.)');
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setError(`Image file is too large. Maximum size is 5MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`);
        return;
      }

      setFormData(prev => ({
        ...prev,
        image: file
      }));

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        console.log('Image preview created successfully');
      };
      reader.onerror = () => {
        console.error('Error reading file:', reader.error);
        setError('Error reading image file. Please try another image.');
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
            user_id: currentUser.uid,
            email: currentUser.email || ''
          });
        } else {
          console.log('No existing profile found, creating new profile');
          // New profile
          setFormData(prev => ({
            ...prev,
            user_id: currentUser.uid,
            email: currentUser.email || ''
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

    // Validate image is provided for new profiles
    if (!isUpdate && !formData.image) {
      setError('Please select a profile image');
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting profile form, isUpdate:', isUpdate);
      console.log('Form data:', {
        name: formData.name,
        designation: formData.designation,
        description: formData.description,
        user_id: formData.user_id,
        email: formData.email,
        hasImage: !!formData.image
      });

      if (isUpdate && existingProfile) {
        console.log('Updating existing profile ID:', existingProfile.id);
        // Update existing profile
        const result = await updateProfile(existingProfile.id, formData);
        console.log('Profile updated successfully:', result);

        // Check if image_url and image_id are present in the response
        if (formData.image && (!result.image_url || !result.image_id)) {
          console.warn('Warning: Profile updated but image may not have been properly associated', {
            image_url: result.image_url,
            image_id: result.image_id
          });
          // We'll still show success but log the warning
        }

        setSuccess(true);
        setError('');

        // Refresh the profile data to ensure we have the latest
        try {
          const refreshedProfile = await getProfileByUserId(currentUser.uid);
          setExistingProfile(refreshedProfile);
          console.log('Profile refreshed after update:', refreshedProfile);
        } catch (refreshErr) {
          console.error('Error refreshing profile after update:', refreshErr);
        }
      } else {
        console.log('Creating new profile');
        // Create new profile
        const result = await createProfile(formData);
        console.log('Profile created successfully:', result);

        // Check if image_url and image_id are present in the response
        if (!result.image_url || !result.image_id) {
          console.warn('Warning: Profile created but image may not have been properly associated', {
            image_url: result.image_url,
            image_id: result.image_id
          });
          // We'll still show success but log the warning
        }

        setSuccess(true);
        setIsUpdate(true); // Now it's an update for future submissions

        // Get the updated profile to set existingProfile
        console.log('Fetching newly created profile');
        const updatedProfile = await getProfileByUserId(currentUser.uid);
        console.log('Retrieved updated profile:', updatedProfile);
        setExistingProfile(updatedProfile);

        // Show success toast
        toast.success('Profile created successfully!', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
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
              console.log('Retrieved existing profile:', existingProfile);
            }
          } catch (fetchErr) {
            console.error('Error fetching existing profile:', fetchErr);
          }
        } else if (err.response.data.error === 'NotGraduating') {
          // Show a fun toast notification for non-graduating students
          toast.info(err.response.data.message, {
            position: "top-center",
            autoClose: 8000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
            icon: "🎓"
          });
          setError('Only graduating students can create profiles.');
        } else {
          const errorMsg = `Failed to ${isUpdate ? 'update' : 'create'} profile: ${err.response.data.error}`;
          setError(errorMsg);
          toast.error(errorMsg, {
            position: "top-center",
            autoClose: 5000,
          });
        }
      } else {
        const errorMsg = `Failed to ${isUpdate ? 'update' : 'create'} profile. Please try again.`;
        setError(errorMsg);
        toast.error(errorMsg, {
          position: "top-center",
          autoClose: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbardesk />
      <ToastContainer />
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
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              readOnly
              disabled
              className="bg-light"
            />
            <Form.Text className="text-muted">
              Email is automatically filled from your Google account
            </Form.Text>
          </Form.Group>

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