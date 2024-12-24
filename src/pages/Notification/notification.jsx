import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../../config/firebase_config';
import { Link, useNavigate } from 'react-router-dom';
import Spinner from "../../assets/loadingSpinner";
import './notification.css';
import { useQuery } from '@tanstack/react-query';
const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';
const icon = "https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/logo.png?alt=media&token=97374df9-684d-44bf-ba79-54f5cb7d48b7";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState(''); // Default profile pic
  const navigate = useNavigate();
   const [scrollingUp, setScrollingUp] = useState(true); // To track scroll direction
      let lastScrollY = 0; // Store the last scroll position

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

   // Listen to scroll events
   const handleScroll = () => {
    if (window.scrollY > lastScrollY) {
      // Scrolling down
      setScrollingUp(false);
    } else {
      // Scrolling up
      setScrollingUp(true);
    }
    lastScrollY = window.scrollY; // Update the last scroll position
  };

  window.addEventListener("scroll", handleScroll);

  

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
        case 'icoin': // Handle icoin notification type
        navigate('/icoins'); // Navigate to /icoins page
        break;
      case 'notify':
        window.location.href = notification.link; // Use the provided link in notification object
        break;
      default:
        break;
    }
  };

  if (isUserProfileLoading || isNotificationsLoading || loading) {
    return <Spinner />;
  }

  return (
    <div className="notification-page-interface">
      {/* Top Section */}

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
                 {notification.type === 'icoin' && (
                  <i className="fa-solid fa-coins notification-icon"></i> // Icon for icoin notifications
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
                   {notification.type === 'icoin' && (
                    <span className="notification-link">
                      View your iCoins
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

        <div
                    className={`user-feed-interface-navigation-panel ${
                      scrollingUp ? "visible" : "hidden"
                    }`}
                  >
                    <span>
                      <Link to={"/"}>
                      <i  className="fa-solid fa-house"></i>
                      </Link>
                    </span>
                    <span>
                      <Link to={"/discovery-page"}>
                      <i className="fa-solid fa-magnifying-glass"></i>
                      </Link>
                    </span>
                    <span>
                      <Link  to={"/notifications"}>
                      <i style={{ color: "black" }} className="fa-solid fa-bell"></i>
                      </Link>
                    </span>
                    <span>
                   <Link to={"/ads"}>
                   <i class="fa-solid fa-bullhorn"></i>
                   </Link>
                    </span>
                  </div>
    </div>
  );
};

export default Notifications;
