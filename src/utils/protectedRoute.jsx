// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import toast from 'react-hot-toast';
import Spinner from '../assets/loadingSpinner';

const ProtectedRoute = ({ element: Component }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redirect, setRedirect] = useState(false);
  const [hasNotified, setHasNotified] = useState(false); // Track if the notification has been shown
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken(true); // Force refresh token
          setIsAuthenticated(!!token); // Set authentication state based on token presence
        } catch (error) {
          console.error('Error getting ID token:', error);
          if (!hasNotified) {
            toast.error('Session expired. Please log in again.');
            setHasNotified(true); // Ensure toast is only shown once
          }
          setIsAuthenticated(false);
          setRedirect(true); // Trigger redirection
        }
      } else {
        if (!hasNotified) {
          toast.error('Please log in again.');
          setHasNotified(true); // Ensure toast is only shown once
        }
        setIsAuthenticated(false);
        setRedirect(true); // Trigger redirection
      }
      setIsLoading(false); // Finished checking auth state
    });

    return () => unsubscribe();
  }, [auth, hasNotified]);

  if (isLoading) {
    return <Spinner />;
  }

  if (redirect) {
    setTimeout(() => {
      setRedirect(false);
    }, 1000); // Wait for 3 seconds before redirecting
    return null;
  }

  return isAuthenticated ? Component : <Navigate to="/login" />;
};

export default ProtectedRoute;
