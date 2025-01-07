import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../../config/firebase_config'; // Adjust this path to your Firebase configuration file
import './video.css';
import { useNavigate } from "react-router-dom"; // For navigation
import Skeleton from '../Notification/skeleton'

const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';

const VideoBody = () => {
    const { videoId } = useParams(); // Extract videoId from route params
    const [videoData, setVideoData] = useState(null);
    const [creatorData, setCreatorData] = useState(null);
    const [commenters, setCommenters] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVideoAndCreatorDetails = async () => {
            setIsLoading(true);
            try {
                // Fetch video details
                const videoRef = doc(db, 'videos', videoId);
                const videoSnap = await getDoc(videoRef);

                if (!videoSnap.exists()) {
                    throw new Error('Video not found');
                }

                const videoDetails = videoSnap.data();
                setVideoData(videoDetails);

                // Fetch creator details using the userId from the video data
                const userRef = doc(db, 'users', videoDetails.userId);
                const userSnap = await getDoc(userRef);

                if (userSnap.exists()) {
                    setCreatorData(userSnap.data());
                } else {
                    throw new Error('Creator not found');
                }

                // Fetch commenter details
                const commentUserIds = videoDetails.comments.map(comment => comment.userId);
                const commentersDetails = {};
                for (const userId of commentUserIds) {
                    if (!commentersDetails[userId]) {
                        const userRef = doc(db, 'users', userId);
                        const userSnap = await getDoc(userRef);
                        if (userSnap.exists()) {
                            commentersDetails[userId] = userSnap.data();
                        } else {
                            commentersDetails[userId] = { username: 'Unknown', profilePicture: defaultProfilePictureURL };
                        }
                    }
                }
                setCommenters(commentersDetails);

            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVideoAndCreatorDetails();
    }, [videoId]);

    const handleShare = (name, id) => {
        if (navigator.share) {
            navigator.share({
                title: `Check out ${name}'s video on Campus Icon`,
                text: 'Join the best talent competition in Nigeria and win cash prizes. Visit now!',
                url: `https://www.campusicon.ng/video/${id}`, // Include the full URL with protocol
            })
            .then(() => console.log('Share successful!'))
            .catch((error) => console.error('Error sharing:', error));
        } else {
            console.log("Sharing not supported on this device.");
        }
    };
    

    const goBack = () => {
        navigate(-1);
    };

    if (isLoading) {
        return <Skeleton/>
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
                <i className="fas fa-arrow-left " onClick={goBack}></i>
                <h2>{creatorData.firstName} {creatorData.lastName}'s post</h2>
            </div>
            <div className="single-video-interface-layout-player-container">
                <div className="single-video-interface-layout-creator-profile">
                    <div className="single-video-interface-creator-props">
                        <img src={creatorData.profilePicture || defaultProfilePictureURL}
                            alt="Creator"
                            className="single-video-interface-layout-creator-profile-picture"
                        />
                        <p className="single-video-interface-layout-creator-name">{creatorData.username}</p>
                    </div>
                    <div className="eclipse-area-single-video-interface">
                        <i className="fa-solid fa-ellipsis"></i>
                    </div>
                </div>

                <video
                    src={videoData.videoURL}
                    controls
                    onError={(e) => console.error("Error loading video:", e)}
                    className="single-video-interface-layout-player"
                />

                <div className="single-video-interface-layout-details">
                    <h2 className="single-video-interface-layout-title">{videoData.title}</h2>
                    <p className="single-video-interface-layout-description">{videoData.description}</p>
                </div>
                <div className="single-video-interface-layout-engagement">
                    <span><i className="fa-solid fa-heart"></i>{videoData.likes.length}</span>
                    <span><i className="fa-solid fa-comment"></i>{videoData.comments.length}</span>
                    <span><i className="fa-solid fa-thumbs-up"></i>{videoData.votes.length}</span>
                    <span><i onClick={() => handleShare(creatorData.name, videoData.videoId)} className="fa-solid fa-share-from-square"></i></span>
                </div>
                <div className="single-video-interface-layout-comments">
                    <h3 className="single-video-interface-layout-comments-header">Comments</h3>
                    {videoData.comments && videoData.comments.length > 0 ? (
                        <ul className="single-video-interface-layout-comments-list">
                            {videoData.comments.map((comment, index) => {
                                const commenter = commenters[comment.userId] || {};
                                return (
                                    <li key={index} className="single-video-interface-layout-comment-item">
                                        <div className="s-v-i-commenters-dp">
                                            <img src={commenter.profilePicture || defaultProfilePictureURL} alt="" />
                                        </div>
                                        <div className="s-v-i-commenters-text">
                                        <div>
                                            <p className='s-v-i-username'> 
                                            {commenter.username || 'Unknown User'}   
                                            </p>
                                            </div>
                                            <p>
                                            {comment.text}
                                                </p>
                                        </div>
                                        <div className="s-v-i">
                                            <i className="fa-solid fa-thumbs-up"></i>
                                            {comment.likes.length || 0}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="single-video-interface-layout-no-comments">No comments yet. Be the first to comment!</p>
                    )}
                </div>

                <div className="comment-send-input-area">
                    <input type="text" placeholder='make your comments' />
                    <i class="fa-brands fa-telegram"></i>
                </div>
            </div>
        </div>
    );
};

export default VideoBody;
