import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase_config';
import '../userProfile/profile.css';
import normalStarAwards from '../../assets/starCup.png';
import superCupAwards from '../../assets/superCup.png';
import iconAwards from '../../assets/iconCup.png';
import LoadingScreen from '../../assets/loadingSpinner'; // Custom spinner component

const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';

const CurrentUserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [awardCounts, setAwardCounts] = useState({ normal: 0, super: 0, icon: 0 });
  const navigate = useNavigate();

  
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true); // Ensure loading state is set
      try {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
          if (currentUser) {
            const q = query(collection(db, 'users'), where('email', '==', currentUser.email));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
              const userDoc = querySnapshot.docs[0];
              const userData = userDoc.data();
              const userDocId = userDoc.id;

              // Initialize missing fields if necessary
              const updates = {};
              if (!userData.win) {
                updates.win = [];
              }
              if (!userData.hobbies) {
                updates.hobbies = [];
              }
              if (!userData.campus) {
                updates.campus = "No campus added yet.";
              }

              // Update the Firestore document with missing fields
              if (Object.keys(updates).length > 0) {
                await updateDoc(doc(db, 'users', userDocId), updates);
                Object.assign(userData, updates);
              }

              
  const goBack = () => {
    navigate(-1)
  }


              // Calculate award counts
              const counts = { normal: 0, super: 0, icon: 0 };
              userData.win.forEach((win) => {
                if (win.awardType === 'Normal Star Award') counts.normal += 1;
                else if (win.awardType === 'Super Star Award') counts.super += 1;
                else if (win.awardType === 'Icon Award') counts.icon += 1;
              });

              setAwardCounts(counts);
              setUser(userData);
            } else {
              console.log('No user found');
            }
          } else {
            console.log('No user logged in');
          }
          setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching user:', error);
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <LoadingScreen />; // Use the custom spinner during loading
  }

  if (!user) {
    return <div>No user logged in</div>;
  }
  const goBack = () => {
    navigate(-1)
  }
  // Function to calculate campus status based on points
  function calculateCampusStatus(points) {
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

    for (const tier of campusStatusTiers) {
      if (points >= tier.minPoints && points <= tier.maxPoints) {
        return tier.status;
      }
    }
    return 'Invalid Points';
  }

  const campusStatus = calculateCampusStatus(user.points);

  const handleEditProfile = () => {
    navigate('/edit profile'); // Adjust the route as per your setup
  };

  return (
    <div className='profile-structure'>
    <i className="fas fa-arrow-left back-icon" onClick={goBack}></i>
      <div className="profile-top">
        <div className="profile-pic-name">
          <div className="profile-pic">
            {/* Check for profile picture, else use default */}
            <img src={user.profilePicture || defaultProfilePictureURL} alt={`${user.firstName}'s profile`} />
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

      <button onClick={handleEditProfile} className="edit-profile-btn">
        Edit Profile
      </button>
      <div className="trophies">
        <div className="normal-star-award">
          <img className='award-img-profle' src={normalStarAwards} alt="Normal Star Award" />
        </div>
        <div  className='super-star-award'>
          <img className='award-img-profle' src={superCupAwards} alt="Super Star Award" />
        </div>
        <div className='icon-award'>
          <img className='award-img-profle' src={iconAwards} alt="Icon Award" />
        </div>
      </div>
      <div className="trophy-count">
        <p className='normal-star-count'>{awardCounts.normal}</p>
        <p className='super-star-count'>{awardCounts.super}</p>
        <p className='icon-awards-count'>{awardCounts.icon}</p>
      </div>
      <div className="user-campus-hobbies">
        <div className="user-campus">
          <strong>Campus: </strong>{user.campus}
        </div>
        <div className="user-hobbies">
          <strong>Hobbies: </strong>{user.hobbies.length > 0 ? user.hobbies.join(', ') : "No hobbies added yet."}
        </div>
      </div>
    </div>
  );
};

export default CurrentUserProfile;
