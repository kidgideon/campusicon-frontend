import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  // const navigate = useNavigate();

  // // Simulating authentication check. Replace this with your actual authentication logic.
  // const isAuthenticated = () => {
  //   // You can use Firebase auth or check localStorage for a token.
  //   // Example:
  //   // return localStorage.getItem('authToken') !== null;

  //   // For this example, let's assume the user is not authenticated:
  //   return false; // Update this logic based on your app
  // };

  // useEffect(() => {
  //   if (isAuthenticated()) {
  //     // If the user is authenticated, redirect to the dashboard
  //     navigate('/dashboard');
  //   } else {
  //     // If not, redirect to login
  //     navigate('/login');
  //   }
  // }, [navigate]);

  return (
    <div className="home-page-interface">
      <h1>Coming Soon</h1>
      <nav>
        <ul>
          <li>
            <Link to="/register">Register</Link>
          </li>
          <li>
            <Link to="/login">Login</Link>
          </li>
          <li>
            <Link to="/">Dashboard</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Home;
