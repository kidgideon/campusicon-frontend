import React from 'react';
import whitelogo from '../../assets/logo.png';

const LoginForm = ({ email, setEmail, password, setPassword, loading, error, handleSubmit, setForgotPassword }) => (
  <form onSubmit={handleSubmit}>
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
    <p>Don't have an account? <a href="/register">Register</a></p>
  </form>
);

export default LoginForm;
