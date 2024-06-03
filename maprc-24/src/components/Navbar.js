import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import logo from '../assets/Logo.svg';
import './Navbardesk.css'; // Import the CSS file for styling

const Navbardesk = () => {
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size on component mount and on resize
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

  return (
    <>
      {isMobile ? (
        <footer className="footer d-flex justify-content-around align-items-center p-2" style={{position:'sticky', width:'100%', top:'', bottom:'0', zIndex:'10', borderTopLeftRadius:'10px', borderTopRightRadius:'10px'}}>
          <button className="footer-btn"><i className="fas fa-home"></i></button>
          <button className="footer-btn"><i className="fas fa-sync-alt"></i></button>
          <button className="footer-btn"><i className="fas fa-plus"></i></button>
          <button className="footer-btn"><i className="fas fa-list"></i></button>
          <button className="footer-btn"><i className="fas fa-users"></i></button>
        </footer>
      ) : (
        <Navbar bg="light" expand="lg">
          <Container>
            <img src={logo} alt="Logo" className="logo" style={{ filter: 'invert(1)' }} />
            <Navbar.Brand href="#home">Yearbook 2024</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link href="#profiles">Profiles</Nav.Link>
                <Nav.Link href="#memory-lane">Memory Lane</Nav.Link>
                <Nav.Link href="#messages">Messages</Nav.Link>
                <Nav.Link href="#confessions">Confessions</Nav.Link>
                <Nav.Link href="#team">Team</Nav.Link>
              </Nav>
              <Nav>
                <Nav.Link href="#build-your-profile">Build Your Profile</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      )}
    </>
  );
};

export default Navbardesk;
