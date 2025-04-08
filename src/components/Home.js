import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Home.css';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/Logo.svg';
import profiles from './Profiles';
import Navbardesk from './Navbar';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (window.innerWidth > 768) {
      navigate('/profileD/1');
    }

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, [navigate, currentUser]);

  return (
    <>
      {isMobile ? (
        <div className="app-container">
          <header className="header d-flex justify-content-between align-items-center">
            <img src={logo} alt="Logo" className="logo" style={{ filter: 'invert(1)' }} />
            <h1>Yearbook 2024</h1>
            <Link to="/build-profile" className="btn btn-outline-light" style={{ filter: 'invert(1)', borderRadius: '100%' }}>
              <i className="fas fa-plus"></i>
            </Link>
          </header>

          <div className="search-bar">
            <input
              type="text"
              placeholder="Search here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="container">
            <div className="row">
              {filteredProfiles.map((profile) => (
                <div className="col-6" key={profile.id}>
                  <Link to={`/profile/${profile.id}`} className="text-decoration-none">
                    <div className="card1">
                      <img src={profile.image} className="card-img-top" alt={profile.name} />
                      <div className="card-body">
                        <h5 id="card-title">{profile.name}</h5>
                        <p id="card-text">{profile.designation}</p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <footer className="footer">
            <Navbardesk />
          </footer>
        </div>
      ) : null}
    </>
  );
};

export default Home;
