import React from 'react';
import './Gallery.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import profiles from './Profiles';
import Navbardesk from './Navbar';
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
      <Navbardesk />
    </>
  );
};

export default Gallery;
