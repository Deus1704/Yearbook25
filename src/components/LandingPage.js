import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import './LandingPage.css';
import maprc_logo from '../assets/MAPRC.png';
import backgroundVideo from '../assets/background.mp4';

const LandingPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();

    // Configure provider to request email
    provider.addScope('email');
    // Set provider to only show accounts from iitgn.ac.in domain
    provider.setCustomParameters({
      hd: 'iitgn.ac.in'
    });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Double check that the email domain is from iitgn.ac.in
      if (user.email && user.email.endsWith('@iitgn.ac.in')) {
        // Store user info in localStorage to maintain session
        localStorage.setItem('user', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }));
        navigate('/');
      } else {
        await auth.signOut();
        setError('Only @iitgn.ac.in email addresses are allowed to access this application.');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setError('Authentication failed. Please try again.');
    }
  };

  return (
    <div className="landing-page">
      {/* Video Background */}
      <video autoPlay muted loop className="video-background">
        <source src={backgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay Content */}
      <div className="content-overlay">
        {/* Header with Title and Login Button */}
        <header className="landing-header">
          <h1 className="landing-title">Yearbook | Class Of 2023</h1>
          <button className="login-button" onClick={handleSignIn}>Login</button>
        </header>

        {/* Error message if login fails */}
        {error && (
          <div className="error-message">
            {error}
            <button className="close-error" onClick={() => setError('')}>×</button>
          </div>
        )}

        {/* Footer with Logo and Text */}
        <footer className="landing-footer">
          <div className="footer-left">
            <div className="footer-logo-container">
              <img src={maprc_logo} alt="Logo" className="footer-logo" />
            </div>
            <div className="footer-text">
              <p>This Website is Managed by</p>
              <p>MAPRC IITGN</p>
            </div>
          </div>

          <div className="footer-right-text">
            <p>Previous Yearbooks</p>
            <p>Year Book of Class 2023</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
