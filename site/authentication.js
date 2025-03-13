// Authentication Configuration and Handlers

// Firebase Configuration (Replace with your own Firebase config)
const firebaseConfig = {
  apiKey: "AIzaSyDrGGDDax_OpD6NSP6R5SznVy9ThAIohBo",
  authDomain: "technavigator-226d0.firebaseapp.com",
  projectId: "technavigator-226d0",
  storageBucket: "technavigator-226d0.firebasestorage.app",
  messagingSenderId: "1057850023813",
  appId: "1:1057850023813:web:bfcf67f80bc27fe22b2eec",
  measurementId: "G-FSXMH7L0ES"
};

// Initialize Firebase Authentication
function initializeFirebase() {
  // Initialize Firebase App
  firebase.initializeApp(firebaseConfig);
  
  // Get Firebase services
  const auth = firebase.auth();
  const db = firebase.firestore();

  // Set authentication persistence
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
      console.log("Firebase persistence set to LOCAL");
    })
    .catch((error) => {
      console.error("Error setting persistence:", error);
    });

  // Authentication State Observer
  auth.onAuthStateChanged(function(user) {
    // Set both local and window-level user variables
    window.currentUser = user; // This is the critical line missing before
    updateAuthUI(user);
    
    if (user) {
      // User is signed in
      console.log("User signed in:", user.displayName || user.email);
      loadUserData(user.uid);
    } else {
      // User is signed out
      console.log("User signed out");
      resetAppState();
    }
  });

  // Set up login button
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', signInWithGoogle);
  }

  // Set up logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', signOut);
  }
}

// Sign in with Google
function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      // Handle successful sign-in
      console.log('Successfully signed in', result.user);
    })
    .catch((error) => {
      console.error('Sign-in error', error);
      showErrorModal(error.message);
    });
}

// Sign out
function signOut() {
  firebase.auth().signOut()
    .then(() => {
      // Sign-out successful
      console.log('User signed out');
    })
    .catch((error) => {
      console.error('Sign-out error', error);
      showErrorModal(error.message);
    });
}

// Update Authentication UI
function updateAuthUI(user) {
  const authContainer = document.getElementById('auth-container');
  const userImg = document.getElementById('user-img');
  const userName = document.getElementById('user-name');

  if (user) {
    // User is signed in
    authContainer.classList.add('signed-in');
    
    if (userImg) {
      userImg.src = user.photoURL || 'default-avatar.png';
      userImg.style.display = 'block';
    }
    
    if (userName) {
      userName.textContent = user.displayName || user.email;
    }
  } else {
    // User is signed out
    authContainer.classList.remove('signed-in');
    
    if (userImg) {
      userImg.style.display = 'none';
    }
    
    if (userName) {
      userName.textContent = '';
    }
  }
}

// Load user data from Firebase
function loadUserData(userId) {
  if (!firebase.firestore) {
    console.error("Firestore not initialized");
    return;
  }
  
  const db = firebase.firestore();
  
  // Get user's problem status data
  db.collection('users').doc(userId).collection('problems')
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        console.log('No saved problem data found.');
        return;
      }
      
      // Update problem status in memory
      snapshot.forEach(doc => {
        const problemData = doc.data();
        if (window.problemsData) {
          const problem = window.problemsData.find(p => p.id == doc.id);
          if (problem) {
            problem.status = problemData.status || false;
            problem.revision = problemData.revision || false;
          }
        }
      });
      
      // Refresh UI
      if (typeof loadProblems === 'function' && window.problemsData) {
        loadProblems(window.problemsData);
      }
      
      if (typeof populateListView === 'function' && window.problemsData) {
        populateListView(window.problemsData);
      }
      
      // Update counts
      if (typeof updateCounts === 'function' && window.problemsData) {
        updateCounts(window.problemsData);
      }
      
      console.log('User data loaded successfully.');
    })
    .catch((error) => {
      console.error('Error loading user data:', error);
    });
}

// Add these Firebase update functions that were missing
// Update problem status in Firebase
function updateProblemStatusInFirebase(problemId, status) {
  if (!window.currentUser) return;
  
  const db = firebase.firestore();
  const userId = window.currentUser.uid;
  
  db.collection('users').doc(userId).collection('problems').doc(problemId.toString()).set({
    status: status,
    revision: window.problemsData.find(p => p.id == problemId)?.revision || false,
    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true })
  .then(() => {
    console.log('Problem status updated in Firebase');
  })
  .catch((error) => {
    console.error('Error updating problem status:', error);
  });
}

// Toggle revision status in Firebase
function toggleRevisionInFirebase(problemId, revision) {
  if (!window.currentUser) return;
  
  const db = firebase.firestore();
  const userId = window.currentUser.uid;
  
  db.collection('users').doc(userId).collection('problems').doc(problemId.toString()).set({
    revision: revision,
    status: window.problemsData.find(p => p.id == problemId)?.status || false,
    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true })
  .then(() => {
    console.log('Revision status updated in Firebase');
  })
  .catch((error) => {
    console.error('Error updating revision status:', error);
  });
}

// Reset App State when User Signs Out
function resetAppState() {
  // Reset problem data to default (all unchecked)
  if (window.problemsData) {
    window.problemsData.forEach(problem => {
      problem.status = false;
      problem.revision = false;
    });
  }
  
  // Refresh UI if functions exist
  if (typeof loadProblems === 'function') {
    loadProblems(window.problemsData || []);
  }
  
  if (typeof populateListView === 'function') {
    populateListView(window.problemsData || []);
  }
  
  if (typeof toggleView === 'function') {
    toggleView('list');
  }
}

// Show Error Modal
function showErrorModal(message) {
  const modal = document.getElementById('login-required-modal');
  const modalMessage = modal.querySelector('.modal-message');
  
  if (modalMessage) {
    modalMessage.textContent = message;
  }
  
  modal.style.display = 'flex';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeFirebase);

// Expose functions globally if needed
window.signInWithGoogle = signInWithGoogle;
window.signOut = signOut;
window.updateProblemStatusInFirebase = updateProblemStatusInFirebase;
window.toggleRevisionInFirebase = toggleRevisionInFirebase;
