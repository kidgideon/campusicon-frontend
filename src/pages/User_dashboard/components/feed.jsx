import React, { useState, useEffect, useRef } from 'react';
import logo from '../../../assets/logo.png';
import { auth } from '../../../../config/firebase_config';
import { db } from '../../../../config/firebase_config'; // Ensure you're importing your Firebase config
import { collection, query, orderBy, limit, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import ReactHotToast, { toast } from 'react-hot-toast';
import Spinner from '../../../assets/loadingSpinner';
import {
  handleFeedLike,
  fetchCommentsWithUserDetails,
  handlePostComment,
  handleShareFeed,
  handleCommentLike,
  handleDeleteComment,
  handleEditComment
} from './feedUtil.js';

const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';

const Feeds = () => {
  const [feeds, setFeeds] = useState([]); // Local state for feeds
  const [newComment, setNewComment] = useState('');
  const [showCommentPanel, setShowCommentPanel] = useState(null);
  const [comments, setComments] = useState({});
  const [commentLoading, setCommentLoading] = useState(false);
  const commentPanelRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state for feeds
  const [loadingCommentLikes, setLoadingCommentLikes] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);



  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setCurrentUser({
        uid: user.uid,
        name: user.displayName || 'Anonymous',
      });
    }
  }, []);

  // Fetch user feeds
  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const feedsRef = collection(db, 'feeds');
        const q = query(feedsRef, orderBy('createdAt', 'desc'), limit(10));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const feedsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setFeeds(feedsList);
          setLoading(false); // Set loading to false when data is fetched
        }, (error) => {
          console.error('Error fetching feeds:', error);
          setLoading(false);
        });

        return () => unsubscribe(); // Cleanup on unmount
      } catch (error) {
        console.error('Error fetching feeds:', error);
        setLoading(false);
      }
    };

    fetchFeeds(); // Call fetchFeeds when the component mounts
  }, []);

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
              likes: comment.likes || [], // Ensure the likes array is initialized
            };
          } else {
            return {
              ...comment,
              username: 'Unknown User',
              userProfilePicture: defaultProfilePictureURL,
              likes: comment.likes || [], // Ensure the likes array is initialized
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

    // Middle function to manage the like action
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

    setCommentLoading(true);  // Set loading to true

    try {
      await handlePostComment(feedId, currentUser.uid, newComment, setComments, commentPanelRef);
      setNewComment('');  // Clear the comment input after successful post
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setCommentLoading(false);  // Stop loading after the process completes
    }
  };



  return (
    <div className="dashboard-interface-feeds">
      {loading ? ( // Show a loading spinner or message if feeds are still loading
        <Spinner />
      ) : (
        feeds.length === 0 ? (
          <p>No feeds available.</p>
        ) : (
          feeds.map(feed => (
            <div key={feed.id} className="dashboard-interface-feed">
              <div className="dashboard-interface-feed-top">
                <div className="dashboard-interface-feed-profile-pic">
                  <img src={logo} alt="Profile" />
                </div>
                <div className="dashboard-interface-right-section-top">
                  <span>{feed.userName || 'campusicon'}</span>
                </div>
              </div>

              <div className="dashboard-interface-text-content">
                <p>{feed.content}</p>
              </div>

              <div className="dashboard-interface-media-content">
                {feed.mediaUrl && (
                  <img src={feed.mediaUrl} alt="Feed Media" className="admin-feed-interface-feed-image feed-image"  />
         )}
              </div>

              <div className="dashboard-interface-interactions">
                <div className="like" onClick={() => handleFeedLike(feed.id, feed.likes.includes(currentUser.uid), currentUser.uid, setFeeds)}>
                  <i className="fa-solid fa-heart" style={{ color: feed.likes.includes(currentUser.uid) ? '#277AA4' : 'rgb(88, 88, 88)' }} />
                  <span>{feed.likes.length}</span>
                </div>

                <div onClick={() => handleToggleCommentPanel(feed.id)}>
                  <i className="fa-solid fa-comment"></i>
                  <span>{feed.comments.length || 0}</span>
                </div>

            
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
                          <i
              className="fa-solid fa-heart"
              onClick={() => handleCommentLikeClick(feed.id, comment.timestamp, currentUser.uid, setComments)}
              style={{ color: comment.likes.includes(currentUser.uid) ? '#277AA4' : 'inherit' }}
            />
            <span>{comment.likes.length}</span>

            {/* Optional: Display loading indicator next to the like button */}
            {loadingCommentLikes && <i className="fa fa-spinner fa-spin" style={{ marginLeft: '5px' }}></i>}

                            {comment.userId === currentUser.uid && (
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
        )
      )}

        {/* Modal for full screen image */}
    
    </div>
  );
};

export default Feeds;
