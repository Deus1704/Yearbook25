import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './Home.css';
import { Link } from 'react-router-dom';
import logo from '../assets/Logo.svg';
import profiles from './Profiles';



const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
    <div className="app-container">
      <header className="header d-flex justify-content-between align-items-center p-3">
        <img src={logo} alt="Logo" className="logo" style={{filter:'invert(1)'}}/>
        <h1>Yearbook 2024</h1>
        <button className="btn btn-outline-light"style={{filter:'invert(1)', borderRadius:'100%'}}><i className="fas fa-plus"></i></button>
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
      <div >
      {/* <div className="container">
        <div className="" id='needed'>
          {filteredProfiles.map((profile, index) => (
            <div className=" mb-3" key={index}>
              <Link to={`/profile/${profile.id}`} className="text-decoration-none">
                <div className="card shadow">
                  <img src={profile.image} className="card-img-top" alt={profile.name} />
                  <div className="card-body text-center">
                    <h5 className="card-title">{profile.name}</h5>
                    <p className="card-text">{profile.designation}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div> */}
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

      <footer className="footer d-flex justify-content-around align-items-center p-2" style={{position:'fixed', width:'100%', top:'93vh', zIndex:'10', borderTopLeftRadius:'10px', borderTopRightRadius:'10px'}}>
        <button className="footer-btn"><i className="fas fa-home"></i></button>
        <button className="footer-btn"><i className="fas fa-sync-alt"></i></button>
        <button className="footer-btn"><i className="fas fa-plus"></i></button>
        <button className="footer-btn"><i className="fas fa-list"></i></button>
        <button className="footer-btn"><i className="fas fa-users"></i></button>
      </footer>
    </div>
    </>
  );
};

export default Home;
