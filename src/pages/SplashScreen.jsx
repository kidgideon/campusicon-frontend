import React from 'react';
import './SplashScreen.css';
const logo = "https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/logo.png?alt=media&token=97374df9-684d-44bf-ba79-54f5cb7d48b7";


const SplashScreen = () => {
  return (
    <div className="splash-screen">
      <img src={logo} className="company-logo-splash" alt="Company Logo" />
      <h1>Campus Icon</h1>
    </div>
  );
};

export default SplashScreen;
