import React from 'react';
import './ProfileDetail.css';
import someone from '../assets/someone.png';
import profiles from './Profiles'; 
import { useParams } from 'react-router-dom';
const ProfileDetail = () => {
  const { id } = useParams();
  const profile = profiles.find(profile => profile.id === parseInt(id));

  if (!profile) {
    return <h2>Profile not found</h2>;
  }
  return (
    <div className="profile-detail-content" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
      <img src={profile.image} alt={profile.name} className="profile-detail-img" />
      <div style={{marginLeft:'15px'}}>
      <h2>{profile.name}</h2>
      <p className="degree">🎓  {profile.designation}</p>
      <p className="description">
      {profile.description}
      </p>
      <div className="comments">
        <div className="comment">
          <p><strong>Pranjal Gaur</strong></p>
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
        </div>
      </div>
      <input type="text" placeholder="Your Message..." className="message-input" />
      </div>
    </div>
  );
};

export default ProfileDetail;
