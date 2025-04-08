import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import './ProfilePage.css';
import ProfileCard from './ProfileCard';
import ProfileDetail from './ProfileDetail';
import Navbardesk from './Navbar';

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
      <Navbardesk />
      <Container fluid className="profile-page-container">
        <Row className="profile-page-row">
          <Col lg={2} md={3} className="profile-list">
            <ProfileCard />
          </Col>
          <Col lg={10} md={9} className="profile-detail">
            <ProfileDetail />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ProfilePage;
