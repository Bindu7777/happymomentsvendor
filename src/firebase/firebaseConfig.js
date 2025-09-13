import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyAI6iUkog5rOPP3VALeEQlv0byTdJnk5z0",
    authDomain: "happymoments-63594.firebaseapp.com",
    projectId: "happymoments-63594",
    storageBucket: "happymoments-63594.firebasestorage.app",
    messagingSenderId: "295583515951",
    appId: "1:295583515951:web:bb0ca1d3b4f0f235790dda",
    measurementId: "G-7482F5BJ2T"
  };
console.log("API Key:", import.meta.env.VITE_FIREBASE_API_KEY);

const app = initializeApp(firebaseConfig);
try {
  // Check if the app is initialized correctly  
    if (!app) {
        throw new Error("Firebase app initialization failed");
    }   
}
catch (error) {
    console.error("Firebase app initialization error:", error);
    // Handle the error as needed, e.g., show a user-friendly message or retry
}
console.log("Firebase app initialized:", app.name); // Optional: Log the app name to confirm initialization
export const auth = getAuth(app); // Initialize Firebase Authentication
export const db = getFirestore(app);
