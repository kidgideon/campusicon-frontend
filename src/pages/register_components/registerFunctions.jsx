import axios from 'axios';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
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
  navigate, // Add navigate parameter
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
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid, // Save the user's UID here
        email: user.email,
        username,
        firstName,
        surname,
        referralCode,
        bio,
        profilePicture ,
        campus,
        dateJoined,
        socialMediaLinks,
        competitionsEntered,
        competitionWins,
        friends,
        points: 0, 
        status: status,
        // Initialize points
        // Add additional user information here
      });

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
