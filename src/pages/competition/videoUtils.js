import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { db } from '../../../config/firebase_config';

// Fetch the user details for a comment
export const fetchCommentUserDetails = async (comments, batchSize = 10, setComments) => {
  try {
    let batchIndex = 0;
    const totalComments = comments.length;

    const fetchUserDetailsForBatch = async (batchComments) => {
      // Process each comment to fetch user details
      return await Promise.all(batchComments.map(async (comment) => {
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
      }));
    };

    const loadBatch = async () => {
      const start = batchIndex * batchSize;
      const end = start + batchSize;
      const batchComments = comments.slice(start, end);

      // Fetch user details for the current batch of comments
      const commentsWithUserDetails = await fetchUserDetailsForBatch(batchComments);

      // Update the state with the new batch of comments
      setComments(prevComments => [...prevComments, ...commentsWithUserDetails]);

      // Increment the batch index for the next batch
      batchIndex++;

      // If there are more comments to load, continue loading the next batch after a delay
      if (end < totalComments) {
        setTimeout(loadBatch, 500);  // Delay to simulate loading (500ms, you can adjust this)
      }
    };

    // Start loading the first batch of comments
    loadBatch();
  } catch (error) {
    console.error('Error fetching user details for comments:', error);
    setComments([]);
  }
};


/**
 * Function to send a notification to the creator of a video.
 * @param {string} creatorId - ID of the user who created the video.
 * @param {object} notification - Notification object to be added.
 * 
 * 
 */const sendNotification = async (creatorId, notification, currentUserId) => {
  // Do not send a notification to yourself
  if (creatorId === currentUserId) return;

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

    
    console.log(userData.username)
    const newComment = {
      userId,
      username: userData.username,
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
    
    await sendNotification(creatorId, notification, userId);

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
      await sendNotification(creatorId, notification, currentUserId);
    }

    // Update the state in the VideoWatch component
    setVideos(prevVideos => prevVideos.map(video => 
      video.id === videoId
        ? { ...video, likes: updatedLikes }
        : video
    ));

    // toast.success(isLiked ? 'Like removed' : 'Liked successfully!');
  } catch (error) {
    console.error('Error handling like:', error);
    // toast.error('Error handling like');
  }
};

export const handleVideoVote = async (videoId, currentUserId, setVideos, votedVideos) => {
  try {
    const videoRef = doc(db, 'videos', videoId);
    const videoDoc = await getDoc(videoRef);
    const videoData = videoDoc.data();
    const votes = videoData.votes || [];
    const competitionId = videoData.competitionId;

    const userRef = doc(db, 'users', currentUserId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    const previousVoteVideoId = userData.votedCompetitions?.[competitionId];

    if (previousVoteVideoId && previousVoteVideoId !== videoId) {
      const previousVideoRef = doc(db, 'videos', previousVoteVideoId);
      const previousVideoDoc = await getDoc(previousVideoRef);
      const previousVideoData = previousVideoDoc.data();
      const updatedPreviousVotes = previousVideoData.votes.filter(userId => userId !== currentUserId);
      await updateDoc(previousVideoRef, { votes: updatedPreviousVotes });

      const previousCreatorId = previousVideoData.userId;
      const unvoteNotification = {
        read: false,
        type: 'vote',
        timestamp: Date.now(),
        competitionId,
        text: `${userData.username} removed their vote from your video`,
      };
      await sendNotification(previousCreatorId, unvoteNotification, currentUserId);

      setVideos(prevVideos => {
        if (!Array.isArray(prevVideos)) {
          console.error('prevVideos is not an array:', prevVideos);
          return prevVideos;
        }
        return prevVideos.map(video =>
          video.id === previousVoteVideoId
            ? { ...video, votes: updatedPreviousVotes }
            : video
        );
      });
    }

    const updatedVotes = votes.includes(currentUserId)
      ? votes.filter(userId => userId !== currentUserId)
      : [...votes, currentUserId];

    await updateDoc(videoRef, { votes: updatedVotes });

    if (!votes.includes(currentUserId)) {
      const creatorId = videoData.userId;
      const voteNotification = {
        read: false,
        type: 'vote',
        timestamp: Date.now(),
        competitionId,
        text: `${userData.username} voted for your video!`,
      };
      await sendNotification(creatorId, voteNotification, currentUserId);
    }

    const updatedVotedCompetitions = { ...userData.votedCompetitions, [competitionId]: videoId };
    await updateDoc(userRef, { votedCompetitions: updatedVotedCompetitions });

    setVideos(prevVideos => {
      if (!Array.isArray(prevVideos)) {
        console.error('prevVideos is not an array:', prevVideos);
        return prevVideos;
      }
      return prevVideos.map(video =>
        video.id === videoId
          ? { ...video, votes: updatedVotes }
          : video
      );
    });

    toast.success(votes.includes(currentUserId) ? 'Vote removed' : 'Voted successfully!');
  } catch (error) {
    console.error('Error handling vote:', error);
    toast.error('Error handling vote');
  }
};

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
      type: 'comment',
      timestamp: Date.now(),
      competitionId: videoData.competitionId,
      text: `${userData.username} liked your comment`, // Assuming videoData has a username field
    };
    await sendNotification(creatorId, notification, currentUserId);

    toast.success(updatedLikes.includes(currentUserId) ? 'Comment liked!' : 'Comment unliked!');
  } catch (error) {
    console.error('Error liking/unliking comment:', error);
    toast.error('Error liking/unliking comment');
  }
};

 export const handleDeleteComment = async (videoId, commentTimestamp, setComments, setCommentLoading) => {
  setCommentLoading(true);
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
    setCommentLoading(false);
  }
};

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

// Function to handle video sharing by copying the URL to the clipboard
export const handleVideoShare = async (videoUrl) => {
  try {
    await navigator.clipboard.writeText(window.location.href);
    toast.success('Current link copied to clipboard!');
  } catch (error) {
    console.error('Failed to copy the current link:', error);
    toast.error('Failed to copy the current link');
  }
};



