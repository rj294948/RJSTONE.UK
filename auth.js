// ===========================
// auth.js - FINAL FIXED FOR GITHUB PAGES (Firebase 12.5.0)
// ===========================

// Firebase Core
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";

// Firestore
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Firebase Auth
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile,
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
  measurementId: "G-6YM1FLYN48",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// ===========================
// GOOGLE PROVIDER (FIXED REDIRECT)
// ===========================
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
  redirect_uri: "https://rj294948.github.io/RJSTONE.UK/__/auth/handler"
});

// ======================================================================
//                AUTH MANAGER (LATEST, STABLE, POPUP SAFE)
// ======================================================================
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.setupAuthListener();
  }

  // Realtime login listener
  setupAuthListener() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.updateUI(user);

      if (user) {
        localStorage.setItem("authUser", JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        }));
      } else {
        localStorage.removeItem("authUser");
      }
    });
  }

  // Check login
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Email Signup
  async signUp(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCredential.user, { displayName });

      await this.saveUserToFirestore(userCredential.user);

      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: this.errorMessage(error) };
    }
  }

  // Email Login
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: this.errorMessage(error) };
    }
  }

  // GOOGLE LOGIN FIXED
  async signInWithGoogle() {
    try {

      // Force correct redirect every time
      googleProvider.setCustomParameters({
        prompt: "select_account",
        redirect_uri: "https://rj294948.github.io/RJSTONE.UK/__/auth/handler"
      });

      const result = await signInWithPopup(auth, googleProvider);

      await this.saveUserToFirestore(result.user);

      return { success: true, user: result.user };
    } catch (error) {
      console.error("Google Login Error:", error);
      return { success: false, error: this.errorMessage(error) };
    }
  }

  // Logout
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: this.errorMessage(error) };
    }
  }

  // Save User Firestore
  async saveUserToFirestore(user) {
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "User",
          photoURL: user.photoURL || null,
          lastLogin: serverTimestamp(),
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Firestore save error:", error);
    }
  }

  // UI Update
  updateUI(user) {
    const loginBtn = document.getElementById("loginButton");
    const userProfile = document.getElementById("userProfile");
    const profileAvatar = document.getElementById("profileAvatar");
    const profileName = document.getElementById("profileName");
    const dropdownUserName = document.getElementById("dropdownUserName");
    const dropdownUserEmail = document.getElementById("dropdownUserEmail");

    if (user) {
      if (loginBtn) loginBtn.style.display = "none";
      if (userProfile) userProfile.style.display = "block";

      const name = user.displayName || "User";

      if (profileAvatar) profileAvatar.textContent = name.charAt(0);
      if (profileName) profileName.textContent = name;
      if (dropdownUserName) dropdownUserName.textContent = name;
      if (dropdownUserEmail) dropdownUserEmail.textContent = user.email;
    } else {
      if (loginBtn) loginBtn.style.display = "flex";
      if (userProfile) userProfile.style.display = "none";
    }
  }

  // Error Handler
  errorMessage(error) {
    const messages = {
      "auth/invalid-email": "Invalid email format.",
      "auth/user-disabled": "Your account is disabled.",
      "auth/user-not-found": "Email not registered.",
      "auth/wrong-password": "Incorrect password.",
      "auth/email-already-in-use": "Email already registered.",
      "auth/weak-password": "Password is too weak.",
      "auth/network-request-failed": "Network error.",
      "auth/popup-blocked": "Popup blocked by browser.",
      "auth/popup-closed-by-user": "Popup closed early.",
      "auth/too-many-requests": "Too many attempts. Try again later.",
      "auth/unauthorized-domain": "Domain not allowed in Firebase.",
    };

    return messages[error.code] || error.message;
  }
}

// Export globally
const authManager = new AuthManager();
export { authManager };
