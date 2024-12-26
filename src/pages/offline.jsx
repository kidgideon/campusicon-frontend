import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import offline from './offline.svg';
import toast from 'react-hot-toast';

const Offline = () => {
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored! Redirecting...');
      setTimeout(() => navigate(-1), 2000); // Navigate back after a brief delay
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You are offline!');
    };

    // Attach event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (navigator.onLine) {
      setIsOnline(true);
    } else {
      setIsOnline(false);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate]);

  return (
    <div className="offline-interface">
      <img src={offline} alt="You are offline illustration" />
      <h1>OOPS! YOU'RE OFFLINE</h1>
      <p>
        It seems like you've lost your internet connection. Please check your connection and try reconnecting.
      </p>
      {!isOnline && (
        <p style={{ color: 'red', fontWeight: 'bold' }}>Waiting for reconnection...</p>
      )}
    </div>
  );
};

export default Offline;
