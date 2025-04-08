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

  if (loading) return <div>Loading...</div>;

  return (
    <>
      {!isMobile && <Navbardesk />}
      <div className="container">
        <Link to="/" className="back-button mt-1">
          <i className="fas fa-arrow-left"></i> Back
        </Link>
        <h1 className="gallery-title">Memory Lane</h1>
        <div className="gallery-grid">
          {profiles.map((profile) => (
            <div className="gallery-item" key={profile.id}>
              <img 
                src={getProfileImageUrl(profile.id)} 
                alt={profile.name} 
                className="gallery-image" 
              />
            </div>
          ))}
        </div>
      </div>
      {isMobile && <Navbardesk />}
    </>
  );
};

export default Gallery;
