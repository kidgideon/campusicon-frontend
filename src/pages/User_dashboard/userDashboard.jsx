import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link} from "react-router-dom"; // For navigation
import { db, auth } from "../../../config/firebase_config"; // Firebase imports
import { onAuthStateChanged } from "firebase/auth"; // Auth state listener
import { doc, getDoc, collection, onSnapshot } from "firebase/firestore"; // Firestore functions
import "./userDashboard.css";
import { useQuery } from '@tanstack/react-query';
import { handleVideoLike, handleFeedLike,
  handlePostComment,
  handleCommentLike,
  handleDeleteComment,
  handleEditComment } from "./feed.js";
import Spinner from '../../assets/loadingSpinner.jsx'
import { toast } from 'react-hot-toast';
import Skeleton from "../competition/competionSkeleton.jsx"

const whiteLogo =
  "https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/campusicon.lightlogo.jpg?alt=media&token=00ac4bd4-f813-409d-a534-70b2c472bd04";

const defaultProfilePictureURL =
  "https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media";

const UserDashboard = () => {
  const [user, setUser] = useState(null); // Store user data
  const [loading, setLoading] = useState(true); // For loading state
  const navigate = useNavigate(); // Navigation hook
  const [feeds, setFeeds] = useState([]);
  const [scrollingUp, setScrollingUp] = useState(true); // To track scroll direction
  const [selectedFeed, setSelectedFeed] = useState(null);  // To keep track of the selected feed for comments
  const [showCommentPanel, setShowCommentPanel] = useState(false);  // To toggle the comment panel visibility
  const [comments, setComments] = useState([]);
  const videoRefs = useRef([]);
  const commentPanelRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState([])
  const [loadingCommentLikes, setLoadingCommentLikes] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1); // For image zooming
  const [lastTapTime, setLastTapTime] = useState(0); // For double-tap detection
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [zoomingImageId, setZoomingImageId] = useState(null); // Tracks the currently zooming image
  const [authInitialized, setAuthInitialized] = useState(false); // Track auth in
  const [iconPopup, setIconPopup] = useState(false);

   // Fetch user data with React Query
 const { data: userData, isLoading: userLoading, error: userError } = useQuery({
  queryKey: ["user"],
  queryFn: async () => {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          try {
            const userDocRef = doc(db, "users", currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              resolve({ uid: currentUser.uid, ...userDoc.data() });
            } else {
              reject(new Error("User document does not exist."));
            }
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error("User not authenticated"));
        }
      });
    });
  },

});

useEffect(() => {
  if (userData) {
    setUser(userData);
    setLoading(false); // Once the user data is loaded, set loading to false
  }
}, [userData]);

  useEffect(() => {
    const handlePopState = (event) => {
      if (showCommentPanel) {
        closeCommentPanel(); // Close the comment panel if it's open
      } else {
        history.go(-1); // Otherwise, let the back button work normally
      }
    };
  
    window.addEventListener('popstate', handlePopState);
  
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [showCommentPanel]); // Listen to showCommentPanel changes
  
  

  useEffect(() => {
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.play();
        } else {
          video.pause();
        }
      });
    }, {
      threshold: 0.5, // Trigger when 50% of the video is in view
    });

    videoRefs.current.forEach(video => observer.observe(video));

    return () => {
      videoRefs.current.forEach(video => observer.unobserve(video));
    };
  }, [feeds]); // Re-run the observer setup when feeds change

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setScrollingUp(false);
      } else {
        setScrollingUp(true);
      }
      lastScrollY = window.scrollY; // Update the last scroll position
    };
  
    // Only add the event listener if the comment panel is not visible
    if (!showCommentPanel && !iconPopup) {
      window.addEventListener("scroll", handleScroll);
    } else {
      // Disable body scroll when the panel is open
      document.body.style.overflow = "hidden";
    }
  
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.overflow = ""; // Reset body scroll on cleanup
    };
  }, [showCommentPanel, navigate]);
  
  let lastScrollY = 0; // Store the last scroll position
  


// Fetch feeds data with React Query, only if user is authenticated
const { data: feedsData, isLoading: feedsLoading, error: feedsError } = useQuery({
  queryKey: ["feeds"],
  queryFn: async () => {
    const feedsCollectionRef = collection(db, "feeds");
    return new Promise((resolve) => {
      const unsubscribe = onSnapshot(feedsCollectionRef, (snapshot) => {
        resolve(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );
      });
    });
  },
  enabled: !!user, // Only fetch feeds if user is authenticated
  staleTime: 1000 * 60 * 2, // 2 minutes
  cacheTime: 1000 * 60 * 5, // 5 minutes
});

useEffect(() => {
  if (feedsData) {
    setFeeds(feedsData);
  }
}, [feedsData]);

// Handle loading states
if (userLoading || feedsLoading) {
  return <Skeleton />;
}

if (!user || !feedsData) {
  return <Skeleton />;
}
//  checks if the user has not completed his or her profile 


  const toggleLike = (video) => {
    const isLiked = video.likes.includes(user.uid);
    handleVideoLike(video.id, isLiked, user.uid, updateVideoLikes);
  };

  // Helper for optimistic UI updates
  const updateVideoLikes = (videoId, userId, isAddingLike) => {
    setFeeds((prevVideos) =>
      prevVideos.map((video) =>
        video.id === videoId
          ? {
              ...video,
              likes: isAddingLike
                ? [...video.likes, userId]
                : video.likes.filter((id) => id !== userId),
            }
          : video
      )
    );
  };

  
