import React, { useState } from "react";
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import StepOne from "./step1";
import StepTwo from "./step2";
import { handleSendVerificationCode, handleVerifyCode } from "./registerFunctions";
import '../../assets/register.css';
import whitelogo from '../../assets/logo.png';

function Register() {
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [bio, setBio] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [campus, setCampus] = useState("");
  const [dateJoined, setDateJoined] = useState(new Date().toISOString());
  const [socialMediaLinks, setSocialMediaLinks] = useState({});
  const [competitionsEntered, setCompetitionsEntered] = useState(0);
  const [competitionWins, setCompetitionWins] = useState(0);
  const [friends, setFriends] = useState([]);
  const [currentParticipatingCompetitions, setCurrentParticipatingCompetitions] = useState([]);
  
  const navigate = useNavigate(); // Initialize navigate

  const goBack = () => setStep(step - 1);

  const handleSendVerification = async () => {
    if (!email || !password || !confirmPassword || !username || !firstName || !surname || !campus) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      await handleSendVerificationCode({
        email,
        password,
        confirmPassword,
        username,
        firstName,
        surname,
        referralCode,
        bio,
        profilePicture,
        campus,
        dateJoined,
        socialMediaLinks,
        competitionsEntered,
        competitionWins,
        friends,
        currentParticipatingCompetitions,
        setGeneratedCode,
        setStep,
        setLoading,
      });
    } catch (error) {
      toast.error("An error occurred while sending the verification code.");
    }
  };

  const handleVerifyVerificationCode = async () => {
    if (!verificationCode) {
      toast.error("Please enter the verification code.");
      return;
    }

    try {
      await handleVerifyCode({
        verificationCode,
        generatedCode,
        email,
        password,
        username,
        firstName,
        surname,
        referralCode,
        bio,
        profilePicture,
        campus,
        dateJoined,
        socialMediaLinks,
        competitionsEntered,
        competitionWins,
        friends,
        currentParticipatingCompetitions,
        setError: (error) => toast.error(error),
        setLoading,
        navigate, // Pass navigate function to handleVerifyCode
      });
    } catch (error) {
      toast.error("An error occurred while verifying the code.");
    }
  };

  return (
    <div className="register-page-whole-body">
      <div className="head">
        <div className="register-page-logo">
          <img src={whitelogo} alt="Campus Icon Logo" />
        </div>
      </div>
      <div>
        {step === 1 && (
          <StepOne
            firstName={firstName}
            setFirstName={setFirstName}
            surname={surname}
            setSurname={setSurname}
            username={username}
            setUsername={setUsername}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            referralCode={referralCode}
            setReferralCode={setReferralCode}
            bio={bio}
            setBio={setBio}
            profilePicture={profilePicture}
            setProfilePicture={setProfilePicture}
            campus={campus}
            setCampus={setCampus}
            handleSendVerificationCode={handleSendVerification}
            loading={loading}
            error="" // React Hot Toast will handle error messages
          />
        )}

        {step === 2 && (
          <StepTwo
            verificationCode={verificationCode}
            setVerificationCode={setVerificationCode}
            handleVerifyCode={handleVerifyVerificationCode}
            loading={loading}
            error="" // React Hot Toast will handle error messages
            goBack={goBack}
          />
        )}
      </div>
    </div>
  );
}

export default Register;
