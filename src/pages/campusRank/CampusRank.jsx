import React, { useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../../config/firebase_config'; // Firebase configuration
import { Link, useNavigate } from 'react-router-dom'; // For navigation
import { useQuery } from '@tanstack/react-query'; // Import React Query
import Spinner from "../../assets/loadingSpinner"; // Import the loading spinner
import './campusRank.css';

const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';

const fetchUsers = async () => {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    return usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

const CampusRank = () => {
    const navigate = useNavigate();
    const currentUser = auth.currentUser; // Get the current user
    const currentUserRef = useRef(null);

    // Use React Query to fetch users
    const { data: users = [], error, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers,
        staleTime: 20 * 60 * 1000, // 20 minutes
        cacheTime: 60 * 60 * 1000, // 1 hour
    });

    // Sort users by points in descending order after fetching
    const sortedUsers = users.sort((a, b) => b.points - a.points);

    // Scroll to the current user's position after fetching
    React.useEffect(() => {
        if (currentUserRef.current) {
            setTimeout(() => {
                currentUserRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 1000);
        }
    }, [sortedUsers, currentUser]); // Only run when users change

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goBack = () => {
        navigate(-1); // Navigate back to the previous page
    };

    if (isLoading) {
        return (
            <div className="campus-rank-interface-loading">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return <p>Error fetching users: {error.message}</p>; // Display error messages
    }

    return (
        <div className="campus-rank-interface-page">
            <div className="top-top-sideliners">
                <i className="fas fa-arrow-left" onClick={goBack}></i>
                <h2>Campus Ranks</h2>
            </div>
            <div className="campus-rank-interface-list">
                {sortedUsers.map((user, index) => {
                    const isCurrentUser = currentUser?.uid === user.id;
                    return (
                        <div
                            key={user.id}
                            className={`campus-rank-interface-item ${isCurrentUser ? 'current-user' : ''}`}
                            ref={isCurrentUser ? currentUserRef : null}
                        >
                            <span className="campus-rank-interface-number">{index + 1}.</span>
                            <img
                                src={user.profilePicture || defaultProfilePictureURL}
                                alt={`${user.firstName} ${user.lastName}`}
                                className="campus-rank-interface-profile-picture"
                            />
                            <div className="campus-rank-interface-info">
                                <Link to={`/profile/${user.username}`} className="campus-rank-interface-username">
                                    {`${user.username}`}
                                </Link>
                                <p className="campus-rank-interface-points"> {user.points} campus streaks</p>
                            </div>
                        </div>
                    );
                })}
            </div>
            <button className="campus-rank-interface-back-to-top" onClick={scrollToTop}>
                <i className="fa-solid fa-caret-down"></i>
            </button>
        </div>
    );
};

export default CampusRank;
