import { useState, useEffect } from 'react';
import { doc, addDoc, collection, getDocs, query, orderBy, deleteDoc, updateDoc, limit, getDoc, writeBatch, increment } from 'firebase/firestore';
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
        description: description,
        imageUrl: imageUrl,
        status: 'Not Started',
        createdAt: new Date(),
        videos: [],
        pricing: "paid",
        sponsores: "campusicon",
        balance: 0,
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
      const { videos, type: competitionType, name: competitionName, balance } = competitionData;
  
      if (!videos || videos.length === 0) {
        throw new Error('No videos in this competition');
      }
  
      const prizePool = balance;
      console.log(prizePool)
  
      // Sort the videos based on votes in descending order
      const sortedVideos = videos.sort((a, b) => b.votes - a.votes);
  
      // Get the top 3 winners (1st, 2nd, and 3rd place)
      const firstPlaceWinner = sortedVideos[0];
      const secondPlaceWinner = sortedVideos[1];
      const thirdPlaceWinner = sortedVideos[2];
  
      // Calculate Campus Streak points based on competition type
      let pointsToAdd = 0;
      let awardType = '';
  
      switch (competitionType) {
        case 'Normal Star Award':
          pointsToAdd = 20;
          awardType = 'Normal Star Award';
          break;
        case 'Super Star Award':
          pointsToAdd = 50;
          awardType = 'Super Star Award';
          break;
        case 'Icon Award':
          pointsToAdd = 100;
          awardType = 'Icon Award';
          break;
        default:
          pointsToAdd = 0;
          awardType = 'Unknown Award'; // Fallback if the type is not recognized
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
  
      // Notifications for the winners (1st, 2nd, and 3rd)
      const winnerNotifications = [
        {
          userId: firstPlaceWinner.userId,
          text: `Congratulations! You have won the competition ${competitionName}.`,
          timestamp: Date.now(),
          read: false,
          type: 'competition',
          competitionId: competitionId,
        },
        {
          userId: secondPlaceWinner.userId,
          text: `Great job! You placed second in the competition ${competitionName}.`,
          timestamp: Date.now(),
          read: false,
          type: 'competition',
          competitionId: competitionId,
        },
        {
          userId: thirdPlaceWinner.userId,
          text: `Nice work! You placed third in the competition ${competitionName}.`,
          timestamp: Date.now(),
          read: false,
          type: 'competition',
          competitionId: competitionId,
        }
      ];
  
      // Loop through all users and send notifications
      usersSnapshot.docs.forEach((userDoc) => {
        const userNotifications = userDoc.data().notifications || [];
        const updatedNotifications = [...userNotifications, competitionEndedNotification];
  
        const userRef = doc(db, 'users', userDoc.id);
        batch.update(userRef, { notifications: updatedNotifications });
      });
  
      // Distribute the icoin: 
      const appShare = prizePool * 0.4;
      const winnerShare = prizePool * 0.6;
      console.log(appShare)
      console.log(winnerShare)
  
      const firstPlaceShare = winnerShare * 0.50; // 30% of the total prize pool for 1st place
      const secondPlaceShare = winnerShare * 0.30; // 18% of the total prize pool for 2nd place
      const thirdPlaceShare = winnerShare * 0.20; // 12% of the total prize pool for 3rd place
  
      console.log(firstPlaceShare, secondPlaceShare, thirdPlaceShare)
  
      const winners = [
        { user: firstPlaceWinner, share: firstPlaceShare, notification: winnerNotifications[0] },
        { user: secondPlaceWinner, share: secondPlaceShare, notification: winnerNotifications[1] },
        { user: thirdPlaceWinner, share: thirdPlaceShare, notification: winnerNotifications[2] }
      ];
  
      for (const { user, share, notification } of winners) {
        const winnerRef = doc(db, 'users', user.userId);
        const winnerDoc = await getDoc(winnerRef);
  
        if (!winnerDoc.exists()) {
          throw new Error('Winner user not found');
        }
  
        const winnerData = winnerDoc.data();
        const updatedCampusStreaks = (winnerData.points || 0) + pointsToAdd;
  
        // Add the notification for streak points and icoin earnings
        const earnedPointsNotification = `You earned ${pointsToAdd} Campus Streak points and ${share} iCoins from the competition ${competitionName}!`;
  
        const winnerNotifications = winnerData.notifications || [];
        const updatedWinnerNotifications = [
          ...winnerNotifications,
          notification,
          {
            userId: user.userId,
            text: earnedPointsNotification,
            timestamp: Date.now(),
            read: false,
            type: 'competition',
            competitionId: competitionId,
          }
        ];
  
        const winnerWins = winnerData.win || [];
        const newWin = {
          competitionId: competitionId,
          awardType: awardType,
        };
        const updatedWinnerWins = [...winnerWins, newWin];
  
        const icoinHistory = winnerData.icoin_history || [];
        const newHistory = `Congratulations! You earned from the ${competitionName} prize pool.`;
        const updatedIcoinHistory = [...icoinHistory, newHistory];
  
       
        batch.update(winnerRef, {
          notifications: updatedWinnerNotifications,
          points: updatedCampusStreaks,
          win: updatedWinnerWins,
          icoin_history: updatedIcoinHistory,
          icoins: increment(share)
        });
      }
  
      // Update the competition status and winner in the competition document
      batch.update(competitionRef, {
        status: 'Ended',
        winner: firstPlaceWinner.userId
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
