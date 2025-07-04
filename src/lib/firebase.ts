// lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Only initialize the app on the client, when needed
const getFirebaseApp = () => {
  return !getApps().length ? initializeApp(firebaseConfig) : getApp();
};

export const getFirebaseAuth = () => getAuth(getFirebaseApp());
export const getFirestoreDB = () => getFirestore(getFirebaseApp());
export const auth = getFirebaseAuth();
export const db = getFirestoreDB();
