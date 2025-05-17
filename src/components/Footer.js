import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const location = useLocation();

  // Don't show footer on team page or landing/login page
  if (location.pathname === '/team' || location.pathname === '/login') {
    return null;
  }

  return (
    <div className="footer">
      <div>
        made with ❤️ by{' '}
        <a href="https://github.com/Metis-IITGandhinagar" target="_blank" rel="noopener noreferrer">
          Metis
        </a>{' '}
        &{' '}
        <a href="https://www.instagram.com/studentlife_iitgn/" target="_blank" rel="noopener noreferrer">
          MAPRC
        </a>
      </div>
    </div>
  );
};

export default Footer;
