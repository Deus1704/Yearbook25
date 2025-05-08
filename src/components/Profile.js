import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Profile.css';
import Navbardesk from './Navbar';
import { getProfile, getProfileImageUrl } from '../services/api';
import { profilePlaceholder } from '../assets/profile-placeholder';
import DirectImageLoader from './DirectImageLoader';
import GoogleDriveImage from './GoogleDriveImage';
import { isGoogleDriveUrl } from '../utils/googleDriveUtils';

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          <p className="profile-description">{profile.description}</p>
        </div>
      </div>

    </div>
    <Navbardesk />
    </>
  );
};

export default Profile;
