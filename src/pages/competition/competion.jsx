import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase_config';
import './competition.css';
import Spinner from '../../assets/loadingSpinner'; // Import the spinner component
import normalAward from '../../assets/starCup.png';
import superCup from '../../assets/superCup.png';
import iconAwards from '../../assets/iconCup.png';


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
    navigate(-1);
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

  const { name, imageUrl, description, startDate, endDate , type } = competition;

  return (

    <div className="full-house">
  <div className="competition-interface">
      <div className="top-top-sideliners">
        <i className="fas fa-arrow-left " onClick={goBack}></i>
        <h2>{name}</h2>
      </div>

     

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

      <div className="competion-award-details-render">
  <div>
    <img
      src={
        type === 'Icon Award'
          ? iconAwards
          : type === 'Normal Star Award'
          ? normalAward
          : type === 'Super Star Award'
          ? superCup
          : normalAward
      }
      alt={type}
    />
    
    <div className="win-worth">
      <p>
        {type === 'Icon Award'
          ? 'This is an Icon Award worth 100 Campus Streaks.'
          : type === 'Normal Star Award'
          ? 'This is a Normal Star Award worth 20 Campus Streaks.'
          : type === 'Super Star Award'
          ? 'This is a Super Cup Award worth 50 Campus Streaks.'
          : 'This is a Normal Star Award worth 20 Campus Streaks.'} {/* Default message */}
      </p>
    </div>
  </div>
</div>

    
<div className="competion-interface-footer">
        <div onClick={() => navigate(`/competition/${competitionId}`)}>
          <i className="fa-solid fa-trophy interface-icon" style={{color : '#205e78'}}></i>
        </div>
        <div onClick={() => navigate(`/watch-video/${competitionId}`)}>
        <i className="fa-solid fa-play interface-icon"></i>
        </div>
        <div className="top-users-icon" onClick={() => navigate(`/ranks/${competitionId}`)}>
          <i className="fa-solid fa-sort interface-icon"></i>
        </div>
        <div className="add-icon" onClick={() => navigate(`/upload/${competitionId}`)}>
          <i className="fa-solid fa-plus interface-icon"></i>
        </div>
        <div className="to-see-video-performance interface-icon" onClick={() => navigate(`/video-performance/${competitionId}`)}>
          <i className="fa-solid fa-square-poll-vertical interface-icon"></i>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Competition;
