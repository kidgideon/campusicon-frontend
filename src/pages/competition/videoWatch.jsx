import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { query, collection, where, onSnapshot, doc, getDoc, updateDoc, arrayUnion, disableNetwork } from 'firebase/firestore';
import { db, auth } from '../../../config/firebase_config';
import ReactPlayer from 'react-player';
import { handleVideoLike, handleVideoVote, handlePostComment, handleCommentLike, handleDeleteComment, handleEditComment, handleVideoShare } from '../competition/videoUtils';  // Import like, vote, and comment functions
import './scrollable.css';
import { toast } from 'react-hot-toast';
import Spinner from '../../assets/loadingSpinner';  // Loading spinner component


const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';

const VideoWatch = () => {
  const { competitionId } = useParams();
  const currentUser = auth.currentUser;
  const [videos, setVideos] = useState([]);
  const [showCommentPanel, setShowCommentPanel] = useState(null);  // Track the open comment panel
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [creators, setCreators] = useState({});
  const [likedComments, setLikedComments] = useState({});
  const [votedVideos, setVotedVideos] = useState({});
  const [loading, setLoading] = useState(true);  // Add loading state for videos
  const [commentLoading, setCommentLoading] = useState(false);  // Loading state for comments
  const commentPanelRef = useRef(null);
  const navigate = useNavigate();
  const [loadingVotes, setLoadingVotes] = useState(false);
  const [loadingCommentLikes, setLoadingCommentLikes] = useState(false);

  // Fetch videos
  useEffect(() => {
    const videosQuery = query(collection(db, 'videos'), where('competitionId', '==', competitionId));
    const unsubscribe = onSnapshot(videosQuery, (snapshot) => {
      const videoData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setVideos(videoData.sort((a, b) => b.timestamp - a.timestamp));

      // Fetch creator details
      videoData.forEach(async (video) => {
        const creatorRef = doc(db, 'users', video.userId);
        const creatorDoc = await getDoc(creatorRef);
        setCreators((prevCreators) => ({
          ...prevCreators,
          [video.userId]: creatorDoc.data(),
        }));
      });
      setLoading(false);  // Set loading to false when data is fetched
    }, (error) => {
      console.error('Error fetching videos:', error);
      setLoading(false);
    });

    return () => unsubscribe && unsubscribe();
  }, [competitionId]);

  const handleVoteClick = (videoId) => {
  if (loadingVotes) return;  // Prevent multiple clicks while loading
  setLoadingVotes(true);  // Start loading
  handleVideoVote(videoId, currentUser.uid, setVideos, votedVideos)
    .finally(() => setLoadingVotes(false));  // End loading after the process is done
};
  
  // Open comment panel
  const handleOpenComments = async (videoId) => {
    setShowCommentPanel(videoId);
    setNewComment('');
    setLikedComments((prev) => ({ ...prev, [videoId]: {} })); // Reset liked comments state for the current video
  
    // Fetch comments and show loading spinner
    setCommentLoading(true);
    const videoRef = doc(db, 'videos', videoId);
    const videoDoc = await getDoc(videoRef);
    const videoData = videoDoc.data();
    const fetchedComments = videoData.comments || [];
  
    // Retrieve the details of each comment's creator
    const commentsWithUserDetails = await Promise.all(
      fetchedComments.map(async (comment) => {
        const userRef = doc(db, 'users', comment.userId);  // Get the user document based on userId
        const userDoc = await getDoc(userRef);

       
        if (userDoc.exists()) {
          const userData = userDoc.data();
          return {
            ...comment,
            username: userData.username || ' ',  // Add username from the user document
            userProfilePicture: userData.profilePicture || defaultProfilePictureURL,  // Add profile picture
          };
        } else {
          return {
            ...comment,
            username: ' ',
            userProfilePicture: defaultProfilePictureURL,
          };
        }
      })
    );
  
    setComments((prevComments) => ({
      ...prevComments,
      [videoId]: commentsWithUserDetails,  // Save the comments with user details
    }));
  
    setCommentLoading(false);  // Hide the loading spinner after fetching data
  };
  

  // Close comment panel
  const closeCommentPanel = () => {
    setShowCommentPanel(null);
  };

  // Middle function to manage the like action
 const handleCommentLikeClick = async (videoId, commentTimestamp, currentUserId, setComments) => {
  setLoadingCommentLikes(true); // Start loading

  try {
    await handleCommentLike(videoId, commentTimestamp, currentUserId, setComments);
  } catch (error) {
    console.error('Error liking comment:', error);
    toast.error('Error liking comment');
  } finally {
    setLoadingCommentLikes(false); // Stop loading
  }
};


  const handleSendComment = async (videoId) => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setCommentLoading(true);  // Set loading to true

    try {
      await handlePostComment(videoId, currentUser.uid, newComment, setComments, commentPanelRef);
      setNewComment('');  // Clear the comment input after successful post
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setCommentLoading(false);  // Stop loading after the process completes
    }
  };

  
  const goBack = () => {
    navigate(-1);
  };


  if (loading) {
    return <Spinner />;  // Show spinner while loading videos
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
