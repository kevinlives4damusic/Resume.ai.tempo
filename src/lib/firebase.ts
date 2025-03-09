// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD0Gc2fmlNXwyytN_YtVwkQTTjlAYoyE0U",
  authDomain: "resume-c993c.firebaseapp.com",
  projectId: "resume-c993c",
  storageBucket: "resume-c993c.firebasestorage.app",
  messagingSenderId: "378917563910",
  appId: "1:378917563910:web:7f289fbec01b9b067b1d87",
  measurementId: "G-8JJJRV1PBQ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };
