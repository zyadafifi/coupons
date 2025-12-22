import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Capacitor } from "@capacitor/core";

const firebaseConfig = {
  apiKey: "AIzaSyAmJl2sK5HG-aIc6T8M6xdqV991mAeQ7n4",
  authDomain: "saving-b35f3.firebaseapp.com",
  projectId: "saving-b35f3",
  storageBucket: "saving-b35f3.firebasestorage.app",
  messagingSenderId: "626636527932",
  appId: "1:626636527932:web:4f387aba70b7e8753fa639",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Helper to check if running on native platform
export const isNativePlatform = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform();
