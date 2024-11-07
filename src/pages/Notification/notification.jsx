import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../../config/firebase_config';
import { Link, useNavigate } from 'react-router-dom';
import Spinner from "../../assets/loadingSpinner";
import './notification.css';
import NotificationPageSkeleton from './skeleton.jsx';

const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';
const icon = "https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/logo.png?alt=media&token=97374df9-684d-44bf-ba79-54f5cb7d48b7";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState(defaultProfilePictureURL);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchUserData(user.uid);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchUserData = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfilePicture(userData.profilePicture || defaultProfilePictureURL);
        setNotifications(userData.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification, index) => {
    if (!notification.read) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const updatedNotifications = [...userData.notifications];
          updatedNotifications[index] = { ...notification, read: true };

          await updateDoc(userDocRef, { notifications: updatedNotifications });

          setNotifications(updatedNotifications);
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

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
      case 'notify':
        window.location.href = notification.link;
        break;
      default:
        break;
    }
  };

  if (loading) {
    return <NotificationPageSkeleton />;
  }

  return (
    <div className="notification-page-interface">
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
          <Link to="/notifications"><i className="fa-solid fa-bell" style={{ color: '#205e78' }}></i></Link>
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
              <div className="icon-text-container">
                {notification.type === 'friend' && <i className="fa-solid fa-user-group notification-icon"></i>}
                {(notification.type === 'like' || notification.type === 'comment' || notification.type === 'vote') && <i className="fa-solid fa-thumbs-up notification-icon"></i>}
                {(notification.type === 'match' || notification.type === 'competition') && <i className="fa-solid fa-trophy notification-icon"></i>}
                {notification.type === 'notify' && <i className="fa-solid fa-bell notification-icon"></i>}
                <p className="notification-text">
                  {notification.text}
                  {notification.type === 'friend' && <span className="notification-link">Go to {notification.username}'s profile</span>}
                  {(notification.type === 'like' || notification.type === 'comment' || notification.type === 'vote') && <span className="notification-link">View the video performance</span>}
                  {notification.type === 'match' && <span className="notification-link">View Match of the Day</span>}
                  {notification.type === 'competition' && <span className="notification-link">View Competition Details</span>}
                  {notification.type === 'notify' && <span className="notification-link">View Notification Details</span>}
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
