import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { db } from '../../../config/firebase_config';

// Fetch the user details for a comment
export const fetchCommentUserDetails = async (comment) => {
  const userRef = doc(db, 'users', comment.userId);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const userData = userDoc.data();
    return {
      ...comment,
      username: userData.username || 'Unknown User',
      userProfilePicture: userData.profilePicture || 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media'
    };
  } else {
    return {
      ...comment,
      username: 'Unknown User',
      userProfilePicture: 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media'
    };
  }
};
/**
 * Function to handle liking or unliking a video
 * @param {string} videoId - ID of the video being liked/unliked
 * @param {boolean} isLiked - Whether the video is currently liked by the user
 * @param {string} currentUserId - The ID of the current user
 * @param {function} setVideos - Function to update the state of videos
 */
export const handleVideoLike = async (videoId, isLiked, currentUserId, setVideos) => {
  try {
    const videoRef = doc(db, 'videos', videoId);
    const videoDoc = await getDoc(videoRef);
    const videoData = videoDoc.data();
    const likes = videoData.likes || [];

    // Check if the user has already liked the video
    const updatedLikes = isLiked 
      ? likes.filter(userId => userId !== currentUserId)  // Remove the user's like
      : [...likes, currentUserId];  // Add the user's like

    // Update the likes in Firestore
    await updateDoc(videoRef, { likes: updatedLikes });

    // Update the state in the VideoWatch component
    setVideos(prevVideos => prevVideos.map(video => 
      video.id === videoId
        ? { ...video, likes: updatedLikes }
        : video
    ));

    toast.success(isLiked ? 'Like removed' : 'Liked successfully!');
  } catch (error) {
    console.error('Error handling like:', error);
    toast.error('Error handling like');
  }
};

/**
 * Function to handle voting for a video
 * @param {string} videoId - ID of the video being voted
 * @param {string} currentUserId - The ID of the current user
 * @param {function} setVideos - Function to update the state of videos
 * @param {object} votedVideos - Current votes of the user
 */
export const handleVideoVote = async (videoId, currentUserId, setVideos, votedVideos) => {
  try {
    const videoRef = doc(db, 'videos', videoId);
    const videoDoc = await getDoc(videoRef);
    const videoData = videoDoc.data();
    const votes = videoData.votes || [];

    // If the user has voted for another video, remove that vote
    let previousVoteVideoId = Object.keys(votedVideos).find((id) => votedVideos[id] === true);
    
    if (previousVoteVideoId && previousVoteVideoId !== videoId) {
      const previousVideoRef = doc(db, 'videos', previousVoteVideoId);
      const previousVideoDoc = await getDoc(previousVideoRef);
      const previousVideoData = previousVideoDoc.data();
      const previousVotes = previousVideoData.votes.filter(userId => userId !== currentUserId);

      await updateDoc(previousVideoRef, { votes: previousVotes });
      
      // Update the previous video state
      setVideos(prevVideos => prevVideos.map(video => 
        video.id === previousVoteVideoId
          ? { ...video, votes: previousVotes }
          : video
      ));
    }

    // If the user has already voted for this video, remove the vote
    const updatedVotes = votes.includes(currentUserId) 
      ? votes.filter(userId => userId !== currentUserId) 
      : [...votes, currentUserId];  // Otherwise, add the vote

    // Update the votes in Firestore
    await updateDoc(videoRef, { votes: updatedVotes });

    // Update the state in the VideoWatch component
    setVideos(prevVideos => prevVideos.map(video => 
      video.id === videoId
        ? { ...video, votes: updatedVotes }
        : video
    ));

    toast.success(votes.includes(currentUserId) ? 'Vote removed' : 'Voted successfully!');
  } catch (error) {
    console.error('Error handling vote:', error);
    toast.error('Error handling vote');
  }
};

/**
 * Function to handle posting a comment
 * @param {string} videoId - ID of the video being commented on
 * @param {string} userId - ID of the user posting the comment
 * @param {string} commentText - Text of the comment
 * @param {function} setComments - Function to update the state of comments
 */
