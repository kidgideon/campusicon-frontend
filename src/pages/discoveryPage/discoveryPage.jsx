import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import {auth, db} from '../../../config/firebase_config'
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import ReactPlayer from 'react-player';
import logo from '../../assets/logo.png';
import './discovery.css';
import Spinner from "../../assets/loadingSpinner";

const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';

const DiscoveryPage = () => {
  const [profilePicture, setProfilePicture] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [creators, setCreators] = useState({});
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false); // State for spinner
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchProfilePicture(user.uid);
      }
    });

    const fetchUnreadNotifications = async () => {
      const userRef = collection(db, 'users');
      const q = query(userRef); // Get all user documents

      try {
        const querySnapshot = await getDocs(q);
        let unreadCount = 0;

        querySnapshot.forEach(async (doc) => {
          const user = doc.data();
          const notifications = user.notifications || []; // Get notifications array

          for (const notification of notifications) {
            if (!notification.read) {
              unreadCount++;
            }
          }
        });

        setUnreadNotificationCount(unreadCount);
      } catch (error) {
        console.error('Error fetching unread notifications:', error);
      }
    };

    fetchUnreadNotifications();
    return () => unsubscribe();
  }, [auth, db]);

  const fetchProfilePicture = async (uid) => {
    const userDocRef = collection(db, 'users');
    const q = query(userDocRef, where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      setProfilePicture(userData.profilePicture || defaultProfilePictureURL);
    });
  };

  const markAllAsRead = async () => {
    const userRef = collection(db, 'users');
    const q = query(userRef); // Get all user documents

    try {
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach(async (doc) => {
        const userDoc = doc.data();
        const notifications = userDoc.notifications || [];

        for (let i = 0; i < notifications.length; i++) {
          // Update the notification directly within the user document
          await updateDoc(doc.ref, {
            notifications: notifications.map((notification) => {
              if (notification.id === notifications[i].id) {
                return { ...notification, read: true };
              }
              return notification;
            }),
          });
        }
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }

    setUnreadNotificationCount(0); // Reset unread count after marking all as read
  };


  
  const handleSearch = async () => {
    setHasSearched(true);
  
    if (searchTerm.trim().length >= 3) { // Enforce minimum of three characters
      setLoading(true); // Start loading spinner
  
      // Convert search term to lowercase for case-insensitive search
      const lowercasedSearchTerm = searchTerm.toLowerCase();
  
      // Use the '==' operator for stricter matching or range matching for exact starts
      const competitionQuery = query(
        collection(db, 'competitions'), 
        where('name', '>=', lowercasedSearchTerm),
        where('name', '<=', lowercasedSearchTerm + '\uf8ff') // strict match range
      );
  
      const userQuery = query(
        collection(db, 'users'), 
        where('username', '>=', lowercasedSearchTerm),
        where('username', '<=', lowercasedSearchTerm + '\uf8ff')
      );
  
      // Fetch competition results
      const competitionSnapshot = await getDocs(competitionQuery);
      const userSnapshot = await getDocs(userQuery);
  
      const results = [];
  
      // Fetch competition results
      competitionSnapshot.forEach((doc) => {
        const competitionData = doc.data();
        results.push({
          type: 'competition',
          data: competitionData
        });
      });
  
      // Fetch user results
      userSnapshot.forEach((doc) => {
        const userData = doc.data();
        results.push({
          type: 'user',
          data: userData
        });
      });
  
      setSearchResults(results);
      setLoading(false); // Stop loading spinner
    } else {
      setSearchResults([]);
      setHasSearched(false);
    }
  };
  
  


  return (
    <div className="full-house">
 <div className="discovery-page-interface">
      {/* Top section */}
      <div className="top-section">
        <span className="user-dp">
          <Link to="/profile">
            <img src={profilePicture} alt="User Avatar" />
          </Link>
        </span>
        <span className="company-logo">
          <img src={logo} alt="logo" />
        </span>
        <span className="nav-bar">
          <i className="fa-solid fa-bars"></i>
        </span>
      </div>

      {/* Top navigation tabs */}
      <div className="top-tab">
        <span className="home-tab">
          <Link to="/"><i className="fa-solid fa-house"></i></Link>
        </span>
        <span className="discovery-tab">
          <Link to="/discovery"><i className="fa-solid fa-compass" style={{ color: '#205e78' }}></i></Link>
        </span>
        <span className="competition-tab">
          <Link to="/competitions"><i className="fa-solid fa-trophy"></i></Link>
        </span>
        <span className="notifications-tab" onClick={markAllAsRead}> {/* Mark all as read on click */}
      <Link to="/notifications"><i className="fa-solid fa-bell"></i></Link>
        <span className='unread-notification-count' style={{ display: unreadNotificationCount > 0 ? 'block' : 'none' }}>
          {unreadNotificationCount > 15 ? '15+' : unreadNotificationCount}
        </span>
      </span>
        <span className="ad-tab">
          <Link to="/ads"><i className="fa-solid fa-bullhorn"></i></Link>
        </span>
      </div>

      {/* Search Interface */}
      <div className="Discovery-page-search-interface">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>
          <i className="fa-solid fa-magnifying-glass"></i>
        </button>
      </div>

      {/* Search Output Area */}
      <div className="discovery-page-output-area">
        {loading ? (
          <div className="spinner-container">
            <Spinner /> {/* Show spinner while loading */}
          </div>
        ) : searchResults.length > 0 ? (
          searchResults.map((result, index) => (
           
 <div key={index} className="search-result-item">
              {result.type === 'competition' && (
                <Link to={`/competition/${result.data.competitionId}`} >
                  <div>
                  <img src={result.data.imageUrl} alt="Competition" />
                  </div>
                  <p>{result.data.name}</p>
                  <p>{result.data.type}</p>
                  <p>{result.data.videos.length} participants</p>
                </Link>
              )}
              {result.type === 'user' && (
                <Link to={`/profile/${result.data.username}`} >
                  <div>
                  <img src={result.data.profilePicture || defaultProfilePictureURL} alt="User" />
                  </div>
                  <p>{result.data.username}</p>
                  <p>{result.data.points} campus streaks</p>
                </Link>
              )}
            </div>
           
          ))
        ) : hasSearched && searchTerm.length >= 3 ? (
          <p>No results found</p>
        ) : null}
      </div>
    </div>
    </div>
  );
};

export default DiscoveryPage;

