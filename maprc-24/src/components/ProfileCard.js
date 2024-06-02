import React from 'react';
import { Card } from 'react-bootstrap';
import './ProfileCard.css';

const ProfileCard = ({ profile }) => {
  return (
    <Card className="profile-card">
      <Card.Img variant="top" src={profile.image} className="profile-img" />
      <Card.Body>
        <Card.Title>{profile.name}</Card.Title>
        <Card.Text>{profile.bio}</Card.Text>
      </Card.Body>
    </Card>
  );
};

export default ProfileCard;
