
import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Analytics, getAnalytics } from 'firebase/analytics';

// Firebase configuration - using environment variables for security
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Lazy initialize Firebase
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
  if (!analytics) {
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
