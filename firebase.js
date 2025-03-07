/***********************
 * FIREBASE CONFIGURATION AND SETUP
 ***********************/
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrGGDDax_OpD6NSP6R5SznVy9ThAIohBo",
  authDomain: "technavigator-226d0.firebaseapp.com",
  projectId: "technavigator-226d0",
  storageBucket: "technavigator-226d0.firebasestorage.app",
  messagingSenderId: "1057850023813",
  appId: "1:1057850023813:web:bfcf67f80bc27fe22b2eec",
  measurementId: "G-FSXMH7L0ES"
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Set up Google Auth provider
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Current user state 
let currentUser = null;

// Track problem revisions
let problemRevisions = {};

// Auth state listener
auth.onAuthStateChanged((user) => {
  if (user) {
    // User signed in
    currentUser = user;
    console.log("User signed in:", user.displayName || user.email);
    
    // Update UI with user info
    const userElement = document.getElementById('user-name');
    if (userElement) {
      userElement.textContent = user.displayName || user.email;
    }
    
    const userImg = document.getElementById('user-img');
    if (userImg && user.photoURL) {
      userImg.src = user.photoURL;
      userImg.style.display = 'block';
    }
    
    document.getElementById('auth-container').classList.add('signed-in');
    
    // Load user progress from Firebase
    loadProgressFromFirebase().then(() => {
      // Load revision status after progress
      return loadRevisionsFromFirebase();
    }).then(() => {
      // Reinitialize the grid after loading progress to ensure checkboxes appear
      if (currentCategory) {
        initializeGrid(currentCategory);
        updateCategoryCounter(currentCategory);
      }
      updateOverallProgress();
    });
  } else {
    // User signed out
    currentUser = null;
    document.getElementById('auth-container').classList.remove('signed-in');
    // Reset revision status
    problemRevisions = {};
    // Fallback to localStorage when logged out
    loadProblemStatuses();
    // Reinitialize grid without checkboxes
    if (currentCategory) {
      initializeGrid(currentCategory);
      changeCategory(currentCategory);
    }
  }
});


// Sign in with Google
function signInWithGoogle() {
  auth.signInWithPopup(googleProvider)
    .then((result) => {
      console.log("Google sign in successful");
    })
    .catch((error) => {
      console.error("Google Sign In Error:", error.message);
      alert("Sign in error: " + error.message);
    });
}

// Sign out function
function signOut() {
  auth.signOut()
    .then(() => {
      console.log("User signed out");
    })
    .catch((error) => {
      console.error("Sign out error:", error);
    });
}

