import React, { useEffect, useState } from 'react';
import { collection, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom'; // To use navigate
import { db, auth } from '../../../config/firebase_config';
import { onAuthStateChanged } from 'firebase/auth'; // Import onAuthStateChanged
import Spinner from "../../assets/loadingSpinner";
import "./frends.css";

const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';

const Friends = () => {
  const [friendsData, setFriendsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriends = async (currentUser) => {
      try {
        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();

            if (userData.friends && userData.friends.length > 0) {
              const friendsDetailsPromises = userData.friends.map(async (friend) => {
                const friendId = friend.userId;
                const friendDocRef = doc(db, 'users', friendId);
                const friendDoc = await getDoc(friendDocRef);

                if (friendDoc.exists()) {
                  const friendData = friendDoc.data();
                  return {
                    username: friendData.username,
                    profilePicture: friendData.profilePicture || defaultProfilePictureURL,
                    points: friendData.points || 0
                  };
                }
                return null;
              });

              const friendsDetails = await Promise.all(friendsDetailsPromises);
              setFriendsData(friendsDetails.filter(friend => friend !== null));
            }
          }
        }
      } catch (error) {
        console.error("Error fetching friends data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchFriends(user); // Fetch friends when user is authenticated
      } else {
        setLoading(false); // No user, stop loading
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

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

  if (loading) {
    return <Spinner />; // Display the spinner during loading
  }

  return (
    <div className="friends-container">
      <i className="fas fa-arrow-left back-icon" onClick={handleBackClick}></i> 

      <h1>Friends</h1>
      
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
       <i className="fa-solid fa-caret-down scroll-to-top" onClick={scrollToTop} ></i>
      )}
    </div>
  );
};

export default Friends;
