import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDWYTIF28fYXR5ydS3TbkS4FXxo-wF9FUY",
  authDomain: "k-finder-eb3d0.firebaseapp.com",
  projectId: "k-finder-eb3d0",
  storageBucket: "k-finder-eb3d0.firebasestorage.app",
  messagingSenderId: "1018195924384",
  appId: "1:1018195924384:web:184365fedce11dfc1140c5",
  measurementId: "G-41J4662T6F",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
