import React from 'react';

const CompetitionsPageSkeleton = () => {
  return (
    <div className="full-house">
      <style>
        {`
          .skeleton {
            background-color: #f0f0f0;
            border-radius: 4px;
            animation: pulse 1.5s ease-in-out infinite;
          }

          @keyframes pulse {
            0% {
              opacity: 1;
            }
            50% {
              opacity: 0.4;
            }
            100% {
              opacity: 1;
            }
          }

          /* Skeleton dimensions */
          .skeleton-avatar, .skeleton-logo, .skeleton-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
          }

          .skeleton-tab-icon {
            width: 30px;
            height: 30px;
            margin: 0 8px;
          }

          .skeleton-competition-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 16px;
            margin: 10px 0;
            width: 90%;
            border-radius: 8px;
          }

          .skeleton-competition-image {
            width: 100%;
            height: 150px;
            border-radius: 8px;
            margin-bottom: 10px;
          }

          .skeleton-text {
            width: 60%;
            height: 15px;
            margin: 5px 0;
          }

          .skeleton-small-text {
            width: 40%;
            height: 12px;
            margin: 5px 0;
          }
        `}
      </style>

      <div className="competitions-page">
        {/* Top Section Skeleton */}
        <div className="top-section">
          <span className="skeleton skeleton-avatar"></span>
          <span className="skeleton skeleton-logo"></span>
          <span className="skeleton skeleton-icon"></span>
        </div>

        {/* Top Tab Skeleton */}
        <div className="top-tab">
          <span className="skeleton skeleton-tab-icon"></span>
          <span className="skeleton skeleton-tab-icon"></span>
          <span className="skeleton skeleton-tab-icon"></span>
          <span className="skeleton skeleton-tab-icon"></span>
          <span className="skeleton skeleton-tab-icon"></span>
        </div>

        {/* Competition List Skeleton */}
        <div className="competition-list">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="skeleton skeleton-competition-card">
              <div className="skeleton skeleton-competition-image"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-small-text"></div>
              <div className="skeleton skeleton-small-text"></div>
              <div className="skeleton skeleton-small-text"></div>
              <div className="skeleton skeleton-small-text"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompetitionsPageSkeleton;
