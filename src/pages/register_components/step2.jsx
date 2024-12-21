// src/components/register/step2.jsx
import React from "react";
const whitelogo = "https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/logo.png?alt=media&token=97374df9-684d-44bf-ba79-54f5cb7d48b7";


const StepTwo = ({
  verificationCode,
  setVerificationCode,
  handleVerifyCode,
  loading,
  error,
  goBack
}) => {
  return (
    <div className='second-container'>
      <div className="head">
        <div className="register-page-logo">
          <img src={whitelogo} alt="Campus Icon Logo" />
        </div>
      </div>
      <i className="fas fa-arrow-left back-icon" onClick={goBack}></i>
      <h2>Enter Verification Code Sent To Your Email</h2>
      <input
        type="text"
        placeholder="Enter the 4-digit code"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
      />
      <button onClick={handleVerifyCode} disabled={loading}>
        {loading ? <div className="spinner"></div> : 'Verify Code'}
      </button>
    </div>
  );
};

export default StepTwo;
