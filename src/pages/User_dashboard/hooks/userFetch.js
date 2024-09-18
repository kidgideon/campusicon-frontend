import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../../config/firebase_config';

const useFetchData = () => {
  const [userData, setUserData] = useState(null);
  const [topUsers, setTopUsers] = useState([]);
  const [activeCompetitions, setActiveCompetitions] = useState([]);
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          // Fetch user data
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          } else {
            setError('No such user!');
            return;
          }

          // Fetch top users
          const topUsersQuery = query(collection(db, 'users'), orderBy('points', 'desc'), limit(10));
          const topUsersSnapshot = await getDocs(topUsersQuery);
          const topUsersList = topUsersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setTopUsers(topUsersList);

          // Fetch active competitions
          const activeCompetitionsQuery = query(collection(db, 'competitions'), orderBy('startDate', 'desc'));
          const activeCompetitionsSnapshot = await getDocs(activeCompetitionsQuery);
          const activeCompetitionsList = activeCompetitionsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              startDate: data.startDate ? data.startDate.toDate() : null,
              endDate: data.endDate ? data.endDate.toDate() : null,
            };
          });

          // Filter and sort competitions
          const now = new Date();
          const filteredCompetitions = activeCompetitionsList.filter(comp => {
            if (comp.status === 'Ongoing') return true;
            if (comp.status === 'Not Started' && comp.startDate > now) return true;
            return false;
          }).sort((a, b) => {
            if (a.status === 'Ongoing' && b.status !== 'Ongoing') return -1;
            if (a.status !== 'Ongoing' && b.status === 'Ongoing') return 1;
            return a.startDate - b.startDate; // Sort by startDate within each status group
          });

          setActiveCompetitions(filteredCompetitions);

          // Fetch user feeds
          const feedsQuery = query(collection(db, 'feeds'), orderBy('date', 'desc'));
          const feedsSnapshot = await getDocs(feedsQuery);
          const feedsList = feedsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setFeeds(feedsList);
        } else {
          setError('No user is signed in!');
        }
      } catch (error) {
        setError('Error fetching data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { userData, topUsers, activeCompetitions, feeds, loading, error };
};

export default useFetchData;
