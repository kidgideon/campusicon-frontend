import React, { useEffect, useState } from 'react';
import './ads.css';
import { Link } from 'react-router-dom';
import { collection, getDocs, where, query, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase_config';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';
const icon = "https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/logo.png?alt=media&token=97374df9-684d-44bf-ba79-54f5cb7d48b7";


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
  const [scrollingUp, setScrollingUp] = useState(true); // To track scroll direction
      let lastScrollY = 0; // Store the last scroll position

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

        <h1>Advertise on Campus Icon</h1>
        <p style={{ color: 'black' }}>Contact the Campus Icon team to create your ad:</p>
     
        <a href="https://wa.me/2349013585057" target="_blank" rel="noopener noreferrer">
            <button>
            Send us a message
          </button>
        </a> 
      </div>
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
                      <i  className="fa-solid fa-magnifying-glass"></i>
                      </Link>
                    </span>
                    <span>
                      <Link to={"/notifications"}>
                      <i className="fa-solid fa-bell"></i>
                      </Link>
                    </span>
                    <span>
                   <Link to={"/ads"}>
                   <i style={{ color: "black" }} class="fa-solid fa-bullhorn"></i>
                   </Link>
                    </span>
                  </div>
    </div>
  );
};

export default AdsPage;
