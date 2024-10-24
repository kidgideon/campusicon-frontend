import { useQuery } from '@tanstack/react-query'; // Import React Query
import { useParams, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../../config/firebase_config'; // Import auth for current user
import Spinner from "../../assets/loadingSpinner"; // Import loading spinner
import toast from 'react-hot-toast';
import './Rank.css';


const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';

const fetchCompetitors = async (competitionId) => {
  const currentUserId = auth.currentUser?.uid;

  if (!currentUserId) {
   toast.error("no user logged in")
   navigate("/login")
  }

  const videosQuery = query(
    collection(db, 'videos'),
    where('competitionId', '==', competitionId)
  );

  const videoSnapshot = await getDocs(videosQuery);
  const allVideos = videoSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if (allVideos.length === 0) {
     toast.error("no competitors yet")
  }

  const sortedVideos = allVideos.sort((a, b) => b.votes.length - a.votes.length);

  return Promise.all(
    sortedVideos.map(async (video) => {
      const userDoc = await getDoc(doc(db, 'users', video.userId));
      const userData = userDoc.exists() ? userDoc.data() : null;

      if (userData) {
        return {
          name: userData.username,
          profilePicture: userData.profilePicture || defaultProfilePictureURL,
          votes: video.votes.length,
          userId: video.userId,
        };
      }
      return null;
    })
  );
};

const CompetitionRank = () => {
  const { competitionId } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const currentUserRef = useRef(null);
  const scrollRef = useRef(null);
  const navigate = useNavigate();
 
  const { data: competitors = [], isLoading, error } = useQuery({
    queryKey: ['competitors', competitionId], // Ensure unique query key
    queryFn: () => fetchCompetitors(competitionId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });

  if (isLoading) {
    return (
      <div className="competition-rank-interface-loading">
        <Spinner />
      </div>
    );
  }

  if (error) {
    toast.error(error.message);
    return null; // or you can handle it as needed
  }

  // Scroll to current user if found
  if (currentUserRef.current) {
    setTimeout(() => {
      currentUserRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 1000);
  }

  return (
    <div className="full-house">
      <div className="competition-rank-interface-page">
        <div ref={scrollRef}></div> {/* Top of the page marker */}
        <div className="top-top-sideliners">
          <i className="fas fa-arrow-left back-icon" onClick={() => navigate(-1)}></i> {/* Back button */}
          <h2 className='competition-rank-h1'>Competition Rank</h2>
        </div>
        <div className="competition-rank-interface-list">
          {competitors.map((competitor, index) => {
            const isCurrentUser = competitor.userId === currentUser?.userId; // Highlight current user
            return (
              <div
                key={competitor.userId}
                className={`competition-rank-interface-item ${isCurrentUser ? 'current-user' : ''}`}
                ref={isCurrentUser ? currentUserRef : null}
                onClick={() => navigate(`/profile/${competitor.name}`)}
              >
                <span className="competition-rank-interface-number">{index + 1}.</span>
                <img
                  src={competitor.profilePicture}
                  alt={`${competitor.name}`}
                  className="competition-rank-interface-profile-picture"
                />
                <div className="competition-rank-interface-info">
                  <div className="competition-rank-interface-username">
                    {competitor.name}
                  </div>
                  <p className="competition-rank-interface-votes">{competitor.votes} votes</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Scroll to top icon */}
        <div className="scroll-to-top" onClick={() => scrollRef.current.scrollIntoView({ behavior: 'smooth' })}>
          <i className="fa-solid fa-arrow-up"></i>
        </div>

        <div className="competion-interface-footer">
          <div onClick={() => navigate(`/competition/${competitionId}`)}>
            <i className="fa-solid fa-trophy interface-icon"></i>
          </div>
          <div onClick={() => navigate(`/watch-video/${competitionId}`)}>
            <i className="fa-solid fa-play interface-icon"></i>
          </div>
          <div className="top-users-icon" onClick={() => navigate(`/ranks/${competitionId}`)}>
            <i className="fa-solid fa-sort interface-icon" style={{ color: '#205e78' }}></i>
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

export default CompetitionRank;
