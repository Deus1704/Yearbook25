import React, { useState, useEffect } from 'react';
import './Message.css';
import { Link } from 'react-router-dom';
import profiles from './Profiles'; // Assuming profiles is an array of messages
import Navbardesk from './Navbar';

const Message = () => {
  const [isMobile, setIsMobile] = useState(false);

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

  return (
    <>
      {isMobile ? null : <Navbardesk />}
      <div className="profile-container">
        <Link to="/" className="back-button">
          <i className="fas fa-arrow-left"></i> Back
        </Link>
        <h2 className="messages-title">Messages</h2>
        <div className="messages-list">
          {profiles.map((profile, index) => (
            <div className="message-item" key={index}>
              <img src={profile.image} alt={profile.name} className="profile-image" />
              <div className="message-content">
                <h3 className="profile-name">{profile.name}</h3>
                <p className="profile-message">{profile.description}</p>
              </div>
            </div>
          ))}
        </div>
        <input 
          type="text" 
          placeholder="Write your message..." 
          style={{ position: 'sticky', top: '', bottom: '', zIndex: '9' }} 
          className="message-input" 
        />
      </div>
      {isMobile ? <Navbardesk /> : null}
    </>
  );
};

export default Message;
