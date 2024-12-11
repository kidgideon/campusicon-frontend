import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../config/firebase_config";
import { doc, getDoc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import axios from "axios";
import { toast } from "react-hot-toast";
import LoadingSpinner from "../../assets/loadingSpinner"

const WithdrawalPayment = () => {
  const { amount } = useParams(); // Amount from the URL
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [transferRecipient, setTransferRecipient] = useState(null);

  const PAYSTACK_SECRET_KEY = import.meta.env.VITE_PAYSTACK_SECRET_KEY;

  // Fetch user details on page load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const { transfer_recipient } = userDoc.data();
            if (!transfer_recipient) {
              throw new Error("Transfer recipient not set up for your account.");
            }
            setTransferRecipient(transfer_recipient);
          } else {
            throw new Error("User details not found.");
          }
        } catch (error) {
          console.error(error);
          toast.error(error.message || "An error occurred while fetching user details.");
          navigate("/error"); // Redirect to an error page if needed
        }
      } else {
        toast.error("You need to log in to proceed.");
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const goBack = () => {
    navigate(-1);
  };

  const updateDatabase = async () => {
    try {
      const userRef = doc(db, "users", userId);

      // Update user's iCoin history and balance
      await updateDoc(userRef, {
        icoin_history: arrayUnion(`Withdrew ${(amount / 10)} iCoins`),
        icoins: increment((-amount / 10)),
      });

      // Update company funds
      const fundsRef = doc(db, "companyfunds", "funds");
      await updateDoc(fundsRef, {
        balance: increment(-amount),
        liability: increment(-amount),
      });
    } catch (error) {
      console.error("Error updating database:", error);
      toast.error("An error occurred while updating the database.");
    }
  };

  const initiateTransfer = async () => {
    if (!transferRecipient) {
      toast.error("Transfer recipient not available.");
      return;
    }

    try {
      setProcessing(true);
      setError(null);

      const reference = `wd-${Math.floor(Math.random() * 1000000000)}`;

      const response = await axios.post(
        "https://api.paystack.co/transfer",
        {
          source: "balance",
          amount: amount * 100, // Amount in kobo
          reference,
          recipient: transferRecipient,
          reason: "Withdrawal Request",
        },
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const { data } = response;
      if (data.status) {
        toast.success("Withdrawal successful! Funds are being processed.");
        await updateDatabase(); // Update the database after successful withdrawal
        setSuccess(true);
      } else {
        console.error("Transfer failed:", data);
        throw new Error(data.message || "Transfer failed");
      }
    } catch (error) {
      console.error("Error occurred during transfer:", error.response ? error.response.data : error.message);
      setError("Unexpected error occurred. Please try again later.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner></LoadingSpinner>;
  }

  if (!transferRecipient) {
    return <div>Unable to load transfer details. Please try again later.</div>;
  }

  return (
    <div className="withdrawal-container">
      <div className="top-top-sideliners">
        <i className="fas fa-arrow-left" onClick={goBack}></i>
        <h2>Withdrawal</h2>
      </div>
      {!processing && !success && !error && (
        <div className="withdrawal-content">
          <h1>Confirm Your Withdrawal</h1>
          <p>You are withdrawing <strong>₦{amount}</strong> from your iCoin balance.</p>
          <p>Recipient: <strong>{transferRecipient}</strong></p>
          <button className="withdraw-button" onClick={initiateTransfer}>
            Withdraw Now
          </button>
        </div>
      )}

      {processing && (
        <div className="processing-container">
          <div className="spinner"></div>
          <p>Processing your withdrawal, please wait...</p>
        </div>
      )}

      {success && (
        <div className="success-container">
          <div className="success-icon">✔</div>
          <p>Withdrawal Successful!</p>
          <button className="success-button" onClick={() => navigate("/icoin")}>Return to Dashboard</button>
        </div>
      )}

      {error && (
        <div className="error-container">
          <div className="error-icon">✖</div>
          <p>{error}</p>
          <button className="error-button" onClick={goBack}>Go Back</button>
        </div>
      )}
    </div>
  );
};

export default WithdrawalPayment;
