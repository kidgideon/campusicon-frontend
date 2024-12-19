import axios from 'axios';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, setDoc, doc, getDoc, getDocs, collection, updateDoc, arrayUnion, increment} from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { auth, db } from '../../../config/firebase_config';


export const sendOtp = async (email, code) => {
  try {
    await axios.post('https://campusicon-backend.onrender.com/send-code', { email, code });
    console.log("OTP sent successfully");
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP.");
  }
};

export const handleSendVerificationCode = async ({
  email,
  password,
  confirmPassword,
  username,
  firstName,
  surname,
  referralCode,
  bio,
  profilePicture,
  campus,
  dateJoined,
  socialMediaLinks,
  competitionsEntered,
  competitionWins,
  friends,
  currentParticipatingCompetitions,
  setGeneratedCode,
  setStep,
  setLoading,
}) => {
  setLoading(true);
  try {
    const generatedCode = Math.floor(1000 + Math.random() * 9000).toString(); // Generate a 4-digit code
    await sendOtp(email, generatedCode);
    setGeneratedCode(generatedCode); // Store the generated code in the state
    setStep(2); // Move to the next step
  } catch (error) {
    toast.error("An error occurred while sending the verification code.");
  } finally {
    setLoading(false);
  }
};
export const handleVerifyCode = async ({
  verificationCode,
  generatedCode,
  email,
  password,
  username,
  firstName,
  surname,
  referralCode,
  bio,
  profilePicture,
  campus,
  dateJoined,
  socialMediaLinks,
  competitionsEntered,
  competitionWins,
  friends,
  currentParticipatingCompetitions,
  setError,
  setLoading,
  navigate,
}) => {
  setLoading(true);
  try {
    if (verificationCode === generatedCode) {
      // Code is correct, proceed with registration
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const getStatusFromPoints = (points) => {
        if (points >= 0 && points <= 499) return "Lad";
        if (points >= 500 && points <= 1499) return "Rising Star";
        if (points >= 1500 && points <= 2499) return "Pace Setter";
        if (points >= 2500 && points <= 3499) return "Influencer";
        if (points >= 3500 && points <= 4499) return "Social Maven";
        if (points >= 4500 && points <= 5499) return "Iconic Figure";
        if (points >= 5500 && points <= 6499) return "Trailblazer";
        if (points >= 6500 && points <= 7499) return "Legend";
        if (points >= 7500 && points <= 8499) return "Campus Legend";
        if (points >= 8500 && points <= 10000) return "Campus Icon";
        return "Lad";
      };

      const status = getStatusFromPoints(0);

      // Add user to Firestore with uid
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        username,
        firstName,
        surname,
        referral: referralCode,
        bio,
        profilePicture,
        campus,
        dateJoined,
        socialMediaLinks,
        friends: [],
        points: 0,
        status: status,
        hobbies: [],
        wins: [],
        notifications: [],
        icoins : 100,
        icoin_History: [
          "earned 100 icoins as login bonus"
        ]
      });

      // Send welcome notification to the new user
      const welcomeNotification = {
        type: "notify",
        text: `Welcome ${username}, get to know our app better!`,
        link: "/awards-ranks",
        read: false,
        timestamp: new Date(),
      };

      await updateDoc(userDocRef, {
        notifications: arrayUnion(welcomeNotification),
      });

      // Handle referral logic
      if (referralCode) {
        const usersRef = collection(db, 'users');
        const querySnapshot = await getDocs(usersRef);
        let referrerUser = null;

        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.username === referralCode) {
            referrerUser = { ...userData, uid: doc.id }; // Store found referrer data
          }
        });

        if (referrerUser) {
          console.log("User found:", referrerUser.username); // Log the found user's username

          // Update points by incrementing by 3
          await updateDoc(doc(db, 'users', referrerUser.uid), {
            points: increment(3),
          });

          // Create a notification for the referrer
          const notification = {
            type: "friend",
            text: `${username} just signed in with your username!`,
            read: false,
            userId: user.uid, // ID of the user who just signed in
          };

          const friend = {
            userId: user.uid, // ID of the user who just signed in
          };

          // Update notifications array using arrayUnion
          await updateDoc(doc(db, 'users', referrerUser.uid), {
            notifications: arrayUnion(notification),
          });

          await updateDoc(doc(db, 'users', referrerUser.uid), {
            friends: arrayUnion(friend),
          });

        } else {
          console.log("No user found with the given referral code.");
        }
      }

      toast.success('Registration successful!');
      navigate('/login'); // Redirect to login page
    } else {
      throw new Error("Invalid verification code.");
    }
  } catch (error) {
    setError(error.message);
    toast.error(`An error occurred: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

