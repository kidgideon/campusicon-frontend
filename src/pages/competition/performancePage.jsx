import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../../../config/firebase_config'; // Firebase config and auth
import './performance.css';
import Spinner from '../../assets/loadingSpinner';
import toast from 'react-hot-toast'; // Import toast for notifications

const Performance = () => {
  const { competitionId } = useParams(); // Using competitionId
  const navigate = useNavigate();
  
  const [videoData, setVideoData] = useState(null);
  const [views, setViews] = useState(0);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        // Get the current user's UID from Firebase Auth
        const currentUser = auth.currentUser;
        if (!currentUser) {
          toast.error("You need to be logged in to view your performance.");
          navigate('/login');
          return;
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
          toast.error("You don't have a video in this competition.");
          setTimeout(() => {
            navigate(`/competition/${competitionId}`);
          }, 2000);
          return;
        }

        // Fetch the current user's video data
        const currentVideo = videoSnapshot.docs[0].data();

        // Update state with fetched video data
        setVideoData(currentVideo);
        setViews(currentVideo.views || 0);
      } catch (error) {
        console.error('Error fetching performance data:', error);
        toast.error('An error occurred while fetching performance data.');
      }
    };

    fetchPerformanceData();
  }, [competitionId, navigate]);

  if (!videoData) {
    return <Spinner />;
  }

  
  const goBack = () => {
    navigate(-1);
  };


  return (
    <div className="full-house">
         <div className="performance-interface">
      <div className="video-performance-preview-area">
      <div className="top-top-sideliners">
        <i className="fas fa-arrow-left" onClick={goBack}></i>
        <h2> Performace </h2>
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
        <div className="shares">
          <i className="fa-solid fa-share"></i>
          <p>{videoData.shares.length || 0}</p>
        </div>
      </div>

      <div className="views-counts">
        <p>You have {views} views on your video</p>
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
          <i className="fa-solid fa-square-poll-vertical"  style={{color : '#205e78'}}></i>
        </div>
      </div>
    </div>
    </div>
 
  );
};

export default Performance;
