// auth.js - Updated with proper UI management
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
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

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxNMhU09mINvq_aDLtylBg3FucCK-MzYE",
  authDomain: "sandstonebijoliya-293d2.firebaseapp.com",
  projectId: "sandstonebijoliya-293d2",
  storageBucket: "sandstonebijoliya-293d2.appspot.com",
  messagingSenderId: "133756247845",
  appId: "1:133756247845:web:8e769ce2af3db1765484cc",
  measurementId: "G-H7JMX9VNYF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Authentication Manager Class
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.initAuthListener();
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
      
      await updateProfile(userCredential.user, {
        displayName: displayName
      });

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

  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await this.createUserDocument(result.user, result.user.displayName);
      return { success: true, user: result.user };
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

  async createUserDocument(user, displayName) {
    try {
      const userDoc = {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp()
      };

      await addDoc(collection(db, "users"), userDoc);
      console.log("User document created");
    } catch (error) {
      console.error("Error creating user document:", error);
    }
  }

  // ✅ IMPROVED: Better UI update method
  updateUI(user) {
    const loginBtn = document.getElementById('loginButton');
    const userProfile = document.getElementById('userProfile');
    const profileAvatar = document.getElementById('profileAvatar');
    const profileName = document.getElementById('profileName');
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserEmail = document.getElementById('dropdownUserEmail');

    if (user) {
      // User is signed in - show profile, hide login
      if (userProfile) {
        userProfile.style.display = 'block';
      }
      if (loginBtn) {
        loginBtn.style.display = 'none';
      }
      
      // Update user information
      const displayName = user.displayName || 'User';
      const email = user.email || '';
      
      if (profileAvatar) {
        profileAvatar.textContent = displayName.charAt(0).toUpperCase();
      }
      if (profileName) {
        profileName.textContent = displayName;
      }
      if (dropdownUserName) {
        dropdownUserName.textContent = displayName;
      }
      if (dropdownUserEmail) {
        dropdownUserEmail.textContent = email;
      }
    } else {
      // User is signed out - show login, hide profile
      if (userProfile) {
        userProfile.style.display = 'none';
      }
      if (loginBtn) {
        loginBtn.style.display = 'flex';
      }
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
      case 'auth/invalid-email':
        return 'Invalid email address format.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }
}

// Initialize Auth Manager
const authManager = new AuthManager();

// Export for use in other files
export { authManager };
