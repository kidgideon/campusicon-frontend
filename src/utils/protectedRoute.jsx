// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import toast from 'react-hot-toast';
import Spinner from '../assets/loadingSpinner';
import { useQuery } from '@tanstack/react-query';
import SkeletonLoader from '../pages/User_dashboard/DashboardSkeleton';

const fetchUser = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (user) {
    try {
      const token = await user.getIdToken(true); // Force refresh token
      return { user, token };
    } catch (error) {
      console.error('Error getting ID token:', error);
      throw new Error('Session expired. Please log in again.');
    }
  } else {
    throw new Error('Please log in again.');
  }
};

const ProtectedRoute = ({ element: Component }) => {
  const [redirect, setRedirect] = useState(false);
  const [hasNotified, setHasNotified] = useState(false); // Track if the notification has been shown

  const { data, isLoading, isError } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    staleTime: 20 * 60 * 1000, // 20 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
    onError: (error) => {
      if (!hasNotified) {
        toast.error(error.message);
        setHasNotified(true); // Ensure toast is only shown once
      }
      setRedirect(true);
    },
  });

  useEffect(() => {
    if (isError) {
      setTimeout(() => setRedirect(false), 1000); // Optional: Reset redirect after a delay
    }
  }, [isError]);

  if (isLoading) {
    return <SkeletonLoader/>;
  }

  if (redirect) {
    return <Navigate to="/login" />;
  }

  return data ? Component : <Navigate to="/login" />;
};

export default ProtectedRoute;
