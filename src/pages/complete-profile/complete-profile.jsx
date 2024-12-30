import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../../config/firebase_config";
import './complete.css'
import { useNavigate } from "react-router-dom";
// Importing auth and db

const CompleteProfile = () => {
  const user = auth.currentUser; // Get the current user
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [campus, setCampus] = useState("");
  const [hobbies, setHobbies] = useState([]);
  const [newHobby, setNewHobby] = useState("");

  const handleNextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const handleCompleteProfile = async () => {
    try {
      // Update the Firestore user document with the new information
      await updateDoc(doc(db, "users", user.uid), {
        firstName,
        lastName,
        campus,
        hobbies,
      });
      toast.success("Profile updated successfully!");
      navigate('/')
    } catch (error) {
      toast.error("Error updating profile, please try again.");
    }
  };

  return (
    <div className="profile-complete-prompt-container">
      {step === 1 && (
        <div className="profile-complete-prompt-modal">
            <div>
            <i className="fa-solid fa-user"></i>
            <h2>complete your profile</h2>
            </div>
          <label className="profile-complete-prompt-label">
          
            <input
              className="profile-complete-prompt-input"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              required
              onFocus={(e) => e.target.placeholder = ""}
              onBlur={(e) => !e.target.value && (e.target.placeholder = "First Name")}
            />
          </label>
          <label className="profile-complete-prompt-label">
            <input
              className="profile-complete-prompt-input"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              required
              onFocus={(e) => e.target.placeholder = ""}
              onBlur={(e) => !e.target.value && (e.target.placeholder = "Last Name")}
            />
          </label>
          {firstName && lastName && (
            <button className="profile-complete-prompt-button" onClick={handleNextStep}>Next</button>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="profile-complete-prompt-modal">
            <div>
            <i className="fa-solid fa-school"></i>
            </div>
          <label className="profile-complete-prompt-label">
            <input
              className="profile-complete-prompt-input"
              type="text"
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
              placeholder="Campus"
              required
              onFocus={(e) => e.target.placeholder = ""}
              onBlur={(e) => !e.target.value && (e.target.placeholder = "Campus")}
            />
          </label>
          {campus && (
            <button className="profile-complete-prompt-button" onClick={handleNextStep}>Next</button>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="profile-complete-prompt-modal">
            <div>
            <i className="fa-brands fa-hornbill"></i>
            </div>
          <label className="profile-complete-prompt-label">
            Hobbies
            <input
              className="profile-complete-prompt-input"
              type="text"
              value={newHobby}
              onChange={(e) => setNewHobby(e.target.value)}
              placeholder="Add a hobby"
            />
          </label>
          <button
            className="profile-complete-prompt-button"
            onClick={() => {
              if (newHobby) {
                setHobbies([...hobbies, newHobby]);
                setNewHobby("");
              }
            }}
          >
            Add Hobby
          </button>
          <div className="profile-complete-prompt-hobbies-list">
            <ul>
              {hobbies.map((hobby, index) => (
                <li key={index}>{hobby}</li>
              ))}
            </ul>
          </div>
          <button className="profile-complete-prompt-button" onClick={handleCompleteProfile}>Complete Profile</button>
        </div>
      )}
    </div>
  );
};

export default CompleteProfile;
