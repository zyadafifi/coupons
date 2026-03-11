import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Capacitor } from "@capacitor/core";

// Use env vars when set (e.g. different envs); fallback to hardcoded for backward compatibility
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyAmJl2sK5HG-aIc6T8M6xdqV991mAeQ7n4",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "saving-b35f3.firebaseapp.com",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || "saving-b35f3",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "saving-b35f3.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "626636527932",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:626636527932:web:4f387aba70b7e8753fa639",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Helper to check if running on native platform
export const isNativePlatform = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform();
