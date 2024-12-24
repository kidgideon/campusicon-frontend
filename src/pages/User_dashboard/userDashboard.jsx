import React, { useState, useEffect } from "react";
import { useNavigate, Link} from "react-router-dom"; // For navigation
import { db, auth } from "../../../config/firebase_config"; // Firebase imports
import { onAuthStateChanged } from "firebase/auth"; // Auth state listener
import { doc, getDoc, collection, onSnapshot } from "firebase/firestore"; // Firestore functions
import "./userDashboard.css";
import { handleVideoLike } from "./feed.js";


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
  let lastScrollY = 0; // Store the last scroll position

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // User is logged in, fetch their data from Firestore
        try {
          const userDocRef = doc(db, "users", currentUser.uid); // Reference to user's document
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUser({ uid: currentUser.uid, ...userDoc.data() }); // Save user data
          } else {
            console.error("User document does not exist.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        // User is not logged in, redirect to login page
        navigate("/login");
      }
      setLoading(false); // Loading complete
    });

    const feedsCollectionRef = collection(db, "feeds");
    const unsubscribeFeeds = onSnapshot(feedsCollectionRef, (snapshot) => {
      const feedsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFeeds(feedsData);
    });

    // Listen to scroll events
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        // Scrolling down
        setScrollingUp(false);
      } else {
        // Scrolling up
        setScrollingUp(true);
      }
      lastScrollY = window.scrollY; // Update the last scroll position
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup the listener on unmount
    return () => {
      unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [navigate]);

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

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator while data is being fetched
  }

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
                  <img className="company-logo-feed" src={whiteLogo} alt="logo" />
                  <p>Campusicon</p>
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
                  <video src={feed.mediaUrl} controls className="feed-media"></video>
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
                 <span><i className="fa-solid fa-comment"></i>
                 {feed.comments.length} 
                 </span>
              </div>
              </div> 
            </div>
          ))}
        </div>
      </div>

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