async function loadProgressFromFirebase() {
  if (!currentUser) return Promise.resolve();
  
  try {
    // Get the user's progress document
    const progressDoc = await db.collection('user_progress')
      .doc(currentUser.uid)
      .get();
    
    if (progressDoc.exists) {
      const data = progressDoc.data();
      const problems = data.problems || {};
      
      // Update all problem instances across all categories
      Object.keys(problemDataByCategory).forEach(category => {
        if (!problemStatuses[category]) {
          problemStatuses[category] = {};
        }
        
        problemDataByCategory[category].forEach(problem => {
          // Update problem status if we have it
          if (problems.hasOwnProperty(problem.leetcode_id)) {
            problem.status = problems[problem.leetcode_id];
            
            // Also update in our tracking object
            problemStatuses[category][problem.leetcode_id] = problems[problem.leetcode_id];
          }
        });
      });
      
      // Update grid if needed
      updateGrid();
      
      // Update progress counters
      Object.keys(problemDataByCategory).forEach(cat => {
        if (cat !== 'all') {
          updateCategoryCounter(cat);
        }
      });
      updateOverallProgress();
      
      console.log(`Loaded progress from Firebase for ${Object.keys(problems).length} problems`);
    } else {
      console.log(`No existing progress, creating new document`);
      // Initialize with local storage data
      const allProblems = {};
      let hasLocalData = false;
      
      // We'll gather status from localStorage, but in a leetcode_id-centric way
      const processedIds = new Set();
      
      Object.keys(problemDataByCategory).forEach(category => {
        if (category === 'all') return;
        
        const localData = localStorage.getItem(`tech-navigator-${category}-progress`);
        if (localData) {
          const categoryProblems = JSON.parse(localData);
          
          Object.keys(categoryProblems).forEach(problemId => {
            // Only process each leetcode_id once
            if (!processedIds.has(problemId)) {
              allProblems[problemId] = categoryProblems[problemId];
              processedIds.add(problemId);
              hasLocalData = true;
            }
          });
        }
      });
      
      // If we found any local data, save it to Firebase
      if (hasLocalData) {
        await saveProgressToFirebase(allProblems);
      }
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error("Error loading progress from Firebase:", error);
    return Promise.reject(error);
  }
}

// Save progress to Firebase
async function saveProgressToFirebase(problems) {
  if (!currentUser) return;
  
  try {
    await db.collection('user_progress')
      .doc(currentUser.uid)
      .set({
        problems: problems,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      });
    
    console.log(`Progress saved to Firebase`);
  } catch (error) {
    console.error("Error saving progress to Firebase:", error);
  }
}

// REVISION FEATURE: Load revisions from Firebase
async function loadRevisionsFromFirebase() {
  if (!currentUser) return Promise.resolve();
  
  try {
    // Get the user's revisions document
    const revisionDoc = await db.collection('user_revisions')
      .doc(currentUser.uid)
      .get();
    
    problemRevisions = {}; // Reset revisions
    
    if (revisionDoc.exists) {
      const data = revisionDoc.data();
      const revisionsData = data.problems || {};
      
      // Store revision status by leetcode ID
      Object.keys(revisionsData).forEach(leetcodeId => {
        problemRevisions[leetcodeId] = true;
      });
      
      console.log(`Loaded ${Object.keys(problemRevisions).length} problems marked for revision`);
      
      // Update the revision count in the header
      const revisionCount = document.getElementById('revision-count');
      if (revisionCount) {
        revisionCount.textContent = Object.keys(problemRevisions).length;
      }
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error("Error loading revisions from Firebase:", error);
    return Promise.reject(error);
  }
}

// REVISION FEATURE: Save revision status to Firebase
async function saveRevisionStatus(problemId, isMarked) {
  if (!currentUser) return;
  
  try {
    // Reference to the user's revision document
    const revisionRef = db.collection('user_revisions')
      .doc(currentUser.uid);
    
    // Get current revisions or create new doc
    const doc = await revisionRef.get();
    
    if (doc.exists) {
      // Update the existing document with the new status
      if (isMarked) {
        // Add to revisions
        await revisionRef.update({
          [`problems.${problemId}`]: {
            markedOn: firebase.firestore.FieldValue.serverTimestamp(),
            leetcodeId: problemId
          }
        });
      } else {
        // Remove from revisions
        await revisionRef.update({
          [`problems.${problemId}`]: firebase.firestore.FieldValue.delete()
        });
      }
    } else {
      // Create new document with initial revision
      const initialData = { problems: {} };
      if (isMarked) {
        initialData.problems[problemId] = {
          markedOn: firebase.firestore.FieldValue.serverTimestamp(),
          leetcodeId: problemId
        };
      }
      await revisionRef.set(initialData);
    }
    
    console.log(`Revision status for problem ${problemId} set to ${isMarked}`);
    
    // Update the revision count in the header
    const revisionCount = document.getElementById('revision-count');
    if (revisionCount) {
      const count = Object.keys(problemRevisions).filter(id => problemRevisions[id]).length;
      revisionCount.textContent = count;
    }
  } catch (error) {
    console.error("Error saving revision status:", error);
  }
}

// REVISION FEATURE: Revision star cell renderer
function revisionStarCellRenderer(params) {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.justifyContent = 'center';
  wrapper.style.alignItems = 'center';
  wrapper.style.height = '100%';
  
  const starIcon = document.createElement('span');
  starIcon.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
         class="revision-star ${problemRevisions[params.data.leetcode_id] ? 'marked' : ''}">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  `;
  starIcon.style.cursor = 'pointer';
  starIcon.classList.add('revision-star-wrapper');
  
  // Add event listener to toggle revision status
  starIcon.addEventListener('click', function() {
    const data = params.node.data;
    const isCurrentlyMarked = problemRevisions[data.leetcode_id] || false;
    const newMarkedStatus = !isCurrentlyMarked;
    
    // Update UI immediately
    problemRevisions[data.leetcode_id] = newMarkedStatus;
    const svgElement = this.querySelector('svg');
    if (newMarkedStatus) {
      svgElement.classList.add('marked');
    } else {
      svgElement.classList.remove('marked');
    }
    
    // Save to Firebase
    saveRevisionStatus(data.leetcode_id, newMarkedStatus);
    
    // Refresh grid for other instances of this problem
    gridApi.refreshCells();
  });
  
  wrapper.appendChild(starIcon);
  return wrapper;
}

// REVISION FEATURE: Get problems marked for revision
function getRevisionProblems() {
  const revisionProblems = [];
  
  // Go through all problems in all categories (except 'revision' itself)
  Object.keys(problemDataByCategory).forEach(category => {
    if (category !== 'revision') {
      problemDataByCategory[category].forEach(problem => {
        if (problemRevisions[problem.leetcode_id]) {
          // Create a copy of the problem to avoid reference issues
          const problemCopy = { ...problem };
          // Avoid duplicates by checking if already added
          if (!revisionProblems.some(p => p.leetcode_id === problemCopy.leetcode_id)) {
            revisionProblems.push(problemCopy);
          }
        }
      });
    }
  });
  
  return revisionProblems;
}

// REVISION FEATURE: Show revision problems
function showRevisionProblems() {
  // Create a "revision" category if it doesn't exist
  if (!problemDataByCategory.revision) {
    problemDataByCategory.revision = getRevisionProblems();
    
    // Add to sidebar if not already there
    const sidebarNav = document.querySelector('.sidebar-nav');
    const revisionListItem = document.getElementById('revision-list-item');
    
    if (!revisionListItem) {
      const li = document.createElement('li');
      li.className = 'sidebar-nav-item';
      li.id = 'revision-list-item';
      
      const link = document.createElement('a');
      link.href = 'javascript:void(0);';
      link.className = 'sidebar-nav-link';
      link.dataset.category = 'revision';
      link.id = 'revision-link-sidebar';
      
      link.innerHTML = `
        <span>Revision List</span>
        <span class="nav-progress" id="revision-nav-progress">
          <div class="progress-mini"><div class="progress-mini-bar" style="width:0%"></div></div>
          0/0
        </span>
      `;
      
      link.addEventListener('click', function() {
        showRevisionProblems();
      });
      
      li.appendChild(link);
      sidebarNav.appendChild(li);
    }
  } else {
    // Update the problems in the revision category
    problemDataByCategory.revision = getRevisionProblems();
  }
  
  // Change to the revision category
  changeCategory('revision');
  
  // Update active sidebar link
  document.querySelectorAll('.sidebar-nav-link').forEach(link => {
    link.classList.remove('active');
  });
  const revisionSidebarLink = document.getElementById('revision-link-sidebar');
  if (revisionSidebarLink) revisionSidebarLink.classList.add('active');
}

/***********************
 * TRANSFORM JSON DATA INTO CATEGORIES
 ***********************/
const CATEGORIES_DATA = {
  
  "Arrays": {
    "tip": "Arrays are the most fundamental data structure. Focus on understanding basic operations like traversal, insertion, deletion, and in-place manipulation. Look for problems involving direct array access, traversal, and simple transformations without specialized algorithms.",
    "problems": [
  {
    "id": 1,
    "leetcode_id": 121,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Best Time to Buy and Sell Stock",
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    "requirements": "Array traversal and tracking maximum difference"
  },
  {
    "id": 2,
    "leetcode_id": 448,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Find All Numbers Disappeared in an Array",
    "leetcode": "https://leetcode.com/problems/find-all-numbers-disappeared-in-an-array/",
    "requirements": "Basic array traversal and element marking"
  },
  {
    "id": 3,
    "leetcode_id": 1431,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Kids With the Greatest Number of Candies",
    "leetcode": "https://leetcode.com/problems/kids-with-the-greatest-number-of-candies/",
    "requirements": "Simple array comparison and boolean array creation"
  },
  {
    "id": 4,
    "leetcode_id": 169,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Majority Element",
    "leetcode": "https://leetcode.com/problems/majority-element/",
    "requirements": "Basic array traversal and counting"
  },
  {
    "id": 5,
    "leetcode_id": 485,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Max Consecutive Ones",
    "leetcode": "https://leetcode.com/problems/max-consecutive-ones/",
    "requirements": "Basic array traversal and counting"
  },
  {
    "id": 6,
    "leetcode_id": 66,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Plus One",
    "leetcode": "https://leetcode.com/problems/plus-one/",
    "requirements": "Array representation of numbers"
  },
  {
    "id": 7,
    "leetcode_id": 27,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Remove Element",
    "leetcode": "https://leetcode.com/problems/remove-element/",
    "requirements": "Basic in-place array element removal"
  },
  {
    "id": 8,
    "leetcode_id": 48,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Rotate Image",
    "leetcode": "https://leetcode.com/problems/rotate-image/",
    "requirements": "2D array in-place rotation"
  },
  {
    "id": 9,
    "leetcode_id": 1480,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Running Sum of 1d Array",
    "leetcode": "https://leetcode.com/problems/running-sum-of-1d-array/",
    "requirements": "Simple array traversal and accumulation"
  },
  {
    "id": 10,
    "leetcode_id": 73,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Set Matrix Zeroes",
    "leetcode": "https://leetcode.com/problems/set-matrix-zeroes/",
    "requirements": "2D array in-place modification"
  },
  {
    "id": 11,
    "leetcode_id": 1470,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Shuffle the Array",
    "leetcode": "https://leetcode.com/problems/shuffle-the-array/",
    "requirements": "Array reorganization with specific pattern"
  },
  {
    "id": 12,
    "leetcode_id": 54,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Spiral Matrix",
    "leetcode": "https://leetcode.com/problems/spiral-matrix/",
    "requirements": "2D array traversal pattern"
  },
  {
    "id": 13,
    "leetcode_id": 977,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Squares of a Sorted Array",
    "leetcode": "https://leetcode.com/problems/squares-of-a-sorted-array/",
    "requirements": "Basic array transformation"
  },
  {
    "id": 14,
    "leetcode_id": 36,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Valid Sudoku",
    "leetcode": "https://leetcode.com/problems/valid-sudoku/",
    "requirements": "2D array validation"
  },
  {
    "id": 15,
    "leetcode_id": 867,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Transpose Matrix",
    "leetcode": "https://leetcode.com/problems/transpose-matrix/",
    "requirements": "Basic 2D array manipulation"
  }
]
  },
  
}

// Process the new data format into the old format for compatibility
const jsonData = {
  "problems": []
};

// Process the new data format into the old format for compatibility
for (const category in CATEGORIES_DATA) {
  CATEGORIES_DATA[category].problems.forEach(problem => {
    const categories = {};
    categories[category] = problem.requirements;
    
    jsonData.problems.push({
      id: problem.id,
      status: problem.status || false,
      problem: problem.problem,
      difficulty: problem.difficulty,
      leetcode: problem.leetcode,
      leetcode_id: problem.leetcode_id,
      requirements: problem.requirements,
      categories: categories
    });
  });
}

console.log('total', jsonData.problems.length);

/***********************
 * TRANSFORM JSON DATA INTO A MAPPING BY CATEGORY
 ***********************/
const problemDataByCategory = {};
jsonData.problems.forEach(problem => {
  Object.keys(problem.categories).forEach(cat => {
    if (!problemDataByCategory[cat]) {
      problemDataByCategory[cat] = [];
    }
    // Add both a "subcategory" and "category" property
    const newProblem = { 
      ...problem, 
      category: cat 
    };
    problemDataByCategory[cat].push(newProblem);
  });
});

// Create an "all" category that combines every problem (excluding "all" itself)
// Create an "all" category that combines every problem (excluding "all" itself)
problemDataByCategory.all = [];
const seenLeetCodeIds = new Set();

Object.keys(problemDataByCategory).forEach(cat => {
  if (cat !== 'all') {
    problemDataByCategory[cat].forEach(problem => {
      if (!seenLeetCodeIds.has(problem.leetcode_id)) {
        seenLeetCodeIds.add(problem.leetcode_id);
        // Create a copy of the problem to avoid reference issues
        const problemCopy = { ...problem };
        // We'll track which categories this problem belongs to for filtering purposes
        problemCopy.categories_list = [cat];
        problemDataByCategory.all.push(problemCopy);
      } else {
        // If we've seen this problem before, add this category to its categories list
        const existingProblem = problemDataByCategory.all.find(p => p.leetcode_id === problem.leetcode_id);
        if (existingProblem && existingProblem.categories_list && !existingProblem.categories_list.includes(cat)) {
          existingProblem.categories_list.push(cat);
        }
      }
    });
  }
});

/***********************
 * STATE & STATUS MANAGEMENT
 ***********************/
let currentCategory = 'all'; // default category (match the case used in JSON)
let gridApi = null;
let columnApi = null;
let problemStatuses = {};

// Load statuses from localStorage for each category
function loadProblemStatuses() {
  if (!currentUser) {
    // Do nothing or leave in-memory defaults when not logged in.
    return;
  }
  Object.keys(problemDataByCategory).forEach(category => {
    if (category === 'all') return; // Skip "all" category
    
    const stored = localStorage.getItem(`tech-navigator-${category}-progress`);
    const statusObj = stored ? JSON.parse(stored) : {};
    problemStatuses[category] = statusObj;
    
    problemDataByCategory[category].forEach(problem => {
      problem.status = statusObj[problem.leetcode_id] || false;
    });
  });
}

// Now getFilteredProblems uses the updated mapping:
function getFilteredProblems() {
  return problemDataByCategory[currentCategory] || [];
}

// Save a problem's status - updated to use LeetCode ID across all categories
function saveProblemStatus(category, problemId, status) {
  if (!currentUser) {
    // If not logged in, do not store anything.
    return;
  }
  
  // Update status in ALL categories
  Object.keys(problemDataByCategory).forEach(cat => {
    // Find the problem in this category
    const problemsInCategory = problemDataByCategory[cat];
    problemsInCategory.forEach(problem => {
      if (problem.leetcode_id === problemId) {
        // Update the status for this specific problem
        problem.status = status;

        // Ensure category-specific tracking
        if (!problemStatuses[cat]) {
          problemStatuses[cat] = {};
        }
        problemStatuses[cat][problemId] = status;

        // Update localStorage for this category
        localStorage.setItem(`tech-navigator-${cat}-progress`, JSON.stringify(problemStatuses[cat]));
        
        // Update category counter immediately for this category
        updateCategoryCounter(cat);
      }
    });
  });

  // Trigger grid update to reflect changes
  if (gridApi) {
    gridApi.refreshCells();
  }

  // Update overall progress counter
  updateOverallProgress();

  // If signed in, collect all problem statuses and save to Firebase
  if (currentUser) {
    const allProblems = {};
    const processedIds = new Set();
    
    Object.keys(problemStatuses).forEach(cat => {
      if (cat === 'all') return;
      
      Object.keys(problemStatuses[cat] || {}).forEach(probId => {
        if (!processedIds.has(probId)) {
          allProblems[probId] = problemStatuses[cat][probId];
          processedIds.add(probId);
        }
      });
    });
    
    saveProgressToFirebase(allProblems);
  }
}

/***********************
 * HELPER FUNCTIONS
 ***********************/
// Resets all filter controls


// Updates/reinitializes the grid with filtered problems.
function updateGrid() {
  const gridData = getFilteredProblems();
  if (gridApi && gridApi.setRowData) {
    gridApi.setRowData(gridData);
  } else {
    console.log("Updated grid data:", gridData);
  }
}

// Retrieves the current status for all problems in the specified category.
function getStatusForCategory(category) {
  return jsonData.problems
    .filter(problem => Object.keys(problem.categories).includes(category))
    .map(problem => ({ id: problem.leetcode_id, status: problem.status }));
}

// Update the category counter
function updateCategoryCounter(category) {
  if (!problemDataByCategory[category]) return;
  
  const problems = problemDataByCategory[category];
  const total = problems.length;
  const solved = problems.filter(p => p.status).length;
  const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;

  // Find the corresponding nav progress element
  const sanitizedId = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const navProgress = document.getElementById(`${sanitizedId}-nav-progress`);
  
  if (navProgress) {
    navProgress.innerHTML = `
      <div class="progress-mini">
        <div class="progress-mini-bar" style="width:${percentage}%"></div>
      </div>
      ${solved}/${total}
    `;
  }

  // Update main counter if current category
  if (category === currentCategory) {
    document.getElementById('problem-count').textContent = `(${solved}/${total})`;
    const progressCircle = document.querySelector('#category-counter .circle-progress-bar');
    if (progressCircle) {
      const circumference = 2 * Math.PI * 15;
      progressCircle.style.strokeDasharray = circumference;
      progressCircle.style.strokeDashoffset = circumference - (percentage / 100) * circumference;
    }
    document.getElementById('category-percentage').textContent = `${percentage}% Completed`;
    updateDifficultyCounts(category);
  }
}

// Theme toggle handler
function setupThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  const lightIcon = document.getElementById('light-icon');
  const darkIcon = document.getElementById('dark-icon');
  
  // Set dark mode as default
  document.body.classList.add('dark-mode');
  lightIcon.classList.remove('active');
  darkIcon.classList.add('active');
  localStorage.setItem('tech-navigator-theme', 'dark');
  
  themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    lightIcon.classList.toggle('active');
    darkIcon.classList.toggle('active');
    localStorage.setItem('tech-navigator-theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    if (gridApi) {
      gridApi.refreshCells();
    }
  });
}

// Change category, update grid and counters. Fixed parameter name usage.
function changeCategory(category) {
  // Reset UI filters
  
  // Clear grid filter model
  if (gridApi) {
    gridApi.setFilterModel(null);
  }

  // Update current category if changed
  if (currentCategory !== category) {
    currentCategory = category;
  }

  // Update active sidebar link
  document.querySelectorAll('.sidebar-nav-link').forEach(link => {
    link.classList.remove('active');
  });
  const activeLink = document.getElementById(`${category}-link`);
  if (activeLink) activeLink.classList.add('active');

  // Update title and problem count
  document.querySelector('.category-name').textContent = getCategoryTitle(category);
  const totalProblems = problemDataByCategory[category] ? problemDataByCategory[category].length : 0;
  const solvedProblems = problemDataByCategory[category] ? problemDataByCategory[category].filter(p => p.status).length : 0;
  document.getElementById('problem-count').textContent = `(${solvedProblems}/${totalProblems})`;

  // Show category tip if available
  updateCategoryTip(category);
  

  // Initialize grid for the category
  initializeGrid(category);

  // Force refresh of client-side row model
  if (gridApi) {
    gridApi.refreshClientSideRowModel('filter');
  }

  // Update counters
  updateCategoryCounter(category);
}

// Update category tip
function updateCategoryTip(category) {
  const tipElement = document.getElementById('category-tip');
  
  if (category !== 'all' && category !== 'revision' && CATEGORIES_DATA[category] && CATEGORIES_DATA[category].tip) {
    tipElement.innerHTML = `
      <h3>Tips for ${getCategoryTitle(category)}</h3>
      <p>${CATEGORIES_DATA[category].tip}</p>
    `;
    tipElement.style.display = 'block';
  } else {
    tipElement.style.display = 'none';
  }
}

// Map category keys to display titles
function getCategoryTitle(category) {
  if (category === 'all') return 'ALL Problems';
  if (category === 'revision') return 'Problems Marked for Revision';
  return category;
}

function initializeGrid(category) {
  console.log(`Initializing grid for category: ${category}`);
  
  if (!problemDataByCategory[category]) {
    console.error(`No data found for category: ${category}`);
    return;
  }
  
  // Status column - only shown for logged in users
  const statusColumn = currentUser
    ? [{
        headerName: 'Status',
        field: 'status',
        width: 80,
        cellRenderer: statusCellRenderer,
        sortable: true,
        filter: 'agSetColumnFilter',
        filterParams: {
          values: [true, false],
          cellRenderer: (params) => (params.value ? 'Completed' : 'Pending')
        },
        suppressSizeToFit: true,
        headerClass: 'ag-center-header'
      }]
    : []; // Omit column if not logged in
  
  // Video column - only shown if video data exists
  const videoColumn = [{
    headerName: '',
    field: 'video_url',
    width: 50,
    cellRenderer: (params) => {
      if (!params.value) return '';
      // Using YouTube icon (play button icon)
      return `<a href="${params.value}" target="_blank" title="Watch Video Solution" class="grid-icon youtube-icon">&#9654;&#65039;</a>`;
    },
    suppressSizeToFit: true,
    headerClass: 'ag-center-header',
    filter: {
      valueGetter: params => !!params.data.video_url,
      filterParams: {
        values: [true, false],
        cellRenderer: params => params.value ? 'Has Video' : 'No Video'
      }
    }
  }];
  
  // Article column - only shown if article data exists
  const articleColumn = [{
    headerName: '',
    field: 'article_url',
    width: 50,
    cellRenderer: (params) => {
      if (!params.value) return '';
      // Using document icon
      return `<a href="${params.value}" target="_blank" title="Read Article Solution" class="grid-icon article-icon">&#128196;</a>`;
    },
    suppressSizeToFit: true,
    headerClass: 'ag-center-header',
    filter: {
      valueGetter: params => !!params.data.article_url,
      filterParams: {
        values: [true, false],
        cellRenderer: params => params.value ? 'Has Article' : 'No Article'
      }
    }
  }];
  
  // REVISION FEATURE: Revision star column - only shown for logged in users
  const revisionColumn = currentUser
    ? [{
        headerName: '',
        field: 'revision',
        width: 50,
        cellRenderer: revisionStarCellRenderer,
        suppressSizeToFit: true,
        headerClass: 'ag-center-header',
        filter: {
          valueGetter: params => !!problemRevisions[params.data.leetcode_id],
          filterParams: {
            values: [true, false],
            cellRenderer: params => params.value ? 'Marked for Revision' : 'Not Marked'
          }
        }
      }]
    : [];
  
  const columnDefs = [
    ...statusColumn,
    ...videoColumn,
    ...articleColumn,
    ...revisionColumn, // Add the revision column here
    {
      headerName: 'Problem',
      field: 'problem',
      flex: 1,
      filter: true,
      sortable: true,
      minWidth: 250,
      cellRenderer: problemCellRenderer
    },
    {
      headerName: 'LeetCode ID',
      field: 'leetcode_id',
      width: 120,
      filter: true,
      sortable: true,
      suppressSizeToFit: true,
      headerClass: 'ag-center-header',
      hide: 'true'
    },
    {
      headerName: 'Difficulty',
      field: 'difficulty',
      width: 120,
      cellRenderer: difficultyCellRenderer,
      filter: true,
      sortable: true,
      suppressSizeToFit: true,
      headerClass: 'ag-center-header',
      sort: 'asc',
      sortingOrder: ['asc', 'desc', null],
      comparator: (valueA, valueB) => {
        const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
        return difficultyOrder[valueA] - difficultyOrder[valueB];
      }
    }
  ];
  
  // For "all" category, add a Category column
  if (category === 'all') {
    // Insert the category column after the problem column
    columnDefs.splice(5, 0, {
      headerName: 'Category',
      field: 'category',
      width: 150,
      filter: true,
      sortable: true,
      valueFormatter: params => getCategoryTitle(params.value)
    });
  }
  
  // Get the appropriate data for the current category
  let rowData;
  if (category === 'revision') {
    // For revision category, get only problems marked for revision
    rowData = getRevisionProblems();
  } else {
    // For other categories, use the standard data
    rowData = problemDataByCategory[category] || [];
  }
  
  console.log(`Grid data for ${category}:`, {
    rowCount: rowData.length,
    firstRowSample: rowData[0]
  });
  
  const gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
    pagination: true,
    paginationPageSize: 15,
    animateRows: true,
    multiSortKey: 'ctrl', 
    defaultColDef: {
      resizable: true,
      suppressMenu: true,
      sortable: true,
      filter: true
    },
    onGridReady: function(params) {
      gridApi = params.api;
      columnApi = params.columnApi;
      
      // Set initial sorting
      params.columnApi.applyColumnState({
        state: [
          { colId: 'frequency', sort: 'desc', sortIndex: 0 },
          { colId: 'difficulty', sort: 'asc', sortIndex: 1 }
        ],
        applyOrder: false
      });
      
      gridApi.sizeColumnsToFit();
      window.addEventListener('resize', () => setTimeout(() => gridApi.sizeColumnsToFit(), 100));
      
      updateDifficultyCounts(category);
    }
  };
  
  // Destroy existing grid if it exists
  const gridDiv = document.getElementById('problem-grid');
  if (gridDiv) {
    gridDiv.innerHTML = ''; // Clear existing grid
  }
  
  // Create new grid
  new agGrid.Grid(gridDiv, gridOptions);
  
  console.log(`Grid initialized for ${category}`);
}

// Modify changeCategory to ensure grid is updated
function changeCategory(category) {
  console.log(`Changing category to: ${category}`);
  
  // Reset UI filters
  
  // Clear grid filter model
  if (gridApi) {
    gridApi.setFilterModel(null);
  }

  // Update current category
  currentCategory = category;

  // Update active sidebar link
  document.querySelectorAll('.sidebar-nav-link').forEach(link => {
    link.classList.remove('active');
  });
  const activeLink = document.getElementById(`${category}-link`);
  if (activeLink) activeLink.classList.add('active');

  // Update title and problem count
  document.querySelector('.category-name').textContent = getCategoryTitle(category);
  const totalProblems = problemDataByCategory[category] ? problemDataByCategory[category].length : 0;
  const solvedProblems = problemDataByCategory[category] ? problemDataByCategory[category].filter(p => p.status).length : 0;
  document.getElementById('problem-count').textContent = `(${solvedProblems}/${totalProblems})`;

  // Show category tip if available
  updateCategoryTip(category);
  

  // Reinitialize grid for the category
  initializeGrid(category);

  // Update counters
  updateCategoryCounter(category);
  updateDifficultyCounts(category);
}

// Cell renderer for the status column (with checkbox)
function statusCellRenderer(params) {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.justifyContent = 'center';
  wrapper.style.alignItems = 'center';
  wrapper.style.height = '100%';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = params.value;
  checkbox.style.cursor = 'pointer';
  checkbox.style.width = '18px';
  checkbox.style.height = '18px';
  checkbox.style.accentColor = '#f97316';
  
  // In the checkbox event listener (statusCellRenderer)
  checkbox.addEventListener('change', function() {
    const data = params.node.data;
    data.status = this.checked;
    
    // If in "all" category, update the original category
    if (currentCategory === 'all' && data.category) {
      const orig = problemDataByCategory[data.category].find(p => p.leetcode_id === data.leetcode_id);
      if (orig) {
        orig.status = this.checked;
        saveProblemStatus(data.category, data.leetcode_id, this.checked); // Save to original category
      }
    } else {
      saveProblemStatus(currentCategory, data.leetcode_id, this.checked); // Save to current category
    }
    
    updateCategoryCounter(currentCategory);
    updateOverallProgress();
  });
  wrapper.appendChild(checkbox);
  return wrapper;
}

