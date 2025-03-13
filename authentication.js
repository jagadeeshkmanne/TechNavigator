// Firebase Authentication Module

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrGGDDax_OpD6NSP6R5SznVy9ThAIohBo",
  authDomain: "technavigator-226d0.firebaseapp.com",
  projectId: "technavigator-226d0",
  storageBucket: "technavigator-226d0.firebasestorage.app",
  messagingSenderId: "1057850023813",
  appId: "1:1057850023813:web:bfcf67f80bc27fe22b2eec",
  measurementId: "G-FSXMH7L0ES"
};

// Global auth variables
let currentUser = null;

// Initialize Firebase Auth
function initializeFirebaseAuth() {
  // Initialize Firebase if it hasn't been initialized already
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    
    const auth = firebase.auth();
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => {
        console.log("Firebase persistence set to LOCAL");
      })
      .catch((error) => {
        console.error("Error setting persistence:", error);
      });
    
    // Set up Firebase auth state changes
    auth.onAuthStateChanged(function(user) {
      console.log('Auth state changed', user ? 'User signed in' : 'No user');
      currentUser = user;
      
      const authContainer = document.getElementById('auth-container');
      if (!authContainer) {
        console.warn('Auth container not found in the page');
        return;
      }
      
      if (user) {
        // User is signed in
        authContainer.classList.add('signed-in');
        
        const userImg = document.getElementById('user-img');
        const userName = document.getElementById('user-name');
        
        if (userImg) {
          userImg.src = user.photoURL || 'default-avatar.png';
          userImg.style.display = 'block';
        }
        
        if (userName) {
          userName.textContent = user.displayName || user.email;
        }
        
        // Dispatch an event that other scripts can listen for
        document.dispatchEvent(new CustomEvent('userLoggedIn', { detail: user }));
      } else {
        // User is signed out
        authContainer.classList.remove('signed-in');
        
        // Dispatch an event that other scripts can listen for
        document.dispatchEvent(new CustomEvent('userLoggedOut'));
      }
    });
    
    // Set up login button
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', function() {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider).catch(function(error) {
          console.error('Error signing in:', error);
          alert('Failed to sign in: ' + error.message);
        });
      });
    } else {
      console.warn('Login button not found in the page');
    }
    
    // Set up logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function() {
        auth.signOut().catch(function(error) {
          console.error('Error signing out:', error);
          alert('Failed to sign out: ' + error.message);
        });
      });
    } else {
      console.warn('Logout button not found in the page');
    }
  } else {
    console.warn('Firebase is not available. Auth functionality will not work.');
  }
}

// Function to check if user is logged in
function isUserLoggedIn() {
  return currentUser !== null;
}

// Function to get current user
function getCurrentUser() {
  return currentUser;
}

// Show login required modal
function showLoginRequiredModal(customMessage = null) {
  const modal = document.getElementById('login-required-modal');
  if (!modal) {
    console.warn('Login required modal not found');
    alert(customMessage || 'Please sign in to access this feature.');
    return;
  }
  
  const messageElement = document.getElementById('login-modal-message');
  
  // Use custom message if provided, otherwise use default
  if (messageElement && customMessage) {
    messageElement.textContent = customMessage;
  } else if (messageElement) {
    messageElement.textContent = 'Please sign in to access this feature and track your progress across all your devices.';
  }
  
  modal.style.display = 'block';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Create login modal if not already created
  if (!document.getElementById('login-required-modal')) {
    const loginModal = document.createElement('div');
    loginModal.id = 'login-required-modal';
    loginModal.className = 'fixed-modal';
    loginModal.style.display = 'none';
    loginModal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-container">
        <div class="modal-content">
          <button class="modal-close-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" 
                fill="none" stroke="currentColor" stroke-width="2" 
                stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          <div class="modal-compass-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" 
                stroke="var(--professional-orange)" stroke-width="2" 
                stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"/>
            </svg>
          </div>

          <h2 id="login-modal-title">Login Required</h2>
          
          <p id="login-modal-message">Please sign in to access this feature and track your progress across all your devices.</p>
        </div>
      </div>
    `;
    document.body.appendChild(loginModal);
    
    // Add modal close events
    document.querySelector('#login-required-modal .modal-close-btn').addEventListener('click', function() {
      document.getElementById('login-required-modal').style.display = 'none';
    });
    
    document.querySelector('#login-required-modal .modal-overlay').addEventListener('click', function() {
      document.getElementById('login-required-modal').style.display = 'none';
    });
  }
  
  // Initialize Firebase authentication
  initializeFirebaseAuth();
});

// Make these functions globally available
window.showLoginRequiredModal = showLoginRequiredModal;
window.isUserLoggedIn = isUserLoggedIn;
window.getCurrentUser = getCurrentUser;
