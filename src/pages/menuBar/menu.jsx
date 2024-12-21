import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query"; // Import useQuery
import { auth, db } from '../../../config/firebase_config'; // Firebase setup
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import "./menu.css";

const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';

// Function to fetch user data
const fetchUserData = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
        throw new Error("User not authenticated");
    }

    const userDocRef = doc(db, 'users', currentUser.uid); // Correct way to reference a document
    const userDocSnap = await getDoc(userDocRef); // Fetch the document snapshot
    if (userDocSnap.exists()) {
        return userDocSnap.data(); // Return user data from Firestore
    } else {
        throw new Error("No such document!");
    }
};

const Menu = () => {
    const navigate = useNavigate();

    // Fetch user data with React Query
    const { data: user, error, isLoading } = useQuery({
        queryKey: ['userData'], // Key for the query
        queryFn: fetchUserData, // Fetch function
        staleTime: 20 * 60 * 1000, // 20 minutes stale time
        enabled: auth.currentUser !== null, // Only run the query if the user is logged in
    });

    // Go back function
    const goBack = () => {
        navigate(-1);
    };

    // Logout function
    const handleLogout = () => {
        auth.signOut().then(() => {
            navigate("/login"); // Navigate to home page after logout
        }).catch((error) => {
            console.error("Logout error:", error);
        });
    };

    return (
        <div className="menu-page-interface">
            <div className="top-top-sideliners">
                <i className="fas fa-arrow-left" onClick={goBack}></i>
                <h2>Menu</h2>
            </div>

            {isLoading ? (
                <p>Loading...</p>
            ) : error ? (
                <p>Error: {error.message}</p>
            ) : user ? (
                <Link to="/profile" style={{ width: '100%' }}>
                    <div className="menu-page-top-section">
                        <div className="menu-page-user-profile">
                            <div className="menu-page-user-profile-picture">
                                <img src={user.profilePicture || defaultProfilePictureURL} alt="User Profile" />
                            </div>
                            <div className="menu-page-username">
                                {`${user.firstName}  ${user.surname}`}
                            </div>
                        </div>
                    </div>
                </Link>
            ) : (
                <div className="menu-page-top-section">
                    <p>User not authenticated</p>
                </div>
            )}

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
                    <div className="menu-page-option" onClick={() => navigate("/notifications")}>
                        <div className="menu-page-option-icon">
                            <i className="fa-solid fa-bell"></i>
                        </div>
                        <div className="menu-page-option-text">Notifications</div>
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
                <div className="menu-page-option-list">
                    <div className="menu-page-option" onClick={() => navigate("/icoins")}>
                        <div className="menu-page-option-icon">
                          <i className="fa-solid fa-wallet"></i>
                        </div>
                        <div className="menu-page-option-text">Wallet</div>
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
                <div className="settings-block-menu-page" onClick={() => window.location.href = 'mailto:campusicon.com@gmail.com?subject=Campus%20Icon%20Sponsorship&body=Hello%20Campus%20Icon%20Team,'}>
                    <div className="settings-block-icon">
                        <i className="fa-solid fa-file-contract"></i>
                    </div>
                    <div className="settings-block-text">Sponsorship and Endorsement</div>
                </div>
                <div className="settings-block-menu-page" onClick={handleLogout} style={{ color: "red" }}>
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
