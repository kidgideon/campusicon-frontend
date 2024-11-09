import React, { useState, useRef, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../../config/firebase_config';
import { useQuery } from '@tanstack/react-query';
import ReactPlayer from 'react-player';
import '../userProfile/profile.css';
import normalStarAwards from '../../assets/starCup.png';
import superCupAwards from '../../assets/superCup.png';
import iconAwards from '../../assets/iconCup.png';
import LoadingScreen from '../../assets/loadingSpinner'; // Custom spinner component
import { handleVideoLike, handlePostComment, handleCommentLike, handleDeleteComment, handleEditComment } from "../competition/videoUtils";

const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';


// Function to fetch user videos
const fetchUserVideos = async (userId) => {
  const videosQuery = query(collection(db, 'videos'), where('userId', '==', userId));
  const videoSnapshot = await getDocs(videosQuery);
  const fetchedVideos = [];

  for (const doc of videoSnapshot.docs) {
    const videoData = doc.data();
    videoData.id = doc.id;
    fetchedVideos.push(videoData);
  }

  return fetchedVideos; // Return the sorted fetched videos
};

// Function to fetch creators based on an array of videos
const fetchCreators = async (videos) => {
  const fetchedCreators = {};

  for (const video of videos) {
    if (!fetchedCreators[video.userId]) {
      const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', video.userId)));
      if (!userDoc.empty) {
        fetchedCreators[video.userId] = userDoc.docs[0].data();
      }
    }
  }
  return fetchedCreators; // Return the fetched creators
};


const CurrentUserProfile = () => {
 
const [videos, setVideos] = useState([]);
const [loading, setLoading] = useState(true);
const [creators, setCreators] = useState({});
const [awardCounts, setAwardCounts] = useState({ normal: 0, super: 0, icon: 0 });
const [commentLoading, setCommentLoading] = useState(false);
const [newComment, setNewComment] = useState('');
const [comments, setComments] = useState({});
const [showCommentPanel, setShowCommentPanel] = useState(null);
const [votedVideos, setVotedVideos] = useState({});
const navigate = useNavigate();
const commentPanelRef = useRef(null);
const [currentUser, setCurrentUser] = useState(null); // Define currentUser state
const [likedComments, setLikedComments] = useState({});
const [loadingVotes, setLoadingVotes] = useState(false);
const [loadingCommentLikes, setLoadingCommentLikes] = useState(false);
const [playingVideoId, setPlayingVideoId] = useState(null);



useEffect(() => {
  // Track Firebase authentication state changes
  const unsubscribe = auth.onAuthStateChanged((user) => {
    if (user) {
      setCurrentUser(user);
      console.log(currentUser.uid)
    } else {
      setCurrentUser(null);
    }
  });
  return () => unsubscribe();
}, []);

const { data: user, isLoading } = useQuery({
  queryKey: ['userProfile'],
  queryFn: async () => {
    if (!currentUser) throw new Error("No user logged in");

    const userQuery = query(collection(db, 'users'), where('email', '==', currentUser.email));
    const querySnapshot = await getDocs(userQuery);
    if (querySnapshot.empty) throw new Error("User not found");

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Initialize missing fields and calculate award counts
    const updates = {};
    if (!userData.win) updates.win = [];
    if (!userData.hobbies) updates.hobbies = [];
    if (!userData.campus) updates.campus = 'No campus added yet.';
    if (Object.keys(updates).length > 0) await updateDoc(userDoc.ref, updates);

    const counts = { normal: 0, super: 0, icon: 0 };
    userData.win.forEach((win) => {
      if (win.awardType === 'Normal Star Award') counts.normal++;
      else if (win.awardType === 'Super Star Award') counts.super++;
      else if (win.awardType === 'Icon Award') counts.icon++;
    });
    setAwardCounts(counts);

    return { ...userData, ...updates };
  },
  enabled: !!currentUser,
  staleTime: 20 * 60 * 1000,
  cacheTime: 60 * 60 * 1000,
  onSuccess: (data) => setVideos([]),
});
// Fetch user videos when user data is available
const { data: savedVideos, isLoading: loadingVideos } = useQuery({
  queryKey: ['videos', currentUser?.uid],
  queryFn: () => fetchUserVideos(currentUser.uid),
  enabled: !!currentUser, // Only run this query if currentUser is available
  onSuccess: (fetchedVideos) => {
    const sortedFetchedVideos = (fetchedVideos || []).sort((a, b) => b.timestamp - a.timestamp);
    setVideos(sortedFetchedVideos);
  },
});

// Fetch creators based on the saved videos when user videos are available
const { data: savedCreators, isLoading: creatorLoading } = useQuery({
  queryKey: ['creators', savedVideos],
  queryFn: () => fetchCreators(savedVideos),
  enabled: !!savedVideos, // Only run this query if savedVideos is available
  onSuccess: () => {
    setCreators(savedCreators)
  },
});
  const calculateCampusStatus = (points) => {
    const campusStatusTiers = [
      { status: 'Lad', minPoints: 0, maxPoints: 499 },
      { status: 'Rising Star', minPoints: 500, maxPoints: 1499 },
      { status: 'Pace Setter', minPoints: 1500, maxPoints: 2499 },
      { status: 'Influencer', minPoints: 2500, maxPoints: 3499 },
      { status: 'Social Maven', minPoints: 3500, maxPoints: 4499 },
      { status: 'Iconic Figure', minPoints: 4500, maxPoints: 5499 },
      { status: 'Trailblazer', minPoints: 5500, maxPoints: 6499 },
      { status: 'Legend', minPoints: 6500, maxPoints: 7499 },
      { status: 'Campus Legend', minPoints: 7500, maxPoints: 8499 },
      { status: 'Campus Icon', minPoints: 8500, maxPoints: 10000 },
    ];

    return campusStatusTiers.find((tier) => points >= tier.minPoints && points <= tier.maxPoints)?.status || 'Invalid Points';
  };

  const campusStatus = calculateCampusStatus(user?.points || 0);

  const goBack = () => navigate(-1);

  
const handleOpenComments = async (videoId) => {
  setShowCommentPanel(videoId);
  setNewComment('');
  setLikedComments((prev) => ({ ...prev, [videoId]: {} })); // Reset liked comments state for the current video

  // Fetch comments and show loading spinner
  setCommentLoading(true);
  const videoRef = doc(db, 'videos', videoId);
  const videoDoc = await getDoc(videoRef);
  const videoData = videoDoc.data();
  const fetchedComments = videoData.comments || [];

  // Retrieve the details of each comment's creator
  const commentsWithUserDetails = await Promise.all(
    fetchedComments.map(async (comment) => {
      const userRef = doc(db, 'users', comment.userId);  // Get the user document based on userId
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          ...comment,
          username: userData.username || 'Unknown User',  // Add username from the user document
          userProfilePicture: userData.profilePicture || defaultProfilePictureURL,  // Add profile picture
        };
      } else {
        return {
          ...comment,
          username: 'Unknown User',
          userProfilePicture: defaultProfilePictureURL,
        };
      }
    })
  );

  setComments((prevComments) => ({
    ...prevComments,
    [videoId]: commentsWithUserDetails,  // Save the comments with user details
  }));

  setCommentLoading(false);  // Hide the loading spinner after fetching data
};

