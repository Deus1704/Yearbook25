import React, { useState, useEffect } from 'react';
import ghibliImages, { getRandomGhibliImage } from '../assets/ghibliImages';
import './GhibliBackground.css';

// Import Ghibli-inspired SVG elements
import cloudSvg from '../assets/ghibli_elements/cloud.svg';
import leafSvg from '../assets/ghibli_elements/leaf.svg';

const HomeGhibliBackground = () => {
  const [currentImage, setCurrentImage] = useState(getRandomGhibliImage());
  const [nextImage, setNextImage] = useState(getRandomGhibliImage());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [elements, setElements] = useState([]);

  // Function to create random floating elements
  const createElements = () => {
    const newElements = [];
    // Create 3-5 clouds
    const cloudCount = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < cloudCount; i++) {
      newElements.push({
        type: 'cloud',
        id: `cloud-${i}`,
        style: {
          top: `${Math.random() * 70}%`,
          left: `${Math.random() * 100}%`,
          opacity: Math.random() * 0.4 + 0.1,
          transform: `scale(${Math.random() * 0.5 + 0.5})`,
          animationDuration: `${Math.random() * 100 + 100}s`,
        }
      });
    }

    // Create 5-8 leaves
    const leafCount = Math.floor(Math.random() * 4) + 5;
    for (let i = 0; i < leafCount; i++) {
      newElements.push({
        type: 'leaf',
        id: `leaf-${i}`,
        style: {
          top: `${Math.random() * 80}%`,
          left: `${Math.random() * 100}%`,
          opacity: Math.random() * 0.6 + 0.2,
          transform: `scale(${Math.random() * 0.3 + 0.2}) rotate(${Math.random() * 360}deg)`,
          animationDuration: `${Math.random() * 20 + 10}s`,
          animationDelay: `${Math.random() * 5}s`,
        }
      });
    }

    setElements(newElements);
  };

  // Change background image every 10 seconds
  useEffect(() => {
    createElements();

    // Log the current image for debugging
    console.log("Current Ghibli background image:", currentImage);

    const interval = setInterval(() => {
      setIsTransitioning(true);

      // After transition starts, set up the next image
      setTimeout(() => {
        setCurrentImage(nextImage);
        const newImage = getRandomGhibliImage();
        console.log("New Ghibli background image:", newImage);
        setNextImage(newImage);
        setIsTransitioning(false);
      }, 1000); // 1 second transition

    }, 10000); // 10 seconds interval

    return () => clearInterval(interval);
  }, [nextImage, currentImage]);

  // For debugging - check if currentImage is valid
  console.log("Rendering with image:", currentImage);

  return (
    <div className="ghibli-background">
      {/* Add a direct image for debugging */}
      <img
        src={currentImage}
        alt="Debug Ghibli"
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

      <div
        className={`ghibli-image ${isTransitioning ? 'fade-out' : 'fade-in'}`}
        style={{
          backgroundImage: `url(${currentImage})`,
          backgroundColor: 'rgba(200, 230, 255, 0.5)' // Fallback color
        }}
      />

      {/* Floating elements */}
      {elements.map(element => (
        <div
          key={element.id}
          className={`floating-element ${element.type}`}
          style={element.style}
        >
          <img
            src={element.type === 'cloud' ? cloudSvg : leafSvg}
            alt={element.type}
          />
        </div>
      ))}

      {/* Overlay to ensure content is readable */}
      <div className="ghibli-overlay"></div>
    </div>
  );
};

export default HomeGhibliBackground;
