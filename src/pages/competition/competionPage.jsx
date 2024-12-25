import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../../../config/firebase_config';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Spinner from '../../assets/loadingSpinner';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import './competionsPage.css';
import superCup from '../../assets/superCup.png';
import normalStarCup from '../../assets/starCup.png';
import iconAwardCup from '../../assets/iconCup.png';
import CompetitionsPageSkeleton from './competionSkeleton';

const iconLogo = "https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/logo.png?alt=media&token=97374df9-684d-44bf-ba79-54f5cb7d48b7";


const awardImages = {
  'Normal Star Award': normalStarCup,
  'Super Star Award': superCup,
  'Icon Award': iconAwardCup,
};

const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';

const CompetitionsPage = () => {
  const [filteredCompetitions, setFilteredCompetitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] = useState('All'); // Track the active status filter
   
  // Fetch all competitions
  const { data: competitions, isLoading: competitionsLoading } = useQuery({
    queryKey: ['competitions'],
    queryFn: async () => {
      const competitionsCollection = collection(db, 'competitions');
      const querySnapshot = await getDocs(competitionsCollection);
      const competitionsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const ongoingCompetitions = competitionsList.filter((c) => c.status === 'ongoing');
      const otherCompetitions = competitionsList.filter((c) => c.status !== 'ongoing');

      const sortedOngoingCompetitions = ongoingCompetitions.sort((a, b) => {
        const aVideosCount = a.videos?.length || 0;
        const bVideosCount = b.videos?.length || 0;
        return bVideosCount - aVideosCount;
      });

      return [...sortedOngoingCompetitions, ...otherCompetitions];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
  });

  // Fetch competitions by status
  const fetchCompetitionsByStatus = async (status) => {
    setMessage('');
    setActiveStatus(status);
    if (status === 'All') {
      setFilteredCompetitions(competitions || []);
      return;
    }

    try {
      const competitionsCollection = collection(db, 'competitions');
      const q = query(competitionsCollection, where('status', '==', status));
      const querySnapshot = await getDocs(q);
      const competitionsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (competitionsList.length === 0) {
        setMessage(`No competitions found for status: ${status}.`);
      } else {
        setMessage('');
      }

      setFilteredCompetitions(competitionsList);
    } catch (error) {
      setMessage('Error fetching competitions.');
    }
  };

  // Set default competitions (all) when React Query data loads
  React.useEffect(() => {
    if (competitions) {
      setFilteredCompetitions(competitions);
    }
  }, [competitions]);

  if (competitionsLoading) {
    return <CompetitionsPageSkeleton />;
  }

  if (!competitions || competitions.length === 0) {
    return <p>No competitions available at the moment.</p>;
  }


  return (
    <div className="full-house">
      <div className="competitions-page">
        <div className="competitions-list-top">
          <h2>Competitions</h2>
          <div className="sort-functions">
            <button
              className={activeStatus === 'All' ? 'active' : ''}
              onClick={() => fetchCompetitionsByStatus('All')}
            >
              All
            </button>
            <button
              className={activeStatus === 'Ongoing' ? 'active' : ''}
              onClick={() => fetchCompetitionsByStatus('Ongoing')}
            >
              Ongoing
            </button>
            <button
              className={activeStatus === 'Not started' ? 'active' : ''}
              onClick={() => fetchCompetitionsByStatus('Not started')}
            >
              Not started
            </button>
            <button
              className={activeStatus === 'Ended' ? 'active' : ''}
              onClick={() => fetchCompetitionsByStatus('Ended')}
            >
              Ended
            </button>
          </div>
        </div>
        {message && <p className="message">{message}</p>}
        <div className="competition-list">
          {!loading &&
            filteredCompetitions.map((competition) => (
              <div
                className="competition-card"
                key={competition.id}
                onClick={() => navigate(`/competition/${competition.id}`)}
              >
                {competition.imageUrl && (
                  <img
                    src={competition.imageUrl}
                    alt={competition.name}
                    className="competition-image"
                  />
                )}
                <h3 className="comp-name">{competition.name}</h3>
                <p className="status">{competition.status}</p>
                <p className="part">{competition.participations?.length || 0} participators</p>
                <p className="amt">{competition.videos?.length || 0} Videos</p>
                {competition.type && (
                  <img
                    src={awardImages[competition.type] || ''}
                    alt={competition.type}
                    className="award-image"
                  />
                )}
                <p className="comp-type"> {competition.type}</p>
              </div>
            ))}
        </div>
      </div>
      <div className={`user-feed-interface-navigation-panel`}>
        <span>
          <Link to={'/'}>
            <i className="fa-solid fa-house"></i>
          </Link>
        </span>
        <span>
          <Link to={'/discovery-page'}>
            <i className="fa-solid fa-magnifying-glass"></i>
          </Link>
        </span>
        <span>
          <Link to={'/competitions'}>
            <i style={{ color: 'black' }} className="fa-solid fa-trophy"></i>
          </Link>
        </span>
        <span>
          <Link to={'/notifications'}>
            <i className="fa-solid fa-bell"></i>
          </Link>
        </span>
        <span>
          <Link to={'/ads'}>
            <i className="fa-solid fa-bullhorn"></i>
          </Link>
        </span>
      </div>
    </div>
  );
};
export default CompetitionsPage;
