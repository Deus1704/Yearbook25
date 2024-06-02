import React, { useState }  from 'react';
import { Card } from 'react-bootstrap';
import './ProfileCard.css';
import { Link } from 'react-router-dom';
import profiles from './Profiles';
import { Form, FormControl } from 'react-bootstrap';
import './SearchBar.css';

const ProfileCard = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

 
  return (
    <>
    <Form className="search-bar">
      <FormControl type="text" placeholder="Search here..." value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}/>
    </Form>
    {filteredProfiles.map((profile, index) => (
    <Link to={`/profileD/${profile.id}`} className="text-decoration-none">
    <div style={{display:'flex', alignItems:'center', padding:'8px 0'}}>
        <Card.Img variant="top" src={profile.image} className="profile-img" style={{margin:'0 10px'}} />
        <Card.Title style={{color:'black', fontSize:'1.1rem'}}>{profile.name}</Card.Title>
    </div>
    </Link>
    ))}
    </>
  );
};

export default ProfileCard;
