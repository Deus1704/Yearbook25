import React from 'react';
import { Container, Row, Col, Navbar, Nav } from 'react-bootstrap';
import './ProfilePage.css';
import ProfileCard from './ProfileCard';
import ProfileDetail from './ProfileDetail';

import logo from '../assets/Logo.svg';
const ProfilePage = () => {
  

  return (
    <>
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

      <div className="profile-page1 pt-0 pl-0 pr-0 ml-0 mr-0" style={{width:'100%'}}>
        <Row>
          <Col lg={3} className="profile-list">
            
              <ProfileCard />
          </Col>
          <Col lg={9} className="profile-detail">
            <ProfileDetail />
          </Col>
        </Row>
      </div>
    </>
  );
};

export default ProfilePage;
