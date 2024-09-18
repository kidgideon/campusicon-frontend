import React, { useState, useEffect } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, getDoc, doc, updateDoc, query, where, getDocs, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { storage, db, auth } from '../../../config/firebase_config'; // Firebase config
import Spinner from '../../assets/loadingSpinner'; // Spinner component
import './uploadvideo.css'; // Add some styles for the form
import { useParams, useNavigate } from 'react-router-dom';

const UploadVideoForm = () => {
  const { competitionId } = useParams(); // Get competition ID from route params
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewURL, setVideoPreviewURL] = useState(null); // Store video preview URL
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentUser, setCurrentUser] = useState(null); // Store current user
  const [competitionVideos, setCompetitionVideos] = useState([]); // Store competition videos
  const [competitionName, setCompetitionName] = useState(''); // Store competition name
  const [showTrashIcon, setShowTrashIcon] = useState(false); // State to manage trash icon visibility
  const [username, setUsername] = useState(''); // Store username from Firestore

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Fetch the username from Firestore based on the user's email
        const userQuery = query(collection(db, 'users'), where('email', '==', user.email));
        const userSnapshot = await getDocs(userQuery);
        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0].data();
          setUsername(userDoc.username); // Store username from Firestore
        } else {
          toast.error('User not found in Firestore');
        }
      } else {
        toast.error('You must be logged in to upload a video');
        navigate('/login');
      }
    });

    const fetchCompetitionDetails = async () => {
      try {
        const docRef = doc(db, 'competitions', competitionId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const competitionData = docSnap.data();
          setCompetitionVideos(competitionData.videos || []);
          setCompetitionName(competitionData.name); // Store competition name

          // Check if the current user has already uploaded a video for this competition
          if (currentUser) {
            const userVideoExists = competitionData.videos.some(video => video.userId === currentUser.uid);
            if (userVideoExists) {
              toast.error('You have already uploaded a video for this competition.');
              navigate(`/competition/${competitionId}`);
            }
          }
        } else {
          toast.error('Competition not found');
        }
      } catch (err) {
        toast.error('Error fetching competition data');
      }
    };

    if (currentUser) {
      fetchCompetitionDetails();
    }

    return () => {
      unsubscribeAuth(); // Cleanup subscription on unmount
      // Revoke the object URL when the component unmounts
      if (videoPreviewURL) {
        URL.revokeObjectURL(videoPreviewURL);
      }
    };
  }, [competitionId, navigate, videoPreviewURL, currentUser]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Revoke the previous object URL if it exists
      if (videoPreviewURL) {
        URL.revokeObjectURL(videoPreviewURL);
      }
      setVideoFile(file);
      const newVideoPreviewURL = URL.createObjectURL(file);
      setVideoPreviewURL(newVideoPreviewURL);
      setShowTrashIcon(true); // Show trash icon when a video is selected
    }
  };

  const handleTrashIconClick = () => {
    setVideoFile(null);
    setVideoPreviewURL(null);
    setShowTrashIcon(false); // Hide trash icon when the video is removed
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !description || !videoFile || !currentUser || !username) {
      toast.error('Please fill in all fields, choose a video, and ensure you are logged in.');
      return;
    }

    setUploading(true);

    const storageRef = ref(storage, `videos/${currentUser.uid}/${videoFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, videoFile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress); // Track progress in %
      },
      (error) => {
        toast.error('Error uploading video: ' + error.message);
        setUploading(false);
      },
      async () => {
        // On success
        const videoURL = await getDownloadURL(uploadTask.snapshot.ref);
        try {
          // Add the video metadata to the 'videos' collection
          const videoDocRef = await addDoc(collection(db, 'videos'), {
            title,
            description,
            videoURL,
            userId: currentUser.uid,
            username, // Use the fetched username
            competitionId,
            timestamp: new Date(),
            votes: [],
            comments: [],
            shares: [],
            likes: [],
          });

          const videoId = videoDocRef.id; // Get the video ID

          // Update competition videos: only save userId and videoId
          const competitionRef = doc(db, 'competitions', competitionId);
          await updateDoc(competitionRef, {
            videos: [...competitionVideos, { videoId, userId: currentUser.uid }]
          });

          // Update user's posts field: only save videoId
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userPosts = userData.posts || [];
            await updateDoc(userRef, {
              posts: [...userPosts, videoId] // Add video ID to posts field
            });
          } else {
            // If user document does not exist, create one with posts field
            await setDoc(userRef, {
              posts: [videoId]
            });
          }

          toast.success('Video uploaded successfully!');
          setTitle(''); // Reset form fields
          setDescription('');
          setVideoFile(null);
          setVideoPreviewURL(null); // Reset the video preview
          setShowTrashIcon(false); // Hide trash icon
          navigate(`/video-performance/${competitionId}`); // Redirect to video performance page
        } catch (err) {
          toast.error('Error saving video metadata: ' + err.message);
        }
        setUploading(false);
      }
    );
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="upload-competition-interface">
      <i className="fas fa-arrow-left back-icon" onClick={goBack}></i>
      <div className="post-top">
        <p>Post your video in {competitionName}, it will also appear on your profile but you can change that later.</p>
      </div>

      <form className="upload-video-form" onSubmit={handleUpload}>
        <div className="video-choice-area">
          <div className="video-body">
            {videoPreviewURL && (
              <video className="preview-video" controls>
                <source src={videoPreviewURL} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
          <div className="video-input">
            <label htmlFor="videoFile" className="file-input-label">
              {showTrashIcon ? (
                <i className="fa-solid fa-trash file-input-icon" onClick={handleTrashIconClick}></i>
              ) : (
                <i className="fa-solid fa-pencil file-input-icon"></i>
              )}
            </label>
            <input type="file" id="videoFile" accept="video/*" onChange={handleFileChange} />
          </div>
        </div>

        <div className="video-description">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title"
          />

          <label htmlFor="description">Description:</label>
          <input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter video description"
          />
        </div>

        <button type="submit" className="submit-button" disabled={uploading}>
          {uploading ? <Spinner /> : 'Upload Video'}
        </button>
        {uploading && <p>Uploading... {Math.round(progress)}%</p>}
      </form>
    </div>
  );
};

export default UploadVideoForm;
