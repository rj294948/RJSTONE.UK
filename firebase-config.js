// ==============================================
// firebase-config.js - COMPLETE WITH AUTH & FIRESTORE
// ==============================================

// Firebase Core
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";

// Firestore Database
import { 
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  arrayUnion,
  arrayRemove,
  increment
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Authentication
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// ==============================================
// FIREBASE CONFIGURATION
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
// INITIALIZE FIREBASE
// ==============================================
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account"
});

// ==============================================
// AUTHENTICATION FUNCTIONS
// ==============================================

// Register new user
const registerUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile if name provided
    if (userData.displayName) {
      await updateProfile(user, {
        displayName: userData.displayName
      });
    }
    
    // Create user document in Firestore
    const userDoc = {
      uid: user.uid,
      email: user.email,
      displayName: userData.displayName || userData.name || '',
      phone: userData.phone || '',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      role: 'customer',
      address: userData.address || null,
      city: userData.city || '',
      postcode: userData.postcode || '',
      country: 'UK',
      preferences: {
        newsletter: userData.newsletter || true,
        marketing: userData.marketing || false
      }
    };
    
    await setDoc(doc(db, "users", user.uid), userDoc);
    
    return { success: true, user: user };
  } catch (error) {
    console.error("Registration error:", error);
    return { 
      success: false, 
      error: error.message,
      errorCode: error.code 
    };
  }
};

// Login user
const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update last login
    await updateDoc(doc(db, "users", user.uid), {
      lastLogin: serverTimestamp()
    });
    
    return { success: true, user: user };
  } catch (error) {
    console.error("Login error:", error);
    return { 
      success: false, 
      error: error.message,
      errorCode: error.code 
    };
  }
};

// Google Sign-in
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user document exists
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      // Create new user document
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        role: 'customer',
        provider: 'google'
      };
      
      await setDoc(doc(db, "users", user.uid), userData);
    } else {
      // Update last login
      await updateDoc(doc(db, "users", user.uid), {
        lastLogin: serverTimestamp()
      });
    }
    
    return { success: true, user: user };
  } catch (error) {
    console.error("Google sign-in error:", error);
    return { 
      success: false, 
      error: error.message,
      errorCode: error.code 
    };
  }
};

// Logout user
const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Get current user
const getCurrentUser = () => {
  return auth.currentUser;
};

// Check if user is logged in
const isUserLoggedIn = () => {
  return auth.currentUser !== null;
};

// Password reset
const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    console.error("Password reset error:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// ==============================================
// USER PROFILE FUNCTIONS
// ==============================================

// Get user data
const getUserData = async (userId = null) => {
  try {
    const uid = userId || auth.currentUser?.uid;
    if (!uid) return null;
    
    const userDoc = await getDoc(doc(db, "users", uid));
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        id: userDoc.id,
        ...data,
        // Convert timestamps if needed
        createdAt: data.createdAt?.toDate() || null,
        lastLogin: data.lastLogin?.toDate() || null
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

// Update user profile
const updateUserProfile = async (updates) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in");
    
    // Update in Firebase Auth
    if (updates.displayName) {
      await updateProfile(user, {
        displayName: updates.displayName
      });
    }
    
    // Update in Firestore
    const userUpdates = { ...updates };
    delete userUpdates.email; // Can't change email directly
    
    await updateDoc(doc(db, "users", user.uid), {
      ...userUpdates,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// ==============================================
// PRODUCT FUNCTIONS (Based on your data structure)
// ==============================================

// Get all products
const getAllProducts = async (limitCount = 50) => {
  try {
    const q = query(
      collection(db, "products"),
      orderBy("created_at", "desc"),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const products = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        name: data.name || data.stone_name || 'Stone Product',
        stone_name: data.stone_name || data.name || '',
        category: data.category || '',
        type: data.type || 'Natural Stone',
        color: data.color || '',
        price: data.price || '£0.00',
        price_unit: data.price_unit || 'sqft',
        description: data.description || '',
        image: data.image || '',
        size: data.size || '',
        thickness: data.thickness || '',
        finish: data.finish || 'Natural',
        usage: data.usage || '',
        density: data.density || '',
        compressive_strength: data.compressive_strength || '',
        water_absorption: data.water_absorption || '',
        status: data.status || 'active',
        created_at: data.created_at?.toDate() || null
      });
    });
    
    return { success: true, products: products };
  } catch (error) {
    console.error("Error getting products:", error);
    return { 
      success: false, 
      error: error.message,
      products: [] 
    };
  }
};

// Get featured products (active status)
const getFeaturedProducts = async (limitCount = 8) => {
  try {
    const q = query(
      collection(db, "products"),
      where("status", "==", "active"),
      orderBy("created_at", "desc"),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const products = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        name: data.name || data.stone_name || 'Stone Product',
        stone_name: data.stone_name || '',
        category: data.category || '',
        price: data.price || '£0.00',
        description: data.description || '',
        image: data.image || '',
        color: data.color || '',
        size: data.size || ''
      });
    });
    
    return { success: true, products: products };
  } catch (error) {
    console.error("Error getting featured products:", error);
    return { 
      success: false, 
      error: error.message,
      products: [] 
    };
  }
};

