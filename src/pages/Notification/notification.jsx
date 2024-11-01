import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../../config/firebase_config';
import { Link, useNavigate } from 'react-router-dom';
import Spinner from "../../assets/loadingSpinner";
import './notification.css';
import icon from '../../assets/logo.png'; // Assuming the company logo path
import { useQuery } from '@tanstack/react-query';
const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';
import NotificationPageSkeleton from './skeleton.jsx'
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState(''); // Default profile pic
  const navigate = useNavigate();

  // Fetch user profile picture
  const { data: userProfile, isLoading: isUserProfileLoading } = useQuery({
    queryKey: ['userProfile', currentUser?.uid],
    queryFn: () => fetchUserProfile(currentUser.uid),
    enabled: !!currentUser, // Only fetch if currentUser is available
    staleTime: 1200 * 1000, // Set stale time to 20 minutes (1200 seconds)
    cacheTime: 60 * 60 * 1000, // 1 hour
  });

  // Fetch notifications
  const { data: userNotifications, isLoading: isNotificationsLoading } = useQuery({
    queryKey: ['notifications', currentUser?.uid],
    queryFn: () => fetchNotifications(currentUser.uid),
    enabled: !!currentUser, // Only fetch if currentUser is available
    staleTime: 1200 * 1000, // Set stale time to 20 minutes (1200 seconds)
    cacheTime: 60 * 60 * 1000, // 1 hour
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (userProfile) {
      setProfilePicture(userProfile.profilePicture || defaultProfilePictureURL);
    }
  }, [userProfile]);

  useEffect(() => {
    if (userNotifications) {
      // Sort notifications by timestamp (newest first)
      const sortedNotifications = (userNotifications || []).sort((a, b) => b.timestamp - a.timestamp);
      setNotifications(sortedNotifications);
      setLoading(false);
    }
  }, [userNotifications]);

  const fetchNotifications = async (userId) => {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.notifications || [];
    }
    return [];
  };

  const fetchUserProfile = async (userId) => {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
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
      case 'notify':
        window.location.href = notification.link; // Use the provided link in notification object
        break;
      default:
        break;
    }
  };

  if (isUserProfileLoading || isNotificationsLoading || loading) {
    return <NotificationPageSkeleton/>;
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
          <Link to="/notifications"><i className="fa-solid fa-bell" style={{color : '#205e78'}}></i></Link>
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
                {notification.type === 'notify' && (
                  <i className="fa-solid fa-bell notification-icon"></i>
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
                  {notification.type === 'notify' && (
                    <span className="notification-link">
                      View Notification Details
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
