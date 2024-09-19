import { Link } from 'react-router-dom';

const Home = () => {
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
            <Link to="/dashboard">Dashboard</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Home;
