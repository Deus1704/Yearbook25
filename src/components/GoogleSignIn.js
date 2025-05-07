import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Alert } from 'react-bootstrap';
import logo from '../assets/Logo.svg';
import './Login.css';

const GoogleSignIn = () => {
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // Configure provider to request email
  provider.addScope('email');
  // Set provider to only show accounts from iitgn.ac.in domain
  provider.setCustomParameters({
    hd: 'iitgn.ac.in'
  });

  const handleSignIn = async () => {
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
      setError('Authentication failed. Please ensure you are using an @iitgn.ac.in email address.');
    }
  };

  return (
    <div className="login-bg d-flex vh-100 text-white">
      <Container className="my-auto">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center" style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
            <img
              src={logo}
              alt="logo"
              className="img-fluid mb-4"
              style={{ height: '60px', width: '60px' }}
            />
            <h1 className="mb-4">Yearbook 2025</h1>
            <h5 className="mb-1">"From campus to forever,</h5>
            <h5 className="mb-4">your story immortalized"</h5>
            <h5 className="mb-2">Class of 2025</h5>
            <h5 className="mb-4">Class of 2024</h5>

            {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

            <Button
              onClick={handleSignIn}
              className="btn btn-lg mb-4"
              style={{ backgroundColor: '#a55c1b', color: 'white', borderRadius: '50px', padding: '10px 30px' }}
            >
              Sign in with Google
            </Button>

            <h6 className="mb-3">Follow Us</h6>
            <div className="d-flex justify-content-center">
              <i className="fab fa-facebook fa-2x mx-2"></i>
              <i className="fab fa-instagram fa-2x mx-2"></i>
              <i className="fab fa-youtube fa-2x mx-2"></i>
              <i className="fab fa-linkedin fa-2x mx-2"></i>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default GoogleSignIn;