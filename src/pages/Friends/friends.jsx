import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // To use navigate
import { db, auth } from '../../../config/firebase_config';
import { onAuthStateChanged } from 'firebase/auth'; // Import onAuthStateChanged
import { useQuery } from '@tanstack/react-query'; // Import React Query
import Spinner from "../../assets/loadingSpinner";
import "./frends.css";

const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';

const fetchFriends = async (currentUser) => {
  const userDocRef = doc(db, 'users', currentUser.uid);
  const userDoc = await getDoc(userDocRef);
  
  if (!userDoc.exists()) throw new Error('User does not exist');

  const userData = userDoc.data();
  const friendsDetailsPromises = userData.friends.map(async (friend) => {
    const friendId = friend.userId;
    const friendDocRef = doc(db, 'users', friendId);
    const friendDoc = await getDoc(friendDocRef);

    if (friendDoc.exists()) {
      const friendData = friendDoc.data();
      return {
        username: friendData.username,
        profilePicture: friendData.profilePicture || defaultProfilePictureURL,
        points: friendData.points || 0,
      };
    }
    return null;
  });

  const friendsDetails = await Promise.all(friendsDetailsPromises);
  return friendsDetails.filter(friend => friend !== null); // Filter out null values
};

const Friends = () => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const navigate = useNavigate();

  // Use React Query to fetch friends
  const { data: friendsData = [], error, isLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No user is logged in');
      return fetchFriends(currentUser);
    },
    enabled: !!auth.currentUser, // Only run if there's a logged-in user
    staleTime: 1200 * 1000, // Set stale time to 20 minutes (1200 seconds)
    cacheTime: 60 * 60 * 1000, // 1 hour
  });

  // Handle scroll events to show/hide the scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle going back
  const handleBackClick = () => {
    navigate(-1); // Navigate to the previous page
  };

  // Handle clicking on a friend's profile
  const goToProfile = (username) => {
    navigate(`/profile/${username}`);
  };

  if (isLoading) {
    return <Spinner />; // Display the spinner during loading
  }

  if (error) {
    return <p>Error fetching friends: {error.message}</p>; // Display error message
  }

  return (
    <div className="friends-container">
      <div className="top-top-sideliners">
        <i className="fas fa-arrow-left" onClick={handleBackClick}></i>
        <h2>Friends</h2>
      </div>

      {friendsData.length > 0 ? (
        friendsData.map((friend, index) => (
          <div
            className="friend-card"
            key={index}
            onClick={() => goToProfile(friend.username)} // Navigate to profile on click
          >
            <img
              src={friend.profilePicture}
              alt={`${friend.username}'s profile`}
              className="friend-profile-picture"
            />
            <div className="friend-info">
              <h3 className="friend-username">{friend.username}</h3>
              <p className="friend-campus-streak">Campus Streak: {friend.points}</p>
            </div>
          </div>
        ))
      ) : (
        <p>No friends found.</p>
      )}

      {/* Floating scroll-to-top button */}
      {showScrollButton && (
        <i className="fa-solid fa-caret-down scroll-to-top" onClick={scrollToTop}></i>
      )}
    </div>
  );
};

export default Friends;
