import React from 'react';
import { Link } from 'react-router-dom';
const whitelogo = "https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/logo.png?alt=media&token=97374df9-684d-44bf-ba79-54f5cb7d48b7";

const LoginForm = ({ email, setEmail, password, setPassword, loading, error, handleSubmit, setForgotPassword }) => (
  <form className='theForm-for-Login' onSubmit={handleSubmit}>
    <div className="icon">
      <img src={whitelogo} alt="Logo" />
    </div>
    {error && <div className="error-box">{error}</div>}
    <div className="input-icon">
      <i className="fas fa-envelope"></i>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
    </div>
    <div className="input-icon">
      <i className="fas fa-lock"></i>
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
    </div>
    <p onClick={() => setForgotPassword(true)}>Forgot password?</p>
    <button type="submit" disabled={loading}>
      {loading ? <div className="spinner"></div> : 'Login'}
    </button>
    <p>Don't have an account? <Link to="/register">register</Link></p>
  </form>
);

export default LoginForm;
