import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { query, collection, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../../config/firebase_config';
import ReactPlayer from 'react-player';
import { handleVideoLike, handleVideoVote, handlePostComment, handleCommentLike, handleDeleteComment, handleEditComment, handleVideoShare } from '../competition/videoUtils'; 
import './scrollable.css';
import { toast } from 'react-hot-toast';
import Spinner from '../../assets/loadingSpinner'; 
import { useQuery } from '@tanstack/react-query'; 

const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';

const VideoWatch = () => {
  const { competitionId } = useParams();
  const [creators, setCreators] = useState({}); 
  const currentUser = auth.currentUser;
  const [showCommentPanel, setShowCommentPanel] = useState(null); 
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [likedComments, setLikedComments] = useState({});
  const [votedVideos, setVotedVideos] = useState({});
  const [commentLoading, setCommentLoading] = useState(false); 
  const commentPanelRef = useRef(null);
  const navigate = useNavigate();
  const [loadingVotes, setLoadingVotes] = useState(false);
  const [loadingCommentLikes, setLoadingCommentLikes] = useState(false);
  const [videos, setVideos] = useState([]);

 
  const fetchVideos = async () => {
    try {
      const videosQuery = query(
        collection(db, 'videos'),
        where('competitionId', '==', competitionId)
      );

      console.log("Querying videos for competitionId:", competitionId); // Debugging log

      return new Promise((resolve, reject) => {
        const unsubscribe = onSnapshot(
          videosQuery,
          (snapshot) => {
            if (snapshot.empty) {
              console.log("No videos found for competitionId:", competitionId); // Debugging log
              resolve([]); // Resolve with an empty array if no videos are found
            } else {
              const videoData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              console.log("Fetched video data:", videoData); // Debugging log
              resolve(videoData.sort((a, b) => b.timestamp - a.timestamp));
            }
          },
          (error) => {
            console.error("Error fetching videos from Firestore:", error);
            reject(error);
          }
        );
        return unsubscribe; // Return the unsubscribe function
      });
    } catch (error) {
      console.error("Error in fetchVideos:", error);
      throw error; // Rethrow the error
    }
  };

  // React Query v5 integration
  const { data, error, isLoading } = useQuery({
    queryKey: ['videos', competitionId],
    queryFn: fetchVideos,
    staleTime: 20 * 60 * 1000,
    cacheTime: 60 * 60 * 1000,
  });

  // Set videos directly when the data is updated
  useEffect(() => {
    if (data) {
      setVideos(data); // Set videos directly from the fetched data
    }
  }, [data]);
  // Fetch creators
  useEffect(() => {
    const fetchCreators = async () => {
      console.log(videos)
      if (!videos.length) return;

      const creatorsData = {};
      await Promise.all(
        videos.map(async (video) => {
          const creatorRef = doc(db, 'users', video.userId);
          const creatorDoc = await getDoc(creatorRef);
          creatorsData[video.userId] = creatorDoc.data();
        })
      );
      setCreators(creatorsData);
    };

    fetchCreators();
  }, [videos]);

  const handleVoteClick = (videoId) => {
    if (loadingVotes) return;
    setLoadingVotes(true); 
    handleVideoVote(videoId, currentUser.uid, setVideos, votedVideos)
      .finally(() => setLoadingVotes(false));
  };

  // Open comment panel
  const handleOpenComments = async (videoId) => {
    setShowCommentPanel(videoId);
    setNewComment('');
    setLikedComments((prev) => ({ ...prev, [videoId]: {} })); 

    // Fetch comments
    setCommentLoading(true);
    const videoRef = doc(db, 'videos', videoId);
    const videoDoc = await getDoc(videoRef);
    const videoData = videoDoc.data();
    const fetchedComments = videoData.comments || [];

    const commentsWithUserDetails = await Promise.all(
      fetchedComments.map(async (comment) => {
        const userRef = doc(db, 'users', comment.userId);
        const userDoc = await getDoc(userRef);

        return {
          ...comment,
          username: userDoc.exists() ? userDoc.data().username || ' ' : ' ',
          userProfilePicture: userDoc.exists() ? userDoc.data().profilePicture || defaultProfilePictureURL : defaultProfilePictureURL,
        };
      })
    );

    setComments((prevComments) => ({
      ...prevComments,
      [videoId]: commentsWithUserDetails,
    }));

    setCommentLoading(false); 
  };

  const closeCommentPanel = () => {
    setShowCommentPanel(null);
  };

  const handleCommentLikeClick = async (videoId, commentTimestamp, currentUserId, setComments) => {
    setLoadingCommentLikes(true);
    try {
      await handleCommentLike(videoId, commentTimestamp, currentUserId, setComments);
    } catch (error) {
      console.error('Error liking comment:', error);
      toast.error('Error liking comment');
    } finally {
      setLoadingCommentLikes(false);
    }
  };

  const handleSendComment = async (videoId) => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setCommentLoading(true); 

    try {
      await handlePostComment(videoId, currentUser.uid, newComment, setComments, commentPanelRef);
      setNewComment(''); 
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setCommentLoading(false); 
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return <Spinner />;
  }


  if (error) {
    return <p>Error loading videos</p>;
  }
  return (
    <div className="full-house">
 <div className="video-watch-area">
 <div className="top-top-sideliners">
        <i className="fas fa-arrow-left " onClick={goBack}></i>
        <h2>Watch Videos</h2>
      </div>

  
  {videos.map((video) => (
    <div key={video.id} className="video-watch-item">
      <div className="video-watch-top">
        <div className="video-creator-profile">
          <div className="video-watch-profile-picture">
            <img 
              src={creators[video.userId]?.profilePicture || defaultProfilePictureURL} 
              alt="Creator Profile" 
            />
          </div>
          <div className="video-watch-username">
            {creators[video.userId]?.username || 'Unknown User'}
          </div>
        </div>
      </div>
      
      <div className="video-watch-video-body">
        <ReactPlayer 
          url={video.videoURL} 
          controls 
          width="100%" 
          height="auto" 
        />
      </div>
      
      <div className="video-watch-video-data">
        <p>{video.description}</p>
      </div>
      
      <div className="video-watch-icon-and-button">
        <div className="like" onClick={() => handleVideoLike(video.id, video.likes.includes(currentUser.uid), currentUser.uid, setVideos)}>
          <i 
            className="fa-solid fa-heart" 
            style={{ color: video.likes.includes(currentUser.uid) ? '#277AA4' : 'inherit' }} // Apply company color if liked
          />
          <span>{video.likes.length}</span>
        </div>
        <div className="comment" onClick={() => handleOpenComments(video.id)}>
          <i className="fa-solid fa-comment" />
          <span>{video.comments.length}</span>
        </div>
        <div className="vote" onClick={() => handleVoteClick(video.id)}>
<i 
className="fa-solid fa-thumbs-up"
style={{ 
  color: votedVideos[video.id] ? '#277AA4' : 'rgb(88, 88, 88)', 
  pointerEvents: loadingVotes ? 'none' : 'auto'  // Disable button while loading
}} 
/>
<span>{video.votes.length}</span>
</div>


      </div>

    {/* Comment Panel (only show if open) */}
    {showCommentPanel === video.id && (
<div className="comment-panel" id={`comment-panel-${video.id}`} ref={commentPanelRef}>

<div className="comment-header">
<h3>Comments</h3>
<i className="fa-solid fa-x" onClick={closeCommentPanel}></i>
</div>

<div className="comment-input">
<input
  ref={commentPanelRef} 
  placeholder="Type a comment"
  value={newComment}
  onChange={(e) => setNewComment(e.target.value)}
/>
<button className="send-comment-btn" onClick={() => handleSendComment(video.id)}>
  Send
</button>
</div>

<div className="comment-body">
{commentLoading ? (
<Spinner />
) : (
// Sort comments by timestamp in descending order
comments[video.id]
?.slice() // Use slice to avoid mutating the original array
.sort((a, b) => b.timestamp - a.timestamp) // Sort by timestamp (newest first)
.map((comment) => (
  <div key={comment.timestamp} className="comment">
    <img 
      src={comment.userProfilePicture || defaultProfilePictureURL} 
      alt="User" 
      className="commenter-image" 
    />
    
    <div className="comment-details">
      <p className="commenters-name">{comment.username || 'me'}</p>
      <p className="commenters-comment">{comment.text}</p>
    </div>

    <div className="comment-actions">

      <i
        className="fa-solid fa-heart"
        onClick={() => handleCommentLikeClick(video.id, comment.timestamp, currentUser.uid, setComments)}
        style={{ color: comment.likes.includes(currentUser.uid) ? '#277AA4' : 'inherit' }}
      />
      <span>{comment.likes.length}</span>

      {/* Optional: Display loading indicator next to the like button */}
      {loadingCommentLikes && <i className="fa fa-spinner fa-spin" style={{ marginLeft: '5px' }}></i>}

      {comment.userId === currentUser.uid && (
        <>
          <i 
            className="fa-solid fa-pen-to-square" 
            onClick={() => handleEditComment(video.id, comment.timestamp, prompt('Edit your comment:', comment.text), setComments, setCommentLoading)}
          ></i>
          <i 
            className="fa-solid fa-trash" 
            onClick={() => handleDeleteComment(video.id, comment.timestamp, setComments, setCommentLoading)}
          ></i>
        </>
      )}
    </div>
  </div>
))
)}
</div>


</div>
)}
    </div>
  ))}

<div className="competion-interface-footer">
  <div onClick={() => navigate(`/competition/${competitionId}`)}>
    <i className="fa-solid fa-trophy interface-icon"></i>
  </div>
  <div onClick={() => navigate(`/watch-video/${competitionId}`)}>
  <i className="fa-solid fa-play interface-icon" style={{color : '#205e78'}}></i>
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

export default VideoWatch;
