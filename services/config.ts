import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCJI3t0Fchqz-L2sKKyYSQEvu1fzlUMBR8",
  authDomain: "parkingaid-75469.firebaseapp.com",
  databaseURL: "https://parkingaid-75469-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "parkingaid-75469",
  storageBucket: "parkingaid-75469.appspot.com",
  messagingSenderId: "81684640897",
  appId: "1:81684640897:web:f77a4541bef16f626a8980",
  measurementId: "G-DNQPZFDC7G"
};

export const FIREBASE_APP = initializeApp(firebaseConfig);

export const FIREBASE_AUTH = getAuth(FIREBASE_APP);

export const FIRESTORE_DB = getFirestore(FIREBASE_APP);

export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);