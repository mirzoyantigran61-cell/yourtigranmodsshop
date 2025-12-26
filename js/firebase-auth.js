// ===== FIREBASE CONFIGURATION =====
const firebaseConfig = {
  apiKey: "AIzaSyDybkzq-K6VerKCkjvcd5yeqtIWkFIgI2I",
  authDomain: "yourtigranmods-official.firebaseapp.com",
  projectId: "yourtigranmods-official",
  storageBucket: "yourtigranmods-official.firebasestorage.app",
  messagingSenderId: "420338260312",
  appId: "1:420338260312:web:2622dc8692dbf80816ad2d"
};

// ===== FIREBASE INIT (NEW VERSION) =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";

let auth;
try {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log('✅ Firebase initialized');
} catch (error) {
  console.error('❌ Firebase init error:', error);
}

// ===== AUTH STATE LISTENER =====
if (auth) {
  onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed:', user ? user.email : 'No user');
    if (window.APP && window.APP.updateUserUI) {
      window.APP.updateUserUI(user);
    }
  });
}

// ===== REGISTER FUNCTION =====
window.firebaseRegister = async function(email, password, username) {
  try {
    console.log('Register attempt:', email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Показываем уведомление
    if (window.APP && window.APP.showNotification) {
      window.APP.showNotification('✅ Account created! Please check your email.', 'success');
    }
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Register error:', error.code, error.message);
    
    let errorMessage = 'Registration failed: ';
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage += 'Email already exists.';
        break;
      case 'auth/invalid-email':
        errorMessage += 'Invalid email address.';
        break;
      case 'auth/weak-password':
        errorMessage += 'Password is too weak (min 6 characters).';
        break;
      default:
        errorMessage += error.message;
    }
    
    if (window.APP && window.APP.showNotification) {
      window.APP.showNotification('❌ ' + errorMessage, 'error');
    }
    
    return { success: false, error: errorMessage };
  }
};

// ===== LOGIN FUNCTION =====
window.firebaseLogin = async function(email, password) {
  try {
    console.log('Login attempt:', email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    if (window.APP && window.APP.showNotification) {
      window.APP.showNotification(`✅ Welcome back!`, 'success');
    }
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Login error:', error.code, error.message);
    
    let errorMessage = 'Login failed: ';
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        errorMessage += 'Invalid email or password.';
        break;
      default:
        errorMessage += error.message;
    }
    
    if (window.APP && window.APP.showNotification) {
      window.APP.showNotification('❌ ' + errorMessage, 'error');
    }
    
    return { success: false, error: errorMessage };
  }
};

// ===== LOGOUT FUNCTION =====
window.firebaseLogout = async function() {
  try {
    await signOut(auth);
    
    if (window.APP && window.APP.showNotification) {
      window.APP.showNotification('👋 Logged out successfully', 'info');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    
    if (window.APP && window.APP.showNotification) {
      window.APP.showNotification(`❌ Error: ${error.message}`, 'error');
    }
    
    return { success: false, error: error.message };
  }
};
