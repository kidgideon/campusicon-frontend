import React, { useState } from "react";
import { Link } from "react-router-dom";  // Import Link for navigation
import PeopleImage from './images/undraw_people_ka7y-removebg-preview.png';
import WinnersImage from './images/undraw_winners_fre4.png';
import SingingTalentImage from './images/2933.jpg';
import DancingTalentImage from './images/14166.jpg';
import './CampusIcon.css';  // Import the vanilla CSS file

const CampusIcon = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <div className="campus-icon-container">
      <nav className="campus-icon-navbar">
        <div className="campus-icon-logo">CampusIcon</div>
        <div className={`campus-icon-nav-links ${menuOpen ? 'open' : ''}`}>
          <Link className="campus-icon-nav-link" to={'/home'}>Home</Link>
          <Link className="campus-icon-nav-link" to={'/about-us'}>About Us</Link>
          <Link className="campus-icon-nav-link" to={'/how-it-works'}>How It Works</Link>
          <Link className="campus-icon-nav-link" to={'/testimonials'}>Testimonials</Link>
          <Link className="campus-icon-nav-link" to={'/contact'}>Contact</Link>
        </div>
        <div className="campus-icon-auth-buttons">
          <a href="#" className="campus-icon-auth-button">Log In</a>
          <a href="#" className="campus-icon-auth-button">Sign Up</a>
        </div>

        <div className="campus-icon-mobile-menu">
          <button
            onClick={toggleMenu}
            className={`campus-icon-menu-toggle ${menuOpen ? 'open' : ''}`}
            aria-expanded={menuOpen}
          >
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>
      </nav>

      <div className="campus-icon-content">
        <div className="campus-icon-text-content">
          <p className="campus-icon-headline">
            Showcase your talent, earn rewards, and rise to the top!
          </p>
          <p className="campus-icon-description">
            Join a thriving community of talent enthusiasts. Compete in exciting challenges, earn iCoins, and unlock amazing rewards as you level up.
            The more you participate, the more you win!
          </p>
        </div>
        <div className="campus-icon-image-content">
          <img className="campus-icon-image" src={PeopleImage} alt="Talent Showcase" />
        </div>
      </div>

      <div className="campus-icon-reward-section">
        <div className="campus-icon-reward-content">
          <div className="campus-icon-reward-text">
            <p className="campus-icon-reward-title">Get Rewarded</p>
            <p className="campus-icon-reward-description">
              The Campus Icon App lets you earn iCoins by competing in challenges, which you can cash out, plus enjoy daily tasks and exclusive levels.
            </p>
            <button className="campus-icon-get-started">Get started</button>
          </div>
          <div className="campus-icon-reward-image">
            <img className="campus-icon-image" src={WinnersImage} alt="Transform Your Passion" />
          </div>
        </div>

        <div className="campus-icon-talent-showcase">
          <p className="campus-icon-talent-title">Show Us Your Talent!</p>
          <div className="campus-icon-talent-cards">
            <div className="campus-icon-talent-card">
              <img className="campus-icon-talent-image" src={SingingTalentImage} alt="Singing Talent" />
              <p className="campus-icon-talent-text">Have you got a singing talent?</p>
              <Link to="/login" className="campus-icon-learn-more">Learn More</Link>
            </div>

            <div className="campus-icon-talent-card">
              <img className="campus-icon-talent-image" src={DancingTalentImage} alt="Dancing Talent" />
              <p className="campus-icon-talent-text">Have you got a dancing talent?</p>
              <Link to="/login" className="campus-icon-learn-more">Learn More</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampusIcon;
