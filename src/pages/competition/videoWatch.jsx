import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { query, collection, where, onSnapshot, doc, getDoc, updateDoc, arrayUnion, disableNetwork } from 'firebase/firestore';
import { db, auth } from '../../../config/firebase_config';
import ReactPlayer from 'react-player';
import { handleVideoLike, handleVideoVote, handlePostComment, handleCommentLike, handleDeleteComment, handleEditComment } from '../competition/videoUtils';  // Import like, vote, and comment functions
import './scrollable.css';
import { toast } from 'react-hot-toast';
import Spinner from '../../assets/loadingSpinner';  // Loading spinner component
import TopSection from '../User_dashboard/components/topSection';

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

  // Handle vote click
  const handleVoteClick = (videoId) => {
    handleVideoVote(videoId, currentUser.uid, setVideos, votedVideos);
    setVotedVideos(prev => ({ ...prev, [videoId]: !prev[videoId] }));  // Update the voted state
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
            username: userData.username || 'Unknown User',  // Add username from the user document
            userProfilePicture: userData.profilePicture || defaultProfilePictureURL,  // Add profile picture
          };
        } else {
          return {
            ...comment,
            username: 'Unknown User',
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

  // Handle send comment
  const handleSendComment = async (videoId) => {
    if (newComment.trim()) {
      await handlePostComment(videoId, currentUser.uid, newComment, setComments);
      setNewComment('');
    } else {
      toast.error('Comment cannot be empty');
    }
  };

  if (loading) {
    return <Spinner />;  // Show spinner while loading videos
  }

  return (
    <div className="video-watch-area">
      <div className="spiritual-boundary">
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
                  className="fa-solid fa-check" 
                  style={{ color: votedVideos[video.id] ? '#277AA4' : 'inherit' }} // Apply company color if voted
                />
                <span>{video.votes.length}</span>
              </div>
              <div className="share" onClick={() => handleVideoShare(video.id)}>
                <i className="fa-solid fa-share" />
                <span>{video.shares.length}</span>
              </div>
            </div>

          {/* Comment Panel (only show if open) */}
{showCommentPanel === video.id && (
  <div className="comment-panel" id={`comment-panel-${video.id}`} ref={commentPanelRef}>
    <div className="comment-panel-up">
      <h3>Comments</h3>
      <div className="close-panel" onClick={closeCommentPanel}>X</div> {/* Close Button */}
    </div>

    <div className="commenters">
  <div className="commenter-body">
    {commentLoading ? (
      <Spinner />  // Show spinner while loading comments or performing edit/delete
    ) : (
      comments[video.id]?.map((comment) => (
        <div key={comment.timestamp} className="commenter">
          <div className="commenter-image">
            <img src={comment.userProfilePicture || defaultProfilePictureURL} alt="User" />
          </div>
          <div className="comment-details-arrange">
            <p className="commenters-name">{comment.username || 'me'}</p>
            <p className="commenters-comment">{comment.text}</p>
          </div>
          <div className="like-comment-icon">
            <i 
              className="fa-solid fa-heart" 
              onClick={() => handleCommentLike(video.id, comment.timestamp, currentUser.uid, setComments)} 
              style={{ color: comment.likes.includes(currentUser.uid) ? '#277AA4' : 'inherit' }}
            />
            <span>{comment.likes.length}</span>
          </div>
          {comment.userId === currentUser.uid && (
            <>
              <button onClick={() => handleDeleteComment(video.id, comment.timestamp, setComments, setCommentLoading)}>Delete</button>
              <button onClick={() => handleEditComment(video.id, comment.timestamp, prompt('Edit your comment:', comment.text), setComments, setCommentLoading)}>
                Edit
              </button>
            </>
          )}
        </div>
      ))
    )}
  </div>
</div>


    <div className="commenter-message">
      <textarea 
        ref={commentPanelRef} 
        rows="2" 
        placeholder="Type a comment"
        value={newComment} 
        onChange={(e) => setNewComment(e.target.value)} 
        style={{ resize: 'none' }} 
      />
      <div className="send-comment">
        <button onClick={() => handleSendComment(video.id)}>Send</button>
      </div>
    </div>
  </div>
)}

          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoWatch;
