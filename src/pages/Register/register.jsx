import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../../config/firebase_config";
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import "./register.css";
import toast from 'react-hot-toast';

const whiteLogo =
  "https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/campusicon.lightlogo.jpg?alt=media&token=00ac4bd4-f813-409d-a534-70b2c472bd04";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Initialize useNavigate

  const provider = new GoogleAuthProvider();

  // Input handler
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Check for duplicates in Firestore
  const checkForDuplicate = async (field, value) => {
    const usersRef = collection(db, "users");
    const fieldQuery = query(usersRef, where(field, "==", value));
    const querySnapshot = await getDocs(fieldQuery);
    return !querySnapshot.empty; // True if duplicate exists
  };

  // Email Signup
  const handleEmailSignup = async () => {
    const { username, email, password } = formData;

    if (!username || !email || !password) {
      toast.error("All fields are required.");
      return;
    }

    setLoading(true);

    try {
      // Check for duplicates
      const emailExists = await checkForDuplicate("email", email);
      const usernameExists = await checkForDuplicate("username", username);

      if (emailExists) {
        toast.error("Email is already registered. Please log in.");
        navigate('/login')
        setLoading(false);
        return;
      }

      if (usernameExists) {
        toast.error("Username is already taken. Please choose another.");
        setLoading(false);
        return;
      }

      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send verification email
      await sendEmailVerification(user);

      // Save user to Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        username,
        referral: "", // Optional
        bio: "", // Optional
        profilePicture: "", // Optional
        campus: "", // Optional
        dateJoined: new Date(),
        socialMediaLinks: {}, // Optional
        friends: [],
        points: 0,
        status: "Active",
        hobbies: [],
        wins: [],
        notifications: [],
        icoins: 10,
        icoin_History: ["earned 10 icoins as login bonus"],
      });

      toast.success("Verification email sent! Please check your inbox.");
      setLoading(false);
      setTimeout(() => {
        window.location.href = "/login"; // Redirect to login
      }, 2000);
    } catch (error) {
      console.error("Error during email signup:", error);
      toast.error("oops couldnt sign you in try again later");
      setLoading(false);
    }
  };

  // Google Signup
  const handleGoogleSignup = async () => {
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check for duplicate email
      const emailExists = await checkForDuplicate("email", user.email);
      if (emailExists) {
        toast.error("Email is already registered. Please log in.");
        setLoading(false);
        return;
      }

      // Generate unique username
      const generateRandomUsername = async () => {
        const randomUsername = `GoogleUser${Math.floor(Math.random() * 10000)}`;
        const usernameExists = await checkForDuplicate("username", randomUsername);

        if (!usernameExists) {
          return randomUsername;
        }

        return generateRandomUsername();
      };

      const uniqueUsername = await generateRandomUsername();

      // Save user to Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        username: uniqueUsername,
        referral: "", // Optional
        bio: "", // Optional
        profilePicture: user.photoURL || "", // From Google
        campus: "", // Optional
        dateJoined: new Date(),
        socialMediaLinks: {}, // Optional
        friends: [],
        points: 0,
        status: "Active",
        hobbies: [],
        wins: [],
        notifications: [],
        icoins: 10,
        icoin_History: ["earned 10 icoins as login bonus"],
      });

      toast.success("Account created successfully! Please log in.");
      setLoading(false);
      setTimeout(() => {
        window.location.href = "/login"; // Redirect to login
      }, 2000);
    } catch (error) {
      console.error("Error during Google signup:", error);
      toast.error("oops there was an error signing you in! please try again later");
      setLoading(false);
    }
  };

  return (
    <div className="register-page__custom">
   <div className="register-container__custom">
      <img src={whiteLogo} alt="Campus Icon Logo" className="register-logo__custom" />
      <h1>Signup</h1>
      <form className="register-form__custom" onSubmit={(e) => e.preventDefault()}>
        <div className="form-group__custom">
          <input
            type="text"
            id="username"
            name="username"
            placeholder=" "
            value={formData.username}
            onChange={handleInputChange}
          />
          <label htmlFor="username">Username</label>
        </div>
        <div className="form-group__custom">
          <input
            type="email"
            id="email"
            name="email"
            placeholder=" "
            value={formData.email}
            onChange={handleInputChange}
          />
          <label htmlFor="email">Email</label>
        </div>
        <div className="form-group__custom">
          <input
            type="password"
            id="password"
            name="password"
            placeholder=" "
            value={formData.password}
            onChange={handleInputChange}
          />
          <label htmlFor="password">Password</label>
        </div>
        <button
          type="button"
          className="register-button__custom"
          onClick={handleEmailSignup}
          disabled={loading}
        >
          {loading ? <span className="spinner__custom"></span> : "Sign Up"}
        </button>
      </form>
      <p>Already have an account ?<a href="/login">signin</a></p>
      <button
        className="google-signup-button__custom"
        onClick={handleGoogleSignup}
        disabled={loading}
      >
        {loading ? <span className="spinner__custom"></span> : <i style={{margin : '5px'}} className="fa-brands fa-google"></i>} Sign Up with Google
      </button>
    </div>
    </div>
 
  );
};

export default Register;
