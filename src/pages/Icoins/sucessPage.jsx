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

  const getCoinsForBundle = (price) => {
   if (price == 800) {
    return 50;
   } else if (price == 1700) {
        return 120;
    } else if (price == 3500) {
        return 250
     } else if (price == 8000) {
        return 600
     }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const purchasedIcoins = getCoinsForBundle(bundlePrice);
 console.log(purchasedIcoins)
        if (paymentReference && paymentReference.status === "success") {
          setPaymentStatus("Payment successful!");

          try {
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

            toast.success("Your iCoin balance has been updated!");
          } catch (error) {
            console.error("Error updating user details:", error);
            toast.error("Failed to update iCoin balance.");
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
