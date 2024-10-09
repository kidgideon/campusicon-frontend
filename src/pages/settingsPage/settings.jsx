import React, { useState, useEffect } from 'react';
import { auth, db } from '../../../config/firebase_config';
import { updateEmail, sendPasswordResetEmail, signOut, deleteUser } from 'firebase/auth';
import { doc, getDoc, updateDoc, query, where, collection, getDocs } from 'firebase/firestore';
import './settings.css';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';
import {  useNavigate } from 'react-router-dom';
import Spinner from '../../assets/loadingSpinner'

const Settings = () => {
  const [userData, setUserData] = useState(null);
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setEmail(data.email);
          setDob(data.dob);
          setPhone(data.phone);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleEmailChange = async () => {
    const user = auth.currentUser;
    if (!email) return toast.error('Email cannot be empty.');

    const usersRef = collection(db, 'users');
    const emailQuery = query(usersRef, where('email', '==', email));
    const emailDocs = await getDocs(emailQuery);

    if (!emailDocs.empty) {
      return toast.error('Email already exists.');
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000); // 6-digit code
    setOtp(generatedOtp);

    try {
      await axios.post('https://campusicon-backend.onrender.com/send-code', { email, code: generatedOtp });
      toast.success('OTP sent to your email.');
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Error sending OTP.');
    }
  };

  const handleVerifyOtp = async () => {
    if (enteredOtp !== otp.toString()) {
      return toast.error('Invalid OTP.');
    }

    const user = auth.currentUser;
    try {
      await updateEmail(user, email);
      await updateDoc(doc(db, 'users', user.uid), { email });
      toast.success('Email updated successfully!');
    } catch (error) {
      console.error('Error updating email:', error);
      toast.error('Error updating email.');
    }
  };

  const handleUpdate = async () => {
    const user = auth.currentUser;
    if (user) {
      setLoading(true);
      try {
        await updateDoc(doc(db, 'users', user.uid), { dob, phone });
        setLoading(false);
        toast.success('Profile updated successfully!');
      } catch (error) {
        setLoading(false);
        console.error('Error updating profile:', error);
        toast.error('Error updating profile.');
      }
    }
  };

  const handlePasswordReset = async () => {
    const user = auth.currentUser;
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.success('Password reset email sent!');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Error sending password reset email.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    toast.success('Logged out successfully!');
    window.location.href = '/';
  };

  const handleDeactivateAccount = async () => {
    const user = auth.currentUser;
    if (user) {
      const confirmation = window.confirm('Are you sure you want to deactivate your account? This action cannot be undone.');
      if (confirmation) {
        try {
          await deleteUser(user);
          toast.success('Account deactivated successfully!');
          window.location.href = '/';
        } catch (error) {
          console.error('Error deactivating account:', error);
          toast.error('Error deactivating account.');
        }
      }
    }
  };

  if (!userData) return <h2><Spinner></Spinner></h2>;

  const goBack = () => {
    navigate(-1);
  };


  return (
    <div className="settings-page">
    <div className="top-top-sideliners">
        <i className="fas fa-arrow-left back-icon" onClick={goBack}></i> {/* Back button */}
        <h2 className='competition-rank-h1'>Settings</h2>
      </div>
      <div className="settings-section">
        <div className="settings-item">
          <i className="fa-solid fa-user"></i>
          <div className="settings-info">
            <label>Username</label>
            <p>{userData.username}</p>
          </div>
        </div>

        <div className="settings-item">
          <i className="fa-solid fa-envelope"></i>
          <div className="settings-info">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Update Email" />
            <button className="otp-button" onClick={handleEmailChange}>Send OTP</button>
          </div>
          {otp && (
            <div className="otp-verification">
              <input
                type="text"
                placeholder="Enter OTP"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
              />
              <button className="verify-button" onClick={handleVerifyOtp}>
                Verify OTP
              </button>
            </div>
          )}
        </div>

        <div className="settings-item">
          <i className="fa-solid fa-cake-candles"></i>
          <div className="settings-info">
            <label>Date of Birth</label>
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
          </div>
        </div>

        <div className="settings-item">
          <i className="fa-solid fa-phone"></i>
          <div className="settings-info">
            <label>Phone Number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Update Phone Number" />
          </div>
        </div>

        <button className="save-button" onClick={handleUpdate} disabled={loading}>
          {loading ? 'Updating...' : 'Save Changes'}
        </button>

        <div className="settings-item">
          <button className="password-reset-btn" onClick={handlePasswordReset}>
            Reset Password
          </button>
        </div>

        <div className="settings-item">
          <i className="fa-solid fa-right-from-bracket"></i>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="settings-item">
          <i className="fa-solid fa-trash"></i>
          <button className="deactivate-btn" onClick={handleDeactivateAccount}>
            Deactivate Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
