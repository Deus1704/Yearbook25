import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Login from './components/login';
import Profile from './components/Profile';
import Gallery from './components/Gallery';
import Team from './components/Team';
import DesktopHome from './components/DesktopHome';
import MyComponent from './components/try';
import ProfilePage from './components/ProfilePage';
import Message from './components/Message';
import Confessions from './components/Confessions';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />                           //merge both destop and mobile
        <Route path="/login" element={<Login />} />                     //login with google
        <Route path="/profile/:id" element={<Profile />} />             //merge both destop and mobile
        <Route path="/profileD/:id" element={<ProfilePage />} />
        <Route path="/gallery" element={<Gallery />} />                 //navbar for desktop
        <Route path="/team" element={<Team />} />                       //team for mobile and navbar for both
        <Route path="/desktop-home" element={<DesktopHome />} />        //desktop memory
        <Route path="/try" element={<MyComponent />} />
        <Route path="/profile-page" element={<ProfilePage />} />        //Direct navigate to profileD
        <Route path="/message" element={<Message />} />                 //Navbar and resposive for desktop
        <Route path="/confessions" element={<Confessions />} />         //Navbar and resposive for desktop
      </Routes>
    </Router>
  );
}

export default App;
