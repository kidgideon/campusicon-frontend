import React from 'react';
import TopSection from './components/topSection';
import TopTab from './components/topTab';
import TopAccounts from './components/topaccount';
import ActiveCompetitions from './components/activeCompetions';
import Feeds from './components/feed';
import useFetchData from './hooks/userFetch';
import './UserDashboard.css';
import LoadingSpinner from '../../assets/loadingSpinner'; // Import the spinner

const UserDashboard = () => {
  const { userData, topUsers, activeCompetitions, feeds, loading, error } = useFetchData();

  if (loading) return <LoadingSpinner />; // Use the custom spinner component for loading
  if (error) return <p>Error: {error}</p>;
  if (!userData) return <p>No user data available</p>;

  return (
    <div className="layout">
      <TopSection userData={userData} />
      <TopTab />
      <TopAccounts topUsers={topUsers} />
      <ActiveCompetitions activeCompetitions={activeCompetitions} />
      <Feeds feeds={feeds} />
    </div>
  );
};

export default UserDashboard;
