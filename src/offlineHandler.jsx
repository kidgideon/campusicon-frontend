import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OfflineHandler = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleConnectivityChange = () => {
      if (!navigator.onLine) {
        console.log('User is offline');
        navigate('/offline');
      }
    };

    if (!navigator.onLine) {
      navigate('/offline');
    }

    window.addEventListener('offline', handleConnectivityChange);

    return () => {
      window.removeEventListener('offline', handleConnectivityChange);
    };
  }, [navigate]);

  return children;
};

export default OfflineHandler;
