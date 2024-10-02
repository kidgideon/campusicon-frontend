import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../../config/firebase_config';
import { Link, useNavigate } from 'react-router-dom';
import Spinner from "../../assets/loadingSpinner";
import './notification.css';
import icon from '../../assets/logo.png'; // Assuming the company logo path

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState('https://example.com/default-profile-pic.png'); // Default profile pic
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchNotifications(user.uid);
        fetchUserProfile(user.uid); // Fetch user's profile picture
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchNotifications = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Sort notifications by timestamp (newest first)
        const sortedNotifications = (userData.notifications || []).sort((a, b) => b.timestamp - a.timestamp);
        setNotifications(sortedNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfilePicture(userData.profilePicture || 'https://example.com/default-profile-pic.png');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleNotificationClick = async (notification, index) => {
    // Update read status
    if (!notification.read) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const updatedNotifications = [...userData.notifications];
          updatedNotifications[index] = { ...notification, read: true };

          await updateDoc(userDocRef, {
            notifications: updatedNotifications,
          });

          setNotifications((prevNotifications) =>
            prevNotifications.map((notif, i) =>
              i === index ? { ...notif, read: true } : notif
            )
          );
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate based on notification type and competitionId
    switch (notification.type) {
      case 'friend':
        navigate(`/profile/${notification.username}`);
        break;
      case 'like':
      case 'comment':
      case 'vote':
        navigate(`/video-performance/${notification.competitionId}`);
        break;
      case 'match':
        navigate(`/match`);
        break;
      case 'competition':
        navigate(`/competition/${notification.competitionId}`);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="notification-page-interface">
      {/* Top Section */}
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
          <Link to="/ads"><i className="fa-solid fa-bullhorn"></i></Link>
        </span>
      </div>

      <h1 className="notification-title">Notifications</h1>
      {notifications.length > 0 ? (
        notifications.map((notification, index) => (
          <div
            key={index}
            className={`notification-card ${notification.read ? '' : 'unread'}`}
            onClick={() => handleNotificationClick(notification, index)}
          >
            <div className="notification-content">
              {/* Render appropriate icon and link based on notification type */}
              <div className="icon-text-container">
                {/* Dynamic Icons */}
                {notification.type === 'friend' && (
                  <i className="fa-solid fa-user-group notification-icon"></i>
                )}
                {(notification.type === 'like' || notification.type === 'comment' || notification.type === 'vote') && (
                  <i className="fa-solid fa-thumbs-up notification-icon"></i>
                )}
                {(notification.type === 'match' || notification.type === 'competition') && (
                  <i className="fa-solid fa-trophy notification-icon"></i>
                )}

                {/* Notification Text */}
                <p className="notification-text">
                  {notification.text}
                  {/* Dynamic Links */}
                  {notification.type === 'friend' && (
                    <span className="notification-link">
                      Go to {notification.username}'s profile
                    </span>
                  )}
                  {(notification.type === 'like' || notification.type === 'comment' || notification.type === 'vote') && (
                    <span className="notification-link">
                      View the video performance
                    </span>
                  )}
                  {notification.type === 'match' && (
                    <span className="notification-link">
                      View Match of the Day
                    </span>
                  )}
                  {notification.type === 'competition' && (
                    <span className="notification-link">
                      View Competition Details
                    </span>
                  )}
                </p>
              </div>
            </div>
            {!notification.read && <span className="unread-badge">New</span>}
          </div>
        ))
      ) : (
        <p className="no-notifications">No notifications found.</p>
      )}
    </div>
  );
};

export default Notifications;
