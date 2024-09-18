// src/utils/auth.js
import { auth } from '../../config/firebase_config';
import { getAuth } from 'firebase/auth';
export const getIdToken = async () => {
  const user = getAuth().currentUser;
  if (user) {
    return user.getIdToken(); // Retrieve the ID token
  }
  return null;
};
