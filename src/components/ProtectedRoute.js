import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { currentUser } = useAuth();
  
  // If user is not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // If user is logged in, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;