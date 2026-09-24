// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "cortexai-66ef0.firebaseapp.com",
  projectId: "cortexai-66ef0",
  storageBucket: "cortexai-66ef0.firebasestorage.app",
  messagingSenderId: "447660948131",
  appId: "1:447660948131:web:819db5c4f865ec3f5b1d16",
  measurementId: "G-M0KPE7Q8SE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
