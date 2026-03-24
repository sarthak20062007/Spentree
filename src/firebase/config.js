// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCJSZVFRaYoock2rftzr_nDtWc6-D4klaA",
  authDomain: "spentree-83d4a.firebaseapp.com",
  projectId: "spentree-83d4a",
  storageBucket: "spentree-83d4a.firebasestorage.app",
  messagingSenderId: "16970988102",
  appId: "1:16970988102:web:60de67655d1bdd8aa6a847",
  measurementId: "G-MZHBEYPMHN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
