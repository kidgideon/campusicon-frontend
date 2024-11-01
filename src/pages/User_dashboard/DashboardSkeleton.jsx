import React from 'react';
import './dashboardSkeleton.css'; // Import the skeleton styles

const SkeletonLoader = () => {
  return (
    <div className="skeleton-layout">
      <div className="skeleton-top-section">
        <div className="skeleton-user-dp"></div>
        <div className="skeleton-company-logo"></div>
        <div className="skeleton-nav-bar">
          <div className="skeleton-nav-icon"></div>
          <div className="skeleton-nav-icon"></div>
          <div className="skeleton-nav-icon"></div>
        </div>
      </div>
      <div className="skeleton-top-tab">
        <div className="skeleton-tab-icon"></div>
        <div className="skeleton-tab-icon"></div>
        <div className="skeleton-tab-icon"></div>
        <div className="skeleton-tab-icon"></div>
      </div>
      <div className="skeleton-accounts">
        <div className="skeleton-user-card"></div>
        <div className="skeleton-user-card"></div>
        <div className="skeleton-user-card"></div>
      </div>
      <div className="skeleton-competitions">
        <div className="skeleton-competition-card"></div>
        <div className="skeleton-competition-card"></div>
        <div className="skeleton-competition-card"></div>
      </div>
      <div className="skeleton-feed">
        <div className="skeleton-feed-top"></div>
        <div className="skeleton-feed-content"></div>
        <div className="skeleton-feed-interactions"></div>
      </div>
    </div>
  );
};

export default SkeletonLoader;