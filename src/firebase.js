
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD50oWI-XAxH2WeYV2n0BGnAyIW81IebU0",
  authDomain: "expense-tracker-151cc.firebaseapp.com",
  projectId: "expense-tracker-151cc",
  storageBucket: "expense-tracker-151cc.appspot.com",
  messagingSenderId: "661703981332",
  appId: "1:661703981332:web:34347cf98590c4fb572a01"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();