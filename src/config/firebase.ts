
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { Analytics, getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhV6m8RZSu3erC_zKYOMyrfSyDmyxmLTw",
  authDomain: "dotogether-c0b18.firebaseapp.com",
  projectId: "dotogether-c0b18",
  storageBucket: "dotogether-c0b18.firebasestorage.app",
  messagingSenderId: "52364021580",
  appId: "1:52364021580:web:2dfb4a01dcab82862e09e9",
  measurementId: "G-0L7W6M722D"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics;

// Initialize Firebase only when needed
const getFirebaseApp = (): FirebaseApp => {
  if (!app) {
    console.log("Initializing Firebase app");
    try {
      app = initializeApp(firebaseConfig);
      console.log("Firebase app initialized successfully");
    } catch (error) {
      console.error("Error initializing Firebase app:", error);
      throw error;
    }
  }
  return app;
};

const getFirebaseAuth = (): Auth => {
  if (!auth) {
    console.log("Initializing Firebase auth");
    try {
      auth = getAuth(getFirebaseApp());
      console.log("Firebase auth initialized successfully");
    } catch (error) {
      console.error("Error initializing Firebase auth:", error);
      throw error;
    }
  }
  return auth;
};

const getFirebaseFirestore = (): Firestore => {
  if (!db) {
    console.log("Initializing Firebase firestore");
    try {
      db = getFirestore(getFirebaseApp());
      console.log("Firebase firestore initialized successfully");
    } catch (error) {
      console.error("Error initializing Firebase firestore:", error);
      throw error;
    }
  }
  return db;
};

const getFirebaseAnalytics = (): Analytics => {
  if (!analytics && typeof window !== 'undefined') {
    console.log("Initializing Firebase analytics");
    try {
      analytics = getAnalytics(getFirebaseApp());
      console.log("Firebase analytics initialized successfully");
    } catch (error) {
      console.error("Error initializing Firebase analytics:", error);
      throw error;
    }
  }
  return analytics;
};

export { getFirebaseApp, getFirebaseAuth, getFirebaseFirestore, getFirebaseAnalytics };