// Get products by category
const getProductsByCategory = async (category, limitCount = 20) => {
  try {
    const q = query(
      collection(db, "products"),
      where("category", "==", category),
      where("status", "==", "active"),
      orderBy("created_at", "desc"),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const products = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        name: data.name || data.stone_name || 'Stone Product',
        stone_name: data.stone_name || '',
        category: data.category || '',
        price: data.price || '£0.00',
        description: data.description || '',
        image: data.image || '',
        color: data.color || '',
        size: data.size || '',
        thickness: data.thickness || ''
      });
    });
    
    return { success: true, products: products };
  } catch (error) {
    console.error("Error getting products by category:", error);
    return { 
      success: false, 
      error: error.message,
      products: [] 
    };
  }
};

// Get product by ID
const getProductById = async (productId) => {
  try {
    const productDoc = await getDoc(doc(db, "products", productId));
    
    if (productDoc.exists()) {
      const data = productDoc.data();
      return {
        success: true,
        product: {
          id: productDoc.id,
          name: data.name || data.stone_name || 'Stone Product',
          stone_name: data.stone_name || '',
          category: data.category || '',
          type: data.type || 'Natural Stone',
          color: data.color || '',
          price: data.price || '£0.00',
          price_unit: data.price_unit || 'sqft',
          description: data.description || '',
          image: data.image || '',
          size: data.size || '',
          thickness: data.thickness || '',
          finish: data.finish || 'Natural',
          usage: data.usage || '',
          density: data.density || '',
          compressive_strength: data.compressive_strength || '',
          water_absorption: data.water_absorption || '',
          status: data.status || 'active',
          created_at: data.created_at?.toDate() || null
        }
      };
    } else {
      return { 
        success: false, 
        error: "Product not found" 
      };
    }
  } catch (error) {
    console.error("Error getting product:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Search products
const searchProducts = async (searchTerm, limitCount = 20) => {
  try {
    // Get all products first (Firebase doesn't support full-text search natively)
    const q = query(
      collection(db, "products"),
      where("status", "==", "active"),
      orderBy("name"),
      limit(50)
    );
    
    const querySnapshot = await getDocs(q);
    const products = [];
    const searchLower = searchTerm.toLowerCase();
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const name = data.name || data.stone_name || '';
      const category = data.category || '';
      const description = data.description || '';
      const color = data.color || '';
      
      // Simple client-side search
      if (name.toLowerCase().includes(searchLower) ||
          category.toLowerCase().includes(searchLower) ||
          description.toLowerCase().includes(searchLower) ||
          color.toLowerCase().includes(searchLower)) {
        
        products.push({
          id: doc.id,
          name: name,
          stone_name: data.stone_name || '',
          category: category,
          price: data.price || '£0.00',
          description: description,
          image: data.image || '',
          color: color
        });
      }
    });
    
    // Limit results
    const limitedProducts = products.slice(0, limitCount);
    
    return { success: true, products: limitedProducts };
  } catch (error) {
    console.error("Error searching products:", error);
    return { 
      success: false, 
      error: error.message,
      products: [] 
    };
  }
};

// ==============================================
// CART FUNCTIONS
// ==============================================

// Add to cart
const addToCart = async (productId, quantity = 1, productData = null) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      // Save to localStorage if not logged in
      const cart = JSON.parse(localStorage.getItem('irya_cart') || '[]');
      const existingIndex = cart.findIndex(item => item.productId === productId);
      
      if (existingIndex > -1) {
        cart[existingIndex].quantity += quantity;
      } else {
        cart.push({
          productId: productId,
          quantity: quantity,
          productData: productData || {},
          addedAt: new Date().toISOString()
        });
      }
      
      localStorage.setItem('irya_cart', JSON.stringify(cart));
      return { success: true, isLocal: true };
    }
    
    // User is logged in - save to Firestore
    const cartItem = {
      userId: user.uid,
      productId: productId,
      quantity: quantity,
      productData: productData || null,
      addedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Check if item already exists in cart
    const q = query(
      collection(db, "cart"),
      where("userId", "==", user.uid),
      where("productId", "==", productId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      // Update existing item
      const existingDoc = querySnapshot.docs[0];
      const existingData = existingDoc.data();
      
      await updateDoc(doc(db, "cart", existingDoc.id), {
        quantity: existingData.quantity + quantity,
        updatedAt: serverTimestamp()
      });
      
      return { 
        success: true, 
        cartItemId: existingDoc.id,
        isLocal: false 
      };
    } else {
      // Add new item
      const docRef = await addDoc(collection(db, "cart"), cartItem);
      return { 
        success: true, 
        cartItemId: docRef.id,
        isLocal: false 
      };
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Get cart items
const getCartItems = async () => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      // Get from localStorage
      const cart = JSON.parse(localStorage.getItem('irya_cart') || '[]');
      return { success: true, items: cart, isLocal: true };
    }
    
    // Get from Firestore
    const q = query(
      collection(db, "cart"),
      where("userId", "==", user.uid)
    );
    
    const querySnapshot = await getDocs(q);
    const cartItems = [];
    
    for (const cartDoc of querySnapshot.docs) {
      const cartItem = { 
        id: cartDoc.id, 
        ...cartDoc.data() 
      };
      
      // Get product details if not already in productData
      if (!cartItem.productData) {
        try {
          const productDoc = await getDoc(doc(db, "products", cartItem.productId));
          if (productDoc.exists()) {
            cartItem.productData = productDoc.data();
          }
        } catch (error) {
          console.error("Error getting product details:", error);
        }
      }
      
      cartItems.push(cartItem);
    }
    
    return { success: true, items: cartItems, isLocal: false };
  } catch (error) {
    console.error("Error getting cart items:", error);
    return { 
      success: false, 
      error: error.message,
      items: [] 
    };
  }
};

