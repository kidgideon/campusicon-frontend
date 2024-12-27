import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OfflineHandler = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleConnectivityChange = () => {
      if (navigator.onLine) {
        // If the user is online, navigate one step backward
        console.log('User is back online');
        navigate(-1); // This will go back one step in the navigation history
      } else {
        console.log('User is offline');
        navigate('/offline'); // Redirect to an offline page if needed
      }
    };

    // Check initial online status
    if (!navigator.onLine) {
      navigate('/offline'); // Redirect to an offline page initially if offline
    }

    window.addEventListener('online', handleConnectivityChange);
    window.addEventListener('offline', handleConnectivityChange);

    return () => {
      window.removeEventListener('online', handleConnectivityChange);
      window.removeEventListener('offline', handleConnectivityChange);
    };
  }, [navigate]);

  return children;
};

export default OfflineHandler;
