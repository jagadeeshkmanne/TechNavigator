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
    loadProgressFromFirebase();
  } else {
    // User signed out
    currentUser = null;
    document.getElementById('auth-container').classList.remove('signed-in');
    // Fallback to localStorage when logged out
    loadProblemStatuses();
    changeCategory(currentCategory);
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
  if (!currentUser) return;
  
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
  } catch (error) {
    console.error("Error loading progress from Firebase:", error);
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


/***********************
 * TRANSFORM JSON DATA INTO CATEGORIES
 ***********************/
const CATEGORIES_DATA = {
  "Arrays": {
    "tip": "Arrays are the most fundamental data structure. Focus on understanding basic operations like traversal, insertion, deletion, and in-place manipulation. Look for problems involving direct array access, traversal, and simple transformations without specialized algorithms.",
    "problems": [
      {
        "id": 1,
        "leetcode_id": 1920,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Build Array from Permutation",
        "leetcode": "https://leetcode.com/problems/build-array-from-permutation/",
        "requirements": "Basic array construction and indexing"
      },
      {
        "id": 2,
        "leetcode_id": 1929,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Concatenation of Array",
        "leetcode": "https://leetcode.com/problems/concatenation-of-array/",
        "requirements": "Basic array creation"
      },
      {
        "id": 3,
        "leetcode_id": 1480,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Running Sum of 1d Array",
        "leetcode": "https://leetcode.com/problems/running-sum-of-1d-array/",
        "requirements": "Simple array traversal and accumulation"
      },
      {
        "id": 4,
        "leetcode_id": 485,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Max Consecutive Ones",
        "leetcode": "https://leetcode.com/problems/max-consecutive-ones/",
        "requirements": "Basic array traversal and counting"
      },
      {
        "id": 5,
        "leetcode_id": 1431,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Kids With the Greatest Number of Candies",
        "leetcode": "https://leetcode.com/problems/kids-with-the-greatest-number-of-candies/",
        "requirements": "Simple array comparison and boolean array creation"
      }
    ]
  }
};

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
      frequency: problem.frequency,
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
problemDataByCategory.all = [];
Object.keys(problemDataByCategory).forEach(cat => {
  if (cat !== 'all') {
    problemDataByCategory.all = problemDataByCategory.all.concat(problemDataByCategory[cat]);
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
  // Update status in the current category
  if (!problemStatuses[category]) {
    problemStatuses[category] = {};
  }
  problemStatuses[category][problemId] = status;
  
  // Save to localStorage for this category as before
  localStorage.setItem(`tech-navigator-${category}-progress`, JSON.stringify(problemStatuses[category]));
  
  // Important: Update the same LeetCode ID in ALL categories
  Object.keys(problemDataByCategory).forEach(cat => {
    if (cat !== 'all' && cat !== category) {
      problemDataByCategory[cat].forEach(problem => {
        if (problem.leetcode_id === problemId) {
          problem.status = status;
          
          // Also update in tracking object
          if (!problemStatuses[cat]) {
            problemStatuses[cat] = {};
          }
          problemStatuses[cat][problemId] = status;
          
          // Update localStorage for this category too
          localStorage.setItem(`tech-navigator-${cat}-progress`, JSON.stringify(problemStatuses[cat]));
        }
      });
    }
  });
  
  // Update the "all" category too
  problemDataByCategory['all'].forEach(problem => {
    if (problem.leetcode_id === problemId) {
      problem.status = status;
    }
  });
  
  // If signed in, collect all problem statuses and save to Firebase
  if (currentUser) {
    const allProblems = {};
    const processedIds = new Set();
    
    Object.keys(problemDataByCategory).forEach(cat => {
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
function resetFilters() {
  const filterElements = document.querySelectorAll('.filter-select');
  filterElements.forEach(filter => {
    filter.value = 'all'; // Assumes 'all' is the default value
  });
}

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
  
  const total = problemDataByCategory[category].length;
  const solved = problemDataByCategory[category].filter(p => p.status).length;
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
  resetFilters();
  
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
  
  // Reset filters explicitly
  document.getElementById('status-filter').value = 'all';
  document.getElementById('difficulty-filter').value = 'all';
  document.getElementById('frequency-filter').value = 'all';

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
  
  if (category !== 'all' && CATEGORIES_DATA[category] && CATEGORIES_DATA[category].tip) {
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
  return category;
}

// Initialize the ag-Grid with column definitions and row data
function initializeGrid(category) {
  if (!problemDataByCategory[category]) return;
  const columnDefs = [
    {
      headerName: 'Status',
      field: 'status',
      width: 80,
      cellRenderer: statusCellRenderer,
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
      headerClass: 'ag-center-header'
    },
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
      sort: 'asc', // Secondary sort
     sortingOrder: ['asc', 'desc', null],
     comparator: (valueA, valueB) => {
      const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
      return difficultyOrder[valueA] - difficultyOrder[valueB];
     }
    },
    {
      headerName: 'Frequency',
      field: 'frequency',
      width: 120,
      cellRenderer: frequencyCellRenderer,
      filter: true,
      sortable: true,
      suppressSizeToFit: true,
      headerClass: 'ag-center-header',
     sort: 'desc', // Initial sort direction
     sortingOrder: ['desc', 'asc', null], // Allowed sorting orders
     comparator: (valueA, valueB) => {
      const frequencyOrder = { High: 1, Medium: 2, Low: 3 };
      return frequencyOrder[valueB] - frequencyOrder[valueA];
     }
    }
  ];
  
  // For "all" category, add a Category column
  if (category === 'all') {
    columnDefs.splice(2, 0, {
      headerName: 'Category',
      field: 'category',
      width: 150,
      filter: true,
      sortable: true,
      valueFormatter: params => getCategoryTitle(params.value)
    });
  }
  
  const gridOptions = {
    columnDefs: columnDefs,
    rowData: problemDataByCategory[category],
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
    },
      
  };
  
  if (gridApi) {
    gridApi.setColumnDefs(columnDefs);
    gridApi.setRowData(problemDataByCategory[category]);
  } else {
    new agGrid.Grid(document.getElementById('problem-grid'), gridOptions);
  }
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
  
  // Get filter values
  const status = document.getElementById('status-filter').value;
  const difficulty = document.getElementById('difficulty-filter').value;
  const frequency = document.getElementById('frequency-filter').value;
  
  // Build filter model
  const filterModel = {};
  if (status !== 'all') {
    filterModel.status = { type: 'equals', filter: status === 'completed' };
  }
  if (difficulty !== 'all') {
    filterModel.difficulty = { type: 'equals', filter: difficulty };
  }
  if (frequency !== 'all') {
    filterModel.frequency = { type: 'equals', filter: frequency };
  }

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
  let total = 0, solved = 0;
  Object.keys(problemDataByCategory).forEach(cat => {
    if (cat !== 'all') {
      total += problemDataByCategory[cat].length;
      solved += problemDataByCategory[cat].filter(p => p.status).length;
    }
  });
  const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;
  const circumference = 2 * Math.PI * 15;
  const offset = circumference - (percentage / 100) * circumference;
  const progressCircle = document.getElementById('overall-progress');
  if (progressCircle) {
    progressCircle.style.strokeDasharray = circumference;
    progressCircle.style.strokeDashoffset = offset;
  }
  document.getElementById('overall-progress-text').textContent = `${percentage}% Completed`;
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
document.addEventListener('DOMContentLoaded', function() {
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
  setupThemeToggle();
  
  // Initialize all category counters
  Object.keys(problemDataByCategory).forEach(cat => {
    updateCategoryCounter(cat);
  });
  updateOverallProgress();
  
  // Set up filters
  document.getElementById('status-filter').addEventListener('change', applyFilters);
  document.getElementById('difficulty-filter').addEventListener('change', applyFilters);
  document.getElementById('frequency-filter').addEventListener('change', applyFilters);
  
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
