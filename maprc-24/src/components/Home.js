import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Home.css';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/Logo.svg';
import profiles from './Profiles';
import Navbardesk from './Navbar';

const Home = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    // Navigate to profileD/1 if the screen size is larger than 768px
    if (window.innerWidth > 768) {
      navigate('/profileD/1');
    }

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [navigate]);

  return (
    <>
      {isMobile ? (
        <div>
          <div className="app-container">
            <header className="header d-flex justify-content-between align-items-center p-3">
              <img src={logo} alt="Logo" className="logo" style={{ filter: 'invert(1)' }} />
              <h1>Yearbook 2024</h1>
              <button className="btn btn-outline-light" style={{ filter: 'invert(1)', borderRadius: '100%' }}>
                <i className="fas fa-plus"></i>
              </button>
            </header>

            <div className="search-bar d-flex justify-content-center my-3">
              <input
                type="text"
                className="form-control"
                placeholder="Search here..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div>
            <div className="container">
              <div className="row">
                {filteredProfiles.map((profile, index) => (
                  <div className="col-6 col-md-3 mb-3" key={index}>
                    <Link to={`/profile/${profile.id}`} className="text-decoration-none">
                      <div className="card1">
                        <img src={profile.image} className="card-img-top" alt={profile.name} />
                        <div className="card-body text-center">
                          <h5 id="card-title">{profile.name}</h5>
                          <p id="card-text">{profile.designation}</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
            <Navbardesk />
          </div>
        </div>
      ) : (
        // Desktop view redirection handled in useEffect
        null
      )}
    </>
  );
};

export default Home;
