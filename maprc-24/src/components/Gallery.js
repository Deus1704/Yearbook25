import React from 'react';
import './Gallery.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import someone from './someone.png';
import { Link } from 'react-router-dom';

const Gallery = () => {
  const images = [
    { id: 1, src: someone, alt: 'Image 1' },
    { id: 2, src: someone, alt: 'Image 2' },
    { id: 3, src: someone, alt: 'Image 3' },
    { id: 4, src: someone, alt: 'Image 4' },
    { id: 5, src: someone, alt: 'Image 5' },
    { id: 6, src: someone, alt: 'Image 6' },
    { id: 7, src: someone, alt: 'Image 6' },
    { id: 8, src: someone, alt: 'Image 6' },
    { id: 9, src: someone, alt: 'Image 6' },
    { id: 10, src: someone, alt: 'Image 6' },
  ];

  return (
    <>
        <div className="container">
            <Link to="/" className="back-button">
                <i className="fas fa-arrow-left"></i>
            </Link>
        <h1 className="gallery-title">Memory Lane</h1>
        <div className="row">
            {images.map((image) => (
            <div className="col-6 col-md-4 mb-4" key={image.id}>
                <img src={image.src} alt={image.alt} className="img-fluid gallery-image" />
            </div>
            ))}
        </div>
        </div>
        <footer className="footer d-flex justify-content-around align-items-center p-2" style={{position:'fixed', width:'100%', top:'93vh', zIndex:'10', borderTopLeftRadius:'10px', borderTopRightRadius:'10px'}}>
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
