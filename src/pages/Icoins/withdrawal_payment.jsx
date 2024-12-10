import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../config/firebase_config";
import { doc, getDoc } from "firebase/firestore"; // Firestore methods
import axios from "axios";
import { toast } from "react-hot-toast";


const WithdrawalPayment = () => {
  const { amount } = useParams(); // Amount from the URL
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transferRecipient, setTransferRecipient] = useState(null);

  const PAYSTACK_SECRET_KEY = import.meta.env.VITE_PAYSTACK_SECRET_KEY;

  // Fetch user details on page load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
    
      if (user) {
        setUserId(user.uid);
    
        try {
          // Fetch user data from Firestore
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

  // Perform the transfer
  const initiateTransfer = async () => {
    if (!transferRecipient) {
      toast.error("Transfer recipient not available.");
      return;
    }
  
    try {
      setProcessing(true);
  
      // Generate unique reference
      const reference = `wd-${Math.floor(Math.random() * 1000000000)}`;
  
      // Make transfer request
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
        setSuccess(true);
      } else {
        // Log the full error response data for debugging
        console.error("Transfer failed:", data);
        throw new Error(data.message || "Transfer failed");
      }
    } catch (error) {
      // Log full error details for debugging
      console.error("Error occurred during transfer:", error.response ? error.response.data : error.message);
      toast.error("An error occurred during the transfer. Please try again.");
    } finally {
      setProcessing(false);
    }
  };
  

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!transferRecipient) {
    return <div>Unable to load transfer details. Please try again later.</div>;
  }

  return (
    <div className="withdrawal-container">
      {!processing && !success && (
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
          <button className="success-button" onClick={() => navigate("/")}>
            Return to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default WithdrawalPayment;
