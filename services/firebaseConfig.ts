
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDyEa39IGXxt4ZIdUmwvai0Z9ItTwSUgs",
  authDomain: "james-website-56637.firebaseapp.com",
  projectId: "james-website-56637",
  storageBucket: "james-website-56637.firebasestorage.app",
  messagingSenderId: "767304081240",
  appId: "1:767304081240:web:cd924faafea6e9e32a0f2d",
  measurementId: "G-LPX7KQL2ZJ"
};

// Initialize Firebase
let app;
let db: any = null;
let analytics: any = null;
let storage: any = null;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
    // Initialize analytics if supported in this environment
    if (typeof window !== 'undefined') {
        analytics = getAnalytics(app);
    }
    console.log("Firebase initialized successfully");
} catch (e) {
    console.error("Firebase initialization failed:", e);
}

export { db, analytics, storage };
