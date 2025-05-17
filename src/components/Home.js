import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Home.css';
import './HomeGhibli.css';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/MAPRC.png';
import Navbardesk from './Navbar';
import { useAuth } from '../context/AuthContext';
import { getProfiles, getProfileImageUrl } from '../services/api';
import { profilePlaceholder } from '../assets/profile-placeholder';
import DirectImageLoader from './DirectImageLoader';
import GoogleDriveImage from './GoogleDriveImage';
import { isGoogleDriveUrl } from '../utils/googleDriveUtils';
// Import a direct image for background
import ghibliBackground from '../assets/ghibli_images/09F156D1-BCB5-4805-B281-6C0493F407A6.PNG';

const Home = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const filteredProfiles = profiles.filter(profile =>
    profile.name && profile.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const checkScreenSize = () => {
      const isMobileView = window.innerWidth <= 768;
      setIsMobile(isMobileView);

      // We no longer automatically redirect desktop users
      // This allows both mobile and desktop to see the gallery landing page
    };

    // Check if user is logged in
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchProfiles = async () => {
      try {
        console.log('Fetching profiles in Home component');
        const data = await getProfiles();
        console.log('Profiles received in Home component:', data);
        setProfiles(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching profiles in Home component:', error);
        if (error.code === 'ERR_NETWORK') {
          setError('Network error: Cannot connect to the server. Please make sure the backend is running.');
        } else {
          setError(`Failed to load profiles: ${error.message}. Please try again.`);
        }
      } finally {
        setLoading(false);
      }
    };

    checkScreenSize();
    fetchProfiles();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [navigate, currentUser]);

  return (
    <>
      {/* Direct background image */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${ghibliBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.7,
        zIndex: 0
      }} />

      <div className="app-container ghibli-theme">

        <div className="content-container">
          <header className={`header ghibli-header ${!isMobile ? 'd-block text-center' : 'd-flex justify-content-between align-items-center'}`}>
            {isMobile ? (
              <>
                <img src={logo} alt="Logo" className="logo" />
                <h1 className="ghibli-title">Yearbook 2025</h1>
                <Link to="/build-profile" className="btn btn-outline-light ghibli-btn" style={{ borderRadius: '100%' }}>
                  <i className="fas fa-plus"></i>
                </Link>
              </>
            ) : (
              <>
                <h1 className="mb-3 ghibli-title">Yearbook 2025 Gallery</h1>
                <p className="ghibli-subtitle">Browse through the profiles of your classmates</p>
              </>
            )}
          </header>

          <div className="search-bar ghibli-search">
            <i className="fas fa-search ghibli-search-icon"></i>
            <input
              type="text"
              placeholder="     Search profiles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ghibli-input"
            />
            {searchQuery && (
              <button
                className="ghibli-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          <div className="profiles-container">
            {loading ? (
              <div className="loading-container text-center py-5">
                <div className="spinner-border ghibli-spinner" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 ghibli-text">Loading profiles...</p>
              </div>
            ) : error ? (
              <div className="error-container text-center py-5">
                <div className="text-danger mb-3">
                  <i className="fas fa-exclamation-circle fa-3x"></i>
                </div>
                <p className="text-danger ghibli-text">{error}</p>
                <button
                  className="btn btn-outline-primary mt-3 ghibli-btn"
                  onClick={() => window.location.reload()}
                >
                  <i className="fas fa-sync-alt me-2"></i> Retry
                </button>
              </div>
            ) : filteredProfiles.length === 0 ? (
              <p className="text-center ghibli-text my-4">No profiles match your search</p>
            ) : (
              <div className="profiles-gallery-grid">
                {filteredProfiles.map((profile) => (
                  <Link
                    to={isMobile ? `/profile/${profile.id}` : `/profileD/${profile.id}`}
                    key={profile.id}
                    className="profile-gallery-item"
                  >
                    <div className="profile-gallery-card ghibli-card">
                      <div className="profile-gallery-img-container ghibli-img-container">
                        {profile.image_url && isGoogleDriveUrl(profile.image_url) ? (
                          <GoogleDriveImage
                            src={profile.image_url}
                            className="profile-gallery-img"
                            alt={profile.name}
                            type="profile"
                            fallbackSrc={getProfileImageUrl(profile.id)}
                          />
                        ) : (
                          <DirectImageLoader
                            src={profile.image_url || getProfileImageUrl(profile.id)}
                            className="profile-gallery-img"
                            alt={profile.name}
                            type="profile"
                          />
                        )}
                      </div>
                      <div className="profile-gallery-info ghibli-info">
                        <h5 className="profile-gallery-name ghibli-name">{profile.name}</h5>
                        <p className="profile-gallery-designation ghibli-designation">{profile.designation}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {isMobile && (
          <footer className="footer">
            <Navbardesk />
          </footer>
        )}
      </div>
    </>
  );
};

export default Home;
