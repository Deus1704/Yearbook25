import React from 'react';
import ghibliImage from '../assets/ghibli_images/09F156D1-BCB5-4805-B281-6C0493F407A6.PNG';

const DirectGhibliBackground = () => {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${ghibliImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.7,
        zIndex: 0
      }}
    />
  );
};

export default DirectGhibliBackground;
