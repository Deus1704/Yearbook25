import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/Logo.svg';
import './Navbardesk.css';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';

const Navbardesk = () => {
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [expanded, setExpanded] = useState(false);

  // Check if user is admin
  const isAdmin = currentUser && currentUser.email &&
    (currentUser.email === 'admin@iitgn.ac.in' ||
     currentUser.email === 'yearbook@iitgn.ac.in' ||
     currentUser.email === 'maprc@iitgn.ac.in');

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('user');
      // Use the correct path with the base URL
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Helper function to check if a path is active
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname.startsWith('/profileD') || location.pathname.startsWith('/profile/');
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {isMobile ? (
        <footer className="mobile-footer">
          <Link to="/" className={`footer-btn ${isActive('/') ? 'active' : ''}`}>
            <i className="fas fa-home"></i>
          </Link>
          <Link to="/gallery" className={`footer-btn ${isActive('/gallery') ? 'active' : ''}`}>
            <i className="fas fa-images"></i>
          </Link>
          <Link to="/build-profile" className={`footer-btn ${isActive('/build-profile') ? 'active' : ''}`}>
            <i className="fas fa-plus-circle"></i>
          </Link>
          <Link to="/messages" className={`footer-btn ${isActive('/messages') ? 'active' : ''}`}>
            <i className="fas fa-comment-alt"></i>
          </Link>
          <Link to="/team" className={`footer-btn ${isActive('/team') ? 'active' : ''}`}>
            <i className="fas fa-users"></i>
          </Link>
        </footer>
      ) : (
        <Navbar bg="dark" expand="lg" fixed="top" expanded={expanded} className="desktop-navbar" variant="dark">
          <Container fluid className="px-4">
            <Link to="/" className="navbar-brand-link">
              <img src={logo} alt="Logo" className="logo me-2" />
              <Navbar.Brand>Yearbook 2025</Navbar.Brand>
            </Link>
            <Navbar.Toggle
              aria-controls="basic-navbar-nav"
              onClick={() => setExpanded(expanded ? false : "expanded")}
            />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto nav-links-left">
                <Nav.Link
                  as={Link}
                  to="/"
                  className={isActive('/') ? 'active' : ''}
                  onClick={() => setExpanded(false)}
                >
                  Profiles
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/gallery"
                  className={isActive('/gallery') ? 'active' : ''}
                  onClick={() => setExpanded(false)}
                >
                  Memory Lane
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/messages"
                  className={isActive('/messages') ? 'active' : ''}
                  onClick={() => setExpanded(false)}
                >
                  Messages
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/confessions"
                  className={isActive('/confessions') ? 'active' : ''}
                  onClick={() => setExpanded(false)}
                >
                  Confessions
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/team"
                  className={isActive('/team') ? 'active' : ''}
                  onClick={() => setExpanded(false)}
                >
                  Team
                </Nav.Link>
              </Nav>
              <Nav className="nav-links-right">
                {currentUser && (
                  <>
                    <Nav.Link
                      as={Link}
                      to="/build-profile"
                      className={`build-profile-btn ${isActive('/build-profile') ? 'active' : ''}`}
                      onClick={() => setExpanded(false)}
                    >
                      <i className="fas fa-plus-circle me-1"></i> Build Your Profile
                    </Nav.Link>
                    {isAdmin && (
                      <Nav.Link
                        as={Link}
                        to="/backup-manager"
                        className={`backup-manager-btn ${isActive('/backup-manager') ? 'active' : ''}`}
                        onClick={() => setExpanded(false)}
                      >
                        <i className="fas fa-database me-1"></i> Backup Manager
                      </Nav.Link>
                    )}
                    <Button
                      variant="outline-light"
                      onClick={() => {
                        setExpanded(false);
                        handleLogout();
                      }}
                      className="ms-2 logout-btn"
                    >
                      <i className="fas fa-sign-out-alt me-1"></i> Logout
                    </Button>
                  </>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      )}
      {/* Navbar spacer removed - now handled by Layout component */}
    </>
  );
};

export default Navbardesk;
