import React, { useState } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../../../config/firebase_config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Spinner from '../../assets/loadingSpinner';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import './competionsPage.css';
import superCup from '../../assets/superCup.png';
import normalStarCup from '../../assets/starCup.png';
import iconAwardCup from '../../assets/iconCup.png';
import CompetitionsPageSkeleton from './competionSkeleton';

const icon = "https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/logo.png?alt=media&token=97374df9-684d-44bf-ba79-54f5cb7d48b7";


const awardImages = {
  'Normal Star Award': normalStarCup,
  'Super Star Award': superCup,
  'Icon Award': iconAwardCup,
};

const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';

const CompetitionsPage = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  // Fetch competitions with React Query
  const { data: competitions, isLoading: competitionsLoading } = useQuery({
    queryKey: ['competitions'],
    queryFn: async () => {
      const competitionsCollection = collection(db, 'competitions');
      const querySnapshot = await getDocs(competitionsCollection);
      const competitionsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const ongoingCompetitions = competitionsList.filter(c => c.status === 'ongoing');
      const otherCompetitions = competitionsList.filter(c => c.status !== 'ongoing');

      const sortedOngoingCompetitions = ongoingCompetitions.sort((a, b) => {
        const aVideosCount = a.videos?.length || 0;
        const bVideosCount = b.videos?.length || 0;
        return bVideosCount - aVideosCount;
      });

      return [...sortedOngoingCompetitions, ...otherCompetitions];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });

  // Fetch profile picture using React Query
  const { data: profilePicture, isLoading: profileLoading } = useQuery({
    queryKey: ['profilePicture'],
    queryFn: async () => {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            const userDocRef = collection(db, 'users');
            const q = query(userDocRef, where('uid', '==', user.uid));
            const querySnapshot = await getDocs(q);
            let profilePic = defaultProfilePictureURL;
            querySnapshot.forEach((doc) => {
              const userData = doc.data();
              profilePic = userData.profilePicture || defaultProfilePictureURL;
            });
            resolve(profilePic);
          } else {
            resolve(defaultProfilePictureURL);
          }
        });
      });
    },
    staleTime: 1000 * 60 * 20, // 20 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour
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


  if (competitionsLoading || profileLoading) {
    return <CompetitionsPageSkeleton />;
  }

  if (!competitions || competitions.length === 0) {
    return <p>No competitions available at the moment.</p>;
  }

  return (
    <div className="full-house">
      <div className="competitions-page">
        <div className="top-section">
          <span className="user-dp">
            <Link to="/profile">
              <img src={profilePicture || defaultProfilePictureURL} alt="User Avatar" />
            </Link>
          </span>
          <span className="company-logo">
            <img src={iconLogo} alt="logo" />
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
            <Link to="/competitions"><i className="fa-solid fa-trophy" style={{ color: '#205e78' }}></i></Link>
          </span>
          <span className="notifications-tab" onClick={() => markAllAsRead}>
            <Link to="/notifications"><i className="fa-solid fa-bell"></i></Link>
            <span className="unread-notification-count" style={{ display: unreadNotificationCount > 0 ? 'block' : 'none' }}>
              {unreadNotificationCount > 15 ? '15+' : unreadNotificationCount}
            </span>
          </span>
          <span className="ad-tab">
            <Link to="/ads"><i className="fa-solid fa-bullhorn"></i></Link>
          </span>
        </div>
       
        <div className="competition-list">
          {competitions.map((competition) => (
            <div 
              className="competition-card" 
              key={competition.id}
              onClick={() => navigate(`/competition/${competition.id}`)}
            >
              {competition.imageUrl && (
                <img
                  src={competition.imageUrl}
                  alt={competition.name}
                  className="competition-image"
                />
              )}
              <h3 className="comp-name">{competition.name}</h3>
              <p className="status">{competition.status}</p>
              <p className="part">{competition.participations?.length || 0} participators</p>
              <p className="amt">{competition.videos?.length || 0} Videos</p>
              {competition.type && (
                <img
                  src={awardImages[competition.type] || ''}
                  alt={competition.type}
                  className="award-image"
                />
              )}
              <p className="comp-type"> {competition.type}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompetitionsPage;
