// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBXGhT17g4Enp2UP4fergDBPkPwBIAazmA",
  authDomain: "retrospecs-app.firebaseapp.com",
  projectId: "retrospecs-app",
  storageBucket: "retrospecs-app.firebasestorage.app",
  messagingSenderId: "710017918551",
  appId: "1:710017918551:web:122f6dfea2d5821b4aa512",
  measurementId: "G-QG4XCLHX4Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
export {app, auth}