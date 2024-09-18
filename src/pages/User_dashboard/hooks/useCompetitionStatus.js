import { useEffect, useState } from 'react';
import { firestore } from '../firebase'; // Adjust the import based on your setup
import { doc, onSnapshot } from 'firebase/firestore';

const useCompetitionStatus = (competitionId) => {
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    const competitionRef = doc(firestore, 'competitions', competitionId);

    const unsubscribe = onSnapshot(competitionRef, (doc) => {
      const data = doc.data();
      if (data) {
        const now = new Date();
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);

        let competitionStatus;
        if (now < start) competitionStatus = 'About to Commence';
        else if (now >= start && now <= end) competitionStatus = 'Ongoing';
        else competitionStatus = 'Ended';

        setStatus(competitionStatus);
      }
    });

    return () => unsubscribe();
  }, [competitionId]);

  return status;
};

export default useCompetitionStatus;
