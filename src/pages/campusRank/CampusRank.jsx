import React, { useEffect, useState, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../../config/firebase_config'; // Firebase configuration
import { Link, useNavigate } from 'react-router-dom'; // For navigation
import Spinner from "../../assets/loadingSpinner"; // Import the loading spinner
import './campusRank.css';
const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';

const CampusRank = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true); // State for loading
    const navigate = useNavigate();
    const currentUser = auth.currentUser; // Get the current user
    const currentUserRef = useRef(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Fetch users from Firestore
                const usersCollection = collection(db, 'users');
                const usersSnapshot = await getDocs(usersCollection);
                const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                // Sort users by points in descending order
                const sortedUsers = usersList.sort((a, b) => b.points - a.points);

                setUsers(sortedUsers);
                setLoading(false); // Set loading to false when data is fetched

                // Scroll to the current user's position
                setTimeout(() => {
                    if (currentUserRef.current) {
                        currentUserRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 1000);
            } catch (error) {
                console.error("Error fetching users: ", error);
            }
        };

        fetchUsers();
    }, [currentUser]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const goBack = () => {
        navigate(-1); // Navigate back to the previous page
    };

    if (loading) {
        return (
            <div className="campus-rank-interface-loading">
                <Spinner /> 
            </div>
        );
    }

    return (
        <div className="campus-rank-interface-page">
          <div className="top-top-sideliners">
        <i className="fas fa-arrow-left " onClick={goBack}></i>
        <h2>Campus Ranks</h2>
      </div>
            <div className="campus-rank-interface-list">
                {users.map((user, index) => {
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
            <button className="campus-rank-interface-back-to-top" >
            <i className="fa-solid fa-caret-down" onClick={scrollToTop} ></i>
            </button>
        </div>
    );
};

export default CampusRank;
