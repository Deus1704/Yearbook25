import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Profile.css';
import Navbardesk from './Navbar';
import { getProfile, getProfileImageUrl } from '../services/api';

const Profile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile(id);
        setProfile(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching profile:', error);
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
        <img
          src={getProfileImageUrl(profile.id)}
          alt={profile.name}
          className="profile-image1"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300?text=No+Image';
          }}
        />
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
