// ==============================================
// firebase-config.js (UPDATED for Firebase 12.5.0)
// ==============================================

// Core App
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";

// Analytics (optional)
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";

// Firestore (with onSnapshot)
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,           // required
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
  where,
  serverTimestamp,
  onSnapshot        // realtime updates
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Auth
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// Storage
import {
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";

// ==============================================
// Your Firebase Config (New one you provided)
// ==============================================
const firebaseConfig = {
  apiKey: "AIzaSyDNwzhOkQQLAQbkiNFTFEGSpWJdKaxbTRk",
  authDomain: "iryastone-uk.firebaseapp.com",
  projectId: "iryastone-uk",
  storageBucket: "iryastone-uk.firebasestorage.app",
  messagingSenderId: "110940910896",
  appId: "1:110940910896:web:b25e92127118665e5c84f5",
  measurementId: "G-6YM1FLYN48"
};

// ==============================================
// Initialize Firebase
// ==============================================
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Google Provider
const googleProvider = new GoogleAuthProvider();

// ==============================================
// Export All Firebase Modules
// ==============================================
export {
  app,
  analytics,
  db,
  auth,
  storage,
  googleProvider,
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
  where,
  serverTimestamp,
  onSnapshot,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL
};
