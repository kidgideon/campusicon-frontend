import { doc, getDoc, updateDoc, query, collection, where, onSnapshot } from 'firebase/firestore';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../../../config/firebase_config';
import ReactPlayer from 'react-player';
import { fetchComments, handleSubmitComment } from './videoUtils';
import './scrollable.css';
import { toast } from 'react-hot-toast';
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
    }, (error) => {
      console.error('Error fetching videos:', error);
    });

    return () => unsubscribe && unsubscribe();
  }, [competitionId]);

  // Handle open/close comments
  const handleOpenComments = (videoId) => {
    if (showCommentPanel === videoId) {
      setShowCommentPanel(null);  // Close the panel if it's already open
    } else {
      setShowCommentPanel(videoId);  // Open the comment panel for the selected video
      fetchComments(videoId, setComments);  // Load comments for this video
    }
  };

  // Close comment panel on 'X' click
  const closeCommentPanel = () => setShowCommentPanel(null);

  // Submit comment
  const handleCommentSubmit = (videoId) => {
    handleSubmitComment(videoId, newComment, currentUser, setNewComment, (videoId) => fetchComments(videoId, setComments));
  };

  // Handle video like
  const handleVideoLike = async (videoId, isLiked) => {
    try {
      const videoRef = doc(db, 'videos', videoId);
      const videoDoc = await getDoc(videoRef);
      const videoData = videoDoc.data();
      const likes = videoData.likes || [];
      const updatedLikes = isLiked 
        ? likes.filter(userId => userId !== currentUser.uid)  // Remove user if already liked
        : [...likes, currentUser.uid];  // Add user if not already liked

      await updateDoc(videoRef, { likes: updatedLikes });

      setVideos(prevVideos => prevVideos.map(video => video.id === videoId 
        ? { ...video, likes: updatedLikes } 
        : video
      ));
    } catch (error) {
      console.error('Error handling like:', error);
      toast.error('Error handling like');
    }
  };

  // Handle comment like
  const handleCommentLike = async (videoId, commentId, isLiked) => {
    try {
      // Get the comments data for the video
      const videoRef = doc(db, 'videos', videoId);
      const videoDoc = await getDoc(videoRef);
      const videoData = videoDoc.data();
      const comments = videoData.comments || [];
  
      // Find the comment being liked/unliked
      const comment = comments.find(comment => comment.commentId === commentId);
      if (!comment) return;
  
      const likes = comment.likes || [];
      const updatedLikes = isLiked 
        ? likes.filter(userId => userId !== currentUser.uid)  // Remove like if already liked
        : [...likes, currentUser.uid];  // Add like if not already liked
  
      // Update the comment's likes
      const updatedComments = comments.map(c => 
        c.commentId === commentId 
          ? { ...c, likes: updatedLikes } 
          : c
      );
      await updateDoc(videoRef, { comments: updatedComments });
  
      // Update the local state
      setComments(prevComments => ({
        ...prevComments,
        [videoId]: updatedComments
      }));
  
      setLikedComments(prevLikedComments => ({
        ...prevLikedComments,
        [commentId]: !isLiked
      }));
  
      toast.success(isLiked ? 'Like removed' : 'Liked successfully');
    } catch (error) {
      console.error('Error handling comment like:', error);
      toast.error('Error handling comment like');
    }
  };

  // Handle video voting
  const handleVote = async (selectedVideoId) => {
    try {
      // Check if the user has already voted on the selected video
      const userHasVoted = votedVideos[selectedVideoId] || false;
  
      // If the user has voted on another video before, remove the previous vote
      const previousVoteId = Object.keys(votedVideos).find(id => votedVideos[id] && id !== selectedVideoId);
  
      if (previousVoteId) {
        const previousVideoRef = doc(db, 'videos', previousVoteId);
        const previousVideoDoc = await getDoc(previousVideoRef);
        const previousVotes = previousVideoDoc.data().votes || [];
        const updatedPreviousVotes = previousVotes.filter(userId => userId !== currentUser.uid);
        await updateDoc(previousVideoRef, { votes: updatedPreviousVotes });
  
        toast.success('Previous vote removed.');
      }
  
      if (userHasVoted) {
        // User has already voted on the selected video; remove their vote
        const videoRef = doc(db, 'videos', selectedVideoId);
        const videoDoc = await getDoc(videoRef);
        const videoData = videoDoc.data();
        const votes = videoData.votes || [];
        const updatedVotes = votes.filter(userId => userId !== currentUser.uid);
        await updateDoc(videoRef, { votes: updatedVotes });
  
        setVotedVideos((prevVotes) => ({
          ...prevVotes,
          [selectedVideoId]: false,
        }));
  
        toast.success('Vote removed successfully!');
        return; // Exit function to avoid adding a vote
      }
  
      // Add the new vote if the user has not voted for this video yet
      const videoRef = doc(db, 'videos', selectedVideoId);
      const videoDoc = await getDoc(videoRef);
      const videoData = videoDoc.data();
      const votes = videoData.votes || [];
      const updatedVotes = [...votes, currentUser.uid];
      await updateDoc(videoRef, { votes: updatedVotes });
  
      setVotedVideos((prevVotes) => ({
        ...prevVotes,
        [selectedVideoId]: true,
      }));
  
      setVideos(prevVideos => prevVideos.map(video =>
        video.id === selectedVideoId
          ? { ...video, votes: updatedVotes }
          : video
      ));
  
      toast.success('Vote cast successfully!');
    } catch (error) {
      console.error('Error handling vote:', error);
      toast.error('Error casting vote');
    }
  };
  

  // Handle video share
  const handleVideoShare = async (videoId) => {
    try {
      const videoRef = doc(db, 'videos', videoId);
      const videoDoc = await getDoc(videoRef);
      const videoData = videoDoc.data();
      const shares = videoData.shares || [];

      const updatedShares = [...shares, { userId: currentUser.uid }];
      await updateDoc(videoRef, { shares: updatedShares });

      await navigator.clipboard.writeText(videoData.videoURL);
      toast.success('Copied to clipboard');

      setVideos(prevVideos => prevVideos.map(video => video.id === videoId 
        ? { ...video, shares: updatedShares } 
        : video
      ));
    } catch (error) {
      console.error('Error handling share:', error);
      toast.error('Error handling share');
    }
  };

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
            <div className="like" onClick={() => handleVideoLike(video.id, video.likes.includes(currentUser.uid))}>
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
            <div className="vote" onClick={() => handleVote(video.id)}>
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
            <div className="comment-panel" id={`comment-panel-${video.id}`}>
              <div className="comment-pNEL-UP">
                <h3>Comments</h3>
                <div className="close-panel" onClick={closeCommentPanel}>X</div> {/* Close Button */}
              </div>
             
              <div className="commenters">
                <div className="commenter-body">
                  {comments[video.id]?.map((comment) => (
                    <div key={comment.commentId} className="commenter">
                      <div className="commenter-image">
                        <img src={comment.userProfilePicture || defaultProfilePictureURL} alt="User" />
                      </div>
                      <div className="comment-details-arrange">
                        <p className="commenters-name">{comment.username || "me"}</p>
                        <p className="commenters-comment">{comment.text}</p>
                      </div>
                      <div className="like-comment-icon">
                        <i 
                          className="fa-solid fa-heart" 
                          onClick={() => handleCommentLike(video.id, comment.commentId, likedComments[comment.commentId])}
                          style={{ color: likedComments[comment.commentId] ? '#277AA4' : 'inherit' }} // Apply company color if liked
                        />
                        <span>{comment.likes.length}</span> {/* Show the number of likes */}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="comment-input-box">
                <input 
                  type="text" 
                  value={newComment} 
                  placeholder="Type your comment..." 
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button onClick={() => handleCommentSubmit(video.id)}>Submit</button>
              </div>
            </div>
          )}
        </div>
      ))}
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

export default VideoWatch;