const handleCommentLikeClick = async (videoId, commentTimestamp, currentUserId, setComments) => {
  setLoadingCommentLikes(true); // Start loading

  try {
    await handleCommentLike(videoId, commentTimestamp, currentUserId, setComments);
  } catch (error) {
    console.error('Error liking comment:', error);
    toast.error('Error liking comment');
  } finally {
    setLoadingCommentLikes(false); // Stop loading
  }
};


const handleSendComment = async (videoId) => {
  if (!newComment.trim()) {
    toast.error('Comment cannot be empty');
    return;
  }

  setCommentLoading(true);  // Set loading to true

  try {
    await handlePostComment(videoId, currentUser.uid, newComment, setComments, commentPanelRef);
    setNewComment('');  // Clear the comment input after successful post
  } catch (error) {
    console.error('Error posting comment:', error);
  } finally {
    setCommentLoading(false);  // Stop loading after the process completes
  }
};



const closeCommentPanel = () => {
  setShowCommentPanel(null);
};

  const handleDeletePost = async (videoId) => {
    // Ask for confirmation before deleting
    const confirmDelete = window.confirm('Are you sure you want to delete this post?, this post will still be visible in the competion interface');
    
    if (confirmDelete) {
      try {
        // Delete the video document from Firestore
        await deleteDoc(doc(db, 'videos', videoId));
        // Remove the video from the state to no longer display it in the UI
        setVideos((prevVideos) => prevVideos.filter((video) => video.id !== videoId));
        alert('Post deleted successfully');
      } catch (error) {
        console.error('Error deleting video:', error);
        alert('Failed to delete the post. Please try again.');
      }
    }
  };

  
  const handleVideoPlay = (videoId) => {
    setPlayingVideoId(videoId); // Set the currently playing video ID
  };

  const handleVideoPause = () => {
    setPlayingVideoId(null); // Reset when the video is paused
  };

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  if (isLoading) return <LoadingScreen />;

  if (!user) return <div>No user logged in</div>;

  return (
    <div className='profile-structure'>
       <div className="top-top-sideliners">
        <i className="fas fa-arrow-left " onClick={goBack}></i>
        <h2>Profile</h2>
      </div>

      <div className="profile-top">
        <div className="profile-pic-name">
          <div className="profile-pic">
            <img src={user.profilePicture || defaultProfilePictureURL} alt="Profile" />
          </div>
          <div className="fullname">
            <p>{user.firstName} {user.lastName}</p>
          </div>
        </div>
        <div className="points-status">
          <div className="campus-points">
            <p className='points'>{user.points}</p>
            <p className='p-text'>campus points</p>
          </div>
          <div className="campus-status">
            <p>{campusStatus}</p>
          </div>
        </div>
      </div>

      <div className="user-bio">
        <p>{user.bio}</p>
      </div>

      <button onClick={handleEditProfile} className="edit-profile-btn">Edit Profile</button>

      <div className="trophies">
        <div className="normal-star-award">
          <img className='award-img-profle' src={normalStarAwards} alt="Normal Star Award" />
          <p className='normal-star-count'>{awardCounts.normal}</p>
        </div>
        <div className='super-star-award'>
          <img className='award-img-profle' src={superCupAwards} alt="Super Star Award" />
          <p className='super-star-count'>{awardCounts.super}</p>
        </div>
        <div className='icon-award'>
          <img className='award-img-profle' src={iconAwards} alt="Icon Award" />
          <p className='icon-awards-count'>{awardCounts.icon}</p>
        </div>
      </div>

      <div className="user-campus-hobbies">
        <div className="user-campus">
          <strong>Campus: </strong>{user.campus}
        </div>
        <div className="user-hobbies">
          <strong>Hobbies: </strong>{user.hobbies.length > 0 ? user.hobbies.join(', ') : "No hobbies added yet."}
        </div>
      </div>

       <h3>posts</h3>

       <div className="video-watch-area">
  
  {videos.map((video) => (
    <div key={video.id} className="video-watch-item">
      <div className="video-watch-top">
        <div className="video-creator-profile">
          <div className="video-watch-profile-picture">
            <img 
              src={creators[video.userId]?.profilePicture || defaultProfilePictureURL} 
              alt="Creator Profile" 
            />
          </div>
          <div className="video-watch-username">
            {creators[video.userId]?.username || 'Unknown User'}
          </div>
        </div>
      </div>
      
      <div className="video-watch-video-body">
        <ReactPlayer 
          url={video.videoURL} 
          controls 
          width="100%" 
          height="auto" 
          playing={playingVideoId === video.id} // Control playback
          onPlay={() => handleVideoPlay(video.id)} // Handle play event
          onPause={handleVideoPause} // Handle pause event
        />
      </div>
      
      <div className="video-watch-video-data">
        <p>{video.description}</p>
      </div>
      
      <div className="video-watch-icon-and-button">
        <div className="like" onClick={() => handleVideoLike(video.id, video.likes.includes(currentUser.uid), currentUser.uid, setVideos)}>
          <i 
            className="fa-solid fa-heart" 
            style={{ color: video.likes.includes(currentUser.uid) ? '#277AA4' : 'inherit' }} // Apply company color if liked
          />
          <span>{video.likes.length}</span>
        </div>
        <div className="comment" onClick={() => handleOpenComments(video.id)}>
          <i className="fa-solid fa-comment" />
          <span>{video.comments.length}</span>
        </div>
        

        <div className="video-delete-button">
    <i className="fa-solid fa-trash" onClick={() => handleDeletePost(video.id)}></i>
  </div>
      </div>

    {/* Comment Panel (only show if open) */}
    {showCommentPanel === video.id && (
<div className="comment-panel" id={`comment-panel-${video.id}`} ref={commentPanelRef}>

<div className="comment-header">
<h3>Comments</h3>
<i className="fa-solid fa-x" onClick={closeCommentPanel}></i>
</div>

<div className="comment-input">
<input
  ref={commentPanelRef} 
  placeholder="Type a comment"
  value={newComment}
  onChange={(e) => setNewComment(e.target.value)}
/>
<button className="send-comment-btn" onClick={() => handleSendComment(video.id)}>
  Send
</button>
</div>

<div className="comment-body">
{commentLoading ? (
<Spinner />
) : (
// Sort comments by timestamp in descending order
comments[video.id]
?.slice() // Use slice to avoid mutating the original array
.sort((a, b) => b.timestamp - a.timestamp) // Sort by timestamp (newest first)
.map((comment) => (
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
        onClick={() => handleCommentLikeClick(video.id, comment.timestamp, currentUser.uid, setComments)}
        style={{ color: comment.likes.includes(currentUser.uid) ? '#277AA4' : 'inherit' }}
      />
      <span>{comment.likes.length}</span>

      {/* Optional: Display loading indicator next to the like button */}
      {loadingCommentLikes && <i className="fa fa-spinner fa-spin" style={{ marginLeft: '5px' }}></i>}

      {comment.userId === currentUser.uid && (
        <>
          <i 
            className="fa-solid fa-pen-to-square" 
            onClick={() => handleEditComment(video.id, comment.timestamp, prompt('Edit your comment:', comment.text), setComments, setCommentLoading)}
          ></i>
          <i 
            className="fa-solid fa-trash" 
            onClick={() => handleDeleteComment(video.id, comment.timestamp, setComments, setCommentLoading)}
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
  ))}
</div>

   
    </div>
  );
};

export default CurrentUserProfile;

 