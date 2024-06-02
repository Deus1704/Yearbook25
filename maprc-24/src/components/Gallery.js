import React from 'react';
import './Gallery.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import profiles from './Profiles';

const Gallery = () => {
  return (
    <>
      <div className="container">
        <Link to="/" className="back-button mt-1">
          <i className="fas fa-arrow-left"></i> Back
        </Link>
        <h1 className="gallery-title">Memory Lane</h1>
        <div className="gallery-grid">
          {profiles.map((profile) => (
            <div className="gallery-item" key={profile.id}>
              <img src={profile.image} alt={profile.name} className="gallery-image" />
            </div>
          ))}
        </div>
      </div>
      <footer className="footer">
        <button className="footer-btn"><i className="fas fa-home"></i></button>
        <button className="footer-btn"><i className="fas fa-sync-alt"></i></button>
        <button className="footer-btn"><i className="fas fa-plus"></i></button>
        <button className="footer-btn"><i className="fas fa-list"></i></button>
        <button className="footer-btn"><i className="fas fa-users"></i></button>
      </footer>
    </>
  );
};

export default Gallery;
