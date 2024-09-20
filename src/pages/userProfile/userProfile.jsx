import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase_config';
import '../userProfile/profile.css';
import normalStarAwards from '../../assets/starCup.png';
import superCupAwards from '../../assets/superCup.png';
import iconAwards from '../../assets/iconCup.png';

const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';

const UserProfile = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [awardCounts, setAwardCounts] = useState({ normal: 0, super: 0, icon: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user data from Firestore based on the username
    const fetchUser = async () => {
      try {
        const q = query(collection(db, 'users'), where('username', '==', username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          const userEmail = userData.email; // Get the email of the user being viewed

          // Get the current user from Firebase authentication
          const currentUser = auth.currentUser;

          if (currentUser && currentUser.email === userEmail) {
            // If the current logged-in user is viewing their own profile, redirect to '/profile'
            navigate('/profile',  { replace: true });
            return;
          }

          const userDocId = querySnapshot.docs[0].id;

          // Check if the 'win' field exists
          if (!userData.win) {
            userData.win = []; // Initialize the win field locally as well
          }

          // Calculate the count of each award type
          const counts = { normal: 0, super: 0, icon: 0 };
          userData.win.forEach((win) => {
            if (win.awardType === 'Normal Star Award') {
              counts.normal += 1;
            } else if (win.awardType === 'Super Star Award') {
              counts.super += 1;
            } else if (win.awardType === 'Icon Award') {
              counts.icon += 1;
            }
          });

          setAwardCounts(counts);
          setUser(userData);
        } else {
          console.log('No user found');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [username, navigate]);

  if (loading) {
    return <div>Loading...</div>; // Replace with your custom spinner
  }

  if (!user) {
    return <div>User not found</div>;

  }

  const goBack = () => {
    navigate(-1)
  }

  // Define the campus status tiers
  const campusStatusTiers = [
    { status: 'Lad', minPoints: 0, maxPoints: 499 },
    { status: 'Rising Star', minPoints: 500, maxPoints: 1499 },
    { status: 'Pace Setter', minPoints: 1500, maxPoints: 2499 },
    { status: 'Influencer', minPoints: 2500, maxPoints: 3499 },
    { status: 'Social Maven', minPoints: 3500, maxPoints: 4499 },
    { status: 'Iconic Figure', minPoints: 4500, maxPoints: 5499 },
    { status: 'Trailblazer', minPoints: 5500, maxPoints: 6499 },
    { status: 'Legend', minPoints: 6500, maxPoints: 7499 },
    { status: 'Campus Legend', minPoints: 7500, maxPoints: 8499 },
    { status: 'Campus Icon', minPoints: 8500, maxPoints: 10000 },
  ];

  // Function to calculate campus status based on points
  function calculateCampusStatus(points) {
    for (const tier of campusStatusTiers) {
      if (points >= tier.minPoints && points <= tier.maxPoints) {
        return tier.status;
      }
    }
    return 'Invalid Points'; // If points are out of the expected range
  }

  const campusStatus = calculateCampusStatus(user.points);

  return (
    <div className='profile-structure'>
      
      <div className="profile-top">
        <div className="profile-pic-name">
          <div className="profile-pic">
            {/* Check if user profile picture exists, otherwise use the default */}
            <img 
              src={user.profilePicture ? user.profilePicture : defaultProfilePictureURL} 
              alt={`${user.firstName}'s profile`} 
            />
          </div>
          <div className="fullname">
            <p>{user.firstName} {user.lastName}</p>
          </div>
        </div>
        <div className="points-status">
          <div className="campus-points">
            <p className='points'>{user.points}</p>
            <p className='p-text'>campus points</p>
          </div>
          <div className="campus-status">
            <p>{campusStatus}</p>
          </div>
        </div>
      </div>
      <div className="user-bio">
        <p>{user.bio}</p>
      </div>
      <div className="trophies">
        <div className="normal-star-award">
          <img src={normalStarAwards} alt="Normal Star Award" />
        </div>
        <div className='super-star-award'>
          <img src={superCupAwards} alt="Super Star Award" />
        </div>
        <div className='icon-award'>
          <img src={iconAwards} alt="Icon Award" />
        </div>
      </div>
      <div className="trophy-count">
        <p className='normal-star-count'>{awardCounts.normal}</p>
        <p className='super-star-count'>{awardCounts.super}</p>
        <p className='icon-awards-count'>{awardCounts.icon}</p>
      </div>
    </div>
  );
};

export default UserProfile;
