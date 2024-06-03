import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from '../assets/Logo.svg';
import './Navbardesk.css'; 

const Navbardesk = () => {
  const [isMobile, setIsMobile] = useState(false);

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
          <Link to="/" className="footer-btn"><i className="fas fa-home"></i></Link>
        <Link to="/gallery" className="footer-btn"><i className="fas fa-sync-alt"></i></Link>
        <Link to="/confessions" className="footer-btn"><i className="fas fa-plus"></i></Link>
        <Link to="/message" className="footer-btn"><i className="fas fa-list"></i></Link>
        <Link to="/team" className="footer-btn"><i className="fas fa-users"></i></Link>
        </footer>
      ) : (
        <Navbar bg="light" expand="lg">
          <Container>
            <img src={logo} alt="Logo" className="logo" style={{ filter: 'invert(1)' }} />
            <Navbar.Brand href="/">Yearbook 2024</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link href="/">Profiles</Nav.Link>
                <Nav.Link href="/gallery">Memory Lane</Nav.Link>
                <Nav.Link href="/message">Messages</Nav.Link>
                <Nav.Link href="/confessions">Confessions</Nav.Link>
                <Nav.Link href="/team">Team</Nav.Link>
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
