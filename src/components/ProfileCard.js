import React, { useState, useEffect } from 'react';
import { Card, Form, FormControl, Spinner, Alert } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { getProfiles, getProfileImageUrl } from '../services/api';
import './ProfileCard.css';
import './SearchBar.css';

const ProfileCard = () => {
  const { id } = useParams();
  const [profiles, setProfiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const data = await getProfiles();
        setProfiles(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching profiles:', error);
        setError('Failed to load profiles. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center p-4">
      <Spinner animation="border" size="sm" className="me-2" />
      <span>Loading profiles...</span>
    </div>
  );

  if (error) return <Alert variant="danger" className="m-2">{error}</Alert>;

  if (profiles.length === 0) return (
    <div className="text-center p-3">
      <p>No profiles found. Create a new profile!</p>
    </div>
  );

  return (
    <>
      <div className="sticky-top bg-light pt-2 pb-2">
        <Form className="search-bar">
          <FormControl
            type="text"
            placeholder="Search profiles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="profile-search"
            aria-label="Search profiles"
          />
        </Form>
      </div>

      <div className="profiles-list">
        {filteredProfiles.length === 0 ? (
          <p className="text-center text-muted my-4">No profiles match your search</p>
        ) : (
          filteredProfiles.map((profile) => (
            <Link
              to={`/profileD/${profile.id}`}
              key={profile.id}
              className={`profile-card-link ${parseInt(id) === profile.id ? 'active' : ''}`}
            >
              <div className="profile-card-item">
                <Card.Img
                  src={getProfileImageUrl(profile.id, profile.image_url)}
                  className="profile-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/50?text=Profile';
                  }}
                />
                <div className="profile-card-info">
                  <Card.Title className="profile-card-name">
                    {profile.name}
                  </Card.Title>
                  <Card.Text className="profile-card-designation">
                    {profile.designation}
                  </Card.Text>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
};

export default ProfileCard;
