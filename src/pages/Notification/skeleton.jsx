import React from 'react';

const NotificationPageSkeleton = () => {
  return (
    <div className="notification-page-interface">
      <style>
        {`
          /* Skeleton base styling */
          .skeleton {
            background-color: #f0f0f0;
            border-radius: 4px;
            margin: 5px 0;
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

          /* Specific skeleton sizes */
          .skeleton-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
          }

          .skeleton-logo,
          .skeleton-icon {
            width: 40px;
            height: 40px;
          }

          .skeleton-tab-icon {
            width: 30px;
            height: 30px;
          }

          .skeleton-title {
            width: 150px;
            height: 20px;
            margin: 10px 0;
          }

          .notification-card-skeleton {
            display: flex;
            align-items: center;
            margin-top: 15px;
          }

          .skeleton-icon-text-container {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .skeleton-notification-icon {
            width: 30px;
            height: 30px;
            border-radius: 50%;
          }

          .skeleton-notification-text {
            width: 200px;
            height: 15px;
          }

          .skeleton-badge {
            width: 40px;
            height: 20px;
            margin-left: auto;
            border-radius: 10px;
          }
        `}
      </style>

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

      {/* Notification Title Skeleton */}
      <h1 className="skeleton skeleton-title"></h1>

      {/* Notification Card Skeletons */}
      {[...Array(5)].map((_, index) => (
        <div key={index} className="notification-card-skeleton">
          <div className="skeleton skeleton-icon-text-container">
            <span className="skeleton skeleton-notification-icon"></span>
            <p className="skeleton skeleton-notification-text"></p>
          </div>
          <span className="skeleton skeleton-badge"></span>
        </div>
      ))}
    </div>
  );
};

export default NotificationPageSkeleton;