// Cell renderer for the difficulty column (shows a tag)
function difficultyCellRenderer(params) {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.justifyContent = 'center';
  wrapper.style.alignItems = 'center';
  wrapper.style.height = '100%';
  const tag = document.createElement('span');
  tag.className = `difficulty-tag ${params.value.toLowerCase()}`;
  tag.textContent = params.value;
  wrapper.appendChild(tag);
  return wrapper;
}

// Cell renderer for the frequency column (shows a tag)
function frequencyCellRenderer(params) {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.justifyContent = 'center';
  wrapper.style.alignItems = 'center';
  wrapper.style.height = '100%';
  const tag = document.createElement('span');
  const frequencyClass = params.value.toLowerCase();
  tag.className = `frequency-tag ${frequencyClass}`;
  tag.textContent = params.value;
  wrapper.appendChild(tag);
  return wrapper;
}

// Update Problem column cell renderer
function problemCellRenderer(params) {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.alignItems = 'center';
  wrapper.style.gap = '6px';
  
  // Create tooltip wrapper
  const tooltipDiv = document.createElement('div');
  tooltipDiv.className = 'tooltip';
  
  // LeetCode Link
  const link = document.createElement('a');
  link.href = params.data.leetcode;
  link.textContent = params.value;
  link.target = '_blank';
  link.style.color = 'var(--text-color)';
  link.style.textDecoration = 'none';
  link.style.fontWeight = '500';
  link.style.display = 'flex';
  link.style.alignItems = 'center';
  link.style.gap = '4px';
  
  // Tooltip content
  if (params.data.requirements) {
    const tooltipContent = document.createElement('div');
    tooltipContent.className = 'tooltip-content';
    tooltipContent.innerHTML = `<strong>Requirements:</strong> ${params.data.requirements}`;
    tooltipDiv.appendChild(tooltipContent);
  }

  // External Link Icon
  link.innerHTML += `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" 
         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
         style="flex-shrink: 0;">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  `;

  // Hover effects
  link.addEventListener('mouseenter', () => {
    link.style.color = 'var(--professional-orange)';
  });
  link.addEventListener('mouseleave', () => {
    link.style.color = 'var(--text-color)';
  });

  tooltipDiv.appendChild(link);
  wrapper.appendChild(tooltipDiv);
  return wrapper;
}

