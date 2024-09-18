import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase_config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Spinner from '../../assets/loadingSpinner';
import { Link } from 'react-router-dom';
import './competionsPage.css';
import superCup from '../../assets/superCup.png';
import normalStarCup from '../../assets/starCup.png';
import iconAwardCup from '../../assets/iconCup.png';
import iconLogo from '../../assets/logo.png'
// Mapping award types to image paths
const awardImages = {
  'Normal Star Award': normalStarCup,
  'Super Star Award': superCup,
  'Icon Award': iconAwardCup,
};

const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';

const CompetitionsPage = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const auth = getAuth();
    
    const fetchCompetitions = async () => {
      setLoading(true);
      try {
        // Query to fetch all competitions
        const q = collection(db, 'competitions');
        const querySnapshot = await getDocs(q);

        // Map the documents to an array of competition objects
        const competitionsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Separate ongoing competitions and others
        const ongoingCompetitions = competitionsList.filter(c => c.status === 'ongoing');
        const otherCompetitions = competitionsList.filter(c => c.status !== 'ongoing');

        // Sort ongoing competitions by the number of videos in descending order
        const sortedOngoingCompetitions = ongoingCompetitions.sort((a, b) => {
          const aVideosCount = a.videos?.length || 0;
          const bVideosCount = b.videos?.length || 0;
          return bVideosCount - aVideosCount;
        });

        // Combine sorted ongoing competitions with other competitions
        const sortedCompetitions = [
          ...sortedOngoingCompetitions,
          ...otherCompetitions
        ];

        setCompetitions(sortedCompetitions);
      } catch (error) {
        console.error('Error fetching competitions:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserData = async (user) => {
      try {
        if (user) {
          // Fetch user data
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            setError('No such user!');
          }
        } else {
          setError('User not authenticated!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Error fetching user data');
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchUserData(user);
      } else {
        setError('User not authenticated!');
      }
      await fetchCompetitions();
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Spinner />; // Use your spinner here
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (competitions.length === 0) {
    return <p>No competitions available at the moment.</p>;
  }

  return (
    <div className="competitions-page">
      <div className="top-section">
        <span className="user-dp">
          {/* Display user profile picture if available, otherwise default */}
          {userData && (
            <Link to="/profile">
              <img src={userData.profilePicture || defaultProfilePictureURL} alt="User Avatar" />
            </Link>
          )}
        </span>
        <span className="company-logo">
          <img src={iconLogo} alt="logo" />
        </span>
        <span className="nav-bar">
          <i className="fa-solid fa-bars"></i>
        </span>
      </div>
      <div className="top-tab">
        <span className="home-tab"><i className="fa-solid fa-house"></i> </span>
        <span className="discovery-tab"><i className="fa-solid fa-compass"></i> </span>
        <span className="competition-tab"><i className="fa-solid fa-trophy"></i></span>
        <span className="notifications-tab"><i className="fa-solid fa-bell"></i></span>
        <span className="ad-tab"><i className="fa-solid fa-bullhorn"></i> </span>
      </div>
      <div className="direction-text">
        <h1>All Competitions</h1>
      </div>
      <div className="competition-list">
        {competitions.map((competition) => (
          <Link to={`/competition/${competition.id}`} key={competition.id} className="competition-card-link">
            <div className="competition-card">
              {competition.imageUrl && (
                <img
                  src={competition.imageUrl}
                  alt={competition.name}
                  className="competition-image"
                />
              )}
              <h3>{competition.name}</h3>
              <p>{competition.status}</p>
              <p>{competition.participations?.length || 0} participators</p>
              <p>{competition.videos?.length || 0} Videos</p>
              {competition.type && (
                <img
                  src={awardImages[competition.type] || ''}
                  alt={competition.type}
                  className="award-image"
                />
              )}
              {competition.type}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CompetitionsPage;
