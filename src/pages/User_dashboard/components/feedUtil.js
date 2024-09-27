import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../../../config/firebase_config';
import { toast } from 'react-hot-toast';

/**
 * Function to handle liking or unliking a feed
 * @param {string} feedId - ID of the feed being liked/unliked
 * @param {boolean} isLiked - Whether the feed is currently liked by the user
 * @param {string} currentUserId - The ID of the current user
 * @param {function} setFeeds - Function to update the state of feeds
 */
export const handleFeedLike = async (feedId, isLiked, currentUserId, setFeeds) => {
  try {
    const feedRef = doc(db, 'feeds', feedId);
    const feedDoc = await getDoc(feedRef);
    const feedData = feedDoc.data();
    const likes = feedData.likes || [];

    // Check if the user has already liked the feed
    const updatedLikes = isLiked 
      ? likes.filter(userId => userId !== currentUserId)  // Remove the user's like
      : [...likes, currentUserId];  // Add the user's like

    // Update the likes in Firestore
    await updateDoc(feedRef, { likes: updatedLikes });

    // Update the state in the Feeds component
    setFeeds(prevFeeds => prevFeeds.map(feed => 
      feed.id === feedId
        ? { ...feed, likes: updatedLikes }
        : feed
    ));

    // Display success message based on like/unlike action
    toast.success(isLiked ? 'Like removed' : 'Liked successfully!');
  } catch (error) {
    console.error('Error handling like:', error);
    toast.error('Error handling like');
  }
};

/**
 * Fetch comments with user details for a feed
 * @param {string} feedId - ID of the feed
 * @returns {Promise<Array>} - Comments with user details
 */
export const fetchCommentsWithUserDetails = async (feedId) => {
  try {
    const feedRef = doc(db, 'feeds', feedId);
    const feedDoc = await getDoc(feedRef);
    const feedData = feedDoc.data();

    const fetchedComments = Array.isArray(feedData.comments) ? feedData.comments : [];

    // Process each comment and add user details
    const commentsWithUserDetails = await Promise.all(
      fetchedComments.map(fetchCommentUserDetails)
    );

    return commentsWithUserDetails;
  } catch (error) {
    console.error('Error fetching comments with user details:', error);
    return [];
  }
};

/**
 * Function to handle posting a comment to a feed
 * @param {string} feedId - ID of the feed being commented on
 * @param {string} userId - ID of the user posting the comment
 * @param {string} commentText - Text of the comment
 * @param {function} setComments - Function to update the state of comments
 * @param {object} commentPanelRef - Reference to the comment panel for scrolling
 */
export const handlePostComment = async (feedId, userId, commentText, setComments, commentPanelRef) => {
  if (!commentText.trim()) {
    toast.error('Comment cannot be empty');
    return;
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      toast.error('User not found');
      return;
    }

    const userData = userSnap.data();
    const newComment = {
      userId,
      userName: userData.username, // Add user's name
      userProfilePicture: userData.profilePicture || '', // Add user's profile picture if available
      text: commentText,
      timestamp: Date.now(),
      likes: [],
    };

    const feedRef = doc(db, 'feeds', feedId);
    await updateDoc(feedRef, { comments: arrayUnion(newComment) });

    setComments(prevComments => ({
      ...prevComments,
      [feedId]: [newComment, ...(prevComments[feedId] || [])],
    }));

    if (commentPanelRef?.current) {
      commentPanelRef.current.scrollTop = 0;
    }

    toast.success('Comment posted!');
  } catch (error) {
    console.error('Error posting comment:', error);
    toast.error('Error posting comment');
  }
};

/**
 * Handle sharing a feed post
 * @param {object} feed - The feed being shared
 * @param {object} currentUser - The current user sharing the feed
 * @param {function} toast - Toast notification function
 */
export const handleShareFeed = async (feed, currentUser) => {
  const feedRef = doc(db, 'feeds', feed.id);
  await updateDoc(feedRef, {
    shares: arrayUnion(currentUser.uid),
  });
  toast.success('Post shared!', { icon: '🔗' });
};

/**
 * Handle liking a comment for a feed
 * @param {string} feedId - ID of the feed
 * @param {number} commentTimestamp - Timestamp of the comment being liked/unliked
 * @param {string} currentUserId - ID of the current user
 * @param {function} setComments - Function to update the comments state
 */