function applyFilters() {
  if (!gridApi) return;
  
  
  // Apply filters and force immediate refresh
  gridApi.setFilterModel(filterModel);
  gridApi.onFilterChanged();
  gridApi.refreshClientSideRowModel('filter');
  
  updateFilteredDifficultyCounts();
}

// Update difficulty counts based on currently filtered data
function updateFilteredDifficultyCounts() {
  if (!gridApi) return;
  const filteredNodes = [];
  gridApi.forEachNodeAfterFilter(node => filteredNodes.push(node));
  const filteredData = filteredNodes.map(node => node.data);
  const easy = countByDifficultyFiltered(filteredData, 'Easy');
  const medium = countByDifficultyFiltered(filteredData, 'Medium');
  const hard = countByDifficultyFiltered(filteredData, 'Hard');
  document.getElementById('easy-count').textContent = `Easy: ${easy.solved}/${easy.total}`;
  document.getElementById('medium-count').textContent = `Medium: ${medium.solved}/${medium.total}`;
  document.getElementById('hard-count').textContent = `Hard: ${hard.solved}/${hard.total}`;
  const remaining = (Math.max(0, easy.total - easy.solved) * 0.5) +
                    (Math.max(0, medium.total - medium.solved) * 1) +
                    (Math.max(0, hard.total - hard.solved) * 2);
  document.getElementById('completion-time').textContent = `Est. completion time: ${Math.round(remaining)} hrs`;
}

// Helper: count difficulties in filtered data
function countByDifficultyFiltered(problems, difficulty) {
  const total = problems.filter(p => p.difficulty === difficulty).length;
  const solved = problems.filter(p => p.difficulty === difficulty && p.status).length;
  return { total, solved };
}

// Update difficulty counts for the current category (unfiltered)
function updateDifficultyCounts(category) {
  if (!problemDataByCategory[category]) return;
  const problems = problemDataByCategory[category];
  const easy = countByDifficulty(problems, 'Easy');
  const medium = countByDifficulty(problems, 'Medium');
  const hard = countByDifficulty(problems, 'Hard');
  document.getElementById('easy-count').textContent = `Easy: ${easy.solved}/${easy.total}`;
  document.getElementById('medium-count').textContent = `Medium: ${medium.solved}/${medium.total}`;
  document.getElementById('hard-count').textContent = `Hard: ${hard.solved}/${hard.total}`;
  const remaining = (Math.max(0, easy.total - easy.solved) * 0.5) +
                    (Math.max(0, medium.total - medium.solved) * 1) +
                    (Math.max(0, hard.total - hard.solved) * 2);
  document.getElementById('completion-time').textContent = `Est. completion time: ${Math.round(remaining)} hrs`;
}

// Helper: count difficulties in a set of problems
function countByDifficulty(problems, difficulty) {
  const total = problems.filter(p => p.difficulty === difficulty).length;
  const solved = problems.filter(p => p.difficulty === difficulty && p.status).length;
  return { total, solved };
}

// Update overall progress across categories (excluding "all")
function updateOverallProgress() {
  // Since we've already ensured uniqueness in the "all" category,
  // we can simply use that for our counts
  const total = problemDataByCategory.all.length;
  const solved = problemDataByCategory.all.filter(p => p.status).length;
  
  const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;
  const circumference = 2 * Math.PI * 15;
  const offset = circumference - (percentage / 100) * circumference;
  
  const progressCircle = document.getElementById('overall-progress');
  if (progressCircle) {
    progressCircle.style.strokeDasharray = circumference;
    progressCircle.style.strokeDashoffset = offset;
  }
  
  document.getElementById('overall-progress-text').textContent = `${percentage}% Completed`;
  
  // Update the nav progress for "all" category separately
  const allNavProgress = document.getElementById('all-nav-progress');
  if (allNavProgress) {
    allNavProgress.innerHTML = `
      <div class="progress-mini">
        <div class="progress-mini-bar" style="width:${percentage}%"></div>
      </div>
      ${solved}/${total}
    `;
  }
}

// REVISION FEATURE: Add CSS styles for revision feature
function addRevisionStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* Revision star styles */
    .revision-star {
      color: var(--text-muted);
      transition: all 0.2s;
    }
    
    .revision-star.marked {
      fill: var(--professional-orange);
      color: var(--professional-orange);
    }
    
    .revision-star-wrapper:hover .revision-star {
      color: var(--professional-orange);
    }
    
    /* Counter badge */
    .revision-count {
      background-color: var(--professional-orange);
      color: white;
      border-radius: 9999px;
      padding: 2px 6px;
      font-size: 10px;
      font-weight: bold;
    }
  `;
  document.head.appendChild(styleElement);
}

document.addEventListener('DOMContentLoaded', function() {
  // Add revision styles
  addRevisionStyles();
  
  // Set up revision link click handler
  const revisionLink = document.getElementById('revision-link');
  if (revisionLink) {
    revisionLink.addEventListener('click', showRevisionProblems);
  }
  
  changeCategory('all');
  // Generate sidebar links dynamically
  const sidebarNav = document.querySelector('.sidebar-nav');
  sidebarNav.innerHTML = ''; // Clear existing static content
  
  // Create 'All Problems' link
  const allLi = createSidebarItem('all');
  sidebarNav.appendChild(allLi);
  
  // Create other categories (sorted)
  const categories = Object.keys(CATEGORIES_DATA);
  categories.forEach(cat => {
    const li = createSidebarItem(cat);
    sidebarNav.appendChild(li);
  });
  
  // Add Google auth event listeners
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  
  if (loginBtn) {
    loginBtn.addEventListener('click', signInWithGoogle);
  }
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', signOut);
  }
  
  // Load statuses and initialize
  loadProblemStatuses();
  
  // Initialize all category counters
  Object.keys(problemDataByCategory).forEach(cat => {
    updateCategoryCounter(cat);
  });
  updateOverallProgress();
  
  
  initializeGrid('all');
  changeCategory('all');
});

// Helper function to create sidebar items
function createSidebarItem(category) {
  const li = document.createElement('li');
  li.className = 'sidebar-nav-item';
  
  const link = document.createElement('a');
  link.href = 'javascript:void(0);';
  link.className = 'sidebar-nav-link';
  link.dataset.category = category;
  
  // Generate sanitized ID
  const sanitizedId = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  link.id = `${sanitizedId}-link`;
  
  link.innerHTML = `
    ${getCategoryTitle(category)}
    <span class="nav-progress" id="${sanitizedId}-nav-progress">
      <div class="progress-mini"><div class="progress-mini-bar" style="width:0%"></div></div>
      0/0
    </span>
  `;
  
  link.addEventListener('click', function(e) {
    changeCategory(e.currentTarget.dataset.category);
  });
  
  li.appendChild(link);
  return li;
}
