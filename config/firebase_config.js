import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuKW8sLu7yiui2O5aVKCOupNUSSLUnN-Q",
  authDomain: "campus-icon.firebaseapp.com",
  projectId: "campus-icon",
  storageBucket: "campus-icon.appspot.com",
  messagingSenderId: "874830323638",
  appId: "1:874830323638:web:fcc0ce1e099e25a7a62b17",
  measurementId: "G-K67044JQM2"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Firestore (this enables logging)
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true // Avoids issues with undefined properties
});
