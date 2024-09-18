import React from "react";
import svg from '../../assets/the.svg';

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
    <div className='container'>
      <div className="svg-div">
        <img className="design-svg" src={svg} alt="Design" />
      </div>
      <div className="container-form">
        <div className="main-form">
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
              placeholder="Referral code (optional)"
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

          <p className="direction-text">Already have an account? <a className="link" href="login">Sign in</a></p>
        </div>
      </div>
    </div>
  );
};

export default StepOne;
