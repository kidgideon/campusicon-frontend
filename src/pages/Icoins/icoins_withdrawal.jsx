import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../../config/firebase_config";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import "./icoin_general_css.css"
import LoadingSpinner from "../../assets/loadingSpinner"

const WithdrawalPage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Fetch user data from Firestore
        const userRef = doc(db, "users", currentUser.uid);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
          setUserData(userSnapshot.data());
          
          // Check if user has provided bank details
          if (!userSnapshot.data().bank) {
            toast.error("Please provide your bank details before withdrawing.");
            navigate("/account-verification");  // Navigate to account verification page
            return;
          }
        }
      } else {
        toast.error("Please log in to access withdrawals.");
        navigate("/login");  // Redirect to login if the user is not authenticated
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const goBack = () => {
    navigate(-1)
  }

  const handleWithdraw = () => {
    const withdrawAmountNumber = parseInt(withdrawAmount);

    if (isNaN(withdrawAmountNumber) || withdrawAmountNumber <= 0) {
      toast.error("Please enter a valid withdrawal amount.");
      return;
    }

    if (withdrawAmountNumber < 1000) {
      toast.error("You must withdraw at least 1,000 iCoins (₦10,000 equivalent).");
      return;
    }

    if (withdrawAmountNumber > userData.icoins) {
      toast.error("Insufficient iCoins. Check your balance and try again.");
      return;
    }

    // Proceed to withdrawal process (e.g., redirect to Paystack or call another function)
    toast.success(`Proceeding to withdraw ${withdrawAmountNumber} iCoins (₦${withdrawAmountNumber * 10}).`);
    navigate(`/withdrawal/${withdrawAmountNumber * 10}`);
  };

  const calculateWorthInNaira = () => {
    const withdrawAmountNumber = parseInt(withdrawAmount);
    return isNaN(withdrawAmountNumber) ? 0 : withdrawAmountNumber * 10; // 1 iCoin = ₦10
  };

  if (loading) {
    return <LoadingSpinner></LoadingSpinner>;
  }

  return (
    <div className="withdrawal-page">
       <div className="top-top-sideliners">
          <i className="fas fa-arrow-left" onClick={goBack}></i>
          <h2>Withdraw</h2>
        </div>
      <h1>Enter the amount of iCoins you want to withdraw</h1>
      <p>Available Balance: {userData.icoins || 0} iCoins</p>
      <p>
        The worth of your withdrawal: ₦{calculateWorthInNaira()} (based on entered iCoins)
      </p>
      <input
        type="number"
        value={withdrawAmount}
        onChange={(e) => setWithdrawAmount(e.target.value)}
        placeholder="Enter amount to withdraw"
      />
      <button onClick={handleWithdraw}>Withdraw Now</button>
    </div>
  );
};

export default WithdrawalPage;
