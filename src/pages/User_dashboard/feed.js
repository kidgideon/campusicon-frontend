import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../config/firebase_config";

export const handleVideoLike = async (videoId, isLiked, currentUserId, updateVideoLikes) => {
  try {
    // Optimistically update the UI
    updateVideoLikes(videoId, currentUserId, !isLiked);

    const videoRef = doc(db, "feeds", videoId);
    const videoDoc = await getDoc(videoRef);
    const videoData = videoDoc.data();
    const likes = videoData.likes || [];

    // Determine the updated likes array
    const updatedLikes = isLiked
      ? likes.filter((userId) => userId !== currentUserId)
      : [...likes, currentUserId];

    // Update the Firestore document
    await updateDoc(videoRef, { likes: updatedLikes });

    // Send a notification if the user liked the video
    if (!isLiked) {
      const creatorId = videoData.userId;
      const notification = {
        read: false,
        type: "like",
        timestamp: Date.now(),
        competitionId: videoData.competitionId,
        text: `${currentUserId} liked your video!`,
      };

      // Call sendNotification (ensure the implementation is defined elsewhere)s
    }
  } catch (error) {
    console.error("Error handling like:", error);

    // Revert the optimistic update in case of an error
    updateVideoLikes(videoId, currentUserId, isLiked);
  }
};
