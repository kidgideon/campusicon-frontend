import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../../config/firebase_config';
import './video.css';
import Skeleton from '../Notification/skeleton';

const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';

const VideoBody = () => {
    const { videoId } = useParams();
    const [videoData, setVideoData] = useState(null);
    const [creatorData, setCreatorData] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visibleComments, setVisibleComments] = useState([]); // To manage the flow of comments

    // Fetch the current user's ID
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUserId(user ? user.uid : null);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchVideoAndCreatorDetails = async () => {
            setIsLoading(true);
            try {
                const videoRef = doc(db, 'videos', videoId);
                const videoSnap = await getDoc(videoRef);

                if (!videoSnap.exists()) {
                    throw new Error('Video not found');
                }

                const videoDetails = videoSnap.data();
                setVideoData(videoDetails);

                const userRef = doc(db, 'users', videoDetails.userId);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    setCreatorData(userSnap.data());
                } else {
                    throw new Error('Creator not found');
                }

                // Initialize visible comments
                setVisibleComments(videoDetails.comments.slice(-4)); // Show the last 4 comments initially
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVideoAndCreatorDetails();
    }, [videoId]);

    useEffect(() => {
        // Simulate new comments coming in every 3 seconds (you can adjust this)
        const interval = setInterval(() => {
            if (videoData?.comments?.length > 0) {
                setVisibleComments((prev) => {
                    const nextIndex = (prev[prev.length - 1]?.index || 0) + 1;
                    const nextComment = videoData.comments[nextIndex % videoData.comments.length];
                    return [...prev.slice(1), nextComment];
                });
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [videoData]);

    if (isLoading) {
        return <Skeleton />;
    }

    if (error) {
        return <div className="single-video-interface-layout-error">{error}</div>;
    }

    if (!videoData || !creatorData) {
        return <div className="single-video-interface-layout-error">Incomplete data</div>;
    }

    return (
        <div className="single-video-interface-layout-body">
            <div className="top-top-sideliners">
                <i className="fas fa-arrow-left" onClick={() => navigate(-1)}></i>
                <h2>{creatorData.firstName} {creatorData.lastName}'s post</h2>
            </div>
            <div className="single-video-interface-layout-player-container">
                <video
                    src={videoData.videoURL}
                    controls
                    onError={(e) => console.error('Error loading video:', e)}
                    className="single-video-interface-layout-player"
                />
                <div className="floating-comments">
                    {visibleComments.map((comment, index) => (
                        <div key={index} className="comment-item" style={{ animationDelay: `${index * 1.5}s` }}>
                            <img
                                src={comment.profilePicture || defaultProfilePictureURL}
                                alt="User"
                                className="comment-profile-picture"
                            />
                            <div className="comment-content">
                                <span className="comment-username">{comment.username || 'Anonymous'}</span>
                                <p>{comment.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VideoBody;