export const handlePostComment = async (videoId, userId, commentText, setComments, commentPanelRef) => {
  if (!commentText.trim()) {
    toast.error('Comment cannot be empty');
    return;
  }

  const newComment = {
    userId,
    text: commentText,
    timestamp: Date.now(),
    likes: [],
  };

  try {
    const videoRef = doc(db, 'videos', videoId);
    await updateDoc(videoRef, { comments: arrayUnion(newComment) });

    // Update comments state
    setComments(prevComments => ({
      ...prevComments,
      [videoId]: [newComment, ...(prevComments[videoId] || [])],
    }));

    // Scroll the comment panel to the top after posting
    if (commentPanelRef.current) {
      commentPanelRef.current.scrollTop = 0;
    }

    toast.success('Comment posted!');
  } catch (error) {
    console.error('Error posting comment:', error);
    toast.error('Error posting comment');
  }
};



// Handle deleting a comment and maintaining the comment list
export const handleDeleteComment = async (videoId, commentTimestamp, setComments, setCommentLoading) => {
  setCommentLoading(true);
  try {
    const videoRef = doc(db, 'videos', videoId);
    const videoDoc = await getDoc(videoRef);
    const videoData = videoDoc.data();

    const updatedComments = videoData.comments.filter(comment => comment.timestamp !== commentTimestamp);

    await updateDoc(videoRef, { comments: updatedComments });

    // Fetch user details for each comment and update state
    const updatedCommentsWithDetails = await Promise.all(
      updatedComments.map(fetchCommentUserDetails)
    );
    setComments(prev => ({
      ...prev,
      [videoId]: updatedCommentsWithDetails
    }));

    toast.success('Comment deleted');
  } catch (error) {
    console.error('Error deleting comment:', error);
    toast.error('Error deleting comment');
  }
  setCommentLoading(false);
};

// Handle editing a comment and maintaining user details
export const handleEditComment = async (videoId, commentTimestamp, newCommentText, setComments, setCommentLoading) => {
  if (!newCommentText) return toast.error('Comment cannot be empty');
  
  setCommentLoading(true);
  try {
    const videoRef = doc(db, 'videos', videoId);
    const videoDoc = await getDoc(videoRef);
    const videoData = videoDoc.data();

    const updatedComments = videoData.comments.map(comment => 
      comment.timestamp === commentTimestamp ? { ...comment, text: newCommentText } : comment
    );

    await updateDoc(videoRef, { comments: updatedComments });

    // Fetch user details for each comment and update state
    const updatedCommentsWithDetails = await Promise.all(
      updatedComments.map(fetchCommentUserDetails)
    );
    setComments(prev => ({
      ...prev,
      [videoId]: updatedCommentsWithDetails
    }));

    toast.success('Comment updated');
  } catch (error) {
    console.error('Error updating comment:', error);
    toast.error('Error updating comment');
  }
  setCommentLoading(false);
};

// Handle liking a comment and preserving user details
export const handleCommentLike = async (videoId, commentTimestamp, currentUserId, setComments) => {
  try {
    const videoRef = doc(db, 'videos', videoId);
    const videoDoc = await getDoc(videoRef);
    const videoData = videoDoc.data();

    const updatedComments = videoData.comments.map(comment => 
      comment.timestamp === commentTimestamp 
        ? { ...comment, likes: comment.likes.includes(currentUserId) ? comment.likes.filter(user => user !== currentUserId) : [...comment.likes, currentUserId] }
        : comment
    );

    await updateDoc(videoRef, { comments: updatedComments });

    // Fetch user details for each comment and update state
    const updatedCommentsWithDetails = await Promise.all(
      updatedComments.map(fetchCommentUserDetails)
    );
    setComments(prev => ({
      ...prev,
      [videoId]: updatedCommentsWithDetails
    }));

    toast.success('Like toggled');
  } catch (error) {
    console.error('Error liking comment:', error);
    toast.error('Error liking comment');
  }
};
