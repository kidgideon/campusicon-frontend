import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase_config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Spinner from '../../assets/loadingSpinner';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import './competionsPage.css';
import superCup from '../../assets/superCup.png';
import normalStarCup from '../../assets/starCup.png';
import iconAwardCup from '../../assets/iconCup.png';
import iconLogo from '../../assets/logo.png';

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
  
  const navigate = useNavigate(); // Initialize useNavigate

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
          {/* Wrap the profile picture with a Link to the user's profile */}
          <Link to="/profile"> 
            <img src={userData?.profilePicture || defaultProfilePictureURL} alt="User Avatar" />
          </Link>
        </span>
        <span className="company-logo">
          <img src={iconLogo} alt="logo" />
        </span>
        <span className="nav-bar">
          {/* Corrected Link to menu page */}
          <Link to="/menu"><i className="fa-solid fa-bars"></i></Link>
        </span>
      </div>
      <div className="top-tab">
        <span className="home-tab">
          <Link to="/"><i className="fa-solid fa-house"></i></Link>
        </span>
        <span className="discovery-tab">
          <Link to="/discovery-page"><i className="fa-solid fa-compass"></i></Link>
        </span>
        <span className="competition-tab">
          <Link to="/competitions"><i className="fa-solid fa-trophy"></i></Link>
        </span>
        <span className="notifications-tab">
          {/* Add the path to your notifications page if needed */}
          <Link to="/notifications"><i className="fa-solid fa-bell"></i></Link>
        </span>
        <span className="ad-tab">
          {/* Add the path to your advertisements or marketing page if needed */}
          <Link to="/ads"><i className="fa-solid fa-bullhorn"></i></Link>
        </span>
      </div>
      <div className="direction-text">
        <h1>All Competitions</h1>
      </div>
      <div className="competition-list">
        {competitions.map((competition) => (
          <div 
            className="competition-card" 
            key={competition.id}
            onClick={() => navigate(`/competition/${competition.id}`)} // Navigate to competition route
          >
            {competition.imageUrl && (
              <img
                src={competition.imageUrl}
                alt={competition.name}
                className="competition-image"
              />
            )}
            <h3 className='comp-name'>{competition.name}</h3>
            <p className='status'>{competition.status}</p>
            <p className='part'>{competition.participations?.length || 0} participators</p>
            <p className='amt'>{competition.videos?.length || 0} Videos</p>
            {competition.type && (
              <img
                src={awardImages[competition.type] || ''}
                alt={competition.type}
                className="award-image"
              />
            )}
            <p className='comp-type'> {competition.type}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompetitionsPage;
