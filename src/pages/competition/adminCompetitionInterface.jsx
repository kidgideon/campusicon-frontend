import { useState, useEffect } from 'react';
import { doc, addDoc, collection, getDocs, query, orderBy, deleteDoc, updateDoc, limit, getDoc, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../config/firebase_config';
import '../../assets/adminCompCreation.css';

const AdminCompetitionInterface = () => {
  const [competitions, setCompetitions] = useState([]);
  const [competitionName, setCompetitionName] = useState('');
  const [competitionType, setCompetitionType] = useState('Normal Star Award');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rules, setRules] = useState('');
  const [description, setDescription] = useState(''); 
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false); // Add loading state

  // Fetch competitions function
  const fetchCompetitions = async () => {
    try {
      const competitionsRef = collection(db, 'competitions');
      const q = query(competitionsRef, orderBy('createdAt', 'desc'), limit(10));
      const querySnapshot = await getDocs(q);
      const competitionsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCompetitions(competitionsList);
    } catch (error) {
      console.error('Error fetching competitions:', error);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const handleCreateCompetition = async () => {
    setLoading(true); // Set loading to true
    try {
      let imageUrl = '';
      if (image) {
        const imageRef = ref(storage, `competitions/${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }
  
      // Create the competition in Firestore
      const competitionRef = await addDoc(collection(db, 'competitions'), {
        name: competitionName,
        type: competitionType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rules: rules,
        description: description,
        imageUrl: imageUrl,
        status: 'Not Started',
        createdAt: new Date(),
        videos: []
      });
  
      // After the competition is created, fetch all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
  
      // Create a notification object
      const notification = {
        read: false,
        type: 'competition',
        competitionId: competitionRef.id, // Reference the newly created competition
        text: `${competitionName} has been created! Get ready to participate.`,
        timestamp: Date.now()
      };
  
      // Create a Firestore batch
      const batch = writeBatch(db);
  
      // Loop through all users and update their notifications array
      usersSnapshot.docs.forEach((userDoc) => {
        const userNotifications = userDoc.data().notifications || []; // Get the current notifications array
        const updatedNotifications = [...userNotifications, notification]; // Append the new notification
        
        // Add the notification update to the batch
        const userRef = doc(db, 'users', userDoc.id);
        batch.update(userRef, { notifications: updatedNotifications });
      });
  
      // Commit the batch write
      await batch.commit();
  
      // Reset form fields after competition creation
      fetchCompetitions(); // Refresh competitions
      setCompetitionName('');
      setCompetitionType('Normal Star Award');
      setStartDate('');
      setEndDate('');
      setRules('');
      setDescription('');
      setImage(null);
  
    } catch (error) {
      console.error('Error creating competition:', error);
    } finally {
      setLoading(false); // Set loading to false
    }
  };
 
  const handleStartCompetition = async (competitionId) => {
    setLoading(true); // Set loading to true
    try {
      const competitionRef = doc(db, 'competitions', competitionId);
      const competitionSnapshot = await getDoc(competitionRef);
  
      if (!competitionSnapshot.exists()) {
        throw new Error('Competition not found');
      }
  
      const competitionData = competitionSnapshot.data();
      const { name: competitionName } = competitionData;
  
      // Fetch all users for batch notifications
      const usersSnapshot = await getDocs(collection(db, 'users'));
  
      // Create a batch
      const batch = writeBatch(db);
  
      // Notification for all users that the competition has started
      const competitionStartedNotification = {
        read: false,
        type: 'competition',
        competitionId: competitionId,
        text: `The competition ${competitionName} has started! Participate now and show your skills.`,
        timestamp: Date.now()
      };
  
      // Loop through all users and send notifications
      usersSnapshot.docs.forEach((userDoc) => {
        const userNotifications = userDoc.data().notifications || [];
        const updatedNotifications = [...userNotifications, competitionStartedNotification];
  
        const userRef = doc(db, 'users', userDoc.id);
        batch.update(userRef, { notifications: updatedNotifications });
      });
  
      // Update the competition status to 'Started'
      batch.update(competitionRef, {
        status: 'Ongoing'
      });
  
      // Commit the batch
      await batch.commit();
  
      fetchCompetitions(); // Refresh competitions
    } catch (error) {
      console.error('Error starting competition:', error);
    } finally {
      setLoading(false); // Set loading to false
    }
  };
  
  const handleEndCompetition = async (competitionId) => {
    setLoading(true); // Set loading to true
    try {
      const competitionRef = doc(db, 'competitions', competitionId);
      const competitionSnapshot = await getDoc(competitionRef);
  
      if (!competitionSnapshot.exists()) {
        throw new Error('Competition not found');
      }
  
      const competitionData = competitionSnapshot.data();
      const { videos, type: competitionType, name: competitionName } = competitionData;
  
      if (!videos || videos.length === 0) {
        throw new Error('No videos in this competition');
      }
  
      // Determine the winning video (video with the most votes)
      let winningVideo = videos[0];
      for (let video of videos) {
        if (video.votes > winningVideo.votes) {
          winningVideo = video;
        }
      }
  
      const winnerUserId = winningVideo.userId;
  
      // Calculate Campus Streak points based on competition type
      let pointsToAdd = 0;
      switch (competitionType) {
        case 'Normal Star Award':
          pointsToAdd = 20;
          break;
        case 'Super Star Award':
          pointsToAdd = 50;
          break;
        case 'Icon Award':
          pointsToAdd = 100;
          break;
        default:
          pointsToAdd = 0;
      }
  
      // Fetch all users for batch notifications
      const usersSnapshot = await getDocs(collection(db, 'users'));
  
      // Create a batch
      const batch = writeBatch(db);
  
      // Notification for all users that the competition has ended
      const competitionEndedNotification = {
        read: false,
        type: 'competition',
        competitionId: competitionId,
        text: `The competition ${competitionName} has ended! Check out the results.`,
        timestamp: Date.now()
      };
  
      // Specific notification for the winner
      const winnerNotification = {
        read: false,
        type: 'competition',
        competitionId: competitionId,
        text: `Congratulations! You have won the competition ${competitionName}.`,
        timestamp: Date.now()
      };
  
      // Loop through all users and send notifications
      usersSnapshot.docs.forEach((userDoc) => {
        const userNotifications = userDoc.data().notifications || [];
        const updatedNotifications = [...userNotifications, competitionEndedNotification];
  
        const userRef = doc(db, 'users', userDoc.id);
        batch.update(userRef, { notifications: updatedNotifications });
      });
  
      // Send winner notification and update their Campus Streaks
      const winnerRef = doc(db, 'users', winnerUserId);
      const winnerDoc = await getDoc(winnerRef);
  
      if (!winnerDoc.exists()) {
        throw new Error('Winner user not found');
      }
  
      const winnerData = winnerDoc.data();
      const updatedCampusStreaks = (winnerData.points || 0) + pointsToAdd;
  
      // Update the winner's notifications and points
      const winnerNotifications = winnerData.notifications || [];
      const updatedWinnerNotifications = [...winnerNotifications, winnerNotification];
      batch.update(winnerRef, {
        notifications: updatedWinnerNotifications,
        points: updatedCampusStreaks
      });
  
      // Update the competition status and winner in the competition document
      batch.update(competitionRef, {
        status: 'Ended',
        winner: winnerUserId
      });
  
      // Commit the batch
      await batch.commit();
  
      fetchCompetitions(); // Refresh competitions
    } catch (error) {
      console.error('Error ending competition:', error);
    } finally {
      setLoading(false); // Set loading to false
    }
  };
  

  const handleDeleteCompetition = async (id) => {
    try {
      await deleteDoc(doc(db, 'competitions', id));
      fetchCompetitions(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting competition:', error);
    }
  };
  
  return (
    <div className="admin-competition-interface">
      <h1>Create Competition</h1>
      <form className="competition-form" onSubmit={e => e.preventDefault()}>
        <label>
          Competition Name:
          <input type="text" value={competitionName} onChange={e => setCompetitionName(e.target.value)} required />
        </label>
        <label>
          Competition Type:
          <select value={competitionType} onChange={e => setCompetitionType(e.target.value)}>
            <option value="Normal Star Award">Normal Star Award</option>
            <option value="Super Star Award">Super Star Award</option>
            <option value="Icon Award">Icon Award</option>
          </select>
        </label>
        <label>
          Start Date:
          <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} required />
        </label>
        <label>
          End Date:
          <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} required />
        </label>
        <label>
          Rules:
          <textarea value={rules} onChange={e => setRules(e.target.value)} required />
        </label>
        <label>
          Description:
          <textarea value={description} onChange={e => setDescription(e.target.value)} required />
        </label>
        <label>
          Competition Image:
          <input type="file" onChange={e => setImage(e.target.files[0])} />
        </label>
        <button type="button" onClick={handleCreateCompetition} disabled={loading}>
          {loading ? 'Creating...' : 'Create Competition'}
        </button>
      </form>

      <div className="competitions-list">
        <h2>Recent Competitions</h2>
        {competitions.map(comp => (
          <div key={comp.id} className="competition-item">
            <h3>{comp.name}</h3>
            <p>Type: {comp.type}</p>
            <p>Status: {comp.status}</p>
            <p>Start Date: {new Date(comp.startDate.toDate()).toLocaleString()}</p>
            <p>End Date: {new Date(comp.endDate.toDate()).toLocaleString()}</p>
            <p>Rules: {comp.rules}</p>
            <p>Description: {comp.description}</p>
            {comp.imageUrl && <img src={comp.imageUrl} alt="Competition" className="competition-image" />}
            <button onClick={() => handleStartCompetition(comp.id)} disabled={comp.status !== 'Not Started' || loading}>
              {loading ? 'Starting...' : 'Start'}
            </button>
            <button onClick={() => handleEndCompetition(comp.id)} disabled={comp.status !== 'Ongoing' || loading}>
              {loading ? 'Ending...' : 'End'}
            </button>
            <button onClick={() => handleDeleteCompetition(comp.id)} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCompetitionInterface;
