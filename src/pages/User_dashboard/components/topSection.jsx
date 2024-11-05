import React from 'react';
import { Link } from 'react-router-dom';


const TopSection = ({ userData }) => {
  if (!userData) return null;

  const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';
  const icon = "https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/logo.png?alt=media&token=97374df9-684d-44bf-ba79-54f5cb7d48b7";
  // Check if the profile picture exists, otherwise use the default
  const profilePicture = userData.profilePicture || defaultProfilePictureURL;

  return (
    <div className="top-section">
      <span className="user-dp">
        {/* Wrap the profile picture with a Link to the user's profile */}
        <Link to="/profile"> 
          <img src={profilePicture} alt="User Avatar" />
        </Link>
      </span>
      <span className="company-logo">
        <img src={icon} alt="logo" />
      </span>
      <span className="nav-bar">
        {/* Corrected Link to menu page */}
        <Link to="/menu"><i className="fa-solid fa-bars"></i></Link>
      </span>
    </div>
  );
};

export default TopSection;
