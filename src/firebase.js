// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC-4-F6ogbiclbeZ93L3Ha_RkeHIv-AYHg",
  authDomain: "tksecurity-7cb4b.firebaseapp.com",
  databaseURL: "https://tksecurity-7cb4b-default-rtdb.firebaseio.com",
  projectId: "tksecurity-7cb4b",
  storageBucket: "tksecurity-7cb4b.firebasestorage.app",
  messagingSenderId: "87336783354",
  appId: "1:87336783354:web:4efb0e75c120d404e76843",
  measurementId: "G-KQ9M2594JQ"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, db, firestore, storage };