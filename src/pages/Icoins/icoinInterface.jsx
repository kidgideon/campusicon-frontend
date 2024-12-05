import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../../config/firebase_config";
import "./icoin.css";

const IcoinInterface = () => {
  const [userData, setUserData] = useState({
    icoins: 0,
    icoin_history: [],
  });
  const [loading, setLoading] = useState(true);
  const [isPopupVisible, setIsPopupVisible] = useState(false); // State for controlling popup visibility

  const fundPopup = () => {
    setIsPopupVisible(true);
  };

  const closePopup = () => {
    setIsPopupVisible(false);
  };

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
          <i className="fas fa-arrow-left"></i>
          <h2>Icoin Wallet</h2>
        </div>

        {/* Coin Balance Area */}
        <div className="coin-balance-area">
          <div className="balance-itself">
            <p>
              <span>I</span> {userData.icoins}
            </p>
          </div>
          <div className="controls">
            <button className="fund-wallet" onClick={fundPopup}>
              Fund
            </button>
            <button className="withdraw">Withdraw</button>
            <button className="value-check">Value</button>
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

        {/* Overlay for Popup */}
        {isPopupVisible && (
          <div className="overlay" onClick={closePopup}>
            <div className="purchase-popup" onClick={(e) => e.stopPropagation()}>
              <div className="option">
                <p>Starter Bundle</p>
                <div className="coin-animation">
                  <div className="coin">
                    <span className="coin-label">iCoin</span>
                  </div>
                </div>
                <p>50 iCoins: ₦800</p>
              </div>

              <div className="option">
                <p>Small Bundle</p>
                <div className="coin-animation">
                  <div className="coin">
                    <span className="coin-label">iCoin</span>
                  </div>
                </div>
                <p>120 iCoins: ₦1,700</p>
              </div>

              <div className="option">
                <p>Medium Bundle</p>
                <div className="coin-animation">
                  <div className="coin">
                    <span className="coin-label">iCoin</span>
                  </div>
                </div>
                <p>250 iCoins: ₦3,500</p>
              </div>

              <div className="option">
                <p>Large Bundle</p>
                <div className="coin-animation">
                  <div className="coin">
                    <span className="coin-label">iCoin</span>
                  </div>
                </div>
                <p>600 iCoins: ₦8,000</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IcoinInterface;
