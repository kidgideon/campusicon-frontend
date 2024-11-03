import React, { useEffect, useState } from 'react';
import './ads.css';
import { Link } from 'react-router-dom';
import icon from '../../assets/logo.png';
import { collection, getDocs, where, query, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase_config';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';


// Function to fetch user data
const fetchUserData = async (uid) => {
  const userRef = collection(db, 'users');
  const q = query(userRef, where('uid', '==', uid)); // Use user.uid for comparison
  const querySnapshot = await getDocs(q);
  let userData;

  querySnapshot.forEach((doc) => {
    userData = doc.data();
  });

  return userData;
};

// Function to fetch unread notifications count
const fetchUnreadNotificationsCount = async () => {
  const userRef = collection(db, 'users');
  const q = query(userRef);
  const querySnapshot = await getDocs(q);
  let unreadCount = 0;

  querySnapshot.forEach((doc) => {
    const user = doc.data();
    const notifications = user.notifications || [];
    unreadCount += notifications.filter(notification => !notification.read).length;
  });

  return unreadCount;
};

// Function to mark notifications as read
const markNotificationsAsRead = async () => {
  const userRef = collection(db, 'users');
  const q = query(userRef);
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach(async (doc) => {
    const userDoc = doc.data();
    const notifications = userDoc.notifications || [];

    await updateDoc(doc.ref, {
      notifications: notifications.map(notification => ({ ...notification, read: true })),
    });
  });
};

const AdsPage = () => {
  const [profilePicture, setProfilePicture] = useState('');
  const queryClient = useQueryClient();

  // Fetch user data using React Query
  const { data: userData } = useQuery({
    queryKey: ['userData'],
    queryFn: async () => {
      const user = auth.currentUser;
      if (user) {
        return await fetchUserData(user.uid);
      }
      return null;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000 // 30 minutes
  });

  // Fetch unread notifications count using React Query
  const { data: unreadNotificationCount = 0 } = useQuery({
    queryKey: ['unreadNotifications'],
    queryFn: fetchUnreadNotificationsCount,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000 // 30 minutes
  });

  // Mutation for marking notifications as read
  const mutation = useMutation({
    mutationFn: markNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['unreadNotifications']);
    }
  });

  useEffect(() => {
    if (userData) {
      setProfilePicture(userData.profilePicture || defaultProfilePictureURL);
    }
  }, [userData]);

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
          <span className="notifications-tab"> {/* Mark all as read on click */}
            <Link to="/notifications"><i className="fa-solid fa-bell"></i></Link>
            <span className='unread-notification-count' style={{ display: unreadNotificationCount > 0 ? 'block' : 'none' }}>
              {unreadNotificationCount > 15 ? '15+' : unreadNotificationCount}
            </span>
          </span>
          <span className="ad-tab">
            <Link to="/ads"><i className="fa-solid fa-bullhorn" style={{ color: '#205e78' }}></i></Link>
          </span>
        </div>

        <h1>Advertise on Campus Icon</h1>
        <p style={{ color: 'black' }}>Contact the Campus Icon team to create your ad:</p>
     
        <a href="https://wa.me/2349013585057" target="_blank" rel="noopener noreferrer">
            <button>
            Send us a message
          </button>
        </a> 
      </div>
    </div>
  );
};

export default AdsPage;