export const handleCommentLike = async (feedId, commentTimestamp, currentUserId, setComments) => {
  try {
    const feedRef = doc(db, 'feeds', feedId);
    const feedDoc = await getDoc(feedRef);
    
    if (!feedDoc.exists()) {
      throw new Error('Feed document does not exist.');
    }

    const feedData = feedDoc.data();
    const comments = Array.isArray(feedData.comments) ? feedData.comments : [];

    const updatedComments = comments.map(comment => {
      const likesArray = Array.isArray(comment.likes) ? comment.likes : [];

      return comment.timestamp === commentTimestamp 
        ? { 
            ...comment, 
            likes: likesArray.includes(currentUserId) 
              ? likesArray.filter(user => user !== currentUserId) 
              : [...likesArray, currentUserId] 
          }
        : comment;
    });

    await updateDoc(feedRef, { comments: updatedComments });

    const updatedCommentsWithDetails = await Promise.all(
      updatedComments.map(fetchCommentsWithUserDetails)
    );
    setComments(prev => ({
      ...prev,
      [feedId]: updatedCommentsWithDetails
    }));

    toast.success('Like toggled');
  } catch (error) {
    console.error('Error liking comment:', error);
    toast.error('Error liking comment');
  }
};

/**
 * Handle editing a comment for a feed
 * @param {string} feedId - ID of the feed
 * @param {number} commentTimestamp - Timestamp of the comment being edited
 * @param {string} newCommentText - Updated text of the comment
 * @param {function} setComments - Function to update the comments state
 * @param {function} setCommentLoading - Function to handle loading state
 */
export const handleEditComment = async (feedId, commentTimestamp, newCommentText, setComments, setCommentLoading) => {
  if (!newCommentText) return toast.error('Comment cannot be empty');
  
  setCommentLoading(true);
  try {
    const feedRef = doc(db, 'feeds', feedId);
    const feedDoc = await getDoc(feedRef);
    const feedData = feedDoc.data();

    const updatedComments = feedData.comments.map(comment => 
      comment.timestamp === commentTimestamp ? { ...comment, text: newCommentText } : comment
    );

    await updateDoc(feedRef, { comments: updatedComments });

    const updatedCommentsWithDetails = await Promise.all(
      updatedComments.map(fetchCommentsWithUserDetails)
    );
    setComments(prev => ({
      ...prev,
      [feedId]: updatedCommentsWithDetails
    }));

    toast.success('Comment updated');
  } catch (error) {
    console.error('Error updating comment:', error);
    toast.error('Error updating comment');
  } finally {
    setCommentLoading(false);
  }
};

/**
 * Handle deleting a comment from a feed
 * @param {string} feedId - ID of the feed
 * @param {number} commentTimestamp - Timestamp of the comment being deleted
 * @param {function} setComments - Function to update the comments state
 * @param {function} setCommentLoading - Function to handle loading state
 */
export const handleDeleteComment = async (feedId, commentTimestamp, setComments, setCommentLoading) => {
  setCommentLoading(true);
  try {
    const feedRef = doc(db, 'feeds', feedId);
    const feedDoc = await getDoc(feedRef);
    const feedData = feedDoc.data();

    const updatedComments = feedData.comments.filter(comment => comment.timestamp !== commentTimestamp);

    await updateDoc(feedRef, { comments: updatedComments });

    const updatedCommentsWithDetails = await Promise.all(
      updatedComments.map(fetchCommentsWithUserDetails)
    );
    setComments(prev => ({
      ...prev,
      [feedId]: updatedCommentsWithDetails
    }));

    toast.success('Comment deleted');
  } catch (error) {
    console.error('Error deleting comment:', error);
    toast.error('Error deleting comment');
  } finally {
    setCommentLoading(false);
  }
};

/**
 * Fetch the user details for a comment
 * @param {object} comment - The comment object
 * @returns {Promise<object>} - The comment with user details
 */
const fetchCommentUserDetails = async (comment) => {
  try {
    const userRef = doc(db, 'users', comment.userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) throw new Error('User not found');

    const userData = userSnap.data();

    return {
      ...comment,
      userName: userData.username,
      userProfilePicture: userData.profilePicture || ''
    };
  } catch (error) {
    console.error('Error fetching comment user details:', error);
    return comment; // Return the original comment if there's an error
  }
};
