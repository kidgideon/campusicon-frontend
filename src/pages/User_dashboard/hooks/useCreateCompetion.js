import { useState } from 'react';
import { firestore, storage } from '../firebase'; // Adjust the import based on your setup
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';

const useCreateCompetition = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  const determineStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 'About to Commence';
    if (now >= start && now <= end) return 'Ongoing';
    return 'Ended';
  };

  const uploadImage = async (file) => {
    const imageRef = ref(storage, `competitions/${file.name}`);
    await uploadBytes(imageRef, file);
    return getDownloadURL(imageRef);
  };

  const createCompetition = async (
    title,
    description,
    startDate,
    endDate,
    awardType,
    imageFile,
    rules
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Upload image and get URL
      const imageUrl = await uploadImage(imageFile);
      
      const status = determineStatus(startDate, endDate);

      const competitionRef = collection(firestore, 'competitions');
      await addDoc(competitionRef, {
        title,
        description,
        startDate,
        endDate,
        status,
        awardType,
        imageUrl,
        rules,
        creatorId: currentUser.uid,
        createdAt: serverTimestamp(),
        participants: [],
        videos: []
      });

      setLoading(false);
    } catch (err) {
      setError('Failed to create competition. Please try again.');
      setLoading(false);
    }
  };

  return { createCompetition, loading, error };
};

export default useCreateCompetition;
