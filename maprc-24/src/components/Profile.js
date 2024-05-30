import React from 'react';
import { useParams, Link } from 'react-router-dom';
import profiles from './Profiles'; 
import './Profile.css';

const Profile = () => {
  const { id } = useParams();
  const profile = profiles.find(profile => profile.id === parseInt(id));

  if (!profile) {
    return <h2>Profile not found</h2>;
  }

  return (
    <div className="profile-container">
      <Link to="/" className="back-button">
        <i className="fas fa-arrow-left"></i>
      </Link>
      <div className="profile-card">
        <img src={profile.image} alt={profile.name} className="profile-image" />
        <div className="profile-details">
          <h1>{profile.name}</h1>
          <p className="profile-designation"><i className="fas fa-graduation-cap"></i> {profile.designation}</p>
          <p className="profile-description">{profile.description}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
