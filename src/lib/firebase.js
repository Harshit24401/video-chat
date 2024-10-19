// Import the functions you need from the SDKs you need
import firebase from "firebase/app";
import "firebase/firestore";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API,
  authDomain: process.env.NEXT_PUBLIC_AUTH,
  projectId: process.env.NEXT_PUBLIC_ID,
  storageBucket: process.env.NEXT_PUBLIC_STO,
  messagingSenderId: process.env.NEXT_PUBLIC_MES,
  appId: process.env.NEXT_PUBLIC_APP,
  measurementId: process.env.NEXT_PUBLIC_MEAS,
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);
export { firestore };
