import React, { useState } from 'react';
import { auth } from '../../../config/firebase_config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, query, where, getDocs, collection, updateDoc, doc } from 'firebase/firestore';
import axios from 'axios';
import LoginForm from './loginForm.jsx';
import ForgotPasswordForm from '../login_components/forgotPassword';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../../assets/login.css';

const db = getFirestore();

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtp = async (email, code) => {
  try {
    await axios.post('https://campusicon-backend.onrender.com/send-code', { email, code });
  } catch (error) {
    console.error("Error sending OTP:", error);
  }
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [storedOtp, setStoredOtp] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Logged in successfully!');
      navigate('/'); // Redirect to the dashboard
    } catch (error) {
      toast.error('Error logging in: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const usersQuery = query(collection(db, 'users'), where('email', '==', forgotEmail));
      const querySnapshot = await getDocs(usersQuery);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        setUserProfile(userDoc.data().photoURL); 
        const generatedOtp = generateOtp(); 
        setStoredOtp(generatedOtp); 
        setOtpSent(true);
        await sendOtp(forgotEmail, generatedOtp); 
        toast.success('OTP sent to your email');
      } else {
        toast.error('User not found');
      }
    } catch (error) {
      toast.error('Error finding user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (otp === storedOtp) {
      try {
        const usersQuery = query(collection(db, 'users'), where('email', '==', forgotEmail));
        const querySnapshot = await getDocs(usersQuery);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          await updateDoc(doc(db, 'users', userDoc.id), { password: newPassword });
          toast.success('Password updated successfully!');
          navigate('/login'); // Redirect to login page after updating password
        } else {
          toast.error('User not found');
        }
      } catch (error) {
        toast.error('Error updating password: ' + error.message);
      }
    } else {
      toast.error('Invalid OTP');
    }
  };

  return (
    <div className="login-page-interface">
      <i className="fas fa-arrow-left back-icon" onClick={() => window.history.back()}></i>
      {!forgotPassword ? (
        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          loading={loading}
          error={error}
          handleSubmit={handleSubmit}
          setForgotPassword={setForgotPassword}
        />
      ) : (
        <ForgotPasswordForm
          forgotEmail={forgotEmail}
          setForgotEmail={setForgotEmail}
          otpSent={otpSent}
          otp={otp}
          setOtp={setOtp}
          userProfile={userProfile}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          loading={loading}
          error={error}
          handleForgotPassword={handleForgotPassword}
          handleVerifyOtp={handleVerifyOtp}
        />
      )}
    </div>
  );
}

export default Login;
