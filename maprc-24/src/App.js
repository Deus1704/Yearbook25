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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/team" element={<Team />} />
        <Route path="/desktop-home" element={<DesktopHome />} />
        <Route path="/try" element={<MyComponent />} />
      </Routes>
    </Router>
  );
}

export default App;
