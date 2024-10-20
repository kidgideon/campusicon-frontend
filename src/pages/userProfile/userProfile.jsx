import React, { useEffect, useState , useRef} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs , getDoc} from 'firebase/firestore';
import { auth, db } from '../../../config/firebase_config';
import '../userProfile/profile.css';
import ReactPlayer from 'react-player';
import normalStarAwards from '../../assets/starCup.png';
import superCupAwards from '../../assets/superCup.png';
import iconAwards from '../../assets/iconCup.png';
import {handleVideoLike, handlePostComment, handleCommentLike, handleDeleteComment, handleEditComment } from "../competition/videoUtils"
const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creators, setCreators] = useState({});
  const [awardCounts, setAwardCounts] = useState({ normal: 0, super: 0, icon: 0 });
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState({});
  const [showCommentPanel, setShowCommentPanel] = useState(null);
  const navigate = useNavigate();
  const commentPanelRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null); // Define currentUser state
  const [likedComments, setLikedComments] = useState({});
  const [loadingVotes, setLoadingVotes] = useState(false);
  const [loadingCommentLikes, setLoadingCommentLikes] = useState(false);


  const { username } = useParams();

  useEffect(() => {
    // Fetch user data from Firestore based on the username
    const fetchUser = async () => {
      try {
        const q = query(collection(db, 'users'), where('username', '==', username));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          const userEmail = userData.email; // Get the email of the user being viewed

          // Get the current user from Firebase authentication
          const currentUser = auth.currentUser;
      
   setCurrentUser(currentUser)
          if (currentUser && currentUser.email === userEmail) {
            // If the current logged-in user is viewing their own profile, redirect to '/profile'
            navigate('/profile', { replace: true });
            return;
          }

          const userDocId = querySnapshot.docs[0].id;

          // Check if the 'win' field exists
          if (!userData.win) {
            userData.win = []; // Initialize the win field locally as well
          }

          // Calculate the count of each award type
          const counts = { normal: 0, super: 0, icon: 0 };
          userData.win.forEach((win) => {
            if (win.awardType === 'Normal Star Award') {
              counts.normal += 1;
            } else if (win.awardType === 'Super Star Award') {
              counts.super += 1;
            } else if (win.awardType === 'Icon Award') {
              counts.icon += 1;
            }
          });

          setAwardCounts(counts);
          setUser(userData);

          // Fetch the user's videos
          await fetchUserVideos(userDocId);

        } else {
          console.log('No user found');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserVideos = async (userId) => {
      try {
        const videosQuery = query(collection(db, 'videos'), where('userId', '==', userId));
        const videoSnapshot = await getDocs(videosQuery);
        const fetchedVideos = [];

        const fetchedCreators = {};
        for (const doc of videoSnapshot.docs) {
          const videoData = doc.data();
          videoData.id = doc.id;
          fetchedVideos.push(videoData);

          // Optionally, fetch the creator's information if not already available
          if (!fetchedCreators[videoData.userId]) {
            const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', videoData.userId)));
            if (!userDoc.empty) {
              fetchedCreators[videoData.userId] = userDoc.docs[0].data();
            }
          }
        }
        setVideos(fetchedVideos);
        setCreators(fetchedCreators);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchUser();
  }, [username, navigate]);

  if (loading) {
    return <div>Loading...</div>; // Replace with your custom spinner
  }

  if (!user) {
    return <div>User not found</div>;

  }

  
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

  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <LoadingScreen />; 
  }

  if (!user) {
    return <div>No user logged in</div>;
  }

  function calculateCampusStatus(points) {
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

    for (const tier of campusStatusTiers) {
      if (points >= tier.minPoints && points <= tier.maxPoints) {
        return tier.status;
      }
    }
    return 'Invalid Points';
  }

  const campusStatus = calculateCampusStatus(user.points);


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
comments[video.id]?.map((comment) => (
  <div key={comment.timestamp} className="comment">
    <img src={comment.userProfilePicture || defaultProfilePictureURL} alt="User" className="commenter-image"/>
    
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

export default UserProfile;