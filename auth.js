// auth.js - FINAL FIXED VERSION for Firebase 12.5.0 (GitHub Pages Safe)

// ===========================
// Firebase Core
// ===========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";

// ===========================
// Firestore
// ===========================
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// ===========================
// Auth
// ===========================
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// ===========================
// FIREBASE CONFIG
// ===========================
const firebaseConfig = {
  apiKey: "AIzaSyDNwzhOkQQLAQbkiNFTFEGSpWJdKaxbTRk",
  authDomain: "iryastone-uk.firebaseapp.com",
  projectId: "iryastone-uk",
  storageBucket: "iryastone-uk.firebasestorage.app",
  messagingSenderId: "110940910896",
  appId: "1:110940910896:web:b25e92127118665e5c84f5",
  measurementId: "G-6YM1FLYN48"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

// ==============================================================
//                    AUTH MANAGER
// ==============================================================
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.initAuthListener();
    this.handleGoogleRedirect();
  }

  // Handle Redirect Login Completion
  async handleGoogleRedirect() {
    try {
      const result = await getRedirectResult(auth);
      if (result && result.user) {
        await this.createUserDocument(result.user, result.user.displayName);
      }
    } catch (error) {
      console.error("Redirect error:", error);
    }
  }

  initAuthListener() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.updateUI(user);
    });
  }

  async signUp(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(userCredential.user, { displayName });

      await this.createUserDocument(userCredential.user, displayName);

      return { success: true, user: userCredential.user };

    } catch (error) {
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };

    } catch (error) {
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  // FIXED Google Login — Redirect method (GitHub safe)
  async signInWithGoogle() {
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  // FIXED — No duplicate user creation
  async createUserDocument(user, displayName) {
    try {
      const userDoc = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      };

      await setDoc(doc(db, "users", user.uid), userDoc, { merge: true });

      console.log("User document created/updated");

    } catch (error) {
      console.error("Error creating user document:", error);
    }
  }

  // ================= UI UPDATE LOGIC =================
  updateUI(user) {
    const loginBtn = document.getElementById('loginButton');
    const userProfile = document.getElementById('userProfile');
    const profileAvatar = document.getElementById('profileAvatar');
    const profileName = document.getElementById('profileName');
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserEmail = document.getElementById('dropdownUserEmail');

    if (user) {
      if (userProfile) userProfile.style.display = 'block';
      if (loginBtn) loginBtn.style.display = 'none';

      const name = user.displayName || "User";

      if (profileAvatar) profileAvatar.textContent = name.charAt(0).toUpperCase();
      if (profileName) profileName.textContent = name;
      if (dropdownUserName) dropdownUserName.textContent = name;
      if (dropdownUserEmail) dropdownUserEmail.textContent = user.email || "";

    } else {
      if (userProfile) userProfile.style.display = 'none';
      if (loginBtn) loginBtn.style.display = 'flex';
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  getErrorMessage(error) {
    switch (error.code) {
      case 'auth/invalid-email': return 'Invalid email format.';
      case 'auth/user-disabled': return 'This account is disabled.';
      case 'auth/user-not-found': return 'Account not found.';
      case 'auth/wrong-password': return 'Incorrect password.';
      case 'auth/email-already-in-use': return 'Email already exists.';
      case 'auth/weak-password': return 'Password must be 6+ characters.';
      case 'auth/network-request-failed': return 'Network error.';
      case 'auth/too-many-requests': return 'Too many attempts. Try later.';
      default: return error.message || 'Something went wrong.';
    }
  }
}

// ================= EXPORT =================
const authManager = new AuthManager();
export { authManager };
