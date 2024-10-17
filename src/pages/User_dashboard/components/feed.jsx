import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../../assets/logo.png';
import { auth } from '../../../../config/firebase_config';
import { db } from '../../../../config/firebase_config'; // Ensure you're importing your Firebase config
import { doc, getDoc } from 'firebase/firestore';
import ReactHotToast, { toast } from 'react-hot-toast';
import Spinner from '../../../assets/loadingSpinner';
import {
  handleFeedLike,
  handlePostComment,
  handleCommentLike,
  handleDeleteComment,
  handleEditComment
} from './feedUtil.js';

const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';

const Feeds = ({ feeds: initialFeeds }) => {
  const [feeds, setFeeds] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showCommentPanel, setShowCommentPanel] = useState(null);
  const [comments, setComments] = useState({});
  const [commentLoading, setCommentLoading] = useState(false);
  const commentPanelRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingCommentLikes, setLoadingCommentLikes] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setCurrentUser({
        uid: user.uid,
        name: user.displayName || 'Anonymous',
      });
    }

    // Initialize the feeds state with the parameter value
    setFeeds(initialFeeds);
  }, [initialFeeds]);

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
        throw new Error('User not logged in.');
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
        feeds.map(feed => (
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
              {feed.mediaUrl && (
                <img src={feed.mediaUrl} alt="Feed Media" className="admin-feed-interface-feed-image feed-image" />
              )}
            </div>

            <div className="dashboard-interface-interactions">
              {currentUser && (
                <div className="like" onClick={() => handleFeedLike(feed.id, feed.likes.includes(currentUser.uid), currentUser.uid, setFeeds)}>
                  <i className="fa-solid fa-heart" style={{ color: feed.likes.includes(currentUser.uid) ? '#277AA4' : 'rgb(88, 88, 88)' }} />
                  <span>{feed.likes.length}</span>
                </div>
              )}

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
