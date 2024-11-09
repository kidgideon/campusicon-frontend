import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase_config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import ReactPlayer from 'react-player';
import './discovery.css';
import Spinner from "../../assets/loadingSpinner";
import { useQuery } from '@tanstack/react-query';

const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';
const logo = "https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/logo.png?alt=media&token=97374df9-684d-44bf-ba79-54f5cb7d48b7";

const DiscoveryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false); // State for spinner

  // Fetch Profile Picture using React Query
  const fetchProfilePicture = async (uid) => {
    const userDocRef = collection(db, 'users');
    const q = query(userDocRef, where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    let profilePic = defaultProfilePictureURL;
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      profilePic = userData.profilePicture || defaultProfilePictureURL;
    });
    return profilePic;
  };

  const { data: profilePicture, isLoading: profileLoading } = useQuery({
    queryKey: ['profilePicture'],
    queryFn: async () => {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            const pic = await fetchProfilePicture(user.uid);
            resolve(pic);
          }
        });
      });
    },
    staleTime: 20 * 60 * 1000,  // 20 minutes
    cacheTime: 60 * 60 * 1000    // 1 hour
  });
  
  // Fetch Unread Notifications using React Query
  const fetchUnreadNotifications = async () => {
    const userRef = collection(db, 'users');
    const q = query(userRef); // Get all user documents
    const querySnapshot = await getDocs(q);
    let unreadCount = 0;
    querySnapshot.forEach((doc) => {
      const user = doc.data();
      const notifications = user.notifications || [];
      notifications.forEach((notification) => {
        if (!notification.read) {
          unreadCount++;
        }
      });
    });
    return unreadCount;
  };

  const { data: unreadNotificationCount = 0, isLoading: notificationsLoading } = useQuery({
    queryKey: ['unreadNotifications'],
    queryFn: fetchUnreadNotifications,
    staleTime: 20 * 60 * 1000,  // 20 minutes
    cacheTime: 60 * 60 * 1000   // 1 hour
  });

  // Mark all notifications as read
  const markAllAsRead = async () => {
    const currentUser = auth.currentUser;

    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnapshot = await getDocs(query(collection(db, 'users'), where('uid', '==', currentUser.uid)));

      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const notifications = userDoc.data().notifications || [];

        // Update all notifications to "read"
        const updatedNotifications = notifications.map((notification) => ({
          ...notification,
          read: true
        }));

        await updateDoc(userRef, { notifications: updatedNotifications });
      }
    }
  };
  const handleSearch = async () => {
    setHasSearched(true);
    if (searchTerm.trim().length >= 3) {
      setLoading(true); // Start loading spinner
      const lowercasedSearchTerm = searchTerm.toLowerCase();
  
      // Broader query fetching more data
      const competitionQuery = collection(db, 'competitions');
      const userQuery = collection(db, 'users');
  
      const [competitionSnapshot, userSnapshot] = await Promise.all([
        getDocs(competitionQuery),
        getDocs(userQuery)
      ]);
  
      const results = [];
  
      // Filter competitions by substring match
      competitionSnapshot.forEach((doc) => {
        const competitionData = doc.data();
        if (
          competitionData.name &&
          competitionData.name.toLowerCase().includes(lowercasedSearchTerm)
        ) {
          results.push({
            type: 'competition',
            data: competitionData
          });
        }
      });
  
      // Filter users by substring match
      userSnapshot.forEach((doc) => {
        const userData = doc.data();
        if (
          userData.username &&
          userData.username.toLowerCase().includes(lowercasedSearchTerm)
        ) {
          results.push({
            type: 'user',
            data: userData
          });
        }
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
              <img src={profileLoading ? defaultProfilePictureURL : profilePicture} alt="User Avatar" />
            </Link>
          </span>
          <span className="company-logo">
            <img src={logo} alt="logo" />
          </span>
         
          <span className="nav-bar">
          <Link to="/menu">
            <i className="fa-solid fa-bars"></i>
              </Link>
          </span>
        
        </div>

        {/* Top navigation tabs */}
        <div className="top-tab">
          <span className="home-tab">
            <Link to="/"><i className="fa-solid fa-house"></i></Link>
          </span>
          <span className="discovery-tab">
            <Link to="/discovery-page"><i className="fa-solid fa-compass" style={{ color: '#205e78' }}></i></Link>
          </span>
          <span className="competition-tab">
            <Link to="/competitions"><i className="fa-solid fa-trophy"></i></Link>
          </span>
          <span className="notifications-tab">
            <Link to="/notifications"><i className="fa-solid fa-bell" onClick={markAllAsRead}></i></Link>
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
