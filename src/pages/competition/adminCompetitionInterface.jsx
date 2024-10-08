import { useState, useEffect } from 'react';
import { doc, addDoc, collection, getDocs, query, orderBy, deleteDoc, updateDoc, limit, getDoc } from 'firebase/firestore';
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

      await addDoc(collection(db, 'competitions'), {
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

  const handleStartCompetition = async (id) => {
    setLoading(true); // Set loading to true
    try {
      const competitionRef = doc(db, 'competitions', id);
      await updateDoc(competitionRef, { status: 'Ongoing' });
      fetchCompetitions();
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
      const videos = competitionData.videos;
      const competitionType = competitionData.type; 

      if (!videos || videos.length === 0) {
        throw new Error('No videos in this competition');
      }

      let winningVideo = videos[0];
      for (let video of videos) {
        if (video.votes > winningVideo.votes) {
          winningVideo = video;
        }
      }

      const winnerUserId = winningVideo.userId;

      await updateDoc(competitionRef, {
        status: 'Ended',
        winner: winnerUserId
      });

      await updateUserCampusStreaks(winnerUserId, competitionType);

      fetchCompetitions();
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
