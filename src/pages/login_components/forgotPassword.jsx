import React from 'react';
const whitelogo = "https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/logo.png?alt=media&token=97374df9-684d-44bf-ba79-54f5cb7d48b7";

const ForgotPasswordForm = ({
  forgotEmail,
  setForgotEmail,
  otpSent,
  otp,
  setOtp,
  userProfile,
  newPassword,
  setNewPassword,
  loading,
  error,
  handleForgotPassword,
  handleVerifyOtp,
}) => (
  <form onSubmit={otpSent ? handleVerifyOtp : handleForgotPassword}>
    <div className="icon">
      <img src={whitelogo} alt="Logo" />
    </div>
    {error && <div className="error-box">{error}</div>}
    <h3>Forgot Password</h3>
    <p>Please enter your email or username to reset your password</p>
    <div className="input-icon">
      <i className="fas fa-envelope"></i>
      <input
        type="email"
        placeholder="Email or Username"
        value={forgotEmail}
        onChange={(e) => setForgotEmail(e.target.value)}
        disabled={loading}
      />
    </div>
    {otpSent && (
      <>
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          disabled={loading}
        />
        {userProfile && <img src={userProfile} alt="User Profile" />}
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? <div className="spinner"></div> : 'Verify OTP'}
        </button>
      </>
    )}
    {!otpSent && (
      <button type="submit" disabled={loading}>
        {loading ? <div className="spinner"></div> : 'Send OTP'}
      </button>
    )}
  </form>
);

export default ForgotPasswordForm;
