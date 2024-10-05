import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from '../../../config/firebase_config'; // Firebase setup
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import Logo from '../../assets/logo.png';
import "./menu.css";

const Menu = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    // Fetch current user data
    useEffect(() => {
        const fetchUserData = async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
                const userDocRef = doc(db, 'users', currentUser.uid); // Correct way to reference a document
                const userDocSnap = await getDoc(userDocRef); // Fetch the document snapshot
                if (userDocSnap.exists()) {
                    setUser(userDocSnap.data()); // Set user data from Firestore
                } else {
                    console.error("No such document!");
                }
            }
        };
        fetchUserData();
    }, []);

    // Go back function
    const goBack = () => {
        navigate(-1);
    };

    // Logout function
    const handleLogout = () => {
        auth.signOut().then(() => {
            navigate("/home"); // Navigate to home page after logout
        }).catch((error) => {
            console.error("Logout error:", error);
        });
    };

    return (
        <div className="menu-page-interface">
            <i className="fas fa-arrow-left back-icon" onClick={goBack}></i>
            <div className="menu-page-top-section">
                <div className="menu-page-user-profile">
                    <div className="menu-page-user-profile-picture">
                        <img src={user ? user.profilePicture : Logo} alt="User Profile" />
                    </div>
                    <div className="menu-page-username">
                        {user ? user.firstName + ' ' + user.lastName : 'Loading...'}
                    </div>
                </div>
            </div>
          
<div className="menu-page-menu-options">
<div className="menu-page-option-list">
    <div className="menu-page-option" onClick={() => navigate("/campus-rank")}>
        <div className="menu-page-option-icon">
            <i className="fa-solid fa-square-poll-vertical"></i>
        </div>
        <div className="menu-page-option-text">Campus Rank</div>
    </div>
    <div className="menu-page-option" onClick={() => navigate("/competitions")}>
        <div className="menu-page-option-icon">
            <i className="fa-solid fa-trophy"></i>
        </div>
        <div className="menu-page-option-text">Competitions</div>
    </div>
</div>
<div className="menu-page-option-list">
    <div className="menu-page-option" onClick={() => navigate("/ads")}>
        <div className="menu-page-option-icon">
            <i className="fa-solid fa-bullhorn"></i>
        </div>
        <div className="menu-page-option-text">Create Ad</div>
    </div>
    <div className="menu-page-option" onClick={() => navigate("/match-of-day")}>
        <div className="menu-page-option-icon">
            <i className="fa-solid fa-star"></i>
        </div>
        <div className="menu-page-option-text">Match of Day</div>
    </div>
</div>
<div className="menu-page-option-list">
    <div className="menu-page-option" onClick={() => navigate("/friends")}>
        <div className="menu-page-option-icon">
            <i className="fa-solid fa-user-group"></i>
        </div>
        <div className="menu-page-option-text">Friends</div>
    </div>
    <div className="menu-page-option" onClick={() => navigate("/awards-ranks")}>
        <div className="menu-page-option-icon">
            <i className="fa-solid fa-award"></i>
        </div>
        <div className="menu-page-option-text">Awards and Ranks</div>
    </div>
</div>
</div>
           
<div className="menu-page-settings-privacy">
<h3>Settings and Privacy</h3>
<div className="settings-block-menu-page" onClick={() => navigate("/settings")}>
    <div className="settings-block-icon">
        <i className="fa-solid fa-gear"></i>
    </div>
    <div className="settings-block-text">Settings</div>
</div>
<h3>Help and Support</h3>
<div className="settings-block-menu-page" onClick={() => window.location.href = 'mailto:campusicon.com@gmail.com?subject=Campus%20Icon%20Problem&body=Hello%20Campus%20Icon%20Team,'}>
    <div className="settings-block-icon">
        <i className="fa-solid fa-circle-xmark"></i>
    </div>
    <div className="settings-block-text">Report a Problem</div>
</div>
<div className="settings-block-menu-page" onClick={() =>  window.location.href = 'mailto:campusicon.com@gmail.com?subject=Campus%20Icon%20Sponsorship&body=Hello%20Campus%20Icon%20Team,'}>
    <div className="settings-block-icon">
        <i className="fa-solid fa-file-contract"></i>
    </div>
    <div className="settings-block-text">Sponsorship and Endorsement</div>
</div>
<div className="settings-block-menu-page" onClick={() => navigate("/about")}>
    <div className="settings-block-icon">
        <i className="fa-solid fa-address-card"></i>
    </div>
    <div className="settings-block-text">About</div>
</div>
<div className="settings-block-menu-page" onClick={handleLogout}>
    <div className="settings-block-icon">
        <i className="fa-solid fa-right-from-bracket"></i>
    </div>
    <div className="settings-block-text">Logout</div>
</div>
</div>
        </div>
    );
};

export default Menu;



