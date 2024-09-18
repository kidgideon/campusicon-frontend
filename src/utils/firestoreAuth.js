// src/utils/firestore.js
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

console.log('error from here')

export const getUserData = async (userId) => {
  try {
    const userDoc = doc(db, 'users', userId); // Assume your user documents are in a 'users' collection
    const docSnap = await getDoc(userDoc);

    if (docSnap.exists()) {
      return docSnap.data(); // Return user data
    } else {
      console.log('No such document!');
      return null;
    }
  } catch (error) {
    console.error('Error getting document:', error);
    return null;
  }
};
