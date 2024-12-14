import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate} from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../../../config/firebase_config';
import { db } from '../../../../config/firebase_config'; // Ensure you're importing your Firebase config
import { doc, getDoc } from 'firebase/firestore';
import ReactHotToast, { toast } from 'react-hot-toast';
import Spinner from '../../../assets/loadingSpinner';
import { useQuery } from '@tanstack/react-query';
import {
  handleFeedLike,
  handlePostComment,
  handleCommentLike,
  handleDeleteComment,
  handleEditComment
} from './feedUtil.js';

const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';
const logo = "https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/logo.png?alt=media&token=97374df9-684d-44bf-ba79-54f5cb7d48b7";
const Feeds = ({ feeds: initialFeeds ,  userData: userData}) => {
  const [feeds, setFeeds] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showCommentPanel, setShowCommentPanel] = useState(null);
  const [comments, setComments] = useState({});
  const [commentLoading, setCommentLoading] = useState(false);
  const commentPanelRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(userData || null)
  const [loadingCommentLikes, setLoadingCommentLikes] = useState(false);
  const videoRefs = useRef([]); // To hold references to all video elements
  const [zoomLevel, setZoomLevel] = useState(1); // For image zooming
  const [lastTapTime, setLastTapTime] = useState(0); // For double-tap detection
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [zoomingImageId, setZoomingImageId] = useState(null); // Tracks the currently zooming image
  const [authInitialized, setAuthInitialized] = useState(false); // Track auth initialization


  const navigate = useNavigate();
  // Fetch current Firebase user
  useEffect(() => {
    // Update currentUser if no userData is passed as a prop
    if (!userData) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUser({
            uid: user.uid,
            name: user.displayName || 'Anonymous', // Default to displayName from Firebase
            email: user.email, // Optional, include other auth properties if needed
          });
        } else {
          setCurrentUser(null); // Handle logged-out state
        }
      });

      return () => unsubscribe(); // Cleanup on component unmount
    }
  }, [userData]);

  useEffect(() => {
    // Initialize feeds state with the provided initialFeeds
    setFeeds(initialFeeds);
  }, [initialFeeds]);

  const handleImageZoom = (e, zoomIn, imageId) => {
    e.preventDefault();
  
    // Only allow zooming for the currently active image
    if (zoomingImageId && zoomingImageId !== imageId) return;
  
    setZoomingImageId(imageId); // Set the active image being zoomed
    setZoomLevel((prev) => {
      const newZoomLevel = zoomIn ? Math.min(prev + 0.5, 3) : Math.max(prev - 0.5, 1);
  
      // Reset zoomingImageId if zoom level is back to default
      if (newZoomLevel === 1) setZoomingImageId(null);
      return newZoomLevel;
    });
  };
  const handleDoubleTap = (feedId) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTime;

    if (timeSinceLastTap < 300) {
      // Double tap detected
      setLikeAnimating(true);
      setTimeout(() => setLikeAnimating(false), 500); // Reset animation state after 500ms

      // Trigger the like functionality
      handleFeedLike(feedId, true); // Assuming `true` is for liking
    }

    setLastTapTime(now);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.play();
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 } // 50% of the video should be visible to trigger play
    );

    // Attach the observer to all video elements
    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    // Cleanup observer
    return () => {
      videoRefs.current.forEach((video) => {
        if (video) observer.unobserve(video);
      });
    };
  }, [feeds]);
  
  const userPage = () => {
    navigate("/profile")
  }

  const handleToggleCommentPanel = async (feedId) => {
    setShowCommentPanel(feedId);
    setNewComment('');
    setCommentLoading(true);

    try {
      const feedRef = doc(db, 'feeds', feedId);
      const feedDoc = await getDoc(feedRef);
      const feedData = feedDoc.data();
      const fetchedComments = feedData.comments || [];

      const commentsWithUserDetails = await Promise.all(
        fetchedComments.map(async (comment) => {
          const userRef = doc(db, 'users', comment.userId);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            return {
              ...comment,
              username: userData.username || 'Unknown User',
              userProfilePicture: userData.profilePicture || defaultProfilePictureURL,
              likes: comment.likes || [],
            };
          } else {
            return {
              ...comment,
              username: 'Unknown User',
              userProfilePicture: defaultProfilePictureURL,
              likes: comment.likes || [],
            };
          }
        })
      );

      setComments((prevComments) => ({
        ...prevComments,
        [feedId]: commentsWithUserDetails,
      }));
    } catch (error) {
      console.error('Error fetching comments with user details:', error);
      toast.error('Failed to load comments.');
    }

    setCommentLoading(false); // Hide the loading spinner after fetching data
  };

  const handleCommentLikeClick = async (feedId, commentTimestamp, currentUserId, setComments) => {
    setLoadingCommentLikes(true); // Start loading

    try {
      await handleCommentLike(feedId, commentTimestamp, currentUserId, setComments);
    } catch (error) {
      console.error('Error liking comment:', error);
      toast.error('Error liking comment');
    } finally {
      setLoadingCommentLikes(false); // Stop loading
    }
  };

  const handleSendComment = async (feedId) => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setCommentLoading(true);

    try {
      if (!currentUser) {
        toast.error("you are not logged in")
      navigate("/login")
      }

      await handlePostComment(feedId, currentUser.uid, newComment, setComments, commentPanelRef);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment.');
    } finally {
      setCommentLoading(false);
    }
  };


  return (
    <div className="dashboard-interface-feeds">
      {feeds.length === 0 ? (
        <p>No feeds available.</p>
      ) : (
        feeds.map((feed, index) => (
          <div key={feed.id} className="dashboard-interface-feed">
            <div className="dashboard-interface-feed-top">
              <div className="dashboard-interface-feed-profile-pic">
                <Link to="icons page" style={{ width: "100%" }}>
                  <img src={logo} alt="Profile" />
                </Link>
              </div>
              <div className="dashboard-interface-right-section-top">
                <Link to="icons page" style={{ width: "100%" }}>
                  <span>{feed.userName || 'campusicon'}</span>
                </Link>
              </div>
            </div>

            <div className="dashboard-interface-text-content">
              <p>{feed.content}</p>
            </div>

            <div className="dashboard-interface-media-content">
            
  {feed.mediaUrl && feed.mediaType && (
    <>
      {feed.mediaType === 'image' ? (
    
          <div
                className="image-container"
                onDoubleClick={() => handleDoubleTap(feed.id)}
                onWheel={(e) => handleImageZoom(e, e.deltaY < 0, feed.id)}
              >
                <img
                  src={feed.mediaUrl}
                  alt="Feed Media"
                  style={{
                    transform: `scale(${zoomingImageId === feed.id ? zoomLevel : 1})`, // Apply zoom only to the active image
                    transition: 'transform 0.3s ease',
                  }}
                   className="admin-feed-interface-feed-image feed-image"
                />
                {likeAnimating && (
                  <div className="like-animation">
                    <i className="fa-solid fa-heart" style={{ color: '#ff0000', fontSize: '3rem' }}></i>
                  </div>
                )}    
        </div>
      ) : feed.mediaType === 'video' ? (
        <video 
          src={feed.mediaUrl} 
          controls 
          className="feed-video"
          ref={(el) => (videoRefs.current[index] = el)}
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        <p>Unsupported media format</p>
      )}
    </>
  )}
</div>


            <div className="dashboard-interface-interactions">
              {currentUser && (
                <div className="like" onClick={() => {
                  // Check if the feed is already liked by the user
                  const isLiked = feed.likes.includes(currentUser.uid);
                
                  // Toggle the like status immediately
                  const updatedLikes = isLiked
                    ? feed.likes.filter(userId => userId !== currentUser.uid)
                    : [...feed.likes, currentUser.uid];
                
                  // Immediately update the like count and color in the UI
                  setFeeds(prevFeeds => prevFeeds.map(f => 
                    f.id === feed.id
                      ? { ...f, likes: updatedLikes }
                      : f
                  ));
                
                  // Call the handleFeedLike function to update the backend after the UI update
                  handleFeedLike(feed.id, isLiked, currentUser.uid, setFeeds);
                }}>
                  <i 
                    className="fa-solid fa-heart"
                    style={{ 
                      color: feed.likes.includes(currentUser.uid) ? '#277AA4' : 'rgb(88, 88, 88)' 
                    }}
                  />
                  <span>{feed.likes.length}</span>
                </div>
                
              )}

              <div onClick={() => handleToggleCommentPanel(feed.id)}>
                <i className="fa-solid fa-comment"></i>
                <span>{feed.comments.length || 0}</span>
              </div>
            </div>
            <div className="add-comment">
            <div className="user-image" onClick={userPage}><img src={currentUser?.profilePicture || defaultProfilePictureURL} alt="profile" /></div>
            <div className="comment-prompt" onClick={() => handleToggleCommentPanel(feed.id)}>add your comment...</div>
            </div>

            {showCommentPanel === feed.id && (
             
   <div className="comment-panel" id={`comment-panel-${feed.id}`} ref={commentPanelRef}>
   
                <div className="comment-header">
                  <h3>Comments</h3>
                  <i className="fa-solid fa-x" onClick={() => setShowCommentPanel(null)}></i>
                </div>

                <div className="comment-input">
                  <input
                    ref={commentPanelRef}
                    placeholder="Type a comment"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button className="send-comment-btn" onClick={() => handleSendComment(feed.id)}>
                    Send
                  </button>
                </div>

                <div className="comment-body">
                  {commentLoading ? (
                    <Spinner />
                  ) : (
                    comments[feed.id]?.map((comment) => (
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
                          {currentUser && (
                            <>
                              <i
                                className="fa-solid fa-heart"
                                onClick={() => handleCommentLikeClick(feed.id, comment.timestamp, currentUser.uid, setComments)}
                                style={{ color: comment.likes.includes(currentUser.uid) ? '#277AA4' : 'inherit' }}
                              />
                              <span>{comment.likes.length}</span>
                            </>
                          )}

                          {loadingCommentLikes && <i className="fa fa-spinner fa-spin" style={{ marginLeft: '5px' }}></i>}

                          {currentUser?.uid === comment.userId && (
                            <>
                              <i 
                                className="fa-solid fa-pen-to-square" 
                                onClick={() => handleEditComment(feed.id, comment.timestamp, prompt('Edit your comment:', comment.text), setComments, setCommentLoading)}
                              ></i>
                              <i 
                                className="fa-solid fa-trash" 
                                onClick={() => handleDeleteComment(feed.id, comment.timestamp, setComments, setCommentLoading)}
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
        ))
      )}
    </div>
  );
};

export default Feeds;
