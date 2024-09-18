// videoUtils.js
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase_config';

// Fetch comments and user details
export const fetchComments = async (videoId, setComments) => {
  try {
    const videoRef = doc(db, 'videos', videoId);
    const videoSnapshot = await getDoc(videoRef);
    const videoData = videoSnapshot.data();
    const commentsWithUserData = await Promise.all(
      (videoData.comments || []).map(async (comment) => {
        const userRef = doc(db, 'users', comment.userId);
        const userSnapshot = await getDoc(userRef);
        return {
          ...comment,
          user: userSnapshot.exists() ? userSnapshot.data() : null,
        };
      })
    );
    setComments((prevComments) => ({ ...prevComments, [videoId]: commentsWithUserData }));
  } catch (error) {
    console.error('Error fetching comments:', error);
  }
};

// Handle submitting a new comment
export const handleSubmitComment = async (videoId, newComment, currentUser, setNewComment, fetchComments) => {
  if (!newComment.trim()) return;
  try {
    const newCommentData = {
      userId: currentUser.uid,
      text: newComment,
      likes: [],
      hates: [],
    };
    const videoRef = doc(db, 'videos', videoId);
    const videoSnapshot = await getDoc(videoRef);
    const videoData = videoSnapshot.data();

    const updatedComments = [...(videoData.comments || []), newCommentData];

    await updateDoc(videoRef, { comments: updatedComments });
    setNewComment('');
    fetchComments(videoId);
  } catch (error) {
    console.error('Error submitting comment:', error);
  }
};

// Handle liking or hating a comment
// Handle liking or hating a comment
// Handle liking or hating a comment
export const handleReaction = async (
  videoId,
  commentId,
  isLiked,
  isHated,
  currentUser,
  updateCommentsInState,
  actionType
) => {
  try {
    const videoRef = doc(db, 'videos', videoId);
    const videoSnapshot = await getDoc(videoRef);
    const videoData = videoSnapshot.data();

    // Find the comment by its commentId
    const commentIndex = videoData.comments.findIndex(comment => comment.id === commentId);
    if (commentIndex === -1) {
      throw new Error('Comment not found');
    }

    const updatedComment = { ...videoData.comments[commentIndex] };

    // Get the original author's userId from the comment
    const originalUserId = updatedComment.userId;

    // Get the current user's ID
    const userId = currentUser.uid;

    // Ensure likes and hates arrays exist
    updatedComment.likes = updatedComment.likes || [];
    updatedComment.hates = updatedComment.hates || [];

    // Like or hate logic
    if (actionType === 'like') {
      if (isLiked) {
        updatedComment.likes = updatedComment.likes.filter((id) => id !== userId);
      } else {
        updatedComment.likes = [...updatedComment.likes, userId];
        updatedComment.hates = updatedComment.hates.filter((id) => id !== userId);
      }
    } else if (actionType === 'hate') {
      if (isHated) {
        updatedComment.hates = updatedComment.hates.filter((id) => id !== userId);
      } else {
        updatedComment.hates = [...updatedComment.hates, userId];
        updatedComment.likes = updatedComment.likes.filter((id) => id !== userId);
      }
    }

    // Fetch the original user's profile (username and profilePicture)
    const userRef = doc(db, 'users', originalUserId);
    const userSnapshot = await getDoc(userRef);
    const userData = userSnapshot.data();

    // Update the comment with the original user's info
    const sanitizedComment = {
      ...updatedComment,
      user: {
        username: userData?.username || 'Unknown User',
        profilePicture: userData?.profilePicture || '/default-profile.png'
      }
     
    };

    const updatedComments = [...videoData.comments];
    updatedComments[commentIndex] = sanitizedComment;

    // Update Firestore with the new comment data
    await updateDoc(videoRef, { comments: updatedComments });

    // Update state to reflect the changes in UI
    updateCommentsInState(videoId, updatedComments);
  } catch (error) {
    console.error(`Error updating comment ${actionType}s:`, error);
  }
};

// videoUtils.js
export const handleDeleteComment = async (commentId, currentUser) => {
  // Add the logic to delete a comment
  try {
    // Example: Ensure only the comment owner can delete it
    const commentRef = doc(db, 'comments', commentId);
    const commentDoc = await getDoc(commentRef);
    if (commentDoc.exists() && commentDoc.data().userId === currentUser.uid) {
      await deleteDoc(commentRef);
      return 'deleted';
    } else {
      throw new Error("You're not authorized to delete this comment");
    }
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};






// Handle liking a video
export const handleLikeVideo = async (videoId, isLiked, currentUser, setVideos, videos) => {
  try {
    const videoRef = doc(db, 'videos', videoId);
    const videoSnapshot = await getDoc(videoRef);
    const videoData = videoSnapshot.data();

    const likes = videoData.likes || [];
    const updatedLikes = isLiked ? likes.filter((id) => id !== currentUser.uid) : [...likes, currentUser.uid];

    await updateDoc(videoRef, { likes: updatedLikes });
    setVideos(videos.map(video => 
      video.id === videoId ? { ...video, likes: updatedLikes } : video
    ));
  } catch (error) {
    console.error('Error updating video likes:', error);
  }
};
