import React from "react";
import svg from '../../assets/the.svg';
import { Link } from "react-router-dom";
const whitelogo = "https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/logo.png?alt=media&token=97374df9-684d-44bf-ba79-54f5cb7d48b7";


const StepOne = ({
  firstName,
  setFirstName,
  surname,
  setSurname,
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  referralCode,
  setReferralCode,
  bio,
  setBio,
  profilePicture,
  setProfilePicture,
  campus,
  setCampus,
  handleSendVerificationCode,
  loading,
  error,
}) => {
  return (
<div className="full-house">
<div className="container-form-register">
 
<div className="head">
<div className="register-page-logo">
  <img src={whitelogo} alt="Campus Icon Logo" />
</div>
</div>

    <h1>Create Your Account</h1>
    <div className="input-icon">
      <i className="fas fa-user"></i>
      <input
        type="text"
        placeholder="Enter first name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
    </div>

    <div className="input-icon">
      <i className="fas fa-user"></i>
      <input
        type="text"
        placeholder="Enter surname"
        value={surname}
        onChange={(e) => setSurname(e.target.value)}
      />
    </div>

    <div className="input-icon">
      <i className="fas fa-user"></i>
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
    </div>

    <div className="input-icon">
      <i className="fas fa-envelope"></i>
      <input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
    </div>

    <div className="input-icon">
      <i className="fas fa-lock"></i>
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
    </div>

    <div className="input-icon">
      <i className="fas fa-lock"></i>
      <input
        type="password"
        placeholder="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
    </div>

    <div className="input-icon">
      <i className="fas fa-gift"></i>
      <input
        type="text"
        placeholder="username of referral (optional)"
        value={referralCode}
        onChange={(e) => setReferralCode(e.target.value)}
      />
    </div>

    <div className="input-icon">
      <i className="fas fa-school"></i>
      <input
        type="text"
        placeholder="Whats the name of your campus"
        value={campus}
        onChange={(e) => setCampus(e.target.value)}
      />
    </div>


    <button onClick={handleSendVerificationCode} disabled={loading}>
      {loading ? <div className="spinner"></div> : 'Get Code'}
    </button>

    <p className="direction-text">Already have an account?  <Link to="/login">Login</Link></p>
  </div>
</div>

  );
};

export default StepOne;
