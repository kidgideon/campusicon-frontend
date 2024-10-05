import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import ReactPlayer from 'react-player';
import logo from '../../assets/logo.png';
import './discovery.css';
import Spinner from "../../assets/loadingSpinner";

const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';

const DiscoveryPage = () => {
  const [profilePicture, setProfilePicture] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [creators, setCreators] = useState({});
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false); // State for spinner
  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchProfilePicture(user.uid);
      }
    });

    return () => unsubscribe();
  }, [auth, db]);

  const fetchProfilePicture = async (uid) => {
    const userDocRef = collection(db, 'users');
    const q = query(userDocRef, where('uid', '==', uid));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      setProfilePicture(userData.profilePicture || defaultProfilePictureURL);
    });
  };


  

const handleSearch = async () => {
  setHasSearched(true);

  if (searchTerm.trim().length >= 3) { // Enforce minimum of three characters
    setLoading(true); // Start loading spinner
    const competitionQuery = query(collection(db, 'competitions'), where('name', '>=', searchTerm));
    const userQuery = query(collection(db, 'users'), where('username', '>=', searchTerm));
    const videoQuery = query(collection(db, 'videos'), where('title', '>=', searchTerm));

    const competitionSnapshot = await getDocs(competitionQuery);
    const userSnapshot = await getDocs(userQuery);
    const videoSnapshot = await getDocs(videoQuery);

    const results = [];

    // Fetch competition results
    competitionSnapshot.forEach((doc) => {
      const competitionData = doc.data();
      results.push({
        type: 'competition',
        data: competitionData
      });
    });

    // Fetch user results
    userSnapshot.forEach((doc) => {
      const userData = doc.data();
      results.push({
        type: 'user',
        data: userData
      });
    });

    // Fetch video results and creator info
    for (const doc of videoSnapshot.docs) {
      const videoData = doc.data();
      const creatorSnapshot = await getDocs(query(collection(db, 'users'), where('uid', '==', videoData.userId)));
      creatorSnapshot.forEach((creatorDoc) => {
        const creatorData = creatorDoc.data();
        setCreators((prev) => ({
          ...prev,
          [videoData.userId]: creatorData,
        }));
      });

      results.push({
        type: 'video',
        data: videoData
      });
    }

    setSearchResults(results);
    setLoading(false); // Stop loading spinner
  } else {
    setSearchResults([]);
    setHasSearched(false);
  }
};


  return (
    <div className="discovery-page-interface">
      {/* Top section */}
      <div className="top-section">
        <span className="user-dp">
          <Link to="/profile">
            <img src={profilePicture} alt="User Avatar" />
          </Link>
        </span>
        <span className="company-logo">
          <img src={logo} alt="logo" />
        </span>
        <span className="nav-bar">
          <i className="fa-solid fa-bars"></i>
        </span>
      </div>

      {/* Top navigation tabs */}
      <div className="top-tab">
        <span className="home-tab">
          <Link to="/"><i className="fa-solid fa-house"></i></Link>
        </span>
        <span className="discovery-tab">
          <Link to="/discovery"><i className="fa-solid fa-compass" style={{ color: '#205e78' }}></i></Link>
        </span>
        <span className="competition-tab">
          <Link to="/competitions"><i className="fa-solid fa-trophy"></i></Link>
        </span>
        <span className="notifications-tab">
          <Link to="/notifications"><i className="fa-solid fa-bell"></i></Link>
        </span>
        <span className="ad-tab">
          <Link to="/ads"><i className="fa-solid fa-bullhorn"></i></Link>
        </span>
      </div>

      {/* Search Interface */}
      <div className="Discovery-page-search-interface">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>
          <i className="fa-solid fa-magnifying-glass"></i>
        </button>
      </div>

      {/* Search Output Area */}
      <div className="discovery-page-output-area">
        {loading ? (
          <div className="spinner-container">
            <Spinner /> {/* Show spinner while loading */}
          </div>
        ) : searchResults.length > 0 ? (
          searchResults.map((result, index) => (
            <div key={index} className="search-result-item">
              {result.type === 'competition' && (
                <Link to={`/competition/${result.data.competitionId}`}>
                  <img src={result.data.imageUrl} alt="Competition" />
                  <p>{result.data.name}</p>
                </Link>
              )}
              {result.type === 'user' && (
                <Link to={`/profile/${result.data.username}`}>
                  <img src={result.data.profilePicture || defaultProfilePictureURL} alt="User" />
                  <p>{result.data.username}</p>
                </Link>
              )}
              {result.type === 'video' && (
                <div className="video-watch-item">
                  <div className="video-watch-top">
                    <div className="video-creator-profile">
                      <div className="video-watch-profile-picture">
                        <Link to={`/profile/${creators[result.data.userId]?.username}`}>
                          <img 
                            src={creators[result.data.userId]?.profilePicture || defaultProfilePictureURL} 
                            alt="Creator Profile" 
                          />
                        </Link>
                      </div>
                      <div className="video-watch-username">
                        <Link to={`/profile/${creators[result.data.userId]?.username}`}>
                          {creators[result.data.userId]?.username || 'Unknown User'}
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="video-watch-video-body">
                    <ReactPlayer 
                      url={result.data.videoURL} 
                      controls 
                      width="100%" 
                      height="auto" 
                    />
                  </div>

                  <div className="video-watch-video-data">
                    <p>{result.data.description}</p>
                  </div>

                  <div className="video-watch-icon-and-button">
                    {/* Add functionality for like, comment, vote, and share */}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : hasSearched && searchTerm.length >= 3 ? (
          <p>No results found</p>
        ) : null}
      </div>
    </div>
  );
};

export default DiscoveryPage;

