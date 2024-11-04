import React from 'react';
import './SplashScreen.css';
import logo from "../assets/logo.png";

const SplashScreen = () => {
  return (
    <div className="splash-screen">
      <img src={logo} className="company-logo-splash" alt="Company Logo" />
      <h1>Campus Icon</h1>
    </div>
  );
};

export default SplashScreen;
