import React from 'react';
import ghibli1 from '../assets/ghibli_images/09F156D1-BCB5-4805-B281-6C0493F407A6.PNG';

const SimpleGhibliBackground = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundImage: `url(${ghibli1})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      zIndex: 0,
      opacity: 0.7
    }}>
      {/* Debug image */}
      <img 
        src={ghibli1} 
        alt="Debug" 
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '100px',
          height: '100px',
          zIndex: 1000,
          border: '2px solid red'
        }}
      />
    </div>
  );
};

export default SimpleGhibliBackground;
