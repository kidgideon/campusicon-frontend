import React from 'react';
import emptyProfileImage from '../../../assets/empty-profile-image.webp';
import { Link } from 'react-router-dom';

const TopAccounts = ({ topUsers }) => {
  return (
    <div className="top-accounts">
    <ul className="user-list">
      {topUsers.map(user => (
        <li className="user-card" key={user.id}>
          <Link to={`/profile/${user.username}`}>
          <div>
          <img
              src={user.profilePicture || emptyProfileImage}
              alt={user.username}
            />
          </div>
          
          <div>{user.username.length > 4 ? `${user.username.slice(0, 4)}...` : user.username}</div>
          </Link>
        </li>
      ))}
    </ul>
  </div>
  
  );
};

export default TopAccounts;