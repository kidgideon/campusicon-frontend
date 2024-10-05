import React, { useEffect, useState } from 'react';
import './ads.css';
import { Link } from 'react-router-dom';
import icon from '../../assets/logo.png';
import { collection, getDocs, where, query } from 'firebase/firestore';
import {auth, db, } from '../../../config/firebase_config'

const AdsPage = () => {
  const [profilePicture, setProfilePicture] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = collection(db, 'users');
        const q = query(userRef, where('uid', '==', user.uid)); // Use user.uid for comparison

        try {
          const querySnapshot = await getDocs(q);
          let userData;

          querySnapshot.forEach((doc) => {
            userData = doc.data();
          });

          if (userData) {
            setProfilePicture(userData.profilePicture || defaultProfilePictureURL); // Set default if profilePicture is not present
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    });

    return unsubscribe;
  }, []);

  return (
    <div className="full-house">
      <div className="ads-page-interface">
        <div className="top-section">
          <span className="user-dp">
            <Link to="/profile">
              <img src={profilePicture} alt="User Avatar" />
            </Link>
          </span>
          <span className="company-logo">
            <img src={icon} alt="logo" />
          </span>
          <span className="nav-bar">
            <Link to="/menu"><i className="fa-solid fa-bars"></i></Link>
          </span>
        </div>

        {/* Top Tab */}
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
            <Link to="/notifications"><i className="fa-solid fa-bell"></i></Link>
          </span>
          <span className="ad-tab">
            <Link to="/ads"><i className="fa-solid fa-bullhorn" style={{ color: '#205e78' }}></i></Link>
          </span>
        </div>

        <h1>Advertise on Campus Icon</h1>
        <p style={{ color: 'white' }}>Contact the Campus Icon team to create your ad:</p>
     
        <a href="https://wa.me/2349013585057" target="_blank">
            <button>
            WhatsApp: +234 901 358 5057
          </button>
            </a> 
      </div>
    </div>
  );
};

export default AdsPage;