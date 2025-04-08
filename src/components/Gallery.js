import React, { useState, useEffect } from 'react';
import './Gallery.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import { getProfiles, getProfileImageUrl } from '../services/api';
import Navbardesk from './Navbar';

const Gallery = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    const fetchProfiles = async () => {
      try {
        const data = await getProfiles();
        setProfiles(data);
      } catch (error) {
        console.error('Error fetching profiles:', error);
      } finally {
        setLoading(false);
      }
    };

    checkScreenSize();
    fetchProfiles();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  if (loading) return (
    <>
      {!isMobile && <Navbardesk />}
      <div className="gallery-container">
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading memories...</p>
        </div>
      </div>
      {isMobile && <Navbardesk />}
    </>
  );

  return (
    <>
      {!isMobile && <Navbardesk />}
      <div className="gallery-container">
        <div className="gallery-header">
          <Link to="/" className="back-button">
            <i className="fas fa-arrow-left"></i> Back
          </Link>
          <h1 className="gallery-title">Memory Lane</h1>
        </div>
        <div className="gallery-content">
          {profiles.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <i className="fas fa-images"></i>
              </div>
              <h3>No memories yet</h3>
              <p>Create your profile to add your photo to the memory lane</p>
              <Link to="/build-profile" className="btn btn-primary mt-3">
                <i className="fas fa-plus-circle me-2"></i> Build Your Profile
              </Link>
            </div>
          ) : (
            <div className="gallery-grid">
              {profiles.map((profile) => (
                <div className="gallery-item" key={profile.id}>
                  <img
                    src={getProfileImageUrl(profile.id)}
                    alt={profile.name}
                    className="gallery-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {isMobile && <Navbardesk />}
    </>
  );
};

export default Gallery;
