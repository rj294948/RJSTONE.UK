// auth.js - Complete Authentication System
import {
  auth,
  db,
  googleProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile,
  collection,
  addDoc,
  serverTimestamp
} from './firebase-config.js';

// ===== Authentication Functions =====
class AuthManager {
  constructor() {
    this.currentUser = null;
    this.initAuthListener();
  }

  // Auth State Listener
  initAuthListener() {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.updateUI(user);
      
      if (user) {
        console.log('User logged in:', user.email);
        this.redirectBasedOnAuth();
      } else {
        console.log('User logged out');
        this.redirectToLogin();
      }
    });
  }

  // Sign Up with Email & Password
  async signUp(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: displayName
      });

      // Create user document in Firestore
      await this.createUserDocument(userCredential.user, displayName);
      
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  // Sign In with Email & Password
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  // Google Sign In
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Create user document if first time
      await this.createUserDocument(result.user, result.user.displayName);
      
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  // Sign Out
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: this.getErrorMessage(error) };
    }
  }

  // Create User Document in Firestore
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

  // Update UI based on auth state
  updateUI(user) {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInfo = document.getElementById('userInfo');
    const userDisplayName = document.getElementById('userDisplayName');

    if (user) {
      // User is signed in
      if (loginBtn) loginBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'block';
      if (userInfo) userInfo.style.display = 'block';
      if (userDisplayName) userDisplayName.textContent = user.displayName || user.email;
    } else {
      // User is signed out
      if (loginBtn) loginBtn.style.display = 'block';
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (userInfo) userInfo.style.display = 'none';
    }
  }

  // Redirect based on authentication
  redirectBasedOnAuth() {
    const currentPage = window.location.pathname;
    
    // If user is on login page and already authenticated, redirect to home
    if (currentPage.includes('login.html') || currentPage.includes('signup.html')) {
      window.location.href = 'index.html';
    }
  }

  // Redirect to login if not authenticated
  redirectToLogin() {
    const currentPage = window.location.pathname;
    const publicPages = ['/login.html', '/signup.html', '/index.html', '/'];
    
    if (!publicPages.includes(currentPage) && !this.currentUser) {
      window.location.href = 'login.html';
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Get user-friendly error messages
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
