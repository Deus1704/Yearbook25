import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import './LandingPage.css';
import maprc_logo from '../assets/MAPRC.png';
import metis_logo from '../assets/metis_logo_legacy.png';
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
        {/* Social Media Handles - Web View Only */}
        <div className="social-handles">
          <p>Follow us</p>
          <span>
            <a href="https://www.facebook.com/IITGNStudentLife/" target="_blank" rel="noopener noreferrer">
              <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="facebook-f" className="svg-inline--fa fa-facebook-f fa-brands fb" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                <path fill="currentColor" d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"></path>
              </svg>
            </a>
            <a href="https://www.instagram.com/studentlife_iitgn/" target="_blank" rel="noopener noreferrer">
              <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="instagram" className="svg-inline--fa fa-instagram fa-brands insta" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                <path fill="currentColor" d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path>
              </svg>
            </a>
            <a href="https://www.linkedin.com/company/media-and-public-relations-committee-iit-gandhinagar/" target="_blank" rel="noopener noreferrer">
              <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="linkedin" className="svg-inline--fa fa-linkedin fa-brands linkedin" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                <path fill="currentColor" d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"></path>
              </svg>
            </a>
            <a href="https://www.youtube.com/c/STUDENTLIFEIITGN" target="_blank" rel="noopener noreferrer">
              <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="youtube" className="svg-inline--fa fa-youtube fa-brands youtube" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                <path fill="currentColor" d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"></path>
              </svg>
            </a>
          </span>
        </div>

        {/* Header with Title and Login Button */}
        <header className="landing-header">
          <h1 className="landing-title">Yearbook | Class Of 2025</h1>
        </header>

        {/* Centered Login Button */}
        <div className="login-container">
          <button className="login-button" onClick={handleSignIn}>Login</button>
        </div>

        {/* Error message if login fails */}
        {error && (
          <div className="error-message">
            {error}
            <button className="close-error" onClick={() => setError('')}>×</button>
          </div>
        )}

        {/* Footer with Logos and Text */}
        <footer className="landing-footer">
          <div className="footer-left">
            <div className="footer-text-with-logos">
              <div className="logo-item">
                <img src={maprc_logo} alt="MAPRC Logo" className="footer-logo" />
              </div>
              <div className="footer-text">
                <p>This Website is Managed by</p>
                <p>MAPRC x METIS</p>
              </div>
              <div className="logo-item">
                <img src={metis_logo} alt="METIS Logo" className="footer-logo" />
              </div>
            </div>
          </div>

          <div className="footer-right">
            <div className="footer-right-text">
              <p>Previous Yearbooks</p>
              <p><a href="https://students.iitgn.ac.in/yearbook/2023/" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>Yearbook of Class 2023</a></p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