// Update cart item quantity
const updateCartItemQuantity = async (cartItemId, quantity) => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      // Update in localStorage
      const cart = JSON.parse(localStorage.getItem('irya_cart') || '[]');
      const itemIndex = cart.findIndex(item => item.id === cartItemId);
      
      if (itemIndex > -1) {
        cart[itemIndex].quantity = quantity;
        localStorage.setItem('irya_cart', JSON.stringify(cart));
        return { success: true, isLocal: true };
      }
      return { success: false, error: "Item not found" };
    }
    
    // Update in Firestore
    await updateDoc(doc(db, "cart", cartItemId), {
      quantity: quantity,
      updatedAt: serverTimestamp()
    });
    
    return { success: true, isLocal: false };
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Remove from cart
const removeFromCart = async (cartItemId) => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      // Remove from localStorage
      const cart = JSON.parse(localStorage.getItem('irya_cart') || '[]');
      const newCart = cart.filter(item => item.id !== cartItemId);
      localStorage.setItem('irya_cart', JSON.stringify(newCart));
      return { success: true, isLocal: true };
    }
    
    // Remove from Firestore
    await deleteDoc(doc(db, "cart", cartItemId));
    
    return { success: true, isLocal: false };
  } catch (error) {
    console.error("Error removing from cart:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Clear cart
const clearCart = async () => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      // Clear localStorage
      localStorage.setItem('irya_cart', '[]');
      return { success: true, isLocal: true };
    }
    
    // Clear from Firestore
    const q = query(
      collection(db, "cart"),
      where("userId", "==", user.uid)
    );
    
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    return { success: true, isLocal: false };
  } catch (error) {
    console.error("Error clearing cart:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// ==============================================
// ORDER FUNCTIONS
// ==============================================

// Create order
const createOrder = async (orderData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { 
        success: false, 
        error: "Please login to create an order" 
      };
    }
    
    // Generate order number
    const orderNumber = 'IRYA-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    const order = {
      orderNumber: orderNumber,
      userId: user.uid,
      customerName: orderData.customerName || user.displayName,
      customerEmail: orderData.customerEmail || user.email,
      customerPhone: orderData.customerPhone || '',
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      vat: orderData.vat || 0,
      shipping: orderData.shipping || 0,
      total: orderData.total || 0,
      deposit: orderData.deposit || 0,
      balance: orderData.balance || 0,
      shippingAddress: orderData.shippingAddress || {},
      billingAddress: orderData.billingAddress || orderData.shippingAddress || {},
      status: 'pending',
      paymentStatus: 'pending',
      notes: orderData.notes || '',
      estimatedDelivery: orderData.estimatedDelivery || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, "orders"), order);
    
    // Clear cart after successful order
    await clearCart();
    
    return { 
      success: true, 
      orderId: docRef.id,
      orderNumber: orderNumber
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Get user orders
const getUserOrders = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return { success: false, error: "Not logged in", orders: [] };
    
    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        orderNumber: data.orderNumber,
        status: data.status,
        total: data.total,
        items: data.items,
        createdAt: data.createdAt?.toDate() || null,
        estimatedDelivery: data.estimatedDelivery || ''
      });
    });
    
    return { success: true, orders: orders };
  } catch (error) {
    console.error("Error getting orders:", error);
    return { 
      success: false, 
      error: error.message,
      orders: [] 
    };
  }
};

// ==============================================
// WISHLIST FUNCTIONS
// ==============================================

// Add to wishlist
const addToWishlist = async (productId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      // Save to localStorage
      const wishlist = JSON.parse(localStorage.getItem('irya_wishlist') || '[]');
      if (!wishlist.includes(productId)) {
        wishlist.push(productId);
        localStorage.setItem('irya_wishlist', JSON.stringify(wishlist));
      }
      return { success: true, isLocal: true };
    }
    
    // Save to Firestore
    const wishlistItem = {
      userId: user.uid,
      productId: productId,
      addedAt: serverTimestamp()
    };
    
    // Check if already in wishlist
    const q = query(
      collection(db, "wishlist"),
      where("userId", "==", user.uid),
      where("productId", "==", productId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      await addDoc(collection(db, "wishlist"), wishlistItem);
    }
    
    return { success: true, isLocal: false };
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Get wishlist
const getWishlist = async () => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      // Get from localStorage
      const wishlist = JSON.parse(localStorage.getItem('irya_wishlist') || '[]');
      return { success: true, items: wishlist, isLocal: true };
    }
    
    // Get from Firestore
    const q = query(
      collection(db, "wishlist"),
      where("userId", "==", user.uid)
    );
    
    const querySnapshot = await getDocs(q);
    const wishlistItems = [];
    
    querySnapshot.forEach((doc) => {
      wishlistItems.push(doc.data().productId);
    });
    
    return { success: true, items: wishlistItems, isLocal: false };
  } catch (error) {
    console.error("Error getting wishlist:", error);
    return { 
      success: false, 
      error: error.message,
      items: [] 
    };
  }
};

