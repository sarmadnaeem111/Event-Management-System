import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "AIzaSyAyr2VKB_4KxvxmbpHWIT2-Ajj5tiwwdMA",
  authDomain: "event-managment-972cd.firebaseapp.com",
  projectId: "event-managment-972cd",
  storageBucket: "event-managment-972cd.appspot.com",
  messagingSenderId: "79598305563",
  appId: "1:79598305563:web:88963ed659911f8ce353be"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app; 