import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../../config/firebase_config'; // Firebase config and auth
import './performance.css';
import Spinner from '../../assets/loadingSpinner';
import toast from 'react-hot-toast'; // Import toast for notifications
import { useQuery } from '@tanstack/react-query'; // Import React Query

const fetchPerformanceData = async (competitionId, navigate) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    toast.error("You need to be logged in to view your performance.");
    navigate("/login")
  }

  const uid = currentUser.uid;

  // Query the 'videos' collection for the video under the specific competition with the current user's UID
  const videoQuery = query(
    collection(db, 'videos'),
    where('competitionId', '==', competitionId),
    where('userId', '==', uid)
  );

  const videoSnapshot = await getDocs(videoQuery);

  if (videoSnapshot.empty) {
    toast.error("You dont have a video for this competition");
    navigate(`/competition/${competitionId}`)
  }

  return videoSnapshot.docs[0].data(); // Return the first video document's data
};

const Performance = () => {
  const { competitionId } = useParams(); // Using competitionId
  const navigate = useNavigate();

  const { data: videoData, isLoading, error } = useQuery({
    queryKey: ['performance', competitionId], // Ensure unique query key
    queryFn: () => fetchPerformanceData(competitionId, navigate),
    staleTime: 1200 * 1000, // Set stale time to 20 minutes (1200 seconds)
    cacheTime: 60 * 60 * 1000, // 1 hour
  });

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    toast.error(error.message);
    navigate('/login'); // Redirect to login if user is not logged in
    return null; // Return null to avoid rendering the rest of the component
  }

  const goBack = () => {
    navigate(-1)
  }
  return (
    <div className="full-house">
      <div className="performance-interface">
        <div className="video-performance-preview-area">
          <div className="top-top-sideliners">
            <i className="fas fa-arrow-left" onClick={goBack}></i>
            <h2> Performance </h2>
          </div>
          {/* Display the video preview */}
          <video className="performance-video" controls>
            <source src={videoData.videoURL} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>

        <div className="icons">
          <div className="likes">
            <i className="fa-solid fa-heart"></i>
            <p>{videoData.likes.length || 0}</p>
          </div>
          <div className="comments">
            <i className="fa-solid fa-comment"></i>
            <p>{videoData.comments.length || 0}</p>
          </div>
          <div className="votes">
            <i className="fa-solid fa-thumbs-up"></i>
            <p>{videoData.votes.length || 0}</p>
          </div>
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
            <i className="fa-solid fa-square-poll-vertical" style={{ color: '#205e78' }}></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Performance;