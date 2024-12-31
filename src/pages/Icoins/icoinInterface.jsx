import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../../config/firebase_config";
import "./icoin.css";
import { useNavigate } from "react-router-dom";

const IcoinInterface = () => {
  const [userData, setUserData] = useState({
    icoins: 0,
    icoin_history: [],
  });
  const [loading, setLoading] = useState(true);
  const [isPopupVisible, setIsPopupVisible] = useState(false); // State for controlling popup visibility
  const [valuePopup, setValuePopup] = useState(false)
 
// Inside the IcoinInterface component
const navigate = useNavigate();

const fundPopup = () => {
  setIsPopupVisible(true);
  window.history.pushState({ popup: "fund" }, ""); // Push a new history state
};

const value = () => {
  setValuePopup(true);
  window.history.pushState({ popup: "value" }, ""); // Push a new history state
};

const closePopup = () => {
  setIsPopupVisible(false);
  window.history.back(); // Trigger the back action to maintain consistency
};

const closeValue = () => {
  setValuePopup(false);
  window.history.back(); // Trigger the back action to maintain consistency
};

// Handle back button behavior
useEffect(() => {
  const handlePopState = (event) => {
    if (isPopupVisible) {
      setIsPopupVisible(false); // Close the "fund" popup if it's open
    } else if (valuePopup) {
      setValuePopup(false); // Close the "value" popup if it's open
    }
  };

  window.addEventListener("popstate", handlePopState);
  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}, [isPopupVisible, valuePopup]);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Listen for authenticated user
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            const userDocRef = doc(db, "users", user.uid); // Adjust the path if your collection structure differs
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              const data = userDoc.data();
              setUserData({
                icoins: data.icoins || 0,
                icoin_history: data.icoin_history || [],
              });
            } else {
              console.error("User document does not exist.");
            }
          }
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleBundleSelection = (amount) => {
    navigate(`/icoin-payment/${amount}`);
  };

  const goBack =() => {
    navigate("/")
  }

  const withdraw = () => {
    navigate("/withdraw")
  }

  if (loading) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    );
  }


  return (
    <div className="full-house">
      <div className="coinBalanceInterface">
        {/* Top Sideliner */}
        <div className="top-top-sideliners">
          <i className="fas fa-arrow-left" onClick={goBack}></i>
          <h2>Icoin Wallet</h2>
        </div>

        {/* Coin Balance Area */}
        <div className="coin-balance-area">
          <div className="balance-itself">
            <p>
              <span> <i className="fa-solid fa-coins balance-icon-main"></i></span> {userData.icoins.toFixed(2)}
            </p>
          </div>
          <div className="controls">
            <button className="fund-wallet" onClick={fundPopup}>
              Fund
            </button>
            <button className="withdraw" onClick={withdraw}>Withdraw</button>
            <button className="value-check" onClick={value}>Value</button>
          </div>
        </div>

        {/* Coin History */}
        <div className="coin-history">
          <p className="history-paragraph">History</p>
          {userData.icoin_history.length > 0 ? (
            userData.icoin_history
              .slice()
              .reverse() // Reverse to show the last history first
              .map((historyItem, index) => (
                <div key={index} className="history">
                  <span>
                    <i className="fa-solid fa-clock-rotate-left"></i>
                  </span>{" "}
                  {historyItem}
                </div>
              ))
          ) : (
            <p className="no-history">No transactions made yet</p>
          )}
        </div>

  {
    valuePopup && (
      <div className="overlay" onClick={closeValue}>
<div className="value-popup">
   your icoins is valued at {(userData.icoins * 5).toFixed(2)} NGN
</div>
      </div>
    )
  }

        {/* Overlay for Popup */}
        {isPopupVisible && (
          <div className="overlay" onClick={closePopup}>
            <div className="purchase-popup" onClick={(e) => e.stopPropagation()}>
              <div className="option" onClick={() => handleBundleSelection(1200)}>
                <p>Small Bundle</p>
                 <i className="fa-solid fa-coins balance-icon"></i>
                <p>80 icoins: ₦1,200</p>
              </div>

              <div className="option" onClick={() => handleBundleSelection(2550)} >
                <p>Medium Bundle</p>
                <i className="fa-solid fa-coins balance-icon"></i>
                <p>210 iCoins: ₦2,550</p>
              </div>

              <div className="option" onClick={() => handleBundleSelection(4650)}>
                <p>Large Bundle</p>
                <i className="fa-solid fa-coins balance-icon"></i>
                <p>390 iCoins: ₦4,650</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IcoinInterface;
