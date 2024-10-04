import React from 'react';
import './SplashScreen.css'; // Add your styles here
import logo from "../assets/logo.png"

const SplashScreen = () => {
  return (
    <div className="splash-screen">
      <img src={logo} alt="Company Logo" />
      <h1>Campus Icon</h1>
    </div>
  );
};

export default SplashScreen;
