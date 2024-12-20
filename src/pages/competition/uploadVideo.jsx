import React, { useState, useEffect } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, getDoc, doc, updateDoc, query, where, getDocs, setDoc, arrayUnion} from 'firebase/firestore';
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
  const [competitionStatus, setCompetitionStatus] = useState('');
  const [competitionType, setCompetitionType] = useState('');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
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
          setCompetitionStatus(competitionData.status);
          setCompetitionType(competitionData.type);

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
      if (videoPreviewURL) {
        URL.revokeObjectURL(videoPreviewURL);
      }
    };
  }, [competitionId, navigate, videoPreviewURL, currentUser]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        const videoElement = document.createElement('video');
        videoElement.src = URL.createObjectURL(file);

        videoElement.onloadedmetadata = () => {
          if (videoElement.duration > 180) { // Limit to 3 minutes (180 seconds)
            toast.error('Video is longer than 3 minutes. Please upload a shorter video.');
            setVideoFile(null);
            setVideoPreviewURL(null);
            setShowTrashIcon(false);
            return;
          } else {
            setVideoFile(file);
            const newVideoPreviewURL = URL.createObjectURL(file);
            setVideoPreviewURL(newVideoPreviewURL);
            setShowTrashIcon(true);
          }
        };
      } else {
        toast.error('Please upload a valid video file.');
        setVideoFile(null);
        setVideoPreviewURL(null);
        setShowTrashIcon(false);
      }
    }
  };

  const handleTrashIconClick = () => {
    setVideoFile(null);
    setVideoPreviewURL(null);
    setShowTrashIcon(false);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
  
    // Check if competition has ended
    if (competitionStatus === 'Ended') {
      toast.error('This competition has ended. You cannot upload a video.');
      return;
    }
  
    if (competitionStatus === 'Not Started') {
      toast.error('This competition has not started. You cannot upload a video yet. Check the start date to participate.');
      return;
    }
  
    if (!title || !description || !videoFile || !currentUser || !username) {
      toast.error('Please fill in all fields, choose a video, and ensure you are logged in.');
      return;
    }
  
    // Step 1: Fetch the user's iCoin balance
    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentICoins = userData.icoins || 0; // Default to 0 if iCoins are not found
  
      // Step 2: Determine deduction amount
      let deductionAmount = 0;
      if (competitionType === 'Normal Star Award') {
        deductionAmount = 5;
      } else if (competitionType === 'Super Star Award') {
        deductionAmount = 15;
      } else if (competitionType === 'Icon Award') {
        deductionAmount = 30;
      }
  
      // Step 3: Check if the user has enough iCoins
      if (currentICoins < deductionAmount) {
        toast.error('You do not have enough iCoins. Please fund your wallet.');
        return;
      }
  
      // Step 4: Show confirmation window
      const proceed = window.confirm(`You are about to spend ${deductionAmount} iCoins to participate in the ${competitionName} competition. Do you want to proceed?`);
      if (!proceed) {
        return; // Stop if the user doesn't confirm
      }
  
      setUploading(true);
  
      // Step 5: Deduct iCoins and update user data
      const newICoins = currentICoins - deductionAmount;
      await updateDoc(userRef, { icoins: newICoins });
  
      // Update iCoin history with arrayUnion to avoid duplicates
      const historyEntry = `Deducted ${deductionAmount} iCoins for ${competitionName} competition`;
      await updateDoc(userRef, {
        icoin_history: arrayUnion(historyEntry)
      });
  
      // Step 6: Update competition's iCoin balance
      const competitionRef = doc(db, 'competitions', competitionId);
      const competitionSnap = await getDoc(competitionRef);
      if (competitionSnap.exists()) {
        const competitionData = competitionSnap.data();
        const currentCompetitionBalance = competitionData.balance || 0;
        const newCompetitionBalance = currentCompetitionBalance + deductionAmount;
        await updateDoc(competitionRef, { balance: newCompetitionBalance });
      }
  
      // Proceed with video upload
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
          const videoURL = await getDownloadURL(uploadTask.snapshot.ref);
          try {
            const videoDocRef = await addDoc(collection(db, 'videos'), {
              title,
              description,
              videoURL,
              userId: currentUser.uid,
              username,
              competitionId,
              timestamp: new Date(),
              votes: [],
              comments: [],
              shares: [],
              likes: [],
            });
  
            const videoId = videoDocRef.id;
  
            const competitionRef = doc(db, 'competitions', competitionId);
            await updateDoc(competitionRef, {
              videos: [...competitionVideos, { videoId, userId: currentUser.uid }]
            });
  
            const userRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userRef);
  
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const userPosts = userData.posts || [];
              await updateDoc(userRef, {
                posts: [...userPosts, videoId]
              });
            } else {
              await setDoc(userRef, {
                posts: [videoId]
              });
            }
  
            toast.success('Video uploaded successfully!');
            setTitle('');
            setDescription('');
            setVideoFile(null);
            setVideoPreviewURL(null);
            setShowTrashIcon(false);
            navigate(`/video-performance/${competitionId}`);
          } catch (err) {
            toast.error('Error saving video metadata: ' + err.message);
          }
          setUploading(false);
        }
      );
    } else {
      toast.error('User not found.');
    }
  };
  
  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="full-house">
 <div className="upload-competition-interface">
      <div className="top-top-sideliners">
        <i className="fas fa-arrow-left" onClick={goBack}></i>
        <h2>Upload a video </h2>
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
       Post 
        </button>
        {uploading && <p>Uploading... {Math.round(progress)}%</p>}
        {uploading && <p>please dont leave the page </p>}
      </form>

    
<div className="competion-interface-footer">
  <div onClick={() => navigate(`/competition/${competitionId}`)}>
    <i className="fa-solid fa-trophy interface-icon"></i>
  </div>
  <div onClick={() => navigate(`/watch-video/${competitionId}`)}>
  <i className="fa-solid fa-play interface-icon"></i>
  </div>
  <div className="top-users-icon" onClick={() => navigate(`/ranks/${competitionId}`)}>
    <i className="fa-solid fa-sort interface-icon"></i>
  </div>
  <div className="add-icon" onClick={() => navigate(`/upload/${competitionId}`)}>
    <i className="fa-solid fa-plus interface-icon" style={{color : '#205e78'}}></i>
  </div>
  <div className="to-see-video-performance interface-icon" onClick={() => navigate(`/video-performance/${competitionId}`)}>
    <i className="fa-solid fa-square-poll-vertical interface-icon"></i>
  </div>
</div>
    </div>
    </div>
  );
};

export default UploadVideoForm;
