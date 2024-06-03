import React from 'react';
import { Container, Row, Col, Navbar, Nav } from 'react-bootstrap';
import './DesktopHome.css';
import logo from '../assets/Logo.svg';
import profiles from './Profiles'; // Make sure the path is correct
import Navbardesk from './Navbar';
const DesktopHome = () => {
  return (
    <div>
      <Navbardesk />

      <Container className="memory-lane-page mt-5" style={{ background: 'transparent' }}>
        <Row className="g-3">
          <Col xs={12} lg={4} className="text-center">
            <h1>Memory Lane</h1>
            <p>A Walk Through Memory Lane:</p>
            <p>Our Stories,</p>
            <p>Our Memories,</p>
            <p>Our Legacy!</p>
          </Col>
          <Col xs={12} lg={8}>
            <Row className="g-3">
              {profiles.slice(0, 5).map((profile, index) => (
                <Col key={index} xs={12} md={6} lg={index === 3 ? 8 : 4}>
                  <div
                    className="image-placeholder"
                    style={{ backgroundImage: `url(${profile.image})` }}
                  ></div>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
        {profiles.length > 5 && (
          <Row className="g-3 mt-3">
            {profiles.slice(5).map((profile, index) => (
              <Col key={index} xs={12} md={6} lg={4}>
                <div
                  className="image-placeholder"
                  style={{ backgroundImage: `url(${profile.image})` }}
                ></div>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
};

export default DesktopHome;
