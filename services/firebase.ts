import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

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

// Enable offline persistence
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
       // Multiple tabs open, persistence can only be enabled in one tab at a a time.
       console.log('Persistence failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
       // The current browser does not support all of the features required to enable persistence
       console.log('Persistence failed: Not supported');
    }
  });
} catch (e) {
  console.log("Persistence initialization error", e);
}