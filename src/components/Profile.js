import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Profile.css';
import Navbardesk from './Navbar';
import { getProfile, getProfileImageUrl, addComment } from '../services/api';
import { profilePlaceholder } from '../assets/profile-placeholder';
import DirectImageLoader from './DirectImageLoader';
import GoogleDriveImage from './GoogleDriveImage';
import { isGoogleDriveUrl } from '../utils/googleDriveUtils';
import { Spinner, Alert, Button } from 'react-bootstrap';

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
    const fetchProfile = async () => {
      try {
        console.log(`Fetching profile with ID: ${id}`);
        const data = await getProfile(id);
        console.log('Profile data received:', {
          id: data.id,
          name: data.name,
          designation: data.designation,
          image_url: data.image_url,
          image_id: data.image_id
        });
        setProfile(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const comment = {
        author: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).displayName : 'Anonymous',
        content: newComment
      };
      await addComment(id, comment);
      const updatedProfile = await getProfile(id);
      setProfile(updatedProfile);
      setNewComment('');
      setError(null);
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container text-center py-5">
        <div className="text-danger mb-3">
          <i className="fas fa-exclamation-circle fa-3x"></i>
        </div>
        <p className="text-danger">{error}</p>
        <button
          className="btn btn-outline-primary mt-3"
          onClick={() => window.location.reload()}
        >
          <i className="fas fa-sync-alt me-2"></i> Retry
        </button>
      </div>
    );
  }

  if (!profile) {
    return <h2 className="text-center py-5">Profile not found</h2>;
  }

  return (
    <>
    <div className="profile-container1">
      <Link to="/" className="back-button1" style={{zIndex:'10'}}>
        <i className="fas fa-arrow-left"></i>
      </Link>
      <div className="profile-card1">
        {/* Profile section */}
        <div className="profile-section">
          {/* Log image information for debugging */}
          {console.log('Rendering profile image with:', {
            image_url: profile.image_url,
            image_id: profile.image_id,
            isGoogleDriveUrl: profile.image_url ? isGoogleDriveUrl(profile.image_url) : false,
            fallbackUrl: getProfileImageUrl(profile.id)
          })}

          {profile.image_url && isGoogleDriveUrl(profile.image_url) ? (
            <GoogleDriveImage
              src={profile.image_url}
              alt={profile.name}
              className="profile-image1"
              type="profile"
              fallbackSrc={getProfileImageUrl(profile.id)}
              onError={(e) => console.error('GoogleDriveImage error:', e)}
            />
          ) : (
            <DirectImageLoader
              src={profile.image_url || getProfileImageUrl(profile.id)}
              alt={profile.name}
              className="profile-image1"
              type="profile"
              onError={(e) => console.error('DirectImageLoader error:', e)}
            />
          )}
          <div className="profile-details1">
            <h1>{profile.name}</h1>
            <p className="profile-designation1"><i className="fas fa-graduation-cap"></i> {profile.designation}</p>
            {profile.description && <p className="profile-description1">{profile.description}</p>}
          </div>
        </div>

        {/* Messages section */}
        <div className={`messages-section ${isMobile ? 'mobile-messages' : ''}`}>
          <h3 className="messages-title">Messages</h3>
          {error && <Alert variant="danger">{error}</Alert>}

          <div className="messages-list">
            {profile.comments && profile.comments.length > 0 ? (
              profile.comments.map((comment, index) => (
                <div className="message-item" key={index}>
                  <p className="message-author"><strong>{comment.author}</strong></p>
                  <p className="message-content">{comment.content}</p>
                </div>
              ))
            ) : (
              <p className="no-messages">No messages yet. Be the first to leave a message!</p>
            )}
          </div>

          <form onSubmit={handleAddComment} className="message-form">
            <div className="message-input-group">
              <input
                type="text"
                placeholder="Write a message..."
                className="message-input"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={submitting}
              />
              <Button
                type="submit"
                variant="primary"
                disabled={!newComment.trim() || submitting}
                className="send-button"
              >
                {submitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <Navbardesk />
    </>
  );
};

export default Profile;
