import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAXNz3I7R94mQtzZCb3NdQ-Ik9kVzNIusg",
  authDomain: "onyx-productivity-d1e9f.firebaseapp.com",
  projectId: "onyx-productivity-d1e9f",
  storageBucket: "onyx-productivity-d1e9f.firebasestorage.app",
  messagingSenderId: "741250061352",
  appId: "1:741250061352:web:651830b8834ea417f8511d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);