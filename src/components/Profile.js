import React from 'react';
import { useParams, Link } from 'react-router-dom';
import profiles from './Profiles'; 
import './Profile.css';
import Navbardesk from './Navbar';
const Profile = () => {
  const { id } = useParams();
  const profile = profiles.find(profile => profile.id === parseInt(id));

  if (!profile) {
    return <h2>Profile not found</h2>;
  }

  return (
    <>
    <div className="profile-container1">
      <Link to="/" className="back-button1" style={{zIndex:'10'}}>
        <i className="fas fa-arrow-left"></i>
      </Link>
      <div className="profile-card1">
        <img src={profile.image} alt={profile.name} className="profile-image1" />
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
