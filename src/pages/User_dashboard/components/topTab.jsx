import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation

const TopTab = () => {
  return (
    <div className="top-tab">
      <span className="home-tab">
        <Link to="/"><i className="fa-solid fa-house"></i></Link>
      </span>
      <span className="discovery-tab">
        <Link to="/discovery-page"><i className="fa-solid fa-compass"></i></Link>
      </span>
      <span className="competition-tab">
        <Link to="/competitions"><i className="fa-solid fa-trophy"></i></Link>
      </span>
      <span className="notifications-tab">
        {/* Add the path to your notifications page if needed */}
        <Link to="/notifications"><i className="fa-solid fa-bell"></i></Link>
      </span>
      <span className="ad-tab">
        {/* Add the path to your advertisements or marketing page if needed */}
        <Link to="/ads"><i className="fa-solid fa-bullhorn"></i></Link>
      </span>
    </div>
  );
};

export default TopTab;
