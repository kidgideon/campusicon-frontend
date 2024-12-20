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
    if (price == 1200) {
    purchasedIcoins = 80;
    } else if (price == 2550) {
     purchasedIcoins = 210;
    }  else if (price == 4650) {
     purchasedIcoins = 390;
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

            if (purchasedIcoins == 80) {
              profit = 800;}
             else if (purchasedIcoins == 210) {
              profit = 1490;}
            else if (purchasedIcoins == 390) {
              profit = 2651}
          
            const liability = bundlePrice - profit;

            // Update company funds
            await updateDoc(companyFundsRef, {
              balance: increment(bundlePrice),
              liability: increment(liability),
              profit: increment(profit),
            });

            toast.success("Your iCoin balance been updated!");
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
