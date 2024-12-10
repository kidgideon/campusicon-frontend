import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../config/firebase_config";
import { doc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { toast } from "react-hot-toast";

const SuccessPage = () => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const paymentReference = location.state?.reference;
  const bundlePrice = location.state?.amount;

  let purchasedIcoins = 0;

  const getCoinsForBundle = (price) => {
    if (price == 800) {
    purchasedIcoins = 50;
    } else if (price == 1700) {
     purchasedIcoins = 120;
    }  else if (price == 3500) {
     purchasedIcoins = 250;
    }
      else if (price == 8000){
      purchasedIcoins = 600;
      } 
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const companyFundsRef = doc(db, "companyfunds", "funds");

        getCoinsForBundle(bundlePrice);
    
        console.log(purchasedIcoins)
        if (paymentReference && paymentReference.status === "success") {
          setPaymentStatus("Payment successful!");

          try {
            // Update user's iCoin balance
            await updateDoc(userRef, {
              icoins: increment(purchasedIcoins),
              icoin_history: arrayUnion(`Purchased ${purchasedIcoins} iCoins`),
              notifications: arrayUnion({
                text: `Purchased ${purchasedIcoins} iCoins`,
                timestamp: Date.now(),
                type: "icoin",
                read: false,
              }),
            });

            // Calculate company funds details
            let profit = 0;

            if (purchasedIcoins == 50) {
              profit = 300;}
             else if (purchasedIcoins == 120) {
              profit = 500;}
            else if (purchasedIcoins == 250) {
              profit = 1000;}
            else if (purchasedIcoins == 600){ 
              profit = 2000;}

            const liability = bundlePrice - profit;

            // Update company funds
            await updateDoc(companyFundsRef, {
              balance: increment(bundlePrice),
              liability: increment(liability),
              profit: increment(profit),
            });

            toast.success("Your iCoin balance and company funds have been updated!");
          } catch (error) {
            console.error("Error updating user or company funds:", error);
            toast.error("Failed to update iCoin balance or company funds.");
          }
        } else {
          setPaymentStatus("Payment failed");
          toast.error("Payment failed. Please try again.");
        }
      } else {
        toast.error("You need to log in to make a payment.");
        navigate("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate, paymentReference, bundlePrice]);

  return (
    <div className="success-page">
      {loading ? (
        <p>Verifying payment...</p>
      ) : (
        <div>
          <h2>{paymentStatus}</h2>
          <div className="check-body">
            <i className="fa-solid fa-check"></i>
          </div>
          <button onClick={() => navigate("/icoins")}>Return</button>
        </div>
      )}
    </div>
  );
};

export default SuccessPage;
