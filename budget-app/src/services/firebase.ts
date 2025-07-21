// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDTYY4f_kt6nlFxMSQEBgFGqswOskhBGSg",
  authDomain: "budget-app-9e1ed.firebaseapp.com",
  projectId: "budget-app-9e1ed",
  storageBucket: "budget-app-9e1ed.firebasestorage.app",
  messagingSenderId: "722586368938",
  appId: "1:722586368938:web:03b616d900ef896a01c9d3",
  measurementId: "G-8CJG9L7TP0",
  databaseURL: "https://budget-app-9e1ed.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);