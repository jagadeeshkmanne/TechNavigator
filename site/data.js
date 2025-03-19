// Data Loading and Management Script

// Global variables
window.problemsData = [];

// Category order for consistent sorting
const categoryOrder = [
  'Arrays', 'Prefix Sum', 'HashMap/HashSet', 'Two Pointers', 
  'Sliding Window', 'Binary Search', 'Cyclic Sort', 'Matrix Traversal',
  'Stacks & Queues', 'Monotonic Stack/Queue', 'Linked Lists',
  'Trees', 'Tree DFS', 'Tree BFS', 'Divide and Conquer', 
  'Backtracking', 'Heap/Priority Queue', 'Tries', 'Graphs',
  'Graph DFS', 'Graph BFS', 'Union Find', 'Topological Sort',
  'Shortest Path', 'Greedy', 'Dynamic Programming', 'Segment Trees',
  'Intervals', 'Bit Manipulation', 'Math & Geometry', 'Design'
];

// Fetch problems data from remote JSON
async function fetchProblemsData() {
  try {
    const response = await fetch('https://cdn.jsdelivr.net/gh/jagadeeshkmanne/TechNavigator@d8b82907833a7f3de648b54d6f26906be92fc6cb/site/data.json');
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const problems = await response.json();
    
    // Transform problems to match the required structure
    return problems.map(problem => ({
      id: problem.id,
      name: problem.Name || problem['Problem Name'],
      category: problem.Category,
      difficulty: problem.Difficulty,
      leetcode_url: problem['Leetcode URL'],
      status: false,
      revision: false,
      editorial_url: problem.editorial_url
    }));
  } catch (error) {
    console.error('Error fetching problems:', error);
    
    // Update loading spinner with error message
    const loadingSpinner = document.getElementById('loading-spinner');
    if (loadingSpinner) {
      loadingSpinner.innerHTML = `
        <div style="text-align: center; color: red;">
          <h2>Failed to Load Problems</h2>
          <p>Unable to retrieve problem list. Please check your internet connection.</p>
          <p>Error: ${error.message}</p>
        </div>
      `;
    }
    
    return []; // Return empty array to prevent further errors
  }
}

// Load user-specific data from Firebase
async function loadUserData(userId) {
  try {
    console.log('Loading user data from Firebase...');
    const snapshot = await firebase.firestore()
      .collection('users')
      .doc(userId)
      .collection('problems')
      .get();
    
    if (snapshot.empty) {
      console.log('No user data found in Firebase');
      return;
    }
    
    // Update local problem data with Firebase data
    snapshot.forEach(doc => {
      const problemId = parseInt(doc.id);
      const problemData = doc.data();
      
      // Find the problem in the local data
      const problemIndex = window.problemsData.findIndex(p => p.id === problemId);
      if (problemIndex !== -1) {
        // Update local data with Firebase data
        if (problemData.status !== undefined) {
          window.problemsData[problemIndex].status = problemData.status;
        }
        if (problemData.revision !== undefined) {
          window.problemsData[problemIndex].revision = problemData.revision;
        }
      }
    });
    
    console.log('User data loaded from Firebase');
    
    // Refresh UI with loaded data
    if (typeof loadProblems === 'function') {
      loadProblems(window.problemsData);
    }
    
    if (typeof populateListView === 'function') {
      populateListView(window.problemsData);
    }
    
    // Fix: Pass problemsData to loadRevisionList to avoid the error
    if (typeof loadRevisionList === 'function') {
      loadRevisionList(window.problemsData);
    }
    
    // Return to the current view
    if (typeof toggleView === 'function') {
      toggleView(window.currentView || 'list');
    }
    
  } catch (error) {
    console.error('Error loading user data from Firebase:', error);
  }
}

// Extract categories for sidebar
function extractCategories(problems) {
  const categories = {};
  
  // Count problems per category
  problems.forEach(problem => {
    if (!categories[problem.category]) {
      categories[problem.category] = 0;
    }
    categories[problem.category]++;
  });
  
  // Sort categories according to predefined order
  return {
    categories,
    totalCount: problems.length,
    orderedCategories: categoryOrder.filter(cat => categories[cat]) 
  };
}

// Update problem status in Firebase
function updateProblemStatusInFirebase(problemId, status) {
  // Check for current user
  if (!window.currentUser) {
    console.error("Cannot update problem status: User not logged in");
    return;
  }

  firebase.firestore()
    .collection('users')
    .doc(window.currentUser.uid)
    .collection('problems')
    .doc(problemId.toString())
    .set({
      status: status
    }, { merge: true })
    .then(() => {
      console.log('Problem status updated in Firebase');
    })
    .catch(error => {
      console.error("Error updating problem status in Firebase:", error);
    });
}

// Toggle revision status in Firebase
function toggleRevisionInFirebase(problemId, revision) {
  // Check for current user
  if (!window.currentUser) {
    console.error("Cannot update revision status: User not logged in");
    return;
  }

  firebase.firestore()
    .collection('users')
    .doc(window.currentUser.uid)
    .collection('problems')
    .doc(problemId.toString())
    .set({
      revision: revision
    }, { merge: true })
    .then(() => {
      console.log('Problem revision status updated in Firebase');
    })
    .catch(error => {
      console.error("Error updating revision status in Firebase:", error);
    });
}

// Initialize data loading
async function initializeData() {
  console.log('Initializing application data...');
  
  // Show loading spinner
  const loadingSpinner = document.getElementById('loading-spinner');
  const categoriesContainer = document.getElementById('categories-container');
  
  if (loadingSpinner) loadingSpinner.style.display = 'flex';
  if (categoriesContainer) categoriesContainer.style.display = 'none';
  
  try {
    // Fetch problems data
    window.problemsData = await fetchProblemsData();
    
    // Hide loading spinner
    if (loadingSpinner) loadingSpinner.style.display = 'none';
    if (categoriesContainer) categoriesContainer.style.display = 'block';
    
    // Trigger sidebar population if sidebar script is loaded
    if (typeof populateSidebar === 'function') {
      populateSidebar(window.problemsData);
    }
    
    // Populate views
    if (typeof loadProblems === 'function') {
      loadProblems(window.problemsData);
    }
    
    if (typeof populateListView === 'function') {
      populateListView(window.problemsData);
    }
    
    if (typeof toggleView === 'function') {
      toggleView('list');
    }
    
  } catch (error) {
    console.error('Failed to initialize data:', error);
    
    // Update loading spinner with error message
    if (loadingSpinner) {
      loadingSpinner.innerHTML = `
        <div style="text-align: center; color: red;">
          <h2>Initialization Failed</h2>
          <p>An unexpected error occurred while loading the application.</p>
          <p>Error: ${error.message}</p>
        </div>
      `;
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeData);

// Expose functions globally
window.fetchProblemsData = fetchProblemsData;
window.loadUserData = loadUserData;
window.updateProblemStatusInFirebase = updateProblemStatusInFirebase;
window.toggleRevisionInFirebase = toggleRevisionInFirebase;
