import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../config/firebase_config.js';
import TopSection from './components/topSection';
import TopTab from './components/topTab';
import TopAccounts from './components/topaccount';
import ActiveCompetitions from './components/activeCompetions';
import Feeds from './components/feed.jsx';
import './userDashboard.css';
import LoadingSpinner from '../../assets/loadingSpinner'; // Import the spinner

// Fetch user data function
const fetchUserData = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    throw new Error('No user is signed in!');
  }

  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    throw new Error('No such user!');
  }

  return userDoc.data();
};

// Fetch top users function
const fetchTopUsers = async () => {
  const topUsersQuery = query(collection(db, 'users'), orderBy('points', 'desc'), limit(10));
  const topUsersSnapshot = await getDocs(topUsersQuery);
  return topUsersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Fetch active competitions function
const fetchActiveCompetitions = async () => {
  const activeCompetitionsQuery = query(collection(db, 'competitions'), orderBy('startDate', 'desc'));
  const activeCompetitionsSnapshot = await getDocs(activeCompetitionsQuery);
  const activeCompetitionsList = activeCompetitionsSnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      startDate: data.startDate ? data.startDate.toDate() : null,
      endDate: data.endDate ? data.endDate.toDate() : null,
    };
  });

  const now = new Date();
  return activeCompetitionsList.filter(comp => {
    if (comp.status === 'Ongoing') return true;
    if (comp.status === 'Not Started' && comp.startDate > now) return true;
    return false;
  }).sort((a, b) => {
    if (a.status === 'Ongoing' && b.status !== 'Ongoing') return -1;
    if (a.status !== 'Ongoing' && b.status === 'Ongoing') return 1;
    return a.startDate - b.startDate; // Sort by startDate within each status group
  });
};

// Fetch feeds function
const fetchFeeds = async () => {
  const feedsQuery = query(collection(db, 'feeds'), orderBy('createdAt', 'desc'));
  const feedsSnapshot = await getDocs(feedsQuery);
  return feedsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const UserDashboard = () => {
  const { data: userData, error: userError, isLoading: userLoading } = useQuery({
    queryKey: ['userData'],
    queryFn: fetchUserData,
    staleTime: 20 * 60 * 1000, // 20 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  });

  const { data: topUsers, error: topUsersError, isLoading: topUsersLoading } = useQuery({
    queryKey: ['topUsers'],
    queryFn: fetchTopUsers,
    staleTime: 20 * 60 * 1000, // 20 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  });

  const { data: activeCompetitions, error: activeCompetitionsError, isLoading: activeCompetitionsLoading } = useQuery({
    queryKey: ['activeCompetitions'],
    queryFn: fetchActiveCompetitions,
    staleTime: 20 * 60 * 1000, // 20 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  });

  const { data: feeds, error: feedsError, isLoading: feedsLoading } = useQuery({
    queryKey: ['feeds'],
    queryFn: fetchFeeds,
    staleTime: 20 * 60 * 1000, // 20 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  });

  // Combine loading states and errors
  const loading = userLoading || topUsersLoading || activeCompetitionsLoading || feedsLoading;
  const error = userError || topUsersError || activeCompetitionsError || feedsError;

  if (loading) return <LoadingSpinner />; // Use the custom spinner component for loading
  if (error) return <p>Error: {error.message}</p>; // Display error messages
  if (!userData) return <p>No user data available</p>;

  return (
    <div className="full-house">
      <div className="layout-dashboard">
        <TopSection userData={userData} />
        <TopTab />
        <TopAccounts topUsers={topUsers} />
        <ActiveCompetitions activeCompetitions={activeCompetitions} />
        <Feeds feeds={feeds} /> {/* Pass feeds as a prop */}
      </div>
    </div>
  );
};

export default UserDashboard;
