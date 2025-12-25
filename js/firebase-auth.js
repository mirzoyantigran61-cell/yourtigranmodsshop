// ===== FIREBASE CONFIGURATION =====
// ВСТАВЬ СВОИ КЛЮЧИ СЮДА (ОНИ У ТЕБЯ УЖЕ ЕСТЬ):
const firebaseConfig = {
  apiKey: "AIzaSyDybkzq-K6VerKCkjvcd5yeqtIWkFIgI2I",
  authDomain: "yourtigranmods-official.firebaseapp.com",
  projectId: "yourtigranmods-official",
  storageBucket: "yourtigranmods-official.firebasestorage.app",
  messagingSenderId: "420338260312",
  appId: "1:420338260312:web:2622dc8692dbf80816ad2d"
};

// ===== FIREBASE INIT =====
try {
  // Проверяем, подключены ли скрипты Firebase
  if (typeof firebase === 'undefined') {
    console.error('❌ Firebase scripts not loaded!');
  } else {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase auth initialized');
  }
} catch (error) {
  console.error('❌ Firebase init error:', error);
}

const auth = firebase.auth();

// ===== AUTH STATE LISTENER =====
auth.onAuthStateChanged((user) => {
  console.log('Auth state changed:', user ? user.email : 'No user');
  if (window.APP && window.APP.updateUserUI) {
    window.APP.updateUserUI(user);
  }
});

// ===== REGISTER FUNCTION =====
window.firebaseRegister = async function(email, password, username) {
  try {
    console.log('Register attempt:', email);
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    console.log('User created:', userCredential.user);
    
    // Отправляем email для верификации
    await userCredential.user.sendEmailVerification();
    console.log('Verification email sent');
    
    // Показываем уведомление через APP
    if (window.APP && window.APP.showNotification) {
      window.APP.showNotification('✅ Account created! Please check your email to verify.', 'success');
    } else {
      alert('✅ Account created! Check your email.');
    }
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Register error:', error.code, error.message);
    
    // Показываем понятную ошибку
    let errorMessage = 'Registration failed. ';
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
    } else {
      alert('❌ ' + errorMessage);
    }
    
    return { success: false, error: errorMessage };
  }
};

// ===== LOGIN FUNCTION =====
window.firebaseLogin = async function(email, password) {
  try {
    console.log('Login attempt:', email);
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    console.log('User logged in:', userCredential.user);
    
    // Проверяем, подтвердил ли email
    if (!userCredential.user.emailVerified) {
      if (window.APP && window.APP.showNotification) {
        window.APP.showNotification('⚠️ Please verify your email first. Check your inbox.', 'warning');
      }
    } else {
      if (window.APP && window.APP.showNotification) {
        window.APP.showNotification(`✅ Welcome back!`, 'success');
      }
    }
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Login error:', error.code, error.message);
    
    let errorMessage = 'Login failed. ';
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        errorMessage += 'Invalid email or password.';
        break;
      case 'auth/user-disabled':
        errorMessage += 'Account disabled.';
        break;
      default:
        errorMessage += error.message;
    }
    
    if (window.APP && window.APP.showNotification) {
      window.APP.showNotification('❌ ' + errorMessage, 'error');
    } else {
      alert('❌ ' + errorMessage);
    }
    
    return { success: false, error: errorMessage };
  }
};

// ===== LOGOUT FUNCTION =====
window.firebaseLogout = async function() {
  try {
    await auth.signOut();
    console.log('User logged out');
    
    if (window.APP && window.APP.showNotification) {
      window.APP.showNotification('👋 Logged out successfully', 'info');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    
    if (window.APP && window.APP.showNotification) {
      window.APP.showNotification(`❌ Logout error: ${error.message}`, 'error');
    }
    
    return { success: false, error: error.message };
  }
};

// ===== PASSWORD RESET =====
window.firebaseResetPassword = async function(email) {
  try {
    await auth.sendPasswordResetEmail(email);
    console.log('Password reset email sent');
    
    if (window.APP && window.APP.showNotification) {
      window.APP.showNotification('📧 Password reset email sent! Check your inbox.', 'success');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Reset error:', error);
    
    if (window.APP && window.APP.showNotification) {
      window.APP.showNotification(`❌ Error: ${error.message}`, 'error');
    }
    
    return { success: false, error: error.message };
  }
};

// ===== GET CURRENT USER =====
window.getCurrentUser = function() {
  return auth.currentUser;
};