const handleToggleCommentPanel = async (feedId) => {
  setShowCommentPanel(feedId); // Open the comment panel
  setNewComment('');
  setCommentLoading(true);

  // Push state to track comment panel visibility in history
  history.pushState({ commentPanelOpen: true }, '');

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

const closeCommentPanel = () => {
  setShowCommentPanel(null); // Close the comment panel
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
      toast.error("you are not logged in")
    navigate("/login")
    }

    await handlePostComment(feedId, user.uid, newComment, setComments, commentPanelRef);
    setNewComment('');
  } catch (error) {
    console.error('Error posting comment:', error);
    toast.error('Failed to post comment.');
  } finally {
    setCommentLoading(false);
  }
};


  return (
    <div className="user-feed-interface">
      {/* Top Section */}
      <div
        className={`user-feed-interface-top ${
          scrollingUp ? "visible" : "hidden"
        }`}
      >
        <div className="top-outliner">
          <div className="user-dp-div">
             <Link to={"/menu"}>
             <img
              src={user?.profilePicture || defaultProfilePictureURL}
              className="company-logo"
              alt="user-profile"
            />
             </Link>
            <div>
              <img
                style={{ marginLeft: "-15px" }}
                src={whiteLogo}
                className="company-logo"
                alt="company-logo"
              />
            </div>
            <div>
              <h1 style={{ padding: "0px", margin: "0px", color: "white", fontSize: "5px" }}>
                hi
              </h1>
            </div>
          </div>
        </div>
        <p>For you</p> {/* Display user name if available */}
      </div>

      {/* Feeds */}
      <div className="user-feeds-container">
        <div className="user-feeds">
          {feeds.map((feed) => (
            <div key={feed.id} className="user-feed-feed-body">
              <div className="feed-top">
                <div className="right-side">
                  <img onClick={() => setIconPopup(true)} className="company-logo-feed" src={whiteLogo} alt="logo" />
                  <p  onClick={() => setIconPopup(true)}>Campusicon</p>
                </div>
                <div className="left-side">
                  <i className="fa-solid fa-ellipsis"></i>
                </div>
              </div>
              <div className="feed-context">
                <p>{feed.content}</p>
                <div className="feed-content">
                {feed.mediaType === "image" ? (
                  <img src={feed.mediaUrl} alt="Feed Media" className="feed-media" />
                ) : (
                  <video
                  ref={(el) => (videoRefs.current[feed.uid] = el)} // Assign video reference
                  src={feed.mediaUrl}
                  controls
                  className="feed-media"
                ></video>
                )}
              </div>
              <div className="feed-actions">
              <span>
              <i 
             onClick={() => toggleLike(feed)}
             style={{
              color: feed.likes?.includes(user.uid) ? "#277AA4" : "rgb(158, 158, 158)",
            }}
              className="fa-solid fa-thumbs-up like-button"></i> {feed.likes.length}
            </span>
                 <span><i className="fa-solid fa-comment"onClick={() => handleToggleCommentPanel(feed.id)}></i>
                 {feed.comments.length}
                 </span>
                 {showCommentPanel === feed.id && (
  <>
    {/* Comment Panel */}
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
              <Link to={`profile/${comment.username}`}>
              <img
                src={comment.userProfilePicture || defaultProfilePictureURL}
                alt="User"
                className="commenter-image"
              />
              </Link>
              <div className="comment-details">
                <Link to={`profile/${comment.username}`}>
                <p className="commenters-name">{comment.username || 'me'}</p>
                </Link>
                <p className="commenters-comment">{comment.text}</p>
              </div>

              <div className="comment-actions">
                {currentUser && (
                  <>
                    <i
                      className="fa-solid fa-heart"
                      onClick={() => handleCommentLikeClick(feed.id, comment.timestamp, user.uid, setComments)}
                      style={{ color: comment.likes.includes(user.uid) ? '#277AA4' : 'inherit' }}
                    />
                    <span>{comment.likes.length}</span>
                  </>
                )}

                {loadingCommentLikes && (
                  <i className="fa fa-spinner fa-spin" style={{ marginLeft: '5px' }}></i>
                )}

                {user?.uid === comment.userId && (
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
  </>
)}
              </div>
              </div> 
            </div>
          ))}
        </div>
      </div>

      {
  iconPopup && (
    <div onClick={() => setIconPopup(false)} className="icon-div">
      {/* Your content goes here */}
      <div className="the-icon-area">
          <img src={whiteLogo} alt="" />
          <p>This is the icons profile</p>
          <p>it is out of reach to users under the icon level</p>
      </div>
    </div>
  )
}

 

      {/* Bottom Navigation */}
      <div
        className={`user-feed-interface-navigation-panel ${
          scrollingUp ? "visible" : "hidden"
        }`}
      >
        <span>
          <Link to={"/"}>
          <i style={{ color: "black" }} className="fa-solid fa-house"></i>
          </Link>
        </span>
        <span>
          <Link to={"/discovery-page"}>
          <i className="fa-solid fa-magnifying-glass"></i>
          </Link>
        </span>
        <span>
        <Link to={"/competitions"}>
        <i class="fa-solid fa-trophy"></i>
        </Link>
        </span> 
        <span>
          <Link to={"/notifications"}>
          <i className="fa-solid fa-bell"></i>
          </Link>
        </span>
        <span>
       <Link to={"/ads"}>
       <i class="fa-solid fa-bullhorn"></i>
       </Link>
        </span>
      </div>
    </div>
  );
};

export default UserDashboard;
