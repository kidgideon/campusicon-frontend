import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'; // Import useQuery
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase_config';
import './competition.css';
import Spinner from '../../assets/loadingSpinner'; // Import the spinner component
import normalAward from '../../assets/starCup.png';
import superCup from '../../assets/superCup.png';
import iconAwards from '../../assets/iconCup.png';

const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';

const fetchCompetitionData = async (competitionId) => {
  // Fetch competition details
  const competitionRef = doc(db, 'competitions', competitionId);
  const competitionSnap = await getDoc(competitionRef);
  
  if (!competitionSnap.exists()) {
    throw new Error('Competition not found.');
  }

  const competitionData = competitionSnap.data();

  // Fetch winner or top competitors based on the competition status
  if (competitionData.status === 'Ended') {
    // Competition ended, fetch winner's details
    if (competitionData.winner) {
      const winnerRef = doc(db, 'users', competitionData.winner);
      const winnerSnap = await getDoc(winnerRef);
      if (winnerSnap.exists()) {
        competitionData.winnerDetails = winnerSnap.data();
      }
    }
  } else {
    // Competition ongoing, fetch top competitors
    const videosQuery = query(
      collection(db, 'videos'),
      where('competitionId', '==', competitionId)
    );
    const videoSnapshot = await getDocs(videosQuery);
    const allVideos = videoSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

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

    competitionData.topCompetitors = competitors.filter(Boolean); // Filter out null values
  }

  return competitionData;
};

const Competition = () => {
  const { competitionId } = useParams();
  const navigate = useNavigate();

  // Use React Query to fetch data
   // Use React Query to fetch data
   const { data: competition, error, isLoading } = useQuery({
    queryKey: ['competition', competitionId], // This identifies the query
    queryFn: () => fetchCompetitionData(competitionId), // Function to fetch data
    staleTime: 1200 * 1000, // Set stale time to 20 minutes (1200 seconds)
    cacheTime: 60 * 60 * 1000, // 1 hour
  });

  const goBack = () => {
    navigate('/competitions');
  };

  if (isLoading) {
    return (
      <div className="spinner-container">
        <Spinner /> {/* Render the spinner component here */}
      </div>
    );
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  const { name, imageUrl, description, startDate, endDate, type, status, winnerDetails, topCompetitors, balance } = competition;

  return (
    <div className="full-house">
    <div className="competition-interface">
      <div className="top-top-sideliners">
        <i className="fas fa-arrow-left" onClick={goBack}></i>
        <h2>{name}</h2>
      </div>
  
      <div className="competion-interface-competion-image">
        <img src={imageUrl} alt="Competition" />
      </div>
  
      {/* New Div for Current Balance */}
      <div className="competition-balance">
  <i className="fa-solid fa-coins balance-icon"></i>
  {balance < 500 ? (
    <span>Top 3 winners are eligible to split 1000 iCoins depending on participation</span>
  ) : (
    <span>Top 3 winners are eligible to split {Math.floor(balance * 0.7)} iCoins</span>
  )}
</div>

  
      <div className="competion-description">
        <div className="description">
          <p className="description-text">{description}</p>
        </div>
  
        {status === 'Ended' ? (
          // Competition ended, display winner
          <div>
            <h4 className="tc">Winner</h4>
            {winnerDetails ? (
              <div className="competitor-in-competion" onClick={() => navigate(`/profile/${winnerDetails.username}`)}>
                <div className="competitors-profile-picture-in-comp">
                  <img src={winnerDetails.profilePicture || defaultProfilePictureURL} alt="Winner" />
                </div>
                <div className="competitors-name">{winnerDetails.username}</div>
              </div>
            ) : (
              <p>No winner information available.</p>
            )}
          </div>
        ) : (
          // Competition ongoing, display top competitors
          <div>
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
        )}
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
                : 'This is a Normal Star Award worth 20 Campus Streaks.'}
            </p>
          </div>
        </div>
      </div>
  
      <div className="competion-interface-footer">
        <div onClick={() => navigate(`/competition/${competitionId}`)}>
          <i className="fa-solid fa-trophy interface-icon" style={{ color: '#205e78' }}></i>
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
