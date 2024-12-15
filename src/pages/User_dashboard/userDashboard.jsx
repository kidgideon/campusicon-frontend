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
import Skeleton from'./DashboardSkeleton.jsx'
import {Helmet} from "react-helmet"

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
  const topUsersQuery = query(collection(db, 'users'), orderBy('points', 'desc'), limit(4));
  const topUsersSnapshot = await getDocs(topUsersQuery);
  return topUsersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const fetchActiveCompetitions = async () => {
  // Step 1: Retrieve competitions ordered by startDate in descending order
  const activeCompetitionsQuery = query(
    collection(db, 'competitions'), 
    orderBy('startDate', 'desc')
  );
  
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

  // Step 2: Filter for competitions with status 'Ongoing'
  const ongoingCompetitions = activeCompetitionsList.filter(comp => comp.status === 'Ongoing');
  
  // Step 3: Sort ongoing competitions by participation count (highest first)
  ongoingCompetitions.sort((a, b) => (b.videos?.length || 0) - (a.videos?.length || 0));

  // Step 4: Retrieve top 3 competitions by participation count if we need more to fill 4 spots
  const additionalCompetitions = activeCompetitionsList
    .filter(comp => comp.status !== 'Ongoing')  // Only look at non-ongoing competitions
    .sort((a, b) => (b.videos?.length || 0) - (a.videos?.length || 0))
    .slice(0, 3);  // Get top 3 by participation count

  // Step 5: Combine the lists, prioritizing ongoing competitions
  const finalCompetitionsList = [...ongoingCompetitions, ...additionalCompetitions].slice(0, 3);

  return finalCompetitionsList;
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

  if (loading) return <Skeleton/>; // Use the custom spinner component for loading
  if (error) return <p>Error: {error.message}</p>; // Display error messages
  if (!userData) return <p>No user data available</p>;

  return (
    <div className="full-house">
      <div className="layout-dashboard">
        <TopSection userData={userData} />
        <TopTab />
        <TopAccounts topUsers={topUsers} />
        <ActiveCompetitions activeCompetitions={activeCompetitions} />
        <Feeds feeds={feeds} userData={userData} /> 
      </div>
    </div>
  );
};

export default UserDashboard;
