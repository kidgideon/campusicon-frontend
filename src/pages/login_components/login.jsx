import React, { useState } from "react";
import { auth, db } from "../../../config/firebase_config";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getDocs, collection, query, where } from "firebase/firestore";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "./login.css";

const whiteLogo =
  "https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/campusicon.lightlogo.jpg?alt=media&token=00ac4bd4-f813-409d-a534-70b2c472bd04";


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const navigate = useNavigate();

  // Google sign-in handler
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check Firestore for the user
      const usersQuery = query(collection(db, "users"), where("email", "==", user.email));
      const querySnapshot = await getDocs(usersQuery);

      if (querySnapshot.empty) {
        toast.error("Account not found. Please sign up first.");
        setTimeout(() => {
          navigate("/signup");
        }, 2000);
      } else {
        toast.success("Logged in successfully!");
        setTimeout(() => {
          navigate("/"); // Redirect to homepage
        }, 2000);
      }
    } catch (error) {
      toast.error("failed to sign you in please try again later");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Check if the email is verified
      if (user.emailVerified) {
        toast.success("Logged in successfully!");
        setTimeout(() => {
          navigate("/"); // Redirect to homepage
        }, 2000);
      } else {
        // Email not verified
        toast.error("Please verify your email before logging in.");
        // Optionally, you can re-send the verification email
        // await user.sendEmailVerification();
      }
    } catch (error) {
      toast.error("Sign-in unsuccessful. Please check your email and password or try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Forgot password handler
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Use Firebase's password reset email method
      await sendPasswordResetEmail(auth, forgotEmail);
      toast.success("Password reset email sent! Check your inbox.");
      setTimeout(() => {
        setForgotPassword(false); // Close forgot password modal
      }, 2000)
    } catch (error) {
      toast.error("Error sending password reset email: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-interface">
      <img src={whiteLogo} alt="" />
      <div className="login-container">
        {!forgotPassword ? (
          <form onSubmit={handleSubmit} className="login-form">
            <h1>signing</h1>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Loading..." : "Login"}
            </button>
            <p onClick={() => setForgotPassword(true)} className="forgot-password-link">
              Forgot Password?
            </p>
            <button
              type="button"
              className="google-signin-button"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
             <i style={{margin : '5px'}} className="fa-brands fa-google"></i>
              {loading ? "Loading..." : "Sign in with Google"}

            </button>

            <p>Don't have an account yet? <a className="link-link" href="/register">sign up</a></p>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="forgot-password-form">
            <h2>Forgot Password</h2>
            <input
              type="email"
              placeholder="Enter your email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Loading..." : "Send Reset Email"}
            </button>
            <p onClick={() => setForgotPassword(false)} className="back-to-login-link">
              Back to Login
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default Login;
