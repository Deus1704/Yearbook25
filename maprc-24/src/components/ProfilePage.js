import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './ProfilePage.css';
import ProfileCard from './ProfileCard';
import ProfileDetail from './ProfileDetail';
import Navbardesk from './Navbar';

const ProfilePage = () => {
  return (
    <>
      
      <Navbardesk />
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
