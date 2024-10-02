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
 * Function to send a notification to the creator of a video.
 * @param {string} creatorId - ID of the user who created the video.
 * @param {object} notification - Notification object to be added.
 */
const sendNotification = async (creatorId, notification) => {
  const userRef = doc(db, 'users', creatorId);
  await updateDoc(userRef, {
    notifications: arrayUnion(notification)
  });
};

/**
 * Function to handle posting a comment
 * @param {string} videoId - ID of the video being commented on
 * @param {string} userId - ID of the user posting the comment
 * @param {string} commentText - Text of the comment
 * @param {function} setComments - Function to update the state of comments
 * @param {object} commentPanelRef - Reference to the comment panel for scrolling
 */
export const handlePostComment = async (videoId, userId, commentText, setComments, commentPanelRef) => {
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
      userName: userData.firstName + " " + userData.lastName,
      userProfilePicture: userData.profilePicture || 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media',
      text: commentText,
      timestamp: Date.now(),
      likes: [],
    };

    // Add comment to video document
    const videoRef = doc(db, 'videos', videoId);
    await updateDoc(videoRef, { comments: arrayUnion(newComment) });

    
    // Send notification to the creator of the video
    const videoDoc = await getDoc(videoRef);
    const videoData = videoDoc.data();
    const creatorId = videoData.userId; // Assuming creator's ID is stored in video document

    const notification = {
      read: false,
      type: 'comment',
      timestamp: Date.now(),
      competitionId: videoData.competitionId,
      text: `${userData.username} commented on your video`,
    };
    await sendNotification(creatorId, notification);

    // Update comments state
    setComments(prevComments => ({
      ...prevComments,
      [videoId]: [newComment, ...(prevComments[videoId] || [])],
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

    // Determine updated likes
    const updatedLikes = isLiked 
      ? likes.filter(userId => userId !== currentUserId) 
      : [...likes, currentUserId];

    // Update the likes in Firestore
    await updateDoc(videoRef, { likes: updatedLikes });

    const userRef = doc(db, 'users', currentUserId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    // Send notification if liked
    if (!isLiked) {
      const creatorId = videoData.userId; // Get the creator ID
      const notification = {
        read: false,
        type: 'like',
        timestamp: Date.now(),
        competitionId: videoData.competitionId,
        text: `${userData.username} liked your video`, // Assuming videoData has a username field
      };
      await sendNotification(creatorId, notification);
    }

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

    const userRef = doc(db, 'users', currentUserId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();


    // Handle unvoting if necessary
    let previousVoteVideoId = Object.keys(votedVideos).find((id) => votedVideos[id] === true);
    
    if (previousVoteVideoId && previousVoteVideoId !== videoId) {
      const previousVideoRef = doc(db, 'videos', previousVoteVideoId);
      const previousVideoDoc = await getDoc(previousVideoRef);
      const previousVideoData = previousVideoDoc.data();
      const previousVotes = previousVideoData.votes.filter(userId => userId !== currentUserId);

      await updateDoc(previousVideoRef, { votes: previousVotes });

      // Send unvote notification
      const previousCreatorId = previousVideoData.userId; // Get the creator ID
      const unvoteNotification = {
        read: false,
        type: 'vote',
        timestamp: Date.now(),
        competitionId: previousVideoData.competitionId,
        text: `${userData.username} unvoted you, you lost a vote!`, // Assuming videoData has a username field
      };
      await sendNotification(previousCreatorId, unvoteNotification);
      
      // Update the previous video state
      setVideos(prevVideos => prevVideos.map(video => 
        video.id === previousVoteVideoId
          ? { ...video, votes: previousVotes }
          : video
      ));
    }

    // Determine updated votes
    const updatedVotes = votes.includes(currentUserId) 
      ? votes.filter(userId => userId !== currentUserId) 
      : [...votes, currentUserId];

    // Update the votes in Firestore
    await updateDoc(videoRef, { votes: updatedVotes });

   

    // Send notification for new vote
    if (!votes.includes(currentUserId)) {
      const creatorId = videoData.userId; // Get the creator ID
      const notification = {
        read: false,
        type: 'vote',
        timestamp: Date.now(),
        competitionId: videoData.competitionId,
        text: `You got a vote! ${userData.username} voted for you`, // Assuming videoData has a username field
      };
      await sendNotification(creatorId, notification);
    }

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
 * Function to handle liking or unliking a comment
 * @param {string} videoId - ID of the video containing the comment
 * @param {string} commentTimestamp - Timestamp of the comment to be liked/unliked
 * @param {string} currentUserId - The ID of the current user
 * @param {function} setComments - Function to update the comments state
 */
export const handleCommentLike = async (videoId, commentTimestamp, currentUserId, setComments) => {
  try {
    const videoRef = doc(db, 'videos', videoId);
    const videoDoc = await getDoc(videoRef);
    const videoData = videoDoc.data();
    const commentToLike = videoData.comments.find(comment => comment.timestamp === commentTimestamp);

    if (!commentToLike) {
      toast.error('Comment not found');
      return;
    }


    const likes = commentToLike.likes || [];
    const updatedLikes = likes.includes(currentUserId) 
      ? likes.filter(userId => userId !== currentUserId) 
      : [...likes, currentUserId];

    // Update the comment in Firestore
    const updatedComments = videoData.comments.map(comment => 
      comment.timestamp === commentTimestamp
        ? { ...comment, likes: updatedLikes }
        : comment
    );

    await updateDoc(videoRef, { comments: updatedComments });

    // Update comments state
    setComments(prevComments => ({
      ...prevComments,
      [videoId]: updatedComments,
    }));

    const userRef = doc(db, 'users', currentUserId);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();

    // Notify the creator of the comment about the like/unlike
    const creatorId = commentToLike.userId; // Assuming commentToLike has a userId field
    const notification = {
      read: false,
      type: 'comment_like',
      timestamp: Date.now(),
      competitionId: videoData.competitionId,
      text: `${userData.username} liked your comment`, // Assuming videoData has a username field
    };
    await sendNotification(creatorId, notification);

    toast.success(updatedLikes.includes(currentUserId) ? 'Comment liked!' : 'Comment unliked!');
  } catch (error) {
    console.error('Error liking/unliking comment:', error);
    toast.error('Error liking/unliking comment');
  }
};

/**
 * Function to delete a comment
 * @param {string} videoId - ID of the video containing the comment
 * @param {number} commentTimestamp - Timestamp of the comment to be deleted
 * @param {function} setComments - Function to update the comments state
 */
export const handleDeleteComment = async (videoId, commentTimestamp, setComments) => {
 
  try {
    const videoRef = doc(db, 'videos', videoId);
    const videoDoc = await getDoc(videoRef);
    const videoData = videoDoc.data();
    const updatedComments = videoData.comments.filter(comment => comment.timestamp !== commentTimestamp);
    
    // Update comments in Firestore
    await updateDoc(videoRef, { comments: updatedComments });
    
    // Update comments state
    setComments(prevComments => ({
      ...prevComments,
      [videoId]: updatedComments,
    }));

    toast.success('Comment deleted!');
  } catch (error) {
    console.error('Error deleting comment:', error);
    toast.error('Error deleting comment');
  } finally {

  }
};


/**
 * Function to handle editing a comment
 * @param {string} videoId - ID of the video containing the comment
 * @param {number} commentTimestamp - Timestamp of the comment to be edited
 * @param {string} newText - The new text for the comment
 * @param {function} setComments - Function to update the comments state
 */
export const handleEditComment = async (videoId, commentTimestamp, newText, setComments) => {
  if (!newText.trim()) {
    toast.error('Comment cannot be empty');
    return;
  }

  try {
    const videoRef = doc(db, 'videos', videoId);
    const videoDoc = await getDoc(videoRef);
    const videoData = videoDoc.data();

    const updatedComments = videoData.comments.map(comment => 
      comment.timestamp === commentTimestamp
        ? { ...comment, text: newText }
        : comment
    );

    // Update the comment in Firestore
    await updateDoc(videoRef, { comments: updatedComments });

    // Update comments state
    setComments(prevComments => ({
      ...prevComments,
      [videoId]: updatedComments,
    }));

    toast.success('Comment updated!');
  } catch (error) {
    console.error('Error editing comment:', error);
    toast.error('Error editing comment');
  }
};

