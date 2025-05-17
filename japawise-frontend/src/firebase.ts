// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBMOn_6VJzFN3wUUTMRWjCCITXhhip_rWY",
  authDomain: "japawise-auth.firebaseapp.com",
  projectId: "japawise-auth",
  storageBucket: "japawise-auth.firebasestorage.app",
  messagingSenderId: "60857539182",
  appId: "1:60857539182:web:7df0a3f2fe3914d8bea47f",
  measurementId: "G-0ZJJX7YEZS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);