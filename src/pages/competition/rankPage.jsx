import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase_config';
import toast from 'react-hot-toast'; // Importing react-hot-toast
import './Rank.css';

const CompetionRank = () => {
  const { competitionId } = useParams();
  const [competitors, setCompetitors] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const currentUserRef = useRef(null);
  const navigate = useNavigate(); // Adding navigate for page navigation

  
const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';

  useEffect(() => {
    const fetchCompetitors = async () => {
      try {
        // Fetch all videos for the competition
        const videosQuery = query(
          collection(db, 'videos'),
          where('competitionId', '==', competitionId)
        );

        const videoSnapshot = await getDocs(videosQuery);
        const allVideos = videoSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (allVideos.length === 0) {
          // If no videos found, toast a message and return
          toast('No videos yet for this competition', {
            icon: '📹',
          });
          return;
        }

        // Sort by votes array length
        const sortedVideos = allVideos.sort((a, b) => b.votes.length - a.votes.length);

        // Fetch users for sorted videos
        const competitorsData = await Promise.all(
          sortedVideos.map(async (video) => {
            const userDoc = await getDoc(doc(db, 'users', video.userId));
            const userData = userDoc.exists() ? userDoc.data() : null;

            if (userData) {
              return {
                name: userData.username,
                profilePicture: userData.profilePicture || defaultProfilePictureURL,
                votes: video.votes.length,
                userId: userData.uid,
              };
            }
            return null;
          })
        );

        setCompetitors(competitorsData.filter(Boolean));

        // Assuming you have a way to get the current user ID
        const currentUserId = 'currentUserId'; // Replace with actual logic
        const currentUserData = competitorsData.find(comp => comp.userId === currentUserId);
        setCurrentUser(currentUserData);
        
        // Scroll to current user if found
        if (currentUserData && currentUserRef.current) {
          currentUserRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

      } catch (err) {
        console.error('Error fetching competitors:', err);
        toast.error('Error fetching competitors');
      }
    };

    fetchCompetitors();
  }, [competitionId]);

  return (
    <div className="competion-rank">
      <h1 className='comp-rank-h1'>Competition Ranks</h1>
      <ul className="competitors-list">
        {competitors.map((competitor, index) => (
          <div
            key={competitor.userId} // Ensure each list item has a unique key
            ref={competitor.userId === currentUser?.userId ? currentUserRef : null}
            className={`competitor ${competitor.userId === currentUser?.userId ? 'current-user' : ''}`}
            onClick={() => navigate(`/profile/${competitor.name}`)} // Navigating to user's profile on click
          >
            <div className="rank">{index + 1}</div>
            <img src={competitor.profilePicture} alt={`${competitor.name}'s profile`} className='competitor-dp-pc' />
            <div className="name">{competitor.name}</div>
            <div className="votes">{competitor.votes} votes</div>
          </div>
        ))}
      </ul>
      
      {/* Footer navigation */}
     
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

export default CompetionRank;