// Remove from wishlist
const removeFromWishlist = async (productId) => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      // Remove from localStorage
      const wishlist = JSON.parse(localStorage.getItem('irya_wishlist') || '[]');
      const newWishlist = wishlist.filter(id => id !== productId);
      localStorage.setItem('irya_wishlist', JSON.stringify(newWishlist));
      return { success: true, isLocal: true };
    }
    
    // Remove from Firestore
    const q = query(
      collection(db, "wishlist"),
      where("userId", "==", user.uid),
      where("productId", "==", productId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      await deleteDoc(doc(db, "wishlist", querySnapshot.docs[0].id));
    }
    
    return { success: true, isLocal: false };
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// ==============================================
// UTILITY FUNCTIONS
// ==============================================

// Calculate totals
const calculateCartTotal = (items) => {
  let subtotal = 0;
  
  items.forEach(item => {
    const price = parseFloat(item.productData?.price?.replace('£', '') || 0);
    subtotal += price * item.quantity;
  });
  
  const vat = subtotal * 0.20; // 20% VAT
  const total = subtotal + vat;
  const deposit = total * 0.30; // 30% deposit
  const balance = total * 0.70; // 70% balance
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    vat: parseFloat(vat.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
    deposit: parseFloat(deposit.toFixed(2)),
    balance: parseFloat(balance.toFixed(2))
  };
};

// Format price
const formatPrice = (price) => {
  if (typeof price === 'string' && price.startsWith('£')) {
    return price;
  }
  return `£${parseFloat(price).toFixed(2)}`;
};

// Sync localStorage cart with Firestore on login
const syncCartOnLogin = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return;
    
    const localCart = JSON.parse(localStorage.getItem('irya_cart') || '[]');
    
    if (localCart.length > 0) {
      // Move local cart to Firestore
      for (const item of localCart) {
        await addToCart(item.productId, item.quantity, item.productData);
      }
      
      // Clear localStorage cart
      localStorage.removeItem('irya_cart');
    }
    
    // Sync wishlist
    const localWishlist = JSON.parse(localStorage.getItem('irya_wishlist') || '[]');
    
    if (localWishlist.length > 0) {
      for (const productId of localWishlist) {
        await addToWishlist(productId);
      }
      
      localStorage.removeItem('irya_wishlist');
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error syncing cart:", error);
    return { success: false, error: error.message };
  }
};

// ==============================================
// AUTH STATE LISTENER
// ==============================================

let authStateListeners = [];

// Listen to auth state changes
onAuthStateChanged(auth, (user) => {
  // Notify all listeners
  authStateListeners.forEach(listener => {
    try {
      listener(user);
    } catch (error) {
      console.error("Auth listener error:", error);
    }
  });
  
  // Sync cart when user logs in
  if (user) {
    setTimeout(() => {
      syncCartOnLogin();
    }, 1000);
  }
});

// Subscribe to auth state changes
const subscribeToAuth = (callback) => {
  authStateListeners.push(callback);
  
  // Return unsubscribe function
  return () => {
    const index = authStateListeners.indexOf(callback);
    if (index > -1) {
      authStateListeners.splice(index, 1);
    }
  };
};

// ==============================================
// EXPORT ALL FUNCTIONS
// ==============================================

export {
  // Firebase instances
  app,
  db,
  auth,
  
  // Authentication
  registerUser,
  loginUser,
  signInWithGoogle,
  logoutUser,
  getCurrentUser,
  isUserLoggedIn,
  resetPassword,
  subscribeToAuth,
  
  // User Profile
  getUserData,
  updateUserProfile,
  
  // Products
  getAllProducts,
  getFeaturedProducts,
  getProductsByCategory,
  getProductById,
  searchProducts,
  
  // Cart
  addToCart,
  getCartItems,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  
  // Orders
  createOrder,
  getUserOrders,
  
  // Wishlist
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  
  // Utilities
  calculateCartTotal,
  formatPrice,
  syncCartOnLogin
};
