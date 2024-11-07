import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../../../config/firebase_config';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

const TopTab = () => {
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  useEffect(() => {
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
  }, []);

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

  return (
    <div className="top-tab">
      <span className="home-tab">
        <Link to="/"><i className="fa-solid fa-house" style={{ color:  '#277AA4' }}></i></Link>
      </span>
      <span className="discovery-tab">
        <Link to="/discovery-page"><i className="fa-solid fa-compass"></i></Link>
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
        {/* Add the path to your advertisements or marketing page if needed */}
        <Link to="/ads"><i className="fa-solid fa-bullhorn"></i></Link>
      </span>
    </div>
  );
};

export default TopTab;