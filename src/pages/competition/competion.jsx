import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase_config';
import './competition.css';
import Spinner from '../../assets/loadingSpinner'; // Import the spinner component


const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';


const Competition = () => {
  const { competitionId } = useParams();
  const navigate = useNavigate();
  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topCompetitors, setTopCompetitors] = useState([]);

  useEffect(() => {
    const fetchCompetitionData = async () => {
      try {
        // Fetch competition details
        const competitionRef = doc(db, 'competitions', competitionId);
        const competitionSnap = await getDoc(competitionRef);

        if (competitionSnap.exists()) {
          const competitionData = competitionSnap.data();
          setCompetition(competitionData);
          
          // Fetch all videos for the competition
          const videosQuery = query(
            collection(db, 'videos'),
            where('competitionId', '==', competitionId)
          );

          const videoSnapshot = await getDocs(videosQuery);
          const allVideos = videoSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          if (allVideos.length > 0) {
            // Sort by votes array length
            const topThreeVideos = allVideos
              .sort((a, b) => b.votes.length - a.votes.length) // Sorting by the number of votes
              .slice(0, 3); // Take the top 3
            
  

            // Fetch the user information for each top competitor
            const competitors = await Promise.all(
              topThreeVideos.map(async (video) => {
                const userDoc = await getDoc(doc(db, 'users', video.userId));
                if (userDoc.exists()) {
                  const userData = userDoc.data();
     
                  return {
                    name: userData.username,
                    profilePicture: userData.profilePicture || defaultProfilePictureURL,
                    votes: video.votes.length,
                  };
                }
                return null;
              })
            );

            setTopCompetitors(competitors.filter(Boolean)); // Filter out null values
          }
        } else {
          setError('Competition not found.');
        }
      } catch (err) {
        setError('Error fetching competition data.');
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitionData();
  }, [competitionId]);

  const goBack = () => {
    navigate('/competitions');
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <Spinner /> {/* Render the spinner component here */}
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  const { name, imageUrl, description, startDate, endDate } = competition;

  return (
    <div className="competition-interface">
      <div className="competion-interface-top">
        <i className="fas fa-arrow-left back-icon" onClick={goBack}></i>
      </div>

      <h1>{name}</h1>

      <div className="competion-interface-competion-image">
        <img src={imageUrl} alt="Competition" />
      </div>

      <div className="competion-description">
        <div className="description">
          <p className="description-text">{description}</p>
        </div>
        <h4 className="tc">Top Competitors</h4>
        <div className="top-3-competitors">
          {topCompetitors.length > 0 ? (
            topCompetitors.map((competitor, index) => (
              <div key={index} className="competitor-in-competion" onClick={() => navigate(`/profile/${competitor.name}`)}>
                <div className="competitors-profile-picture-in-comp">
                  <img src={competitor.profilePicture} alt="Profile" />
                </div>
                <div className="competitors-name">{competitor.name}</div>
                <div className="competitors-votes-amount">{competitor.votes} votes</div>
              </div>
            ))
          ) : (
            <p>No competitors yet.</p>
          )}
        </div>
      </div>

      <div className="date">
        <div className="start-date">Start: {new Date(startDate.toDate()).toLocaleDateString()}</div>
        <div className="end-date">End: {new Date(endDate.toDate()).toLocaleDateString()}</div>
      </div>

    

      <div className="watch-button" onClick={() => navigate(`/watch-video/${competitionId}`)}>
        <i className="fa-solid fa-play"></i>
        <p>Watch videos and vote now!</p>
      </div>

    
<div className="competion-interface-footer">
        <div onClick={() => navigate(`/competition/${competitionId}`)}>
          <i className="fa-solid fa-trophy"></i>
        </div>
        <div onClick={() => navigate(`/watch-video/${competitionId}`)}>
        <i className="fa-solid fa-play"></i>
        </div>
        <div className="top-users-icon" onClick={() => navigate(`/ranks/${competitionId}`)}>
          <i className="fa-solid fa-sort"></i>
        </div>
        <div className="add-icon" onClick={() => navigate(`/upload/${competitionId}`)}>
          <i className="fa-solid fa-plus"></i>
        </div>
        <div className="to-see-video-performance" onClick={() => navigate(`/video-performance/${competitionId}`)}>
          <i className="fa-solid fa-square-poll-vertical"></i>
        </div>
      </div>
    </div>
  );
};

export default Competition;
