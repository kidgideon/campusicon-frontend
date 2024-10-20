import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../../../config/firebase_config';
import { toast } from 'react-hot-toast';

export const handleFeedLike = async (feedId, isLiked, currentUserId, setFeeds) => {
  try {
    // Reference to the feed document
    const feedRef = doc(db, 'feeds', feedId);
    const feedDoc = await getDoc(feedRef);
    const feedData = feedDoc.data();
    const likes = feedData.likes || [];

    // Determine updated likes (add or remove current user's like)
    const updatedLikes = isLiked 
      ? likes.filter(userId => userId !== currentUserId)  // Remove the user's like
      : [...likes, currentUserId];  // Add the user's like

    // Update the likes in Firestore for the feed
    await updateDoc(feedRef, { likes: updatedLikes });

    // Fetch the current user's data
    const userRef = doc(db, 'users', currentUserId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    // Update the state in the Feeds component
    setFeeds(prevFeeds => prevFeeds.map(feed => 
      feed.id === feedId
        ? { ...feed, likes: updatedLikes } // Update the likes for the specific feed
        : feed
    ));

    // Display a success message using toast
    // toast.success(isLiked ? 'Like removed' : 'Liked successfully!');
  } catch (error) {
    console.error('Error handling feed like:', error);
    // toast.error('Error handling like');
  }
};


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
      username: userData.username, // Add user's name
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
    const feedData = feedDoc.data();

    // Find the comment to like
    const commentToLike = feedData.comments.find(comment => comment.timestamp === commentTimestamp);

    if (!commentToLike) {
      toast.error('Comment not found');
      return;
    }

    const likes = commentToLike.likes || [];
    const updatedLikes = likes.includes(currentUserId)
      ? likes.filter(userId => userId !== currentUserId) // Unlike if already liked
      : [...likes, currentUserId]; // Like if not already liked

    // Update the comment in Firestore
    const updatedComments = feedData.comments.map(comment =>
      comment.timestamp === commentTimestamp
        ? { ...comment, likes: updatedLikes }
        : comment
    );

    await updateDoc(feedRef, { comments: updatedComments });

    // Update the comments state
    setComments(prevComments => ({
      ...prevComments,
      [feedId]: updatedComments,
    }));

    // Notify the user of success
    // toast.success(updatedLikes.includes(currentUserId) ? 'Comment liked!' : 'Comment unliked!');
  } catch (error) {
    console.error('Error liking/unliking comment:', error);
    // toast.error('Error liking/unliking comment');
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
  if (!newCommentText.trim()) {
    toast.error('Comment cannot be empty');
    return;
  }

  setCommentLoading(true);
  try {
    const feedRef = doc(db, 'feeds', feedId);
    const feedDoc = await getDoc(feedRef);
    const feedData = feedDoc.data();

    // Update the comment text
    const updatedComments = feedData.comments.map(comment => 
      comment.timestamp === commentTimestamp
        ? { ...comment, text: newCommentText }
        : comment
    );

    // Update the comments in Firestore
    await updateDoc(feedRef, { comments: updatedComments });

    // Update comments state
    setComments(prevComments => ({
      ...prevComments,
      [feedId]: updatedComments,
    }));

    toast.success('Comment updated!');
  } catch (error) {
    console.error('Error editing comment:', error);
    toast.error('Error editing comment');
  } finally {
    setCommentLoading(false);
  }
};


export const handleDeleteComment = async (feedId, commentTimestamp, setComments, setCommentLoading) => {
  setCommentLoading(true);
  try {
    const feedRef = doc(db, 'feeds', feedId);
    const feedDoc = await getDoc(feedRef);
    const feedData = feedDoc.data();
    
    // Filter out the comment to delete
    const updatedComments = feedData.comments.filter(comment => comment.timestamp !== commentTimestamp);
    
    // Update comments in Firestore
    await updateDoc(feedRef, { comments: updatedComments });
    
    // Update comments state
    setComments(prevComments => ({
      ...prevComments,
      [feedId]: updatedComments,
    }));

    toast.success('Comment deleted!');
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
