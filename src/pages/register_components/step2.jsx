// src/components/register/step2.jsx
import React from "react";

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
      <i className="fas fa-arrow-left back-icon" onClick={goBack}></i>
      <h2>Enter Verification Code</h2>
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
