import React from 'react';
import './ProfileDetail.css';
import someone from '../assets/someone.png';
const ProfileDetail = () => {
  return (
    <div className="profile-detail-content" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
      <img src={someone} alt="Profile" className="profile-detail-img" />
      <div>
      <h2>Aria Lee</h2>
      <p className="degree">🎓 B.Tech</p>
      <p className="description">
        The tumultuous tide of complex emotions swelled and receded within me as I steadfastly clung
        to the tenets of authenticity, navigating the ever-shifting currents of reality.
      </p>
      <div className="comments">
        <div className="comment">
          <p><strong>Pranjal Gaur</strong></p>
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
        </div>
        <div className="comment">
          <p><strong>Pranjal Gaur</strong></p>
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
        </div>
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
