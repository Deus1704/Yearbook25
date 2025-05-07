import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Profile from './components/Profile';
import Gallery from './components/Gallery';
import Team from './components/Team';
import ProfilePage from './components/ProfilePage';
import Message from './components/Message';
import Messages from './components/Messages';
import Confessions from './components/Confessions';
import BuildProfile from './components/BuildProfile';
import BackupManager from './components/BackupManager';
import PendingApprovals from './components/PendingApprovals';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';

// Get the base URL from the homepage in package.json
const BASE_PATH = process.env.PUBLIC_URL || '';

function App() {
  return (
    <AuthProvider>
      <Router basename={BASE_PATH}>
        <Routes>
          {/* Public route - Login */}
          <Route path="/login" element={<LandingPage />} />

          {/* Protected routes with Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/team" element={<Team />} />
              <Route path="/profile-page" element={<ProfilePage />} />
              <Route path="/message/:id" element={<Message />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/confessions" element={<Confessions />} />
              <Route path="/profileD/:id" element={<ProfilePage />} />
              <Route path="/build-profile" element={<BuildProfile />} />
              <Route path="/backup-manager" element={<BackupManager />} />
              <Route path="/pending-approvals" element={<PendingApprovals />} />
            </Route>
          </Route>

          {/* Default route - redirects to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
