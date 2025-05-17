import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { preloadGalleryImages } from '../services/imagePreloader';

export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage first
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    // Then listen for auth state changes from Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email && user.email.endsWith('@iitgn.ac.in')) {
        setCurrentUser(user);
        // Update localStorage
        localStorage.setItem('user', JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }));

        // Start preloading gallery images in the background
        console.log('User logged in, starting background preload of gallery images');
        preloadGalleryImages().catch(err =>
          console.error('Error preloading gallery images:', err)
        );
      } else {
        // If user is logged out or doesn't have the right domain
        setCurrentUser(null);
        localStorage.removeItem('user');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = { currentUser };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};