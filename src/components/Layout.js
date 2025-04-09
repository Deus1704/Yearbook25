import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbardesk from './Navbar';

const Layout = () => {
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
      {!isMobile && <Navbardesk />}
      <div className={!isMobile ? 'page-with-navbar' : ''}>
        <Outlet />
      </div>
      {isMobile && <Navbardesk />}
    </>
  );
};

export default Layout;
