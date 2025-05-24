import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';

// React Native Firebase automatically initializes from google-services.json (Android)
// and GoogleService-Info.plist (iOS).
// Explicit initializeApp({}) is generally not needed if those files are correctly in place
// and the native app is configured.
// However, checking if apps are loaded can be a good practice in some scenarios.
if (!firebase.apps.length) {
  // This line might be optional or even unnecessary if native setup is correct.
  // It's more common in web environments or when dynamically loading configurations.
  // For React Native Firebase, the native modules handle initialization.
  // firebase.initializeApp({}); 
  console.log('Firebase SDK Initialized (or re-checked) via JS. Native setup is primary.');
} else {
  console.log('Firebase SDK already initialized natively.');
}

export const getFirebaseAuth = () => {
  // Ensure we are returning the auth instance from the default app
  return firebase.auth();
};

export const getFirebaseFirestore = () => {
  // Ensure we are returning the firestore instance from the default app
  return firebase.firestore();
};

// Export the default firebase instance for convenience if needed elsewhere,
// though specific services like auth() and firestore() are usually preferred.
export default firebase;
