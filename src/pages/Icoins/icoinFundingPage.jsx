import React, { useEffect, useState } from "react";
import { PaystackButton } from "react-paystack";
import { useParams, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../config/firebase_config"; // Adjust the path based on your project structure
import { toast} from 'react-hot-toast'; // Import toast and ToastContainer


const IcoinPayment = () => {
  const { amount } = useParams(); // Get the amount from the URL parameter
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  // Paystack configuration
  const publicKey = "pk_live_34e2037efd63904c29ff6a9163a29c662409d8de";
  const amountInKobo = amount * 100; // Paystack requires amount in kobo (Naira * 100)
  const reference = `ref-${Math.floor(Math.random() * 1000000000)}`; // Unique reference

  // Callback after successful payment
  const onSuccess = (reference) => {
    toast.success("Payment successful!"); // Show success toast
    // Directly navigate to the success page with the reference passed in the state
    navigate("/payment/success", { state: { reference, amount } });
  };

  // Callback after payment cancellation
  const onClose = () => {
    console.log("Payment cancelled");
    toast.error("Payment was cancelled."); // Show cancellation toast
  };

  // Retrieve logged-in user's email
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        toast.error("You need to log in to make a payment."); // Show login required toast
        navigate("/login"); // Redirect to login if no user is logged in
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Clean up the listener
  }, [navigate]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!userEmail) {
    return null; // Prevent rendering if email is not yet available
  }

  // Button component configuration
  const paystackProps = {
    email: userEmail,
    amount: amountInKobo,
    publicKey,
    text: "Pay Now",
    onSuccess,
    onClose,
    reference,
  };

  return (
    <div style={{
      
      textAlign: "center", padding: "2rem", width: "100%", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
      <h1>Confirm Your Payment</h1>
      <p>You are paying ₦{amount} for iCoins.</p>
      <PaystackButton {...paystackProps} />
    </div>
  );
};

export default IcoinPayment;
