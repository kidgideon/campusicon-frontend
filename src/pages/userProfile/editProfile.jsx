import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, updateProfile, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { storage } from '../../../config/firebase_config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './editProfile.css';
import Spinner from '../../assets/loadingSpinner'; // Assuming your spinner is a React component

// Default profile picture URL
const defaultProfilePictureURL = 'https://firebasestorage.googleapis.com/v0/b/campus-icon.appspot.com/o/empty-profile-image.webp?alt=media';

const EditProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    profilePicture: defaultProfilePictureURL,
    workplace: '',
    hobbies: [],
  });
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(defaultProfilePictureURL); // Add preview state
  const [newHobby, setNewHobby] = useState('');
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchProfile(user.uid);
      } else {
        toast.error('No user is currently authenticated.');
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, [auth, db]);

  const fetchProfile = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          ...data,
          profilePicture: data.profilePicture || defaultProfilePictureURL,
          hobbies: data.hobbies || [],
        });
        setPreview(data.profilePicture || defaultProfilePictureURL); // Set initial preview
      }
    } catch (error) {
      toast.error('Error fetching profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    
    // Preview the selected image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleAddHobby = () => {
    if (newHobby.trim()) {
      setProfile((prevProfile) => ({
        ...prevProfile,
        hobbies: [...prevProfile.hobbies, newHobby.trim()],
      }));
      setNewHobby('');
    }
  };

  const handleRemoveHobby = (hobbyToRemove) => {
    setProfile((prevProfile) => ({
      ...prevProfile,
      hobbies: prevProfile.hobbies.filter(hobby => hobby !== hobbyToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        const existingUser = userDoc.data();

        if (existingUser && existingUser.username !== profile.username) {
          const usernameRef = doc(db, 'usernames', profile.username);
          const usernameDoc = await getDoc(usernameRef);
          if (usernameDoc.exists()) {
            throw new Error('Username is already in use.');
          }
        }

        let profilePictureUrl = profile.profilePicture;

        if (image) {
          const imageRef = ref(storage, `profilePictures/${user.uid}`);
          await uploadBytes(imageRef, image);
          profilePictureUrl = await getDownloadURL(imageRef);
        }

        await updateProfile(user, {
          displayName: `${profile.firstName} ${profile.lastName}`,
        });

        await updateDoc(userRef, {
          ...profile,
          profilePicture: profilePictureUrl,
        });

        toast.success('Profile updated successfully!');
        navigate('/profile');
      }
    } catch (error) {
      toast.error('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <Spinner />; // Display the spinner while loading
  }

  return (
    <div className='edit-layout'>
      <div className="top-area">
        <i className="fas fa-arrow-left back-icon" onClick={goBack}></i>
      </div>
      <div className="profile-picture">
        <div className="profilepicture">
          <img src={preview} alt="Profile" />
          <label htmlFor="file-upload" className="upload-icon">
            <i className="fas fa-pencil-alt"></i>
          </label>
          <input 
            type="file" 
            id="file-upload"
            accept="image/*" 
            onChange={handleImageChange} 
            style={{ display: 'none' }} 
          />
        </div>
      </div>
      <div className="orther-informations">
        <input 
          type="text" 
          name="firstName" 
          value={profile.firstName} 
          onChange={handleChange} 
          placeholder="First Name" 
        />
        <input 
          type="text" 
          name="lastName" 
          value={profile.lastName} 
          onChange={handleChange} 
          placeholder="Last Name" 
        />
        <input 
          type="text" 
          name="username" 
          value={profile.username} 
          onChange={handleChange} 
          placeholder="Username" 
        />
        <input 
          type="text" 
          name="bio" 
          value={profile.bio} 
          onChange={handleChange} 
          placeholder="Bio" 
        />
        <input 
          type="text" 
          name="workplace" 
          value={profile.workplace} 
          onChange={handleChange} 
          placeholder="Workplace" 
        />
        <div>
          <input 
            type="text" 
            value={newHobby} 
            onChange={(e) => setNewHobby(e.target.value)} 
            placeholder="Add a hobby" 
          />
          <button onClick={handleAddHobby}>Add Hobby</button>
        </div>
        <ul>
          {profile.hobbies.map(hobby => (
            <li key={hobby}>
              {hobby}
              <button className='btn-remove' onClick={() => handleRemoveHobby(hobby)}>Remove</button>
            </li>
          ))}
        </ul>
        <button onClick={handleSubmit}>Save</button>
      </div>
    </div>
  );
};

export default EditProfile;
