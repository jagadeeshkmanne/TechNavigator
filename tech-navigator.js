const firebaseConfig = {
  // Add your Firebase config here
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Global variables
let currentUser = null;
let currentView = 'category';
let problemsData = [];

// Category order definition
const categoryOrder = [
  'Arrays',
  'Prefix Sum',
  'HashMap/HashSet',
  'Two Pointers',
  'Sliding Window',
  'Binary Search',
  'Cyclic Sort',
  'Matrix Traversal',
  'Stacks & Queues',
  'Monotonic Stack/Queue',
  'Linked Lists',
  'Fast & Slow Pointers',
  'Linked List Reversal',
  'Recursion',
  'Trees',
  'Tree DFS',
  'Tree BFS',
  'Divide and Conquer',
  'Backtracking',
  'Heap/Priority Queue',
  'Tries',
  'Graphs',
  'Graph DFS',
  'Graph BFS',
  'Union Find',
  'Topological Sort',
  'Shortest Path',
  'Greedy',
  'Dynamic Programming',
  'Segment Trees',
  'Intervals',
  'Bit Manipulation',
  'Math & Geometry'
];

// LocalStorage key
const LOCAL_STORAGE_KEY = 'techNavigator_problems';

// Document Ready Function
document.addEventListener('DOMContentLoaded', function() {
  console.log('Document loaded, initializing app...');
  
  // Show loading spinner
  document.getElementById('loading-spinner').style.display = 'flex';
  document.getElementById('categories-container').style.display = 'none';
  
  // Set up Firebase auth state changes
  auth.onAuthStateChanged(function(user) {
    console.log('Auth state changed', user ? 'User signed in' : 'No user');
    currentUser = user;
    const authContainer = document.getElementById('auth-container');
    
    if (user) {
      // User is signed in
      authContainer.classList.add('signed-in');
      const userImg = document.getElementById('user-img');
      const userName = document.getElementById('user-name');
      
      userImg.src = user.photoURL || 'default-avatar.png';
      userImg.style.display = 'block';
      userName.textContent = user.displayName || user.email;
      
      // Fetch problems for the user
      fetchProblems(user.uid);
    } else {
      // User is signed out
      authContainer.classList.remove('signed-in');
      
      // Load problems from localStorage
      loadProblemsFromLocalStorage();
    }
  });

  // Set up login button
  document.getElementById('login-btn').addEventListener('click', function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(function(error) {
      console.error('Error signing in:', error);
      alert('Failed to sign in: ' + error.message);
    });
  });

  // Set up logout button
  document.getElementById('logout-btn').addEventListener('click', function() {
    auth.signOut().catch(function(error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out: ' + error.message);
    });
  });

  // Setup revision link in header
  document.getElementById('revision-link').addEventListener('click', function() {
    // Switch to revision view when the header link is clicked
    toggleView('revision');
  });
  
  // Setup view toggle buttons
  document.getElementById('category-view-btn').addEventListener('click', function() {
    toggleView('category');
  });
  
  document.getElementById('list-view-btn').addEventListener('click', function() {
    toggleView('list');
  });
  
  // Setup revision view button
  document.getElementById('revision-view-btn').addEventListener('click', function() {
    toggleView('revision');
  });
});

// Load problems from localStorage
function loadProblemsFromLocalStorage() {
  console.log('Loading problems from localStorage');
  
  // Try to get problems from localStorage
  const storedProblems = localStorage.getItem(LOCAL_STORAGE_KEY);
  
  if (storedProblems) {
    try {
      const problems = JSON.parse(storedProblems);
      console.log('Found problems in localStorage:', problems.length);
      
      // Store problems data globally
      problemsData = problems;
      
      // Load problems to UI
      loadProblems(problems);
    } catch (error) {
      console.error('Error parsing localStorage data:', error);
      useDefaultProblems();
    }
  } else {
    // No localStorage data, use defaults
    useDefaultProblems();
  }
}

// Use default problems and save to localStorage
function useDefaultProblems() {
  console.log('Using default problems');
  const defaultProblems = getDefaultProblems();
  problemsData = defaultProblems;
  
  // Save to localStorage
  saveToLocalStorage(defaultProblems);
  
  // Load problems to UI
  loadProblems(defaultProblems);
}

// Save problems to localStorage
function saveToLocalStorage(problems) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(problems));
    console.log('Saved problems to localStorage');
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

// Fetch problems from Firebase
function fetchProblems(userId) {
  console.log('Fetching problems for user', userId);
  document.getElementById('loading-spinner').style.display = 'flex';
  document.getElementById('categories-container').style.display = 'none';
  
  db.collection('users').doc(userId).collection('problems')
    .get()
    .then(function(querySnapshot) {
      let problems = [];
      querySnapshot.forEach(function(doc) {
        console.log('Got problem doc:', doc.id);
        problems.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // If user has no problems, check localStorage first
      if (problems.length === 0) {
        console.log('No existing problems found in Firebase, checking localStorage');
        
        // Try to get problems from localStorage
        const storedProblems = localStorage.getItem(LOCAL_STORAGE_KEY);
        
        if (storedProblems) {
          try {
            problems = JSON.parse(storedProblems);
            console.log('Using problems from localStorage:', problems.length);
            
            // Save to Firebase (in batch)
            const batch = db.batch();
            problems.forEach(problem => {
              const docRef = db.collection('users').doc(userId).collection('problems').doc(problem.id.toString());
              batch.set(docRef, problem);
            });
            
            batch.commit()
              .then(() => {
                console.log('Problems from localStorage saved to Firebase');
              })
              .catch(error => {
                console.error("Error adding localStorage problems to Firebase:", error);
              });
          } catch (error) {
            console.error('Error parsing localStorage data:', error);
            problems = getDefaultProblems();
          }
        } else {
          // No localStorage data, use defaults
          console.log('No localStorage data, using defaults');
          problems = getDefaultProblems();
          
          // Save default problems to user's collection (in batch)
          const batch = db.batch();
          problems.forEach(problem => {
            const docRef = db.collection('users').doc(userId).collection('problems').doc(problem.id.toString());
            batch.set(docRef, problem);
          });
          
          batch.commit()
            .then(() => {
              console.log('Default problems saved to Firebase');
            })
            .catch(error => {
              console.error("Error adding default problems in batch:", error);
            });
        }
      }
      
      // Also save to localStorage for offline use
      saveToLocalStorage(problems);
      
      // Store problems data globally
      problemsData = problems;
      
      // Load problems to UI
      loadProblems(problems);
    })
    .catch(function(error) {
      console.error("Error getting problems from Firebase:", error);
      
      // Fall back to localStorage if Firebase fails
      loadProblemsFromLocalStorage();
    });
}

// Helper function to check if a problem has a valid editorial URL
function hasValidEditorialUrl(problem) {
  return problem && 
         problem.editorial_url && 
         typeof problem.editorial_url === 'string' && 
         problem.editorial_url.trim() !== '';
}

// Load problems into UI
function loadProblems(problems) {
  console.log('Loading problems into UI', problems.length);
  
  // Group problems by category
  const groupedProblems = {};
  problems.forEach(problem => {
    if (!groupedProblems[problem.category]) {
      groupedProblems[problem.category] = [];
    }
    groupedProblems[problem.category].push(problem);
  });
  
  // Get container
  const container = document.getElementById('categories-container');
  container.innerHTML = '';
  
  // Create accordions for ALL categories in the order specified, even if they have no problems yet
  categoryOrder.forEach(category => {
    // Get problems for this category, or empty array if none
    const categoryProblems = groupedProblems[category] || [];
    const totalProblems = categoryProblems.length;
    const completedProblems = categoryProblems.filter(p => p.status).length;
    const percentComplete = totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0;
    
    // Create accordion element
    const accordionElement = document.createElement('div');
    accordionElement.className = 'accordion-category';
    
    // Create header
    const headerElement = document.createElement('div');
    headerElement.className = 'accordion-header';
    headerElement.innerHTML = `
      <div class="category-title">
        <span class="category-title-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" 
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </span>
        ${category}
      </div>
      <div class="category-stats">
        <div class="category-progress">
          <div class="category-progress-bar" style="width: ${percentComplete}%"></div>
        </div>
        <span>${completedProblems}/${totalProblems} (${percentComplete}%)</span>
      </div>
    `;
    
    // Create content
    const contentElement = document.createElement('div');
    contentElement.className = 'accordion-content';
    
    // Create problem table
    const tableElement = document.createElement('table');
    tableElement.className = 'problem-table';
    
    // Add table header
    tableElement.innerHTML = `
      <thead>
        <tr>
          <th>Status</th>
          <th>Review</th>
          <th>Editorial</th>
          <th>Problem</th>
          <th>Difficulty</th>
        </tr>
      </thead>
      <tbody id="category-${category.replace(/\s+|[/&]/g, '-')}-problems"></tbody>
    `;
    
    contentElement.appendChild(tableElement);
    accordionElement.appendChild(headerElement);
    accordionElement.appendChild(contentElement);
    container.appendChild(accordionElement);
    
    // Add problems to table (if any)
    if (categoryProblems.length > 0) {
      const tbody = document.getElementById(`category-${category.replace(/\s+|[/&]/g, '-')}-problems`);
      categoryProblems.forEach(problem => {
        const row = document.createElement('tr');
        row.className = 'problem-row';
        row.dataset.id = problem.id;
        
        // Check if the problem has a valid editorial URL
        const hasEditorial = hasValidEditorialUrl(problem);
        
        row.innerHTML = `
          <td>
            <div class="status-checkbox">
              <input type="checkbox" id="status-${problem.id}" 
                ${problem.status ? 'checked' : ''} 
                onchange="updateProblemStatus(${problem.id}, this.checked)">
            </div>
          </td>
          <td>
            <div class="revision-star-wrapper" onclick="toggleRevision(${problem.id}, ${!problem.revision})">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${problem.revision ? 'currentColor' : 'none'}" 
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="revision-star ${problem.revision ? 'marked' : ''}">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
          </td>
          <td>
            <div class="editorial-wrapper" ${hasEditorial ? `onclick="window.open('${problem.editorial_url}', '_blank')"` : ''}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${hasEditorial ? 'currentColor' : 'none'}" 
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="editorial-icon ${hasEditorial ? 'marked' : ''}">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            </div>
          </td>
          <td>
            <a href="${problem.leetcode_url}" target="_blank" class="problem-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" 
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              ${problem.name}
            </a>
          </td>
          <td>
            <span class="difficulty-tag ${problem.difficulty.toLowerCase()}">${problem.difficulty}</span>
          </td>
        `;
        
        tbody.appendChild(row);
      });
    }
    
    // Add click event to header
    headerElement.addEventListener('click', function() {
      toggleAccordion(accordionElement);
    });
  });
  
  // Check for any additional categories not in the ordered list
  Object.keys(groupedProblems).forEach(category => {
    if (!categoryOrder.includes(category)) {
      const categoryProblems = groupedProblems[category];
      const totalProblems = categoryProblems.length;
      const completedProblems = categoryProblems.filter(p => p.status).length;
      const percentComplete = Math.round((completedProblems / totalProblems) * 100);
      
      // Create accordion element
      const accordionElement = document.createElement('div');
      accordionElement.className = 'accordion-category';
      
      // Create header
      const headerElement = document.createElement('div');
      headerElement.className = 'accordion-header';
      headerElement.innerHTML = `
        <div class="category-title">
          <span class="category-title-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" 
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </span>
          ${category}
        </div>
        <div class="category-stats">
          <div class="category-progress">
            <div class="category-progress-bar" style="width: ${percentComplete}%"></div>
          </div>
          <span>${completedProblems}/${totalProblems} (${percentComplete}%)</span>
        </div>
      `;
      
      // Create content
      const contentElement = document.createElement('div');
      contentElement.className = 'accordion-content';
      
      // Create problem table
      const tableElement = document.createElement('table');
      tableElement.className = 'problem-table';
      
      // Add table header
      tableElement.innerHTML = `
        <thead>
          <tr>
            <th>Status</th>
            <th>Review</th>
            <th>Editorial</th>
            <th>Problem</th>
            <th>Difficulty</th>
          </tr>
        </thead>
        <tbody id="category-${category.replace(/\s+|[/&]/g, '-')}-problems"></tbody>
      `;
      
      contentElement.appendChild(tableElement);
      accordionElement.appendChild(headerElement);
      accordionElement.appendChild(contentElement);
      container.appendChild(accordionElement);
      
      // Add problems to table
      const tbody = document.getElementById(`category-${category.replace(/\s+|[/&]/g, '-')}-problems`);
      categoryProblems.forEach(problem => {
        const row = document.createElement('tr');
        row.className = 'problem-row';
        row.dataset.id = problem.id;
        
        // Check if the problem has a valid editorial URL
        const hasEditorial = hasValidEditorialUrl(problem);
        
        row.innerHTML = `
          <td>
            <div class="status-checkbox">
              <input type="checkbox" id="status-${problem.id}" 
                ${problem.status ? 'checked' : ''} 
                onchange="updateProblemStatus(${problem.id}, this.checked)">
            </div>
          </td>
          <td>
            <div class="revision-star-wrapper" onclick="toggleRevision(${problem.id}, ${!problem.revision})">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${problem.revision ? 'currentColor' : 'none'}" 
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="revision-star ${problem.revision ? 'marked' : ''}">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
          </td>
          <td>
            <div class="editorial-wrapper" ${hasEditorial ? `onclick="window.open('${problem.editorial_url}', '_blank')"` : ''}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${hasEditorial ? 'currentColor' : 'none'}" 
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="editorial-icon ${hasEditorial ? 'marked' : ''}">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            </div>
          </td>
          <td>
            <a href="${problem.leetcode_url}" target="_blank" class="problem-link">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" 
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              ${problem.name}
            </a>
          </td>
          <td>
            <span class="difficulty-tag ${problem.difficulty.toLowerCase()}">${problem.difficulty}</span>
          </td>
        `;
        
        tbody.appendChild(row);
      });
      
      // Add click event to header
      headerElement.addEventListener('click', function() {
        toggleAccordion(accordionElement);
      });
    }
  });
  
  // Update counts
  updateCounts(problems);
  
  // Expand first category by default
  const firstCategory = document.querySelector('.accordion-category');
  if (firstCategory) {
    toggleAccordion(firstCategory);
  }
  
  // Hide loading spinner
  document.getElementById('loading-spinner').style.display = 'none';
  document.getElementById('categories-container').style.display = 'block';
  
  // Initialize list view if we're in list view
    populateListView();
    toggleView('list');
  
}

// Toggle accordion open/close
function toggleAccordion(accordionElement) {
  accordionElement.classList.toggle('expanded');
}

// Toggle between views (category, list, and revision)
function toggleView(view) {
  currentView = view;
  
  const categoryContainer = document.getElementById('categories-container');
  const listContainer = document.getElementById('list-container');
  const revisionContainer = document.getElementById('revision-container');
  
  const categoryBtn = document.getElementById('category-view-btn');
  const listBtn = document.getElementById('list-view-btn');
  const revisionBtn = document.getElementById('revision-view-btn');
  
  // First, hide all containers and remove active class from all buttons
  categoryContainer.style.display = 'none';
  listContainer.style.display = 'none';
  revisionContainer.style.display = 'none';
  
  categoryBtn.classList.remove('active');
  listBtn.classList.remove('active');
  revisionBtn.classList.remove('active');
  
  // Show the selected view
  if (view === 'category') {
    categoryContainer.style.display = 'block';
    categoryBtn.classList.add('active');
  } else if (view === 'list') {
    listContainer.style.display = 'block';
    listBtn.classList.add('active');
    
    // Populate list view if not already populated
    if (document.getElementById('list-problems').children.length === 0) {
      populateListView();
    }
  } else if (view === 'revision') {
    revisionContainer.style.display = 'block';
    revisionBtn.classList.add('active');
    
    // Load the revision list
    loadRevisionList();
  }
}

// Populate the list view
function populateListView() {
  const tbody = document.getElementById('list-problems');
  tbody.innerHTML = '';
  
  // First sort by category according to categoryOrder, then by difficulty and name
  const sortedProblems = [...problemsData].sort((a, b) => {
    // First sort by category according to categoryOrder
    const categoryA = a.category;
    const categoryB = b.category;
    const indexA = categoryOrder.indexOf(categoryA);
    const indexB = categoryOrder.indexOf(categoryB);
    
    // If both categories are in the categoryOrder array
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    
    // If only one is in the array, prioritize the one in the array
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    
    // If neither is in the array, sort alphabetically
    if (categoryA !== categoryB) return categoryA.localeCompare(categoryB);
    
    // If same category, sort by difficulty
    const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
    const diffComp = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    
    if (diffComp !== 0) return diffComp;
    
    // If same difficulty, sort by name
    return a.name.localeCompare(b.name);
  });
  
  // Add rows for each problem
  sortedProblems.forEach(problem => {
    const row = document.createElement('tr');
    row.className = 'problem-row';
    row.dataset.id = problem.id;
    
    // Check if the problem has a valid editorial URL
    const hasEditorial = hasValidEditorialUrl(problem);
    
    row.innerHTML = `
      <td>
        <div class="status-checkbox">
          <input type="checkbox" id="list-status-${problem.id}" 
            ${problem.status ? 'checked' : ''} 
            onchange="updateProblemStatus(${problem.id}, this.checked)">
        </div>
      </td>
      <td>
        <div class="revision-star-wrapper" onclick="toggleRevision(${problem.id}, ${!problem.revision})">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${problem.revision ? 'currentColor' : 'none'}" 
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="revision-star ${problem.revision ? 'marked' : ''}">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </div>
      </td>
      <td>
        <div class="editorial-wrapper" ${hasEditorial ? `onclick="window.open('${problem.editorial_url}', '_blank')"` : ''}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${hasEditorial ? 'currentColor' : 'none'}" 
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="editorial-icon ${hasEditorial ? 'marked' : ''}">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
        </div>
      </td>
      <td>
        <a href="${problem.leetcode_url}" target="_blank" class="problem-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" 
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          ${problem.name}
        </a>
      </td>
      <td>${problem.category}</td>
      <td>
        <span class="difficulty-tag ${problem.difficulty.toLowerCase()}">${problem.difficulty}</span>
      </td>
    `;
    
    tbody.appendChild(row);
  });
}

// Function to load problems marked for revision
function loadRevisionList() {
  const tbody = document.getElementById('revision-problems');
  tbody.innerHTML = '';
  
  // Filter problems marked for revision
  const revisionProblems = problemsData.filter(problem => problem.revision);
  
  if (revisionProblems.length === 0) {
    // No revision problems found
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" 
                 stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <h3>No problems marked for revision</h3>
            <p>Mark problems for revision by clicking the star icon next to problems in the category or list view.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  // Sort problems the same way as in list view
  const sortedProblems = [...revisionProblems].sort((a, b) => {
    // First sort by category according to categoryOrder
    const categoryA = a.category;
    const categoryB = b.category;
    const indexA = categoryOrder.indexOf(categoryA);
    const indexB = categoryOrder.indexOf(categoryB);
    
    // If both categories are in the categoryOrder array
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    
    // If only one is in the array, prioritize the one in the array
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    
    // If neither is in the array, sort alphabetically
    if (categoryA !== categoryB) return categoryA.localeCompare(categoryB);
    
    // If same category, sort by difficulty
    const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
    const diffComp = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    
    if (diffComp !== 0) return diffComp;
    
    // If same difficulty, sort by name
    return a.name.localeCompare(b.name);
  });
  
  // Add rows for each problem
  sortedProblems.forEach(problem => {
    const row = document.createElement('tr');
    row.className = 'problem-row';
    row.dataset.id = problem.id;
    
    // Check if the problem has a valid editorial URL
    const hasEditorial = hasValidEditorialUrl(problem);
    
    row.innerHTML = `
      <td>
        <div class="status-checkbox">
          <input type="checkbox" id="revision-status-${problem.id}" 
            ${problem.status ? 'checked' : ''} 
            onchange="updateProblemStatus(${problem.id}, this.checked)">
        </div>
      </td>
      <td>
        <div class="revision-star-wrapper" onclick="removeFromRevision(${problem.id})">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" 
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="revision-star marked">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </div>
      </td>
      <td>
        <div class="editorial-wrapper" ${hasEditorial ? `onclick="window.open('${problem.editorial_url}', '_blank')"` : ''}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${hasEditorial ? 'currentColor' : 'none'}" 
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="editorial-icon ${hasEditorial ? 'marked' : ''}">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
        </div>
      </td>
      <td>
        <a href="${problem.leetcode_url}" target="_blank" class="problem-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" 
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          ${problem.name}
        </a>
      </td>
      <td>${problem.category}</td>
      <td>
        <span class="difficulty-tag ${problem.difficulty.toLowerCase()}">${problem.difficulty}</span>
      </td>
    `;
    
    tbody.appendChild(row);
  });
}

// Function to remove a problem from revision list
function removeFromRevision(problemId) {
  // Update problem revision status
  toggleRevision(problemId, false);
  
  // Reload revision list
  loadRevisionList();
}

// Update problem status
function updateProblemStatus(problemId, status) {
  console.log('Updating problem status', problemId, status);
  
  // Find the problem in the local data
  const problemIndex = problemsData.findIndex(p => p.id == problemId);
  if (problemIndex === -1) {
    console.error('Problem not found in local data:', problemId);
    return;
  }
  
  // Update local data
  problemsData[problemIndex].status = status;
  
  // Save to localStorage immediately
  saveToLocalStorage(problemsData);
  
  // Update UI in all views
  updateProblemStatusUi(problemId, status);
  
  // Update global counts
  updateCounts(problemsData);
  
  // Update Firebase if user is logged in
  if (currentUser) {
    db.collection('users').doc(currentUser.uid).collection('problems').doc(problemId.toString())
      .update({
        status: status
      })
      .then(() => {
        console.log('Problem status updated in Firebase');
      })
      .catch(error => {
        console.error("Error updating problem status in Firebase:", error);
      });
  }
}

// Update problem status UI in all views
function updateProblemStatusUi(problemId, status) {
  // Update checkbox in category view
  const categoryCheckbox = document.getElementById(`status-${problemId}`);
  if (categoryCheckbox) {
    categoryCheckbox.checked = status;
  }
  
  // Update checkbox in list view
  const listCheckbox = document.getElementById(`list-status-${problemId}`);
  if (listCheckbox) {
    listCheckbox.checked = status;
  }
  
  // Update checkbox in revision view
  const revisionCheckbox = document.getElementById(`revision-status-${problemId}`);
  if (revisionCheckbox) {
    revisionCheckbox.checked = status;
  }
  
  // Update category stats if in category view
  if (currentView === 'category') {
    const categoryRow = document.querySelector(`.problem-row[data-id="${problemId}"]`);
    if (categoryRow) {
      // Find the category of this problem
      const category = categoryRow.closest('.accordion-category');
      if (category) {
        const categoryName = category.querySelector('.category-title').textContent.trim();
        
        // Get all problems in this category
        const categoryProblems = problemsData.filter(p => p.category === categoryName);
        
        // Update category stats
        const totalProblems = categoryProblems.length;
        const completedProblems = categoryProblems.filter(p => p.status).length;
        const percentComplete = Math.round((completedProblems / totalProblems) * 100);
        
        const progressBar = category.querySelector('.category-progress-bar');
        if (progressBar) {
          progressBar.style.width = `${percentComplete}%`;
        }
        
        const statsText = category.querySelector('.category-stats span');
        if (statsText) {
          statsText.textContent = `${completedProblems}/${totalProblems} (${percentComplete}%)`;
        }
      }
    }
  }
}

// Toggle revision state
function toggleRevision(problemId, revision) {
  console.log('Toggling revision', problemId, revision);
  
  // Find the problem in the local data
  const problemIndex = problemsData.findIndex(p => p.id == problemId);
  if (problemIndex === -1) {
    console.error('Problem not found in local data:', problemId);
    return;
  }
  
  // Update local data
  problemsData[problemIndex].revision = revision;
  
  // Save to localStorage immediately
  saveToLocalStorage(problemsData);
  
  // Update UI in both views
  updateRevisionUi(problemId, revision);
  
  // Update revision count
  const revisionCount = problemsData.filter(p => p.revision).length;
  document.getElementById('revision-count').textContent = revisionCount;
  
  // Update Firebase if user is logged in
  if (currentUser) {
    db.collection('users').doc(currentUser.uid).collection('problems').doc(problemId.toString())
      .update({
        revision: revision
      })
      .then(() => {
        console.log('Problem revision status updated in Firebase');
      })
      .catch(error => {
        console.error("Error updating revision status in Firebase:", error);
      });
  }
}

// Update revision UI in all views
function updateRevisionUi(problemId, revision) {
  // Update in category view
  const categoryRow = document.querySelector(`#categories-container .problem-row[data-id="${problemId}"]`);
  if (categoryRow) {
    const starSvg = categoryRow.querySelector('.revision-star');
    if (starSvg) {
      if (revision) {
        starSvg.setAttribute('fill', 'currentColor');
        starSvg.classList.add('marked');
      } else {
        starSvg.setAttribute('fill', 'none');
        starSvg.classList.remove('marked');
      }
    }
  }
  
  // Update in list view
  const listRow = document.querySelector(`#list-container .problem-row[data-id="${problemId}"]`);
  if (listRow) {
    const starSvg = listRow.querySelector('.revision-star');
    if (starSvg) {
      if (revision) {
        starSvg.setAttribute('fill', 'currentColor');
        starSvg.classList.add('marked');
      } else {
        starSvg.setAttribute('fill', 'none');
        starSvg.classList.remove('marked');
      }
    }
  }
  
  // If we're in revision view and removing an item, the row will be removed by loadRevisionList()
}

// Update counts and progress
function updateCounts(problems) {
  const totalEasy = problems.filter(p => p.difficulty === 'Easy').length;
  const totalMedium = problems.filter(p => p.difficulty === 'Medium').length;
  const totalHard = problems.filter(p => p.difficulty === 'Hard').length;
  
  const completedEasy = problems.filter(p => p.difficulty === 'Easy' && p.status).length;
  const completedMedium = problems.filter(p => p.difficulty === 'Medium' && p.status).length;
  const completedHard = problems.filter(p => p.difficulty === 'Hard' && p.status).length;
  
  // Update status counts
  document.getElementById('easy-count').textContent = `Easy: ${completedEasy}/${totalEasy}`;
  document.getElementById('medium-count').textContent = `Medium: ${completedMedium}/${totalMedium}`;
  document.getElementById('hard-count').textContent = `Hard: ${completedHard}/${totalHard}`;
  
  // Update overall progress
  const totalProblems = problems.length;
  const completedProblems = problems.filter(p => p.status).length;
  const progressPercentage = totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0;
  
  document.getElementById('overall-progress-text').textContent = `${progressPercentage}% Completed`;
  
  // Update the circular progress bar
  const circle = document.getElementById('overall-progress');
  const radius = circle.r.baseVal.value;
  const circumference = radius * 2 * Math.PI;
  
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = `${circumference - (progressPercentage / 100) * circumference}`;
  
  // Update revision count
  const revisionCount = problems.filter(p => p.revision).length;
  document.getElementById('revision-count').textContent = revisionCount;
}

// Get default problems 
function getDefaultProblems() {
  // Return an expanded default set of problems with the specified categories
  return [
 {
   "id": 1,
   "LeetCode_ID": 121,
   "Name": "Best Time to Buy and Sell Stock",
   "Category": "Greedy",
   "Difficulty": "Easy",
   "Problem Name": "Best Time to Buy and Sell Stock",
   "Leetcode URL": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/"
 },
 {
   "id": 2,
   "LeetCode_ID": 448,
   "Name": "Find All Numbers Disappeared in an Array",
   "Category": "Cyclic Sort",
   "Difficulty": "Easy",
   "Problem Name": "Find All Numbers Disappeared in an Array",
   "Leetcode URL": "https://leetcode.com/problems/find-all-numbers-disappeared-in-an-array/"
 },
 {
   "id": 3,
   "LeetCode_ID": 1431,
   "Name": "Kids With the Greatest Number of Candies",
   "Category": "Arrays",
   "Difficulty": "Easy",
   "Problem Name": "Kids With the Greatest Number of Candies",
   "Leetcode URL": "https://leetcode.com/problems/kids-with-the-greatest-number-of-candies/"
 },
 {
   "id": 4,
   "LeetCode_ID": 169,
   "Name": "Majority Element",
   "Category": "Arrays",
   "Difficulty": "Easy",
   "Problem Name": "Majority Element",
   "Leetcode URL": "https://leetcode.com/problems/majority-element/"
 },
 {
   "id": 5,
   "LeetCode_ID": 485,
   "Name": "Max Consecutive Ones",
   "Category": "Arrays",
   "Difficulty": "Easy",
   "Problem Name": "Max Consecutive Ones",
   "Leetcode URL": "https://leetcode.com/problems/max-consecutive-ones/"
 },
 {
   "id": 6,
   "LeetCode_ID": 66,
   "Name": "Plus One",
   "Category": "Arrays",
   "Difficulty": "Easy",
   "Problem Name": "Plus One",
   "Leetcode URL": "https://leetcode.com/problems/plus-one/"
 },
 {
   "id": 7,
   "LeetCode_ID": 27,
   "Name": "Remove Element",
   "Category": "Arrays",
   "Difficulty": "Easy",
   "Problem Name": "Remove Element",
   "Leetcode URL": "https://leetcode.com/problems/remove-element/"
 },
 {
   "id": 8,
   "LeetCode_ID": 48,
   "Name": "Rotate Image",
   "Category": "Matrix Traversal",
   "Difficulty": "Medium",
   "Problem Name": "Rotate Image",
   "Leetcode URL": "https://leetcode.com/problems/rotate-image/"
 },
 {
   "id": 9,
   "LeetCode_ID": 1480,
   "Name": "Running Sum of 1d Array",
   "Category": "Prefix Sum",
   "Difficulty": "Easy",
   "Problem Name": "Running Sum of 1d Array",
   "Leetcode URL": "https://leetcode.com/problems/running-sum-of-1d-array/"
 },
 {
   "id": 10,
   "LeetCode_ID": 73,
   "Name": "Set Matrix Zeroes",
   "Category": "Matrix Traversal",
   "Difficulty": "Medium",
   "Problem Name": "Set Matrix Zeroes",
   "Leetcode URL": "https://leetcode.com/problems/set-matrix-zeroes/"
 },
 {
   "id": 11,
   "LeetCode_ID": 1470,
   "Name": "Shuffle the Array",
   "Category": "Arrays",
   "Difficulty": "Easy",
   "Problem Name": "Shuffle the Array",
   "Leetcode URL": "https://leetcode.com/problems/shuffle-the-array/"
 },
 {
   "id": 12,
   "LeetCode_ID": 54,
   "Name": "Spiral Matrix",
   "Category": "Matrix Traversal",
   "Difficulty": "Medium",
   "Problem Name": "Spiral Matrix",
   "Leetcode URL": "https://leetcode.com/problems/spiral-matrix/"
 },
 {
   "id": 13,
   "LeetCode_ID": 977,
   "Name": "Squares of a Sorted Array",
   "Category": "Two Pointers",
   "Difficulty": "Easy",
   "Problem Name": "Squares of a Sorted Array",
   "Leetcode URL": "https://leetcode.com/problems/squares-of-a-sorted-array/"
 },
 {
   "id": 14,
   "LeetCode_ID": 36,
   "Name": "Valid Sudoku",
   "Category": "HashMap/HashSet",
   "Difficulty": "Medium",
   "Problem Name": "Valid Sudoku",
   "Leetcode URL": "https://leetcode.com/problems/valid-sudoku/"
 },
 {
   "id": 15,
   "LeetCode_ID": 867,
   "Name": "Transpose Matrix",
   "Category": "Matrix Traversal",
   "Difficulty": "Easy",
   "Problem Name": "Transpose Matrix",
   "Leetcode URL": "https://leetcode.com/problems/transpose-matrix/"
 },
 {
   "id": 16,
   "LeetCode_ID": 238,
   "Name": "Product of Array Except Self",
   "Category": "Arrays",
   "Difficulty": "Medium",
   "Problem Name": "Product of Array Except Self",
   "Leetcode URL": "https://leetcode.com/problems/product-of-array-except-self/"
 },
 {
   "id": 17,
   "LeetCode_ID": 304,
   "Name": "Range Sum Query 2D - Immutable",
   "Category": "Prefix Sum",
   "Difficulty": "Medium",
   "Problem Name": "Range Sum Query 2D - Immutable",
   "Leetcode URL": "https://leetcode.com/problems/range-sum-query-2d-immutable/"
 },
 {
   "id": 18,
   "LeetCode_ID": 724,
   "Name": "Find Pivot Index",
   "Category": "Prefix Sum",
   "Difficulty": "Easy",
   "Problem Name": "Find Pivot Index",
   "Leetcode URL": "https://leetcode.com/problems/find-pivot-index/"
 },
 {
   "id": 19,
   "LeetCode_ID": 1423,
   "Name": "Maximum Points You Can Obtain from Cards",
   "Category": "Sliding Window",
   "Difficulty": "Medium",
   "Problem Name": "Maximum Points You Can Obtain from Cards",
   "Leetcode URL": "https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/"
 },
 {
   "id": 20,
   "LeetCode_ID": 1732,
   "Name": "Find the Highest Altitude",
   "Category": "Prefix Sum",
   "Difficulty": "Easy",
   "Problem Name": "Find the Highest Altitude",
   "Leetcode URL": "https://leetcode.com/problems/find-the-highest-altitude/"
 },
 {
   "id": 21,
   "LeetCode_ID": 1685,
   "Name": "Sum of Absolute Differences in a Sorted Array",
   "Category": "Prefix Sum",
   "Difficulty": "Medium",
   "Problem Name": "Sum of Absolute Differences in a Sorted Array",
   "Leetcode URL": "https://leetcode.com/problems/sum-of-absolute-differences-in-a-sorted-array/"
 },
 {
   "id": 22,
   "LeetCode_ID": 303,
   "Name": "Range Sum Query - Immutable",
   "Category": "Prefix Sum",
   "Difficulty": "Easy",
   "Problem Name": "Range Sum Query - Immutable",
   "Leetcode URL": "https://leetcode.com/problems/range-sum-query-immutable/"
 },
 {
   "id": 23,
   "LeetCode_ID": 370,
   "Name": "Range Addition",
   "Category": "Prefix Sum",
   "Difficulty": "Medium",
   "Problem Name": "Range Addition",
   "Leetcode URL": "https://leetcode.com/problems/range-addition/"
 },
 {
   "id": 24,
   "LeetCode_ID": 528,
   "Name": "Random Pick with Weight",
   "Category": "Binary Search",
   "Difficulty": "Medium",
   "Problem Name": "Random Pick with Weight",
   "Leetcode URL": "https://leetcode.com/problems/random-pick-with-weight/"
 },
 {
   "id": 25,
   "LeetCode_ID": 1314,
   "Name": "Matrix Block Sum",
   "Category": "Prefix Sum",
   "Difficulty": "Medium",
   "Problem Name": "Matrix Block Sum",
   "Leetcode URL": "https://leetcode.com/problems/matrix-block-sum/"
 },
 {
   "id": 26,
   "LeetCode_ID": 1588,
   "Name": "Sum of All Odd Length Subarrays",
   "Category": "Prefix Sum",
   "Difficulty": "Easy",
   "Problem Name": "Sum of All Odd Length Subarrays",
   "Leetcode URL": "https://leetcode.com/problems/sum-of-all-odd-length-subarrays/"
 },
 {
   "id": 27,
   "LeetCode_ID": 2017,
   "Name": "Grid Game",
   "Category": "Prefix Sum",
   "Difficulty": "Medium",
   "Problem Name": "Grid Game",
   "Leetcode URL": "https://leetcode.com/problems/grid-game/"
 },
 {
   "id": 28,
   "LeetCode_ID": 1352,
   "Name": "Product of the Last K Numbers",
   "Category": "Arrays",
   "Difficulty": "Medium",
   "Problem Name": "Product of the Last K Numbers",
   "Leetcode URL": "https://leetcode.com/problems/product-of-the-last-k-numbers/"
 },
 {
   "id": 29,
   "LeetCode_ID": 2270,
   "Name": "Number of Ways to Split Array",
   "Category": "Prefix Sum",
   "Difficulty": "Easy",
   "Problem Name": "Number of Ways to Split Array",
   "Leetcode URL": "https://leetcode.com/problems/number-of-ways-to-split-array/"
 },
 {
   "id": 30,
   "LeetCode_ID": 1177,
   "Name": "Can Make Palindrome from Substring",
   "Category": "Bit Manipulation",
   "Difficulty": "Medium",
   "Problem Name": "Can Make Palindrome from Substring",
   "Leetcode URL": "https://leetcode.com/problems/can-make-palindrome-from-substring/"
 },
 {
   "id": 31,
   "LeetCode_ID": 1,
   "Name": "Two Sum",
   "Category": "HashMap/HashSet",
   "Difficulty": "Easy",
   "Problem Name": "Two Sum",
   "Leetcode URL": "https://leetcode.com/problems/two-sum/"
 },
 {
   "id": 32,
   "LeetCode_ID": 242,
   "Name": "Valid Anagram",
   "Category": "HashMap/HashSet",
   "Difficulty": "Easy",
   "Problem Name": "Valid Anagram",
   "Leetcode URL": "https://leetcode.com/problems/valid-anagram/"
 },
 {
   "id": 33,
   "LeetCode_ID": 217,
   "Name": "Contains Duplicate",
   "Category": "HashMap/HashSet",
   "Difficulty": "Easy",
   "Problem Name": "Contains Duplicate",
   "Leetcode URL": "https://leetcode.com/problems/contains-duplicate/"
 },
 {
   "id": 34,
   "LeetCode_ID": 49,
   "Name": "Group Anagrams",
   "Category": "HashMap/HashSet",
   "Difficulty": "Medium",
   "Problem Name": "Group Anagrams",
   "Leetcode URL": "https://leetcode.com/problems/group-anagrams/"
 },
 {
   "id": 35,
   "LeetCode_ID": 347,
   "Name": "Top K Frequent Elements",
   "Category": "Heap/Priority Queue",
   "Difficulty": "Medium",
   "Problem Name": "Top K Frequent Elements",
   "Leetcode URL": "https://leetcode.com/problems/top-k-frequent-elements/"
 },
 {
   "id": 36,
   "LeetCode_ID": 560,
   "Name": "Subarray Sum Equals K",
   "Category": "HashMap/HashSet",
   "Difficulty": "Medium",
   "Problem Name": "Subarray Sum Equals K",
   "Leetcode URL": "https://leetcode.com/problems/subarray-sum-equals-k/"
 },
 {
   "id": 37,
   "LeetCode_ID": 205,
   "Name": "Isomorphic Strings",
   "Category": "HashMap/HashSet",
   "Difficulty": "Easy",
   "Problem Name": "Isomorphic Strings",
   "Leetcode URL": "https://leetcode.com/problems/isomorphic-strings/"
 },
 {
   "id": 38,
   "LeetCode_ID": 380,
   "Name": "Insert Delete GetRandom O(1)",
   "Category": "HashMap/HashSet",
   "Difficulty": "Medium",
   "Problem Name": "Insert Delete GetRandom O(1)",
   "Leetcode URL": "https://leetcode.com/problems/insert-delete-getrandom-o1/"
 },
 {
   "id": 39,
   "LeetCode_ID": 438,
   "Name": "Find All Anagrams in a String",
   "Category": "Sliding Window",
   "Difficulty": "Medium",
   "Problem Name": "Find All Anagrams in a String",
   "Leetcode URL": "https://leetcode.com/problems/find-all-anagrams-in-a-string/"
 },
 {
   "id": 40,
   "LeetCode_ID": 350,
   "Name": "Intersection of Two Arrays II",
   "Category": "HashMap/HashSet",
   "Difficulty": "Easy",
   "Problem Name": "Intersection of Two Arrays II",
   "Leetcode URL": "https://leetcode.com/problems/intersection-of-two-arrays-ii/"
 },
 {
   "id": 41,
   "LeetCode_ID": 387,
   "Name": "First Unique Character in a String",
   "Category": "HashMap/HashSet",
   "Difficulty": "Easy",
   "Problem Name": "First Unique Character in a String",
   "Leetcode URL": "https://leetcode.com/problems/first-unique-character-in-a-string/"
 },
 {
   "id": 42,
   "LeetCode_ID": 219,
   "Name": "Contains Duplicate II",
   "Category": "HashMap/HashSet",
   "Difficulty": "Easy",
   "Problem Name": "Contains Duplicate II",
   "Leetcode URL": "https://leetcode.com/problems/contains-duplicate-ii/"
 },
 {
   "id": 43,
   "LeetCode_ID": 290,
   "Name": "Word Pattern",
   "Category": "HashMap/HashSet",
   "Difficulty": "Easy",
   "Problem Name": "Word Pattern",
   "Leetcode URL": "https://leetcode.com/problems/word-pattern/"
 },
 {
   "id": 44,
   "LeetCode_ID": 454,
   "Name": "4Sum II",
   "Category": "HashMap/HashSet",
   "Difficulty": "Medium",
   "Problem Name": "4Sum II",
   "Leetcode URL": "https://leetcode.com/problems/4sum-ii/"
 },
 {
   "id": 45,
   "LeetCode_ID": 525,
   "Name": "Contiguous Array",
   "Category": "HashMap/HashSet",
   "Difficulty": "Medium",
   "Problem Name": "Contiguous Array",
   "Leetcode URL": "https://leetcode.com/problems/contiguous-array/"
 },
 {
   "id": 46,
   "LeetCode_ID": 1010,
   "Name": "Pairs of Songs With Total Durations Divisible by 60",
   "Category": "HashMap/HashSet",
   "Difficulty": "Medium",
   "Problem Name": "Pairs of Songs With Total Durations Divisible by 60",
   "Leetcode URL": "https://leetcode.com/problems/pairs-of-songs-with-total-durations-divisible-by-60/"
 },
 {
   "id": 47,
   "LeetCode_ID": 705,
   "Name": "Design HashSet",
   "Category": "Design",
   "Difficulty": "Easy",
   "Problem Name": "Design HashSet",
   "Leetcode URL": "https://leetcode.com/problems/design-hashset/"
 },
 {
   "id": 48,
   "LeetCode_ID": 299,
   "Name": "Bulls and Cows",
   "Category": "Arrays",
   "Difficulty": "Medium",
   "Problem Name": "Bulls and Cows",
   "Leetcode URL": "https://leetcode.com/problems/bulls-and-cows/"
 },
 {
   "id": 49,
   "LeetCode_ID": 359,
   "Name": "Logger Rate Limiter",
   "Category": "HashMap/HashSet",
   "Difficulty": "Easy",
   "Problem Name": "Logger Rate Limiter",
   "Leetcode URL": "https://leetcode.com/problems/logger-rate-limiter/"
 },
 {
   "id": 50,
   "LeetCode_ID": 26,
   "Name": "Remove Duplicates from Sorted Array",
   "Category": "Two Pointers",
   "Difficulty": "Easy",
   "Problem Name": "Remove Duplicates from Sorted Array",
   "Leetcode URL": "https://leetcode.com/problems/remove-duplicates-from-sorted-array/"
 },
 {
   "id": 51,
   "LeetCode_ID": 283,
   "Name": "Move Zeroes",
   "Category": "Two Pointers",
   "Difficulty": "Easy",
   "Problem Name": "Move Zeroes",
   "Leetcode URL": "https://leetcode.com/problems/move-zeroes/"
 },
 {
   "id": 52,
   "LeetCode_ID": 125,
   "Name": "Valid Palindrome",
   "Category": "Two Pointers",
   "Difficulty": "Easy",
   "Problem Name": "Valid Palindrome",
   "Leetcode URL": "https://leetcode.com/problems/valid-palindrome/"
 },
 {
   "id": 53,
   "LeetCode_ID": 15,
   "Name": "3Sum",
   "Category": "Two Pointers",
   "Difficulty": "Medium",
   "Problem Name": "3Sum",
   "Leetcode URL": "https://leetcode.com/problems/3sum/"
 },
 {
   "id": 54,
   "LeetCode_ID": 11,
   "Name": "Container With Most Water",
   "Category": "Two Pointers",
   "Difficulty": "Medium",
   "Problem Name": "Container With Most Water",
   "Leetcode URL": "https://leetcode.com/problems/container-with-most-water/"
 },
 {
   "id": 55,
   "LeetCode_ID": 42,
   "Name": "Trapping Rain Water",
   "Category": "Two Pointers",
   "Difficulty": "Hard",
   "Problem Name": "Trapping Rain Water",
   "Leetcode URL": "https://leetcode.com/problems/trapping-rain-water/"
 },
 {
   "id": 56,
   "LeetCode_ID": 75,
   "Name": "Sort Colors",
   "Category": "Two Pointers",
   "Difficulty": "Medium",
   "Problem Name": "Sort Colors",
   "Leetcode URL": "https://leetcode.com/problems/sort-colors/"
 },
 {
   "id": 57,
   "LeetCode_ID": 167,
   "Name": "Two Sum II - Input Array Is Sorted",
   "Category": "Two Pointers",
   "Difficulty": "Medium",
   "Problem Name": "Two Sum II - Input Array Is Sorted",
   "Leetcode URL": "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/"
 },
 {
   "id": 58,
   "LeetCode_ID": 88,
   "Name": "Merge Sorted Array",
   "Category": "Two Pointers",
   "Difficulty": "Easy",
   "Problem Name": "Merge Sorted Array",
   "Leetcode URL": "https://leetcode.com/problems/merge-sorted-array/"
 },
 {
   "id": 59,
   "LeetCode_ID": 344,
   "Name": "Reverse String",
   "Category": "Two Pointers",
   "Difficulty": "Easy",
   "Problem Name": "Reverse String",
   "Leetcode URL": "https://leetcode.com/problems/reverse-string/"
 },
 {
   "id": 60,
   "LeetCode_ID": 18,
   "Name": "4Sum",
   "Category": "Two Pointers",
   "Difficulty": "Medium",
   "Problem Name": "4Sum",
   "Leetcode URL": "https://leetcode.com/problems/4sum/"
 },
 {
   "id": 61,
   "LeetCode_ID": 16,
   "Name": "3Sum Closest",
   "Category": "Two Pointers",
   "Difficulty": "Medium",
   "Problem Name": "3Sum Closest",
   "Leetcode URL": "https://leetcode.com/problems/3sum-closest/"
 },
 {
   "id": 62,
   "LeetCode_ID": 680,
   "Name": "Valid Palindrome II",
   "Category": "Two Pointers",
   "Difficulty": "Easy",
   "Problem Name": "Valid Palindrome II",
   "Leetcode URL": "https://leetcode.com/problems/valid-palindrome-ii/"
 },
 {
   "id": 63,
   "LeetCode_ID": 581,
   "Name": "Shortest Unsorted Continuous Subarray",
   "Category": "Monotonic Stack",
   "Difficulty": "Medium",
   "Problem Name": "Shortest Unsorted Continuous Subarray",
   "Leetcode URL": "https://leetcode.com/problems/shortest-unsorted-continuous-subarray/"
 },
 {
   "id": 64,
   "LeetCode_ID": 3,
   "Name": "Longest Substring Without Repeating Characters",
   "Category": "Sliding Window",
   "Difficulty": "Medium",
   "Problem Name": "Longest Substring Without Repeating Characters",
   "Leetcode URL": "https://leetcode.com/problems/longest-substring-without-repeating-characters/"
 },
 {
   "id": 65,
   "LeetCode_ID": 209,
   "Name": "Minimum Size Subarray Sum",
   "Category": "Sliding Window",
   "Difficulty": "Medium",
   "Problem Name": "Minimum Size Subarray Sum",
   "Leetcode URL": "https://leetcode.com/problems/minimum-size-subarray-sum/"
 },
 {
   "id": 66,
   "LeetCode_ID": 567,
   "Name": "Permutation in String",
   "Category": "Sliding Window",
   "Difficulty": "Medium",
   "Problem Name": "Permutation in String",
   "Leetcode URL": "https://leetcode.com/problems/permutation-in-string/"
 },
 {
   "id": 67,
   "LeetCode_ID": 239,
   "Name": "Sliding Window Maximum",
   "Category": "Monotonic Stack/Queue",
   "Difficulty": "Hard",
   "Problem Name": "Sliding Window Maximum",
   "Leetcode URL": "https://leetcode.com/problems/sliding-window-maximum/"
 },
 {
   "id": 68,
   "LeetCode_ID": 76,
   "Name": "Minimum Window Substring",
   "Category": "Sliding Window",
   "Difficulty": "Hard",
   "Problem Name": "Minimum Window Substring",
   "Leetcode URL": "https://leetcode.com/problems/minimum-window-substring/"
 },
 {
   "id": 69,
   "LeetCode_ID": 1004,
   "Name": "Max Consecutive Ones III",
   "Category": "Sliding Window",
   "Difficulty": "Medium",
   "Problem Name": "Max Consecutive Ones III",
   "Leetcode URL": "https://leetcode.com/problems/max-consecutive-ones-iii/"
 },
 {
   "id": 70,
   "LeetCode_ID": 424,
   "Name": "Longest Repeating Character Replacement",
   "Category": "Sliding Window",
   "Difficulty": "Medium",
   "Problem Name": "Longest Repeating Character Replacement",
   "Leetcode URL": "https://leetcode.com/problems/longest-repeating-character-replacement/"
 },
 {
   "id": 71,
   "LeetCode_ID": 340,
   "Name": "Longest Substring with At Most K Distinct Characters",
   "Category": "Sliding Window",
   "Difficulty": "Medium",
   "Problem Name": "Longest Substring with At Most K Distinct Characters",
   "Leetcode URL": "https://leetcode.com/problems/longest-substring-with-at-most-k-distinct-characters/"
 },
 {
   "id": 72,
   "LeetCode_ID": 1438,
   "Name": "Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit",
   "Category": "Monotonic Stack/Queue",
   "Difficulty": "Medium",
   "Problem Name": "Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit",
   "Leetcode URL": "https://leetcode.com/problems/longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit/"
 },
 {
   "id": 73,
   "LeetCode_ID": 992,
   "Name": "Subarrays with K Different Integers",
   "Category": "Sliding Window",
   "Difficulty": "Hard",
   "Problem Name": "Subarrays with K Different Integers",
   "Leetcode URL": "https://leetcode.com/problems/subarrays-with-k-different-integers/"
 },
 {
   "id": 74,
   "LeetCode_ID": 1658,
   "Name": "Minimum Operations to Reduce X to Zero",
   "Category": "Sliding Window",
   "Difficulty": "Medium",
   "Problem Name": "Minimum Operations to Reduce X to Zero",
   "Leetcode URL": "https://leetcode.com/problems/minimum-operations-to-reduce-x-to-zero/"
 },
 {
   "id": 75,
   "LeetCode_ID": 1456,
   "Name": "Maximum Number of Vowels in a Substring of Given Length",
   "Category": "Sliding Window",
   "Difficulty": "Medium",
   "Problem Name": "Maximum Number of Vowels in a Substring of Given Length",
   "Leetcode URL": "https://leetcode.com/problems/maximum-number-of-vowels-in-a-substring-of-given-length/"
 },
 {
   "id": 76,
   "LeetCode_ID": 1695,
   "Name": "Maximum Erasure Value",
   "Category": "Sliding Window",
   "Difficulty": "Medium",
   "Problem Name": "Maximum Erasure Value",
   "Leetcode URL": "https://leetcode.com/problems/maximum-erasure-value/"
 },
 {
   "id": 77,
   "LeetCode_ID": 159,
   "Name": "Longest Substring with At Most Two Distinct Characters",
   "Category": "Sliding Window",
   "Difficulty": "Medium",
   "Problem Name": "Longest Substring with At Most Two Distinct Characters",
   "Leetcode URL": "https://leetcode.com/problems/longest-substring-with-at-most-two-distinct-characters/"
 },
 {
   "id": 78,
   "LeetCode_ID": 1248,
   "Name": "Count Number of Nice Subarrays",
   "Category": "Sliding Window",
   "Difficulty": "Medium",
   "Problem Name": "Count Number of Nice Subarrays",
   "Leetcode URL": "https://leetcode.com/problems/count-number-of-nice-subarrays/"
 },
 {
   "id": 79,
   "LeetCode_ID": 704,
   "Name": "Binary Search",
   "Category": "Binary Search",
   "Difficulty": "Easy",
   "Problem Name": "Binary Search",
   "Leetcode URL": "https://leetcode.com/problems/binary-search/"
 },
 {
   "id": 80,
   "LeetCode_ID": 35,
   "Name": "Search Insert Position",
   "Category": "Binary Search",
   "Difficulty": "Easy",
   "Problem Name": "Search Insert Position",
   "Leetcode URL": "https://leetcode.com/problems/search-insert-position/"
 },
 {
   "id": 81,
   "LeetCode_ID": 278,
   "Name": "First Bad Version",
   "Category": "Binary Search",
   "Difficulty": "Easy",
   "Problem Name": "First Bad Version",
   "Leetcode URL": "https://leetcode.com/problems/first-bad-version/"
 },
 {
   "id": 82,
   "LeetCode_ID": 69,
   "Name": "Sqrt(x)",
   "Category": "Binary Search",
   "Difficulty": "Easy",
   "Problem Name": "Sqrt(x)",
   "Leetcode URL": "https://leetcode.com/problems/sqrtx/"
 },
 {
   "id": 83,
   "LeetCode_ID": 33,
   "Name": "Search in Rotated Sorted Array",
   "Category": "Binary Search",
   "Difficulty": "Medium",
   "Problem Name": "Search in Rotated Sorted Array",
   "Leetcode URL": "https://leetcode.com/problems/search-in-rotated-sorted-array/"
 },
 {
   "id": 84,
   "LeetCode_ID": 34,
   "Name": "Find First and Last Position of Element in Sorted Array",
   "Category": "Binary Search",
   "Difficulty": "Medium",
   "Problem Name": "Find First and Last Position of Element in Sorted Array",
   "Leetcode URL": "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/"
 },
 {
   "id": 85,
   "LeetCode_ID": 74,
   "Name": "Search a 2D Matrix",
   "Category": "Binary Search",
   "Difficulty": "Medium",
   "Problem Name": "Search a 2D Matrix",
   "Leetcode URL": "https://leetcode.com/problems/search-a-2d-matrix/"
 },
 {
   "id": 86,
   "LeetCode_ID": 153,
   "Name": "Find Minimum in Rotated Sorted Array",
   "Category": "Binary Search",
   "Difficulty": "Medium",
   "Problem Name": "Find Minimum in Rotated Sorted Array",
   "Leetcode URL": "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/"
 },
 {
   "id": 87,
   "LeetCode_ID": 4,
   "Name": "Median of Two Sorted Arrays",
   "Category": "Binary Search",
   "Difficulty": "Hard",
   "Problem Name": "Median of Two Sorted Arrays",
   "Leetcode URL": "https://leetcode.com/problems/median-of-two-sorted-arrays/"
 },
 {
   "id": 88,
   "LeetCode_ID": 875,
   "Name": "Koko Eating Bananas",
   "Category": "Binary Search",
   "Difficulty": "Medium",
   "Problem Name": "Koko Eating Bananas",
   "Leetcode URL": "https://leetcode.com/problems/koko-eating-bananas/"
 },
 {
   "id": 89,
   "LeetCode_ID": 1011,
   "Name": "Capacity To Ship Packages Within D Days",
   "Category": "Binary Search",
   "Difficulty": "Medium",
   "Problem Name": "Capacity To Ship Packages Within D Days",
   "Leetcode URL": "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/"
 },
 {
   "id": 90,
   "LeetCode_ID": 378,
   "Name": "Kth Smallest Element in a Sorted Matrix",
   "Category": "Binary Search",
   "Difficulty": "Medium",
   "Problem Name": "Kth Smallest Element in a Sorted Matrix",
   "Leetcode URL": "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/"
 },
 {
   "id": 91,
   "LeetCode_ID": 162,
   "Name": "Find Peak Element",
   "Category": "Binary Search",
   "Difficulty": "Medium",
   "Problem Name": "Find Peak Element",
   "Leetcode URL": "https://leetcode.com/problems/find-peak-element/"
 },
 {
   "id": 92,
   "LeetCode_ID": 240,
   "Name": "Search a 2D Matrix II",
   "Category": "Matrix Traversal",
   "Difficulty": "Medium",
   "Problem Name": "Search a 2D Matrix II",
   "Leetcode URL": "https://leetcode.com/problems/search-a-2d-matrix-ii/"
 },
 {
   "id": 93,
   "LeetCode_ID": 540,
   "Name": "Single Element in a Sorted Array",
   "Category": "Binary Search",
   "Difficulty": "Medium",
   "Problem Name": "Single Element in a Sorted Array",
   "Leetcode URL": "https://leetcode.com/problems/single-element-in-a-sorted-array/"
 },
 {
   "id": 94,
   "LeetCode_ID": 81,
   "Name": "Search in Rotated Sorted Array II",
   "Category": "Binary Search",
   "Difficulty": "Medium",
   "Problem Name": "Search in Rotated Sorted Array II",
   "Leetcode URL": "https://leetcode.com/problems/search-in-rotated-sorted-array-ii/"
 },
 {
   "id": 95,
   "LeetCode_ID": 268,
   "Name": "Missing Number",
   "Category": "Cyclic Sort",
   "Difficulty": "Easy",
   "Problem Name": "Missing Number",
   "Leetcode URL": "https://leetcode.com/problems/missing-number/"
 },
 {
   "id": 96,
   "LeetCode_ID": 287,
   "Name": "Find the Duplicate Number",
   "Category": "Cyclic Sort",
   "Difficulty": "Medium",
   "Problem Name": "Find the Duplicate Number",
   "Leetcode URL": "https://leetcode.com/problems/find-the-duplicate-number/"
 },
 {
   "id": 97,
   "LeetCode_ID": 442,
   "Name": "Find All Duplicates in an Array",
   "Category": "Cyclic Sort",
   "Difficulty": "Medium",
   "Problem Name": "Find All Duplicates in an Array",
   "Leetcode URL": "https://leetcode.com/problems/find-all-duplicates-in-an-array/"
 },
 {
   "id": 98,
   "LeetCode_ID": 41,
   "Name": "First Missing Positive",
   "Category": "Cyclic Sort",
   "Difficulty": "Hard",
   "Problem Name": "First Missing Positive",
   "Leetcode URL": "https://leetcode.com/problems/first-missing-positive/"
 },
 {
   "id": 99,
   "LeetCode_ID": 645,
   "Name": "Set Mismatch",
   "Category": "Cyclic Sort",
   "Difficulty": "Easy",
   "Problem Name": "Set Mismatch",
   "Leetcode URL": "https://leetcode.com/problems/set-mismatch/"
 },
 {
   "id": 100,
   "LeetCode_ID": 765,
   "Name": "Couples Holding Hands",
   "Category": "Union Find",
   "Difficulty": "Hard",
   "Problem Name": "Couples Holding Hands",
   "Leetcode URL": "https://leetcode.com/problems/couples-holding-hands/"
 },
 {
   "id": 101,
   "LeetCode_ID": 289,
   "Name": "Game of Life",
   "Category": "Matrix Traversal",
   "Difficulty": "Medium",
   "Problem Name": "Game of Life",
   "Leetcode URL": "https://leetcode.com/problems/game-of-life/"
 },
 {
   "id": 102,
   "LeetCode_ID": 463,
   "Name": "Island Perimeter",
   "Category": "Matrix Traversal",
   "Difficulty": "Easy",
   "Problem Name": "Island Perimeter",
   "Leetcode URL": "https://leetcode.com/problems/island-perimeter/"
 },
 {
   "id": 103,
   "LeetCode_ID": 1329,
   "Name": "Sort the Matrix Diagonally",
   "Category": "Matrix Traversal",
   "Difficulty": "Medium",
   "Problem Name": "Sort the Matrix Diagonally",
   "Leetcode URL": "https://leetcode.com/problems/sort-the-matrix-diagonally/"
 },
 {
   "id": 104,
   "LeetCode_ID": 59,
   "Name": "Spiral Matrix II",
   "Category": "Matrix Traversal",
   "Difficulty": "Medium",
   "Problem Name": "Spiral Matrix II",
   "Leetcode URL": "https://leetcode.com/problems/spiral-matrix-ii/"
 },
 {
   "id": 105,
   "LeetCode_ID": 2022,
   "Name": "Convert 1D Array Into 2D Array",
   "Category": "Arrays",
   "Difficulty": "Medium",
   "Problem Name": "Convert 1D Array Into 2D Array",
   "Leetcode URL": "https://leetcode.com/problems/convert-1d-array-into-2d-array/"
 },
 {
   "id": 106,
   "LeetCode_ID": 766,
   "Name": "Toeplitz Matrix",
   "Category": "Matrix Traversal",
   "Difficulty": "Easy",
   "Problem Name": "Toeplitz Matrix",
   "Leetcode URL": "https://leetcode.com/problems/toeplitz-matrix/"
 },
 {
   "id": 107,
   "LeetCode_ID": 1292,
   "Name": "Maximum Side Length of a Square with Sum Less than or Equal to Threshold",
   "Category": "Binary Search",
   "Difficulty": "Medium",
   "Problem Name": "Maximum Side Length of a Square with Sum less than or Equal to Threshold",
   "Leetcode URL": "https://leetcode.com/problems/maximum-side-length-of-a-square-with-sum-less-than-or-equal-to-threshold/"
 },
 {
   "id": 108,
   "LeetCode_ID": 20,
   "Name": "Valid Parentheses",
   "Category": "Stacks & Queues",
   "Difficulty": "Easy",
   "Problem Name": "Valid Parentheses",
   "Leetcode URL": "https://leetcode.com/problems/valid-parentheses/"
 },
 {
   "id": 109,
   "LeetCode_ID": 155,
   "Name": "Min Stack",
   "Category": "Stacks & Queues",
   "Difficulty": "Medium",
   "Problem Name": "Min Stack",
   "Leetcode URL": "https://leetcode.com/problems/min-stack/"
 },
 {
   "id": 110,
   "LeetCode_ID": 232,
   "Name": "Implement Queue using Stacks",
   "Category": "Stacks & Queues",
   "Difficulty": "Easy",
   "Problem Name": "Implement Queue using Stacks",
   "Leetcode URL": "https://leetcode.com/problems/implement-queue-using-stacks/"
 },
 {
   "id": 111,
   "LeetCode_ID": 394,
   "Name": "Decode String",
   "Category": "Stacks & Queues",
   "Difficulty": "Medium",
   "Problem Name": "Decode String",
   "Leetcode URL": "https://leetcode.com/problems/decode-string/"
 },
 {
   "id": 112,
   "LeetCode_ID": 150,
   "Name": "Evaluate Reverse Polish Notation",
   "Category": "Stacks & Queues",
   "Difficulty": "Medium",
   "Problem Name": "Evaluate Reverse Polish Notation",
   "Leetcode URL": "https://leetcode.com/problems/evaluate-reverse-polish-notation/"
 },
 {
   "id": 113,
   "LeetCode_ID": 739,
   "Name": "Daily Temperatures",
   "Category": "Monotonic Stack/Queue",
   "Difficulty": "Medium",
   "Problem Name": "Daily Temperatures",
   "Leetcode URL": "https://leetcode.com/problems/daily-temperatures/"
 },
 {
   "id": 114,
   "LeetCode_ID": 227,
   "Name": "Basic Calculator II",
   "Category": "Stacks & Queues",
   "Difficulty": "Medium",
   "Problem Name": "Basic Calculator II",
   "Leetcode URL": "https://leetcode.com/problems/basic-calculator-ii/"
 },
 {
   "id": 115,
   "LeetCode_ID": 84,
   "Name": "Largest Rectangle in Histogram",
   "Category": "Monotonic Stack/Queue",
   "Difficulty": "Hard",
   "Problem Name": "Largest Rectangle in Histogram",
   "Leetcode URL": "https://leetcode.com/problems/largest-rectangle-in-histogram/"
 },
 {
   "id": 116,
   "LeetCode_ID": 496,
   "Name": "Next Greater Element I",
   "Category": "Stacks & Queues",
   "Difficulty": "Easy",
   "Problem Name": "Next Greater Element I",
   "Leetcode URL": "https://leetcode.com/problems/next-greater-element-i/"
 },
 {
   "id": 117,
   "LeetCode_ID": 1047,
   "Name": "Remove All Adjacent Duplicates In String",
   "Category": "Stacks & Queues",
   "Difficulty": "Easy",
   "Problem Name": "Remove All Adjacent Duplicates In String",
   "Leetcode URL": "https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/"
 },
 {
   "id": 118,
   "LeetCode_ID": 402,
   "Name": "Remove K Digits",
   "Category": "Monotonic Stack/Queue",
   "Difficulty": "Medium",
   "Problem Name": "Remove K Digits",
   "Leetcode URL": "https://leetcode.com/problems/remove-k-digits/"
 },
 {
   "id": 119,
   "LeetCode_ID": 844,
   "Name": "Backspace String Compare",
   "Category": "Two Pointers",
   "Difficulty": "Easy",
   "Problem Name": "Backspace String Compare",
   "Leetcode URL": "https://leetcode.com/problems/backspace-string-compare/"
 },
 {
   "id": 120,
   "LeetCode_ID": 32,
   "Name": "Longest Valid Parentheses",
   "Category": "Stacks & Queues",
   "Difficulty": "Hard",
   "Problem Name": "Longest Valid Parentheses",
   "Leetcode URL": "https://leetcode.com/problems/longest-valid-parentheses/"
 },
 {
   "id": 121,
   "LeetCode_ID": 316,
   "Name": "Remove Duplicate Letters",
   "Category": "Monotonic Stack/Queue",
   "Difficulty": "Medium",
   "Problem Name": "Remove Duplicate Letters",
   "Leetcode URL": "https://leetcode.com/problems/remove-duplicate-letters/"
 },
 {
   "id": 122,
   "LeetCode_ID": 503,
   "Name": "Next Greater Element II",
   "Category": "Monotonic Stack/Queue",
   "Difficulty": "Medium",
   "Problem Name": "Next Greater Element II",
   "Leetcode URL": "https://leetcode.com/problems/next-greater-element-ii/"
 },
 {
   "id": 123,
   "LeetCode_ID": 901,
   "Name": "Online Stock Span",
   "Category": "Stacks & Queues",
   "Difficulty": "Medium",
   "Problem Name": "Online Stock Span",
   "Leetcode URL": "https://leetcode.com/problems/online-stock-span/"
 },
 {
   "id": 124,
   "LeetCode_ID": 456,
   "Name": "132 Pattern",
   "Category": "Stacks & Queues",
   "Difficulty": "Medium",
   "Problem Name": "132 Pattern",
   "Leetcode URL": "https://leetcode.com/problems/132-pattern/"
 },
 {
   "id": 125,
   "LeetCode_ID": 907,
   "Name": "Sum of Subarray Minimums",
   "Category": "Monotonic Stack/Queue",
   "Difficulty": "Medium",
   "Problem Name": "Sum of Subarray Minimums",
   "Leetcode URL": "https://leetcode.com/problems/sum-of-subarray-minimums/"
 },
 {
   "id": 126,
   "LeetCode_ID": 1019,
   "Name": "Next Greater Node In Linked List",
   "Category": "Monotonic Stack/Queue",
   "Difficulty": "Medium",
   "Problem Name": "Next Greater Node In Linked List",
   "Leetcode URL": "https://leetcode.com/problems/next-greater-node-in-linked-list/"
 },
 {
   "id": 127,
   "LeetCode_ID": 1856,
   "Name": "Maximum Subarray Min-Product",
   "Category": "Monotonic Stack/Queue",
   "Difficulty": "Medium",
   "Problem Name": "Maximum Subarray Min-Product",
   "Leetcode URL": "https://leetcode.com/problems/maximum-subarray-min-product/"
 },
 {
   "id": 128,
   "LeetCode_ID": 2104,
   "Name": "Sum of Subarray Ranges",
   "Category": "Monotonic Stack/Queue",
   "Difficulty": "Medium",
   "Problem Name": "Sum of Subarray Ranges",
   "Leetcode URL": "https://leetcode.com/problems/sum-of-subarray-ranges/"
 },
 {
   "id": 129,
   "LeetCode_ID": 1475,
   "Name": "Final Prices With a Special Discount in a Shop",
   "Category": "Monotonic Stack/Queue",
   "Difficulty": "Easy",
   "Problem Name": "Final Prices With a Special Discount in a Shop",
   "Leetcode URL": "https://leetcode.com/problems/final-prices-with-a-special-discount-in-a-shop/"
 },
 {
   "id": 130,
   "LeetCode_ID": 206,
   "Name": "Reverse Linked List",
   "Category": "Linked Lists",
   "Difficulty": "Easy",
   "Problem Name": "Reverse Linked List",
   "Leetcode URL": "https://leetcode.com/problems/reverse-linked-list/"
 },
 {
   "id": 131,
   "LeetCode_ID": 21,
   "Name": "Merge Two Sorted Lists",
   "Category": "Linked Lists",
   "Difficulty": "Easy",
   "Problem Name": "Merge Two Sorted Lists",
   "Leetcode URL": "https://leetcode.com/problems/merge-two-sorted-lists/"
 },
 {
   "id": 132,
   "LeetCode_ID": 141,
   "Name": "Linked List Cycle",
   "Category": "Linked Lists",
   "Difficulty": "Easy",
   "Problem Name": "Linked List Cycle",
   "Leetcode URL": "https://leetcode.com/problems/linked-list-cycle/"
 },
 {
   "id": 133,
   "LeetCode_ID": 19,
   "Name": "Remove Nth Node From End of List",
   "Category": "Linked Lists",
   "Difficulty": "Medium",
   "Problem Name": "Remove Nth Node From End of List",
   "Leetcode URL": "https://leetcode.com/problems/remove-nth-node-from-end-of-list/"
 },
 {
   "id": 134,
   "LeetCode_ID": 2,
   "Name": "Add Two Numbers",
   "Category": "Linked Lists",
   "Difficulty": "Medium",
   "Problem Name": "Add Two Numbers",
   "Leetcode URL": "https://leetcode.com/problems/add-two-numbers/"
 },
 {
   "id": 135,
   "LeetCode_ID": 160,
   "Name": "Intersection of Two Linked Lists",
   "Category": "Linked Lists",
   "Difficulty": "Easy",
   "Problem Name": "Intersection of Two Linked Lists",
   "Leetcode URL": "https://leetcode.com/problems/intersection-of-two-linked-lists/"
 },
 {
   "id": 136,
   "LeetCode_ID": 234,
   "Name": "Palindrome Linked List",
   "Category": "Linked Lists",
   "Difficulty": "Easy",
   "Problem Name": "Palindrome Linked List",
   "Leetcode URL": "https://leetcode.com/problems/palindrome-linked-list/"
 },
 {
   "id": 137,
   "LeetCode_ID": 876,
   "Name": "Middle of the Linked List",
   "Category": "Linked Lists",
   "Difficulty": "Easy",
   "Problem Name": "Middle of the Linked List",
   "Leetcode URL": "https://leetcode.com/problems/middle-of-the-linked-list/"
 },
 {
   "id": 138,
   "LeetCode_ID": 142,
   "Name": "Linked List Cycle II",
   "Category": "Linked Lists",
   "Difficulty": "Medium",
   "Problem Name": "Linked List Cycle II",
   "Leetcode URL": "https://leetcode.com/problems/linked-list-cycle-ii/"
 },
 {
   "id": 139,
   "LeetCode_ID": 92,
   "Name": "Reverse Linked List II",
   "Category": "Linked Lists",
   "Difficulty": "Medium",
   "Problem Name": "Reverse Linked List II",
   "Leetcode URL": "https://leetcode.com/problems/reverse-linked-list-ii/"
 },
 {
   "id": 140,
   "LeetCode_ID": 138,
   "Name": "Copy List with Random Pointer",
   "Category": "Linked Lists",
   "Difficulty": "Medium",
   "Problem Name": "Copy List with Random Pointer",
   "Leetcode URL": "https://leetcode.com/problems/copy-list-with-random-pointer/"
 },
 {
   "id": 141,
   "LeetCode_ID": 148,
   "Name": "Sort List",
   "Category": "Divide and Conquer",
   "Difficulty": "Medium",
   "Problem Name": "Sort List",
   "Leetcode URL": "https://leetcode.com/problems/sort-list/"
 },
 {
   "id": 142,
   "LeetCode_ID": 23,
   "Name": "Merge k Sorted Lists",
   "Category": "Heap/Priority Queue",
   "Difficulty": "Hard",
   "Problem Name": "Merge k Sorted Lists",
   "Leetcode URL": "https://leetcode.com/problems/merge-k-sorted-lists/"
 },
 {
   "id": 143,
   "LeetCode_ID": 24,
   "Name": "Swap Nodes in Pairs",
   "Category": "Linked Lists",
   "Difficulty": "Medium",
   "Problem Name": "Swap Nodes in Pairs",
   "Leetcode URL": "https://leetcode.com/problems/swap-nodes-in-pairs/"
 },
 {
   "id": 144,
   "LeetCode_ID": 146,
   "Name": "LRU Cache",
   "Category": "Design",
   "Difficulty": "Medium",
   "Problem Name": "LRU Cache",
   "Leetcode URL": "https://leetcode.com/problems/lru-cache/"
 },
 {
   "id": 145,
   "LeetCode_ID": 143,
   "Name": "Reorder List",
   "Category": "Linked Lists",
   "Difficulty": "Medium",
   "Problem Name": "Reorder List",
   "Leetcode URL": "https://leetcode.com/problems/reorder-list/"
 },
 {
   "id": 146,
   "LeetCode_ID": 202,
   "Name": "Happy Number",
   "Category": "HashMap/HashSet",
   "Difficulty": "Easy",
   "Problem Name": "Happy Number",
   "Leetcode URL": "https://leetcode.com/problems/happy-number/"
 },
 {
   "id": 147,
   "LeetCode_ID": 457,
   "Name": "Circular Array Loop",
   "Category": "Two Pointers",
   "Difficulty": "Medium",
   "Problem Name": "Circular Array Loop",
   "Leetcode URL": "https://leetcode.com/problems/circular-array-loop/"
 },
 {
   "id": 148,
   "LeetCode_ID": 61,
   "Name": "Rotate List",
   "Category": "Linked Lists",
   "Difficulty": "Medium",
   "Problem Name": "Rotate List",
   "Leetcode URL": "https://leetcode.com/problems/rotate-list/"
 },
 {
   "id": 149,
   "LeetCode_ID": 25,
   "Name": "Reverse Nodes in k-Group",
   "Category": "Linked Lists",
   "Difficulty": "Hard",
   "Problem Name": "Reverse Nodes in k-Group",
   "Leetcode URL": "https://leetcode.com/problems/reverse-nodes-in-k-group/"
 },
 {
   "id": 150,
   "LeetCode_ID": 2074,
   "Name": "Reverse Nodes in Even Length Groups",
   "Category": "Linked Lists",
   "Difficulty": "Medium",
   "Problem Name": "Reverse Nodes in Even Length Groups",
   "Leetcode URL": "https://leetcode.com/problems/reverse-nodes-in-even-length-groups/"
 },
 {
   "id": 151,
   "LeetCode_ID": 1721,
   "Name": "Swapping Nodes in a Linked List",
   "Category": "Linked Lists",
   "Difficulty": "Medium",
   "Problem Name": "Swapping Nodes in a Linked List",
   "Leetcode URL": "https://leetcode.com/problems/swapping-nodes-in-a-linked-list/"
 },
 {
   "id": 152,
   "LeetCode_ID": 328,
   "Name": "Odd Even Linked List",
   "Category": "Linked Lists",
   "Difficulty": "Medium",
   "Problem Name": "Odd Even Linked List",
   "Leetcode URL": "https://leetcode.com/problems/odd-even-linked-list/"
 },
 {
   "id": 153,
   "LeetCode_ID": 509,
   "Name": "Fibonacci Number",
   "Category": "Dynamic Programming",
   "Difficulty": "Easy",
   "Problem Name": "Fibonacci Number",
   "Leetcode URL": "https://leetcode.com/problems/fibonacci-number/"
 },
 {
   "id": 154,
   "LeetCode_ID": 70,
   "Name": "Climbing Stairs",
   "Category": "Dynamic Programming",
   "Difficulty": "Easy",
   "Problem Name": "Climbing Stairs",
   "Leetcode URL": "https://leetcode.com/problems/climbing-stairs/"
 },
 {
   "id": 155,
   "LeetCode_ID": 50,
   "Name": "Pow(x n)",
   "Category": "Divide and Conquer",
   "Difficulty": "Medium",
   "Problem Name": "Pow(x n)",
   "Leetcode URL": "https://leetcode.com/problems/powx-n/"
 },
 {
   "id": 156,
   "LeetCode_ID": 203,
   "Name": "Remove Linked List Elements",
   "Category": "Linked Lists",
   "Difficulty": "Easy",
   "Problem Name": "Remove Linked List Elements",
   "Leetcode URL": "https://leetcode.com/problems/remove-linked-list-elements/"
 },
 {
   "id": 157,
   "LeetCode_ID": 1823,
   "Name": "Find the Winner of the Circular Game",
   "Category": "Recursion",
   "Difficulty": "Medium",
   "Problem Name": "Find the Winner of the Circular Game",
   "Leetcode URL": "https://leetcode.com/problems/find-the-winner-of-the-circular-game/"
 },
 {
   "id": 158,
   "LeetCode_ID": 226,
   "Name": "Invert Binary Tree",
   "Category": "Trees",
   "Difficulty": "Easy",
   "Problem Name": "Invert Binary Tree",
   "Leetcode URL": "https://leetcode.com/problems/invert-binary-tree/"
 },
 {
   "id": 159,
   "LeetCode_ID": 104,
   "Name": "Maximum Depth of Binary Tree",
   "Category": "Tree DFS",
   "Difficulty": "Easy",
   "Problem Name": "Maximum Depth of Binary Tree",
   "Leetcode URL": "https://leetcode.com/problems/maximum-depth-of-binary-tree/"
 },
 {
   "id": 160,
   "LeetCode_ID": 100,
   "Name": "Same Tree",
   "Category": "Tree DFS",
   "Difficulty": "Easy",
   "Problem Name": "Same Tree",
   "Leetcode URL": "https://leetcode.com/problems/same-tree/"
 },
 {
   "id": 161,
   "LeetCode_ID": 101,
   "Name": "Symmetric Tree",
   "Category": "Tree DFS",
   "Difficulty": "Easy",
   "Problem Name": "Symmetric Tree",
   "Leetcode URL": "https://leetcode.com/problems/symmetric-tree/"
 },
 {
   "id": 162,
   "LeetCode_ID": 112,
   "Name": "Path Sum",
   "Category": "Tree DFS",
   "Difficulty": "Easy",
   "Problem Name": "Path Sum",
   "Leetcode URL": "https://leetcode.com/problems/path-sum/"
 },
 {
   "id": 163,
   "LeetCode_ID": 94,
   "Name": "Binary Tree Inorder Traversal",
   "Category": "Tree DFS",
   "Difficulty": "Easy",
   "Problem Name": "Binary Tree Inorder Traversal",
   "Leetcode URL": "https://leetcode.com/problems/binary-tree-inorder-traversal/"
 },
 {
   "id": 164,
   "LeetCode_ID": 144,
   "Name": "Binary Tree Preorder Traversal",
   "Category": "Tree DFS",
   "Difficulty": "Easy",
   "Problem Name": "Binary Tree Preorder Traversal",
   "Leetcode URL": "https://leetcode.com/problems/binary-tree-preorder-traversal/"
 },
 {
   "id": 165,
   "LeetCode_ID": 145,
   "Name": "Binary Tree Postorder Traversal",
   "Category": "Tree DFS",
   "Difficulty": "Easy",
   "Problem Name": "Binary Tree Postorder Traversal",
   "Leetcode URL": "https://leetcode.com/problems/binary-tree-postorder-traversal/"
 },
 {
   "id": 166,
   "LeetCode_ID": 257,
   "Name": "Binary Tree Paths",
   "Category": "Tree DFS",
   "Difficulty": "Easy",
   "Problem Name": "Binary Tree Paths",
   "Leetcode URL": "https://leetcode.com/problems/binary-tree-paths/"
 },
 {
   "id": 167,
   "LeetCode_ID": 98,
   "Name": "Validate Binary Search Tree",
   "Category": "Tree DFS",
   "Difficulty": "Medium",
   "Problem Name": "Validate Binary Search Tree",
   "Leetcode URL": "https://leetcode.com/problems/validate-binary-search-tree/"
 },
 {
   "id": 168,
   "LeetCode_ID": 700,
   "Name": "Search in a Binary Search Tree",
   "Category": "Trees",
   "Difficulty": "Easy",
   "Problem Name": "Search in a Binary Search Tree",
   "Leetcode URL": "https://leetcode.com/problems/search-in-a-binary-search-tree/"
 },
 {
   "id": 169,
   "LeetCode_ID": 235,
   "Name": "Lowest Common Ancestor of a Binary Search Tree",
   "Category": "Trees",
   "Difficulty": "Medium",
   "Problem Name": "Lowest Common Ancestor of a Binary Search Tree",
   "Leetcode URL": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/"
 },
 {
   "id": 170,
   "LeetCode_ID": 236,
   "Name": "Lowest Common Ancestor of a Binary Tree",
   "Category": "Tree DFS",
   "Difficulty": "Medium",
   "Problem Name": "Lowest Common Ancestor of a Binary Tree",
   "Leetcode URL": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/"
 },
 {
   "id": 171,
   "LeetCode_ID": 230,
   "Name": "Kth Smallest Element in a BST",
   "Category": "Tree DFS",
   "Difficulty": "Medium",
   "Problem Name": "Kth Smallest Element in a BST",
   "Leetcode URL": "https://leetcode.com/problems/kth-smallest-element-in-a-bst/"
 },
 {
   "id": 172,
   "LeetCode_ID": 110,
   "Name": "Balanced Binary Tree",
   "Category": "Tree DFS",
   "Difficulty": "Easy",
   "Problem Name": "Balanced Binary Tree",
   "Leetcode URL": "https://leetcode.com/problems/balanced-binary-tree/"
 },
 {
   "id": 173,
   "LeetCode_ID": 543,
   "Name": "Diameter of Binary Tree",
   "Category": "Tree DFS",
   "Difficulty": "Easy",
   "Problem Name": "Diameter of Binary Tree",
   "Leetcode URL": "https://leetcode.com/problems/diameter-of-binary-tree/"
 },
 {
   "id": 174,
   "LeetCode_ID": 113,
   "Name": "Path Sum II",
   "Category": "Tree DFS",
   "Difficulty": "Medium",
   "Problem Name": "Path Sum II",
   "Leetcode URL": "https://leetcode.com/problems/path-sum-ii/"
 },
 {
   "id": 175,
   "LeetCode_ID": 124,
   "Name": "Binary Tree Maximum Path Sum",
   "Category": "Tree DFS",
   "Difficulty": "Hard",
   "Problem Name": "Binary Tree Maximum Path Sum",
   "Leetcode URL": "https://leetcode.com/problems/binary-tree-maximum-path-sum/"
 },
 {
   "id": 176,
   "LeetCode_ID": 105,
   "Name": "Construct Binary Tree from Preorder and Inorder Traversal",
   "Category": "Trees",
   "Difficulty": "Medium",
   "Problem Name": "Construct Binary Tree from Preorder and Inorder Traversal",
   "Leetcode URL": "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/"
 },
 {
   "id": 177,
   "LeetCode_ID": 114,
   "Name": "Flatten Binary Tree to Linked List",
   "Category": "Tree DFS",
   "Difficulty": "Medium",
   "Problem Name": "Flatten Binary Tree to Linked List",
   "Leetcode URL": "https://leetcode.com/problems/flatten-binary-tree-to-linked-list/"
 },
 {
   "id": 178,
   "LeetCode_ID": 99,
   "Name": "Recover Binary Search Tree",
   "Category": "Tree DFS",
   "Difficulty": "Hard",
   "Problem Name": "Recover Binary Search Tree",
   "Leetcode URL": "https://leetcode.com/problems/recover-binary-search-tree/"
 },
 {
   "id": 179,
   "LeetCode_ID": 863,
   "Name": "All Nodes Distance K in Binary Tree",
   "Category": "Tree BFS",
   "Difficulty": "Medium",
   "Problem Name": "All Nodes Distance K in Binary Tree",
   "Leetcode URL": "https://leetcode.com/problems/all-nodes-distance-k-in-a-binary-tree/"
 },
 {
   "id": 180,
   "LeetCode_ID": 297,
   "Name": "Serialize and Deserialize Binary Tree",
   "Category": "Tree DFS",
   "Difficulty": "Hard",
   "Problem Name": "Serialize and Deserialize Binary Tree",
   "Leetcode URL": "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/"
 },
 {
   "id": 181,
   "LeetCode_ID": 102,
   "Name": "Binary Tree Level Order Traversal",
   "Category": "Tree BFS",
   "Difficulty": "Medium",
   "Problem Name": "Binary Tree Level Order Traversal",
   "Leetcode URL": "https://leetcode.com/problems/binary-tree-level-order-traversal/"
 },
 {
   "id": 182,
   "LeetCode_ID": 107,
   "Name": "Binary Tree Level Order Traversal II",
   "Category": "Tree BFS",
   "Difficulty": "Medium",
   "Problem Name": "Binary Tree Level Order Traversal II",
   "Leetcode URL": "https://leetcode.com/problems/binary-tree-level-order-traversal-ii/"
 },
 {
   "id": 183,
   "LeetCode_ID": 103,
   "Name": "Binary Tree Zigzag Level Order Traversal",
   "Category": "Tree BFS",
   "Difficulty": "Medium",
   "Problem Name": "Binary Tree Zigzag Level Order Traversal",
   "Leetcode URL": "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/"
 },
 {
   "id": 184,
   "LeetCode_ID": 199,
   "Name": "Binary Tree Right Side View",
   "Category": "Tree BFS",
   "Difficulty": "Medium",
   "Problem Name": "Binary Tree Right Side View",
   "Leetcode URL": "https://leetcode.com/problems/binary-tree-right-side-view/"
 },
 {
   "id": 185,
   "LeetCode_ID": 111,
   "Name": "Minimum Depth of Binary Tree",
   "Category": "Tree BFS",
   "Difficulty": "Easy",
   "Problem Name": "Minimum Depth of Binary Tree",
   "Leetcode URL": "https://leetcode.com/problems/minimum-depth-of-binary-tree/"
 },
 {
   "id": 186,
   "LeetCode_ID": 637,
   "Name": "Average of Levels in Binary Tree",
   "Category": "Tree BFS",
   "Difficulty": "Easy",
   "Problem Name": "Average of Levels in Binary Tree",
   "Leetcode URL": "https://leetcode.com/problems/average-of-levels-in-binary-tree/"
 },
 {
   "id": 187,
   "LeetCode_ID": 116,
   "Name": "Populating Next Right Pointers in Each Node",
   "Category": "Tree BFS",
   "Difficulty": "Medium",
   "Problem Name": "Populating Next Right Pointers in Each Node",
   "Leetcode URL": "https://leetcode.com/problems/populating-next-right-pointers-in-each-node/"
 },
 {
   "id": 188,
   "LeetCode_ID": 117,
   "Name": "Populating Next Right Pointers in Each Node II",
   "Category": "Tree BFS",
   "Difficulty": "Medium",
   "Problem Name": "Populating Next Right Pointers in Each Node II",
   "Leetcode URL": "https://leetcode.com/problems/populating-next-right-pointers-in-each-node-ii/"
 },
 {
   "id": 189,
   "LeetCode_ID": 513,
   "Name": "Find Bottom Left Tree Value",
   "Category": "Tree BFS",
   "Difficulty": "Medium",
   "Problem Name": "Find Bottom Left Tree Value",
   "Leetcode URL": "https://leetcode.com/problems/find-bottom-left-tree-value/"
 },
 {
   "id": 190,
   "LeetCode_ID": 958,
   "Name": "Check Completeness of a Binary Tree",
   "Category": "Tree BFS",
   "Difficulty": "Medium",
   "Problem Name": "Check Completeness of a Binary Tree",
   "Leetcode URL": "https://leetcode.com/problems/check-completeness-of-a-binary-tree/"
 },
 {
   "id": 191,
   "LeetCode_ID": 993,
   "Name": "Cousins in Binary Tree",
   "Category": "Tree BFS",
   "Difficulty": "Easy",
   "Problem Name": "Cousins in Binary Tree",
   "Leetcode URL": "https://leetcode.com/problems/cousins-in-binary-tree/"
 },
 {
   "id": 192,
   "LeetCode_ID": 1161,
   "Name": "Maximum Level Sum of a Binary Tree",
   "Category": "Tree BFS",
   "Difficulty": "Medium",
   "Problem Name": "Maximum Level Sum of a Binary Tree",
   "Leetcode URL": "https://leetcode.com/problems/maximum-level-sum-of-a-binary-tree/"
 },
 {
   "id": 193,
   "LeetCode_ID": 662,
   "Name": "Maximum Width of Binary Tree",
   "Category": "Tree BFS",
   "Difficulty": "Medium",
   "Problem Name": "Maximum Width of Binary Tree",
   "Leetcode URL": "https://leetcode.com/problems/maximum-width-of-binary-tree/"
 },
 {
   "id": 194,
   "LeetCode_ID": 429,
   "Name": "N-ary Tree Level Order Traversal",
   "Category": "Tree BFS",
   "Difficulty": "Medium",
   "Problem Name": "N-ary Tree Level Order Traversal",
   "Leetcode URL": "https://leetcode.com/problems/n-ary-tree-level-order-traversal/"
 },
 {
   "id": 195,
   "LeetCode_ID": 987,
   "Name": "Vertical Order Traversal of a Binary Tree",
   "Category": "Tree BFS",
   "Difficulty": "Hard",
   "Problem Name": "Vertical Order Traversal of a Binary Tree",
   "Leetcode URL": "https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/"
 },
 {
   "id": 196,
   "LeetCode_ID": 53,
   "Name": "Maximum Subarray",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "Maximum Subarray",
   "Leetcode URL": "https://leetcode.com/problems/maximum-subarray/"
 },
 {
   "id": 197,
   "LeetCode_ID": 215,
   "Name": "Kth Largest Element in an Array",
   "Category": "Divide and Conquer",
   "Difficulty": "Medium",
   "Problem Name": "Kth Largest Element in an Array",
   "Leetcode URL": "https://leetcode.com/problems/kth-largest-element-in-an-array/"
 },
 {
   "id": 198,
   "LeetCode_ID": 912,
   "Name": "Sort an Array",
   "Category": "Divide and Conquer",
   "Difficulty": "Medium",
   "Problem Name": "Sort an Array",
   "Leetcode URL": "https://leetcode.com/problems/sort-an-array/"
 },
 {
   "id": 199,
   "LeetCode_ID": 108,
   "Name": "Convert Sorted Array to Binary Search Tree",
   "Category": "Divide and Conquer",
   "Difficulty": "Easy",
   "Problem Name": "Convert Sorted Array to Binary Search Tree",
   "Leetcode URL": "https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/"
 },
 {
   "id": 200,
   "LeetCode_ID": 109,
   "Name": "Convert Sorted List to Binary Search Tree",
   "Category": "Divide and Conquer",
   "Difficulty": "Medium",
   "Problem Name": "Convert Sorted List to Binary Search Tree",
   "Leetcode URL": "https://leetcode.com/problems/convert-sorted-list-to-binary-search-tree/"
 },
 {
   "id": 201,
   "LeetCode_ID": 654,
   "Name": "Maximum Binary Tree",
   "Category": "Divide and Conquer",
   "Difficulty": "Medium",
   "Problem Name": "Maximum Binary Tree",
   "Leetcode URL": "https://leetcode.com/problems/maximum-binary-tree/"
 },
 {
   "id": 202,
   "LeetCode_ID": 218,
   "Name": "The Skyline Problem",
   "Category": "Heap/Priority Queue",
   "Difficulty": "Hard",
   "Problem Name": "The Skyline Problem",
   "Leetcode URL": "https://leetcode.com/problems/the-skyline-problem/"
 },
 {
   "id": 203,
   "LeetCode_ID": 427,
   "Name": "Construct Quad Tree",
   "Category": "Divide and Conquer",
   "Difficulty": "Medium",
   "Problem Name": "Construct Quad Tree",
   "Leetcode URL": "https://leetcode.com/problems/construct-quad-tree/"
 },
 {
   "id": 204,
   "LeetCode_ID": 973,
   "Name": "K Closest Points to Origin",
   "Category": "Divide and Conquer",
   "Difficulty": "Medium",
   "Problem Name": "K Closest Points to Origin",
   "Leetcode URL": "https://leetcode.com/problems/k-closest-points-to-origin/"
 },
 {
   "id": 205,
   "LeetCode_ID": 46,
   "Name": "Permutations",
   "Category": "Backtracking",
   "Difficulty": "Medium",
   "Problem Name": "Permutations",
   "Leetcode URL": "https://leetcode.com/problems/permutations/"
 },
 {
   "id": 206,
   "LeetCode_ID": 78,
   "Name": "Subsets",
   "Category": "Backtracking",
   "Difficulty": "Medium",
   "Problem Name": "Subsets",
   "Leetcode URL": "https://leetcode.com/problems/subsets/"
 },
 {
   "id": 207,
   "LeetCode_ID": 39,
   "Name": "Combination Sum",
   "Category": "Backtracking",
   "Difficulty": "Medium",
   "Problem Name": "Combination Sum",
   "Leetcode URL": "https://leetcode.com/problems/combination-sum/"
 },
 {
   "id": 208,
   "LeetCode_ID": 17,
   "Name": "Letter Combinations of a Phone Number",
   "Category": "Backtracking",
   "Difficulty": "Medium",
   "Problem Name": "Letter Combinations of a Phone Number",
   "Leetcode URL": "https://leetcode.com/problems/letter-combinations-of-a-phone-number/"
 },
 {
   "id": 209,
   "LeetCode_ID": 22,
   "Name": "Generate Parentheses",
   "Category": "Backtracking",
   "Difficulty": "Medium",
   "Problem Name": "Generate Parentheses",
   "Leetcode URL": "https://leetcode.com/problems/generate-parentheses/"
 },
 {
   "id": 210,
   "LeetCode_ID": 79,
   "Name": "Word Search",
   "Category": "Backtracking",
   "Difficulty": "Medium",
   "Problem Name": "Word Search",
   "Leetcode URL": "https://leetcode.com/problems/word-search/"
 },
 {
   "id": 211,
   "LeetCode_ID": 51,
   "Name": "N-Queens",
   "Category": "Backtracking",
   "Difficulty": "Hard",
   "Problem Name": "N-Queens",
   "Leetcode URL": "https://leetcode.com/problems/n-queens/"
 },
 {
   "id": 212,
   "LeetCode_ID": 37,
   "Name": "Sudoku Solver",
   "Category": "Backtracking",
   "Difficulty": "Hard",
   "Problem Name": "Sudoku Solver",
   "Leetcode URL": "https://leetcode.com/problems/sudoku-solver/"
 },
 {
   "id": 213,
   "LeetCode_ID": 131,
   "Name": "Palindrome Partitioning",
   "Category": "Backtracking",
   "Difficulty": "Medium",
   "Problem Name": "Palindrome Partitioning",
   "Leetcode URL": "https://leetcode.com/problems/palindrome-partitioning/"
 },
 {
   "id": 214,
   "LeetCode_ID": 93,
   "Name": "Restore IP Addresses",
   "Category": "Backtracking",
   "Difficulty": "Medium",
   "Problem Name": "Restore IP Addresses",
   "Leetcode URL": "https://leetcode.com/problems/restore-ip-addresses/"
 },
 {
   "id": 215,
   "LeetCode_ID": 40,
   "Name": "Combination Sum II",
   "Category": "Backtracking",
   "Difficulty": "Medium",
   "Problem Name": "Combination Sum II",
   "Leetcode URL": "https://leetcode.com/problems/combination-sum-ii/"
 },
 {
   "id": 216,
   "LeetCode_ID": 47,
   "Name": "Permutations II",
   "Category": "Backtracking",
   "Difficulty": "Medium",
   "Problem Name": "Permutations II",
   "Leetcode URL": "https://leetcode.com/problems/permutations-ii/"
 },
 {
   "id": 217,
   "LeetCode_ID": 90,
   "Name": "Subsets II",
   "Category": "Backtracking",
   "Difficulty": "Medium",
   "Problem Name": "Subsets II",
   "Leetcode URL": "https://leetcode.com/problems/subsets-ii/"
 },
 {
   "id": 218,
   "LeetCode_ID": 473,
   "Name": "Matchsticks to Square",
   "Category": "Backtracking",
   "Difficulty": "Medium",
   "Problem Name": "Matchsticks to Square",
   "Leetcode URL": "https://leetcode.com/problems/matchsticks-to-square/"
 },
 {
   "id": 219,
   "LeetCode_ID": 698,
   "Name": "Partition to K Equal Sum Subsets",
   "Category": "Backtracking",
   "Difficulty": "Medium",
   "Problem Name": "Partition to K Equal Sum Subsets",
   "Leetcode URL": "https://leetcode.com/problems/partition-to-k-equal-sum-subsets/"
 },
 {
   "id": 220,
   "LeetCode_ID": 784,
   "Name": "Letter Case Permutation",
   "Category": "Backtracking",
   "Difficulty": "Medium",
   "Problem Name": "Letter Case Permutation",
   "Leetcode URL": "https://leetcode.com/problems/letter-case-permutation/"
 },
 {
   "id": 221,
   "LeetCode_ID": 295,
   "Name": "Find Median from Data Stream",
   "Category": "Heap/Priority Queue",
   "Difficulty": "Hard",
   "Problem Name": "Find Median from Data Stream",
   "Leetcode URL": "https://leetcode.com/problems/find-median-from-data-stream/"
 },
 {
   "id": 222,
   "LeetCode_ID": 703,
   "Name": "Kth Largest Element in a Stream",
   "Category": "Heap/Priority Queue",
   "Difficulty": "Easy",
   "Problem Name": "Kth Largest Element in a Stream",
   "Leetcode URL": "https://leetcode.com/problems/kth-largest-element-in-a-stream/"
 },
 {
   "id": 223,
   "LeetCode_ID": 253,
   "Name": "Meeting Rooms II",
   "Category": "Heap/Priority Queue",
   "Difficulty": "Medium",
   "Problem Name": "Meeting Rooms II",
   "Leetcode URL": "https://leetcode.com/problems/meeting-rooms-ii/"
 },
 {
   "id": 224,
   "LeetCode_ID": 621,
   "Name": "Task Scheduler",
   "Category": "Greedy",
   "Difficulty": "Medium",
   "Problem Name": "Task Scheduler",
   "Leetcode URL": "https://leetcode.com/problems/task-scheduler/"
 },
 {
   "id": 225,
   "LeetCode_ID": 373,
   "Name": "Find K Pairs with Smallest Sums",
   "Category": "Heap/Priority Queue",
   "Difficulty": "Medium",
   "Problem Name": "Find K Pairs with Smallest Sums",
   "Leetcode URL": "https://leetcode.com/problems/find-k-pairs-with-smallest-sums/"
 },
 {
   "id": 226,
   "LeetCode_ID": 871,
   "Name": "Minimum Number of Refueling Stops",
   "Category": "Heap/Priority Queue",
   "Difficulty": "Hard",
   "Problem Name": "Minimum Number of Refueling Stops",
   "Leetcode URL": "https://leetcode.com/problems/minimum-number-of-refueling-stops/"
 },
 {
   "id": 227,
   "LeetCode_ID": 1642,
   "Name": "Furthest Building You Can Reach",
   "Category": "Heap/Priority Queue",
   "Difficulty": "Medium",
   "Problem Name": "Furthest Building You Can Reach",
   "Leetcode URL": "https://leetcode.com/problems/furthest-building-you-can-reach/"
 },
 {
   "id": 228,
   "LeetCode_ID": 1675,
   "Name": "Minimize Deviation in Array",
   "Category": "Heap/Priority Queue",
   "Difficulty": "Hard",
   "Problem Name": "Minimize Deviation in Array",
   "Leetcode URL": "https://leetcode.com/problems/minimize-deviation-in-array/"
 },
 {
   "id": 229,
   "LeetCode_ID": 208,
   "Name": "Implement Trie (Prefix Tree)",
   "Category": "Tries",
   "Difficulty": "Medium",
   "Problem Name": "Implement Trie (Prefix Tree)",
   "Leetcode URL": "https://leetcode.com/problems/implement-trie-prefix-tree/"
 },
 {
   "id": 230,
   "LeetCode_ID": 211,
   "Name": "Design Add and Search Words Data Structure",
   "Category": "Tries",
   "Difficulty": "Medium",
   "Problem Name": "Design Add and Search Words Data Structure",
   "Leetcode URL": "https://leetcode.com/problems/design-add-and-search-words-data-structure/"
 },
 {
   "id": 231,
   "LeetCode_ID": 212,
   "Name": "Word Search II",
   "Category": "Tries",
   "Difficulty": "Hard",
   "Problem Name": "Word Search II",
   "Leetcode URL": "https://leetcode.com/problems/word-search-ii/"
 },
 {
   "id": 232,
   "LeetCode_ID": 1023,
   "Name": "Camelcase Matching",
   "Category": "Two Pointers",
   "Difficulty": "Medium",
   "Problem Name": "Camelcase Matching",
   "Leetcode URL": "https://leetcode.com/problems/camelcase-matching/"
 },
 {
   "id": 233,
   "LeetCode_ID": 648,
   "Name": "Replace Words",
   "Category": "Tries",
   "Difficulty": "Medium",
   "Problem Name": "Replace Words",
   "Leetcode URL": "https://leetcode.com/problems/replace-words/"
 },
 {
   "id": 234,
   "LeetCode_ID": 677,
   "Name": "Map Sum Pairs",
   "Category": "Tries",
   "Difficulty": "Medium",
   "Problem Name": "Map Sum Pairs",
   "Leetcode URL": "https://leetcode.com/problems/map-sum-pairs/"
 },
 {
   "id": 235,
   "LeetCode_ID": 720,
   "Name": "Longest Word in Dictionary",
   "Category": "Tries",
   "Difficulty": "Medium",
   "Problem Name": "Longest Word in Dictionary",
   "Leetcode URL": "https://leetcode.com/problems/longest-word-in-dictionary/"
 },
 {
   "id": 236,
   "LeetCode_ID": 1268,
   "Name": "Search Suggestions System",
   "Category": "Tries",
   "Difficulty": "Medium",
   "Problem Name": "Search Suggestions System",
   "Leetcode URL": "https://leetcode.com/problems/search-suggestions-system/"
 },
 {
   "id": 237,
   "LeetCode_ID": 745,
   "Name": "Prefix and Suffix Search",
   "Category": "Tries",
   "Difficulty": "Hard",
   "Problem Name": "Prefix and Suffix Search",
   "Leetcode URL": "https://leetcode.com/problems/prefix-and-suffix-search/"
 },
 {
   "id": 238,
   "LeetCode_ID": 676,
   "Name": "Implement Magic Dictionary",
   "Category": "Tries",
   "Difficulty": "Medium",
   "Problem Name": "Implement Magic Dictionary",
   "Leetcode URL": "https://leetcode.com/problems/implement-magic-dictionary/"
 },
 {
   "id": 239,
   "LeetCode_ID": 1032,
   "Name": "Stream of Characters",
   "Category": "Tries",
   "Difficulty": "Hard",
   "Problem Name": "Stream of Characters",
   "Leetcode URL": "https://leetcode.com/problems/stream-of-characters/"
 },
 {
   "id": 240,
   "LeetCode_ID": 692,
   "Name": "Top K Frequent Words",
   "Category": "Heap/Priority Queue",
   "Difficulty": "Medium",
   "Problem Name": "Top K Frequent Words",
   "Leetcode URL": "https://leetcode.com/problems/top-k-frequent-words/"
 },
 {
   "id": 241,
   "LeetCode_ID": 1065,
   "Name": "Index Pairs of a String",
   "Category": "Tries",
   "Difficulty": "Medium",
   "Problem Name": "Index Pairs of a String",
   "Leetcode URL": "https://leetcode.com/problems/index-pairs-of-a-string/"
 },
 {
   "id": 242,
   "LeetCode_ID": 642,
   "Name": "Design Search Autocomplete System",
   "Category": "Design",
   "Difficulty": "Hard",
   "Problem Name": "Design Search Autocomplete System",
   "Leetcode URL": "https://leetcode.com/problems/design-search-autocomplete-system/"
 },
 {
   "id": 243,
   "LeetCode_ID": 472,
   "Name": "Concatenated Words",
   "Category": "Dynamic Programming",
   "Difficulty": "Hard",
   "Problem Name": "Concatenated Words",
   "Leetcode URL": "https://leetcode.com/problems/concatenated-words/"
 },
 {
   "id": 244,
   "LeetCode_ID": 336,
   "Name": "Palindrome Pairs",
   "Category": "Tries",
   "Difficulty": "Hard",
   "Problem Name": "Palindrome Pairs",
   "Leetcode URL": "https://leetcode.com/problems/palindrome-pairs/"
 },
 {
   "id": 245,
   "LeetCode_ID": 133,
   "Name": "Clone Graph",
   "Category": "Graph DFS",
   "Difficulty": "Medium",
   "Problem Name": "Clone Graph",
   "Leetcode URL": "https://leetcode.com/problems/clone-graph/"
 },
 {
   "id": 246,
   "LeetCode_ID": 695,
   "Name": "Max Area of Island",
   "Category": "Graph DFS",
   "Difficulty": "Medium",
   "Problem Name": "Max Area of Island",
   "Leetcode URL": "https://leetcode.com/problems/max-area-of-island/"
 },
 {
   "id": 247,
   "LeetCode_ID": 733,
   "Name": "Flood Fill",
   "Category": "Graph DFS",
   "Difficulty": "Easy",
   "Problem Name": "Flood Fill",
   "Leetcode URL": "https://leetcode.com/problems/flood-fill/"
 },
 {
   "id": 248,
   "LeetCode_ID": 797,
   "Name": "All Paths From Source to Target",
   "Category": "Graph DFS",
   "Difficulty": "Medium",
   "Problem Name": "All Paths From Source to Target",
   "Leetcode URL": "https://leetcode.com/problems/all-paths-from-source-to-target/"
 },
 {
   "id": 249,
   "LeetCode_ID": 841,
   "Name": "Keys and Rooms",
   "Category": "Graph DFS",
   "Difficulty": "Medium",
   "Problem Name": "Keys and Rooms",
   "Leetcode URL": "https://leetcode.com/problems/keys-and-rooms/"
 },
 {
   "id": 250,
   "LeetCode_ID": 997,
   "Name": "Find the Town Judge",
   "Category": "Graphs",
   "Difficulty": "Easy",
   "Problem Name": "Find the Town Judge",
   "Leetcode URL": "https://leetcode.com/problems/find-the-town-judge/"
 },
 {
   "id": 251,
   "LeetCode_ID": 1971,
   "Name": "Find if Path Exists in Graph",
   "Category": "Graph BFS",
   "Difficulty": "Easy",
   "Problem Name": "Find if Path Exists in Graph",
   "Leetcode URL": "https://leetcode.com/problems/find-if-path-exists-in-graph/"
 },
 {
   "id": 252,
   "LeetCode_ID": 1466,
   "Name": "Reorder Routes to Make All Paths Lead to the City Zero",
   "Category": "Graph DFS",
   "Difficulty": "Medium",
   "Problem Name": "Reorder Routes to Make All Paths Lead to the City Zero",
   "Leetcode URL": "https://leetcode.com/problems/reorder-routes-to-make-all-paths-lead-to-the-city-zero/"
 },
 {
   "id": 253,
   "LeetCode_ID": 1306,
   "Name": "Jump Game III",
   "Category": "Graph BFS",
   "Difficulty": "Medium",
   "Problem Name": "Jump Game III",
   "Leetcode URL": "https://leetcode.com/problems/jump-game-iii/"
 },
 {
   "id": 254,
   "LeetCode_ID": 690,
   "Name": "Employee Importance",
   "Category": "Graph DFS",
   "Difficulty": "Medium",
   "Problem Name": "Employee Importance",
   "Leetcode URL": "https://leetcode.com/problems/employee-importance/"
 },
 {
   "id": 255,
   "LeetCode_ID": 1267,
   "Name": "Count Servers that Communicate",
   "Category": "Union Find",
   "Difficulty": "Medium",
   "Problem Name": "Count Servers that Communicate",
   "Leetcode URL": "https://leetcode.com/problems/count-servers-that-communicate/"
 },
 {
   "id": 256,
   "LeetCode_ID": 1557,
   "Name": "Minimum Number of Vertices to Reach All Nodes",
   "Category": "Graphs",
   "Difficulty": "Medium",
   "Problem Name": "Minimum Number of Vertices to Reach All Nodes",
   "Leetcode URL": "https://leetcode.com/problems/minimum-number-of-vertices-to-reach-all-nodes/"
 },
 {
   "id": 257,
   "LeetCode_ID": 2192,
   "Name": "All Ancestors of a Node in a Directed Acyclic Graph",
   "Category": "Graph DFS",
   "Difficulty": "Medium",
   "Problem Name": "All Ancestors of a Node in a Directed Acyclic Graph",
   "Leetcode URL": "https://leetcode.com/problems/all-ancestors-of-a-node-in-a-directed-acyclic-graph/"
 },
 {
   "id": 258,
   "LeetCode_ID": 1436,
   "Name": "Destination City",
   "Category": "Graphs",
   "Difficulty": "Easy",
   "Problem Name": "Destination City",
   "Leetcode URL": "https://leetcode.com/problems/destination-city/"
 },
 {
   "id": 259,
   "LeetCode_ID": 1202,
   "Name": "Smallest String With Swaps",
   "Category": "Union Find",
   "Difficulty": "Medium",
   "Problem Name": "Smallest String With Swaps",
   "Leetcode URL": "https://leetcode.com/problems/smallest-string-with-swaps/"
 },
 {
   "id": 260,
   "LeetCode_ID": 200,
   "Name": "Number of Islands",
   "Category": "Graph DFS",
   "Difficulty": "Medium",
   "Problem Name": "Number of Islands",
   "Leetcode URL": "https://leetcode.com/problems/number-of-islands/"
 },
 {
   "id": 261,
   "LeetCode_ID": 1254,
   "Name": "Number of Closed Islands",
   "Category": "Graph DFS",
   "Difficulty": "Medium",
   "Problem Name": "Number of Closed Islands",
   "Leetcode URL": "https://leetcode.com/problems/number-of-closed-islands/"
 },
 {
   "id": 262,
   "LeetCode_ID": 1020,
   "Name": "Number of Enclaves",
   "Category": "Graph DFS",
   "Difficulty": "Medium",
   "Problem Name": "Number of Enclaves",
   "Leetcode URL": "https://leetcode.com/problems/number-of-enclaves/"
 },
 {
   "id": 263,
   "LeetCode_ID": 130,
   "Name": "Surrounded Regions",
   "Category": "Graph DFS",
   "Difficulty": "Medium",
   "Problem Name": "Surrounded Regions",
   "Leetcode URL": "https://leetcode.com/problems/surrounded-regions/"
 },
 {
   "id": 264,
   "LeetCode_ID": 417,
   "Name": "Pacific Atlantic Water Flow",
   "Category": "Graph DFS",
   "Difficulty": "Medium",
   "Problem Name": "Pacific Atlantic Water Flow",
   "Leetcode URL": "https://leetcode.com/problems/pacific-atlantic-water-flow/"
 },
 {
   "id": 265,
   "LeetCode_ID": 1559,
   "Name": "Detect Cycles in 2D Grid",
   "Category": "Graph DFS",
   "Difficulty": "Medium",
   "Problem Name": "Detect Cycles in 2D Grid",
   "Leetcode URL": "https://leetcode.com/problems/detect-cycles-in-2d-grid/"
 },
 {
   "id": 266,
   "LeetCode_ID": 547,
   "Name": "Number of Provinces",
   "Category": "Union Find",
   "Difficulty": "Medium",
   "Problem Name": "Number of Provinces",
   "Leetcode URL": "https://leetcode.com/problems/number-of-provinces/"
 },
 {
   "id": 267,
   "LeetCode_ID": 1376,
   "Name": "Time Needed to Inform All Employees",
   "Category": "Graph DFS",
   "Difficulty": "Medium",
   "Problem Name": "Time Needed to Inform All Employees",
   "Leetcode URL": "https://leetcode.com/problems/time-needed-to-inform-all-employees/"
 },
 {
   "id": 268,
   "LeetCode_ID": 529,
   "Name": "Minesweeper",
   "Category": "Graph DFS",
   "Difficulty": "Medium",
   "Problem Name": "Minesweeper",
   "Leetcode URL": "https://leetcode.com/problems/minesweeper/"
 },
 {
   "id": 269,
   "LeetCode_ID": 994,
   "Name": "Rotting Oranges",
   "Category": "Graph BFS",
   "Difficulty": "Medium",
   "Problem Name": "Rotting Oranges",
   "Leetcode URL": "https://leetcode.com/problems/rotting-oranges/"
 },
 {
   "id": 270,
   "LeetCode_ID": 1091,
   "Name": "Shortest Path in Binary Matrix",
   "Category": "Graph BFS",
   "Difficulty": "Medium",
   "Problem Name": "Shortest Path in Binary Matrix",
   "Leetcode URL": "https://leetcode.com/problems/shortest-path-in-binary-matrix/"
 },
 {
   "id": 271,
   "LeetCode_ID": 934,
   "Name": "Shortest Bridge",
   "Category": "Graph BFS",
   "Difficulty": "Medium",
   "Problem Name": "Shortest Bridge",
   "Leetcode URL": "https://leetcode.com/problems/shortest-bridge/"
 },
 {
   "id": 272,
   "LeetCode_ID": 127,
   "Name": "Word Ladder",
   "Category": "Graph BFS",
   "Difficulty": "Hard",
   "Problem Name": "Word Ladder",
   "Leetcode URL": "https://leetcode.com/problems/word-ladder/"
 },
 {
   "id": 273,
   "LeetCode_ID": 752,
   "Name": "Open the Lock",
   "Category": "Graph BFS",
   "Difficulty": "Medium",
   "Problem Name": "Open the Lock",
   "Leetcode URL": "https://leetcode.com/problems/open-the-lock/"
 },
 {
   "id": 274,
   "LeetCode_ID": 542,
   "Name": "01 Matrix",
   "Category": "Graph BFS",
   "Difficulty": "Medium",
   "Problem Name": "01 Matrix",
   "Leetcode URL": "https://leetcode.com/problems/01-matrix/"
 },
 {
   "id": 275,
   "LeetCode_ID": 1162,
   "Name": "As Far from Land as Possible",
   "Category": "Graph BFS",
   "Difficulty": "Medium",
   "Problem Name": "As Far from Land as Possible",
   "Leetcode URL": "https://leetcode.com/problems/as-far-from-land-as-possible/"
 },
 {
   "id": 276,
   "LeetCode_ID": 909,
   "Name": "Snakes and Ladders",
   "Category": "Graph BFS",
   "Difficulty": "Medium",
   "Problem Name": "Snakes and Ladders",
   "Leetcode URL": "https://leetcode.com/problems/snakes-and-ladders/"
 },
 {
   "id": 277,
   "LeetCode_ID": 1926,
   "Name": "Nearest Exit from Entrance in Maze",
   "Category": "Graph BFS",
   "Difficulty": "Medium",
   "Problem Name": "Nearest Exit from Entrance in Maze",
   "Leetcode URL": "https://leetcode.com/problems/nearest-exit-from-entrance-in-maze/"
 },
 {
   "id": 278,
   "LeetCode_ID": 286,
   "Name": "Walls and Gates",
   "Category": "Graph BFS",
   "Difficulty": "Medium",
   "Problem Name": "Walls and Gates",
   "Leetcode URL": "https://leetcode.com/problems/walls-and-gates/"
 },
 {
   "id": 279,
   "LeetCode_ID": 1730,
   "Name": "Shortest Path to Get Food",
   "Category": "Graph BFS",
   "Difficulty": "Medium",
   "Problem Name": "Shortest Path to Get Food",
   "Leetcode URL": "https://leetcode.com/problems/shortest-path-to-get-food/"
 },
 {
   "id": 280,
   "LeetCode_ID": 433,
   "Name": "Minimum Genetic Mutation",
   "Category": "Graph BFS",
   "Difficulty": "Medium",
   "Problem Name": "Minimum Genetic Mutation",
   "Leetcode URL": "https://leetcode.com/problems/minimum-genetic-mutation/"
 },
 {
   "id": 281,
   "LeetCode_ID": 684,
   "Name": "Redundant Connection",
   "Category": "Union Find",
   "Difficulty": "Medium",
   "Problem Name": "Redundant Connection",
   "Leetcode URL": "https://leetcode.com/problems/redundant-connection/"
 },
 {
   "id": 282,
   "LeetCode_ID": 323,
   "Name": "Number of Connected Components in an Undirected Graph",
   "Category": "Union Find",
   "Difficulty": "Medium",
   "Problem Name": "Number of Connected Components in an Undirected Graph",
   "Leetcode URL": "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/"
 },
 {
   "id": 283,
   "LeetCode_ID": 128,
   "Name": "Longest Consecutive Sequence",
   "Category": "HashMap/HashSet",
   "Difficulty": "Medium",
   "Problem Name": "Longest Consecutive Sequence",
   "Leetcode URL": "https://leetcode.com/problems/longest-consecutive-sequence/"
 },
 {
   "id": 284,
   "LeetCode_ID": 721,
   "Name": "Accounts Merge",
   "Category": "Union Find",
   "Difficulty": "Medium",
   "Problem Name": "Accounts Merge",
   "Leetcode URL": "https://leetcode.com/problems/accounts-merge/"
 },
 {
   "id": 285,
   "LeetCode_ID": 1319,
   "Name": "Number of Operations to Make Network Connected",
   "Category": "Union Find",
   "Difficulty": "Medium",
   "Problem Name": "Number of Operations to Make Network Connected",
   "Leetcode URL": "https://leetcode.com/problems/number-of-operations-to-make-network-connected/"
 },
 {
   "id": 286,
   "LeetCode_ID": 990,
   "Name": "Satisfiability of Equality Equations",
   "Category": "Union Find",
   "Difficulty": "Medium",
   "Problem Name": "Satisfiability of Equality Equations",
   "Leetcode URL": "https://leetcode.com/problems/satisfiability-of-equality-equations/"
 },
 {
   "id": 287,
   "LeetCode_ID": 305,
   "Name": "Number of Islands II",
   "Category": "Union Find",
   "Difficulty": "Hard",
   "Problem Name": "Number of Islands II",
   "Leetcode URL": "https://leetcode.com/problems/number-of-islands-ii/"
 },
 {
   "id": 288,
   "LeetCode_ID": 839,
   "Name": "Similar String Groups",
   "Category": "Union Find",
   "Difficulty": "Hard",
   "Problem Name": "Similar String Groups",
   "Leetcode URL": "https://leetcode.com/problems/similar-string-groups/"
 },
 {
   "id": 289,
   "LeetCode_ID": 261,
   "Name": "Graph Valid Tree",
   "Category": "Union Find",
   "Difficulty": "Medium",
   "Problem Name": "Graph Valid Tree",
   "Leetcode URL": "https://leetcode.com/problems/graph-valid-tree/"
 },
 {
   "id": 290,
   "LeetCode_ID": 886,
   "Name": "Possible Bipartition",
   "Category": "Graph BFS",
   "Difficulty": "Medium",
   "Problem Name": "Possible Bipartition",
   "Leetcode URL": "https://leetcode.com/problems/possible-bipartition/"
 },
 {
   "id": 291,
   "LeetCode_ID": 1135,
   "Name": "Connecting Cities With Minimum Cost",
   "Category": "Heap/Priority Queue",
   "Difficulty": "Medium",
   "Problem Name": "Connecting Cities With Minimum Cost",
   "Leetcode URL": "https://leetcode.com/problems/connecting-cities-with-minimum-cost/"
 },
 {
   "id": 292,
   "LeetCode_ID": 207,
   "Name": "Course Schedule",
   "Category": "Topological Sort",
   "Difficulty": "Medium",
   "Problem Name": "Course Schedule",
   "Leetcode URL": "https://leetcode.com/problems/course-schedule/"
 },
 {
   "id": 293,
   "LeetCode_ID": 210,
   "Name": "Course Schedule II",
   "Category": "Topological Sort",
   "Difficulty": "Medium",
   "Problem Name": "Course Schedule II",
   "Leetcode URL": "https://leetcode.com/problems/course-schedule-ii/"
 },
 {
   "id": 294,
   "LeetCode_ID": 269,
   "Name": "Alien Dictionary",
   "Category": "Topological Sort",
   "Difficulty": "Hard",
   "Problem Name": "Alien Dictionary",
   "Leetcode URL": "https://leetcode.com/problems/alien-dictionary/"
 },
 {
   "id": 295,
   "LeetCode_ID": 329,
   "Name": "Longest Increasing Path in a Matrix",
   "Category": "Dynamic Programming",
   "Difficulty": "Hard",
   "Problem Name": "Longest Increasing Path in a Matrix",
   "Leetcode URL": "https://leetcode.com/problems/longest-increasing-path-in-a-matrix/"
 },
 {
   "id": 296,
   "LeetCode_ID": 444,
   "Name": "Sequence Reconstruction",
   "Category": "Topological Sort",
   "Difficulty": "Medium",
   "Problem Name": "Sequence Reconstruction",
   "Leetcode URL": "https://leetcode.com/problems/sequence-reconstruction/"
 },
 {
   "id": 297,
   "LeetCode_ID": 310,
   "Name": "Minimum Height Trees",
   "Category": "Graph BFS",
   "Difficulty": "Medium",
   "Problem Name": "Minimum Height Trees",
   "Leetcode URL": "https://leetcode.com/problems/minimum-height-trees/"
 },
 {
   "id": 298,
   "LeetCode_ID": 802,
   "Name": "Find Eventual Safe States",
   "Category": "Graph DFS",
   "Difficulty": "Medium",
   "Problem Name": "Find Eventual Safe States",
   "Leetcode URL": "https://leetcode.com/problems/find-eventual-safe-states/"
 },
 {
   "id": 299,
   "LeetCode_ID": 1203,
   "Name": "Sort Items by Groups Respecting Dependencies",
   "Category": "Topological Sort",
   "Difficulty": "Hard",
   "Problem Name": "Sort Items by Groups Respecting Dependencies",
   "Leetcode URL": "https://leetcode.com/problems/sort-items-by-groups-respecting-dependencies/"
 },
 {
   "id": 300,
   "LeetCode_ID": 2050,
   "Name": "Parallel Courses III",
   "Category": "Dynamic Programming",
   "Difficulty": "Hard",
   "Problem Name": "Parallel Courses III",
   "Leetcode URL": "https://leetcode.com/problems/parallel-courses-iii/"
 },
 {
   "id": 301,
   "LeetCode_ID": 1136,
   "Name": "Parallel Courses",
   "Category": "Topological Sort",
   "Difficulty": "Medium",
   "Problem Name": "Parallel Courses",
   "Leetcode URL": "https://leetcode.com/problems/parallel-courses/"
 },
 {
   "id": 302,
   "LeetCode_ID": 1462,
   "Name": "Course Schedule IV",
   "Category": "Graph DFS",
   "Difficulty": "Medium",
   "Problem Name": "Course Schedule IV",
   "Leetcode URL": "https://leetcode.com/problems/course-schedule-iv/"
 },
 {
   "id": 303,
   "LeetCode_ID": 1857,
   "Name": "Largest Color Value in a Directed Graph",
   "Category": "Topological Sort",
   "Difficulty": "Hard",
   "Problem Name": "Largest Color Value in a Directed Graph",
   "Leetcode URL": "https://leetcode.com/problems/largest-color-value-in-a-directed-graph/"
 },
 {
   "id": 304,
   "LeetCode_ID": 1059,
   "Name": "All Paths from Source Lead to Destination",
   "Category": "Graph DFS",
   "Difficulty": "Medium",
   "Problem Name": "All Paths from Source Lead to Destination",
   "Leetcode URL": "https://leetcode.com/problems/all-paths-from-source-lead-to-destination/"
 },
 {
   "id": 305,
   "LeetCode_ID": 2392,
   "Name": "Build a Matrix With Conditions",
   "Category": "Topological Sort",
   "Difficulty": "Hard",
   "Problem Name": "Build a Matrix With Conditions",
   "Leetcode URL": "https://leetcode.com/problems/build-a-matrix-with-conditions/"
 },
 {
   "id": 306,
   "LeetCode_ID": 743,
   "Name": "Network Delay Time",
   "Category": "Shortest Path",
   "Difficulty": "Medium",
   "Problem Name": "Network Delay Time",
   "Leetcode URL": "https://leetcode.com/problems/network-delay-time/"
 },
 {
   "id": 307,
   "LeetCode_ID": 1631,
   "Name": "Path With Minimum Effort",
   "Category": "Shortest Path",
   "Difficulty": "Medium",
   "Problem Name": "Path With Minimum Effort",
   "Leetcode URL": "https://leetcode.com/problems/path-with-minimum-effort/"
 },
 {
   "id": 308,
   "LeetCode_ID": 787,
   "Name": "Cheapest Flights Within K Stops",
   "Category": "Shortest Path",
   "Difficulty": "Medium",
   "Problem Name": "Cheapest Flights Within K Stops",
   "Leetcode URL": "https://leetcode.com/problems/cheapest-flights-within-k-stops/"
 },
 {
   "id": 309,
   "LeetCode_ID": 1514,
   "Name": "Path with Maximum Probability",
   "Category": "Shortest Path",
   "Difficulty": "Medium",
   "Problem Name": "Path with Maximum Probability",
   "Leetcode URL": "https://leetcode.com/problems/path-with-maximum-probability/"
 },
 {
   "id": 310,
   "LeetCode_ID": 1334,
   "Name": "Find the City With the Smallest Number of Neighbors at a Threshold Distance",
   "Category": "Shortest Path",
   "Difficulty": "Medium",
   "Problem Name": "Find the City With the Smallest Number of Neighbors at a Threshold Distance",
   "Leetcode URL": "https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/"
 },
 {
   "id": 311,
   "LeetCode_ID": 1976,
   "Name": "Number of Ways to Arrive at Destination",
   "Category": "Shortest Path",
   "Difficulty": "Medium",
   "Problem Name": "Number of Ways to Arrive at Destination",
   "Leetcode URL": "https://leetcode.com/problems/number-of-ways-to-arrive-at-destination/"
 },
 {
   "id": 312,
   "LeetCode_ID": 1368,
   "Name": "Minimum Cost to Make at Least One Valid Path in a Grid",
   "Category": "Shortest Path",
   "Difficulty": "Hard",
   "Problem Name": "Minimum Cost to Make at Least One Valid Path in a Grid",
   "Leetcode URL": "https://leetcode.com/problems/minimum-cost-to-make-at-least-one-valid-path-in-a-grid/"
 },
 {
   "id": 313,
   "LeetCode_ID": 399,
   "Name": "Evaluate Division",
   "Category": "Graph DFS",
   "Difficulty": "Medium",
   "Problem Name": "Evaluate Division",
   "Leetcode URL": "https://leetcode.com/problems/evaluate-division/"
 },
 {
   "id": 314,
   "LeetCode_ID": 505,
   "Name": "The Maze II",
   "Category": "Shortest Path",
   "Difficulty": "Medium",
   "Problem Name": "The Maze II",
   "Leetcode URL": "https://leetcode.com/problems/the-maze-ii/"
 },
 {
   "id": 315,
   "LeetCode_ID": 1786,
   "Name": "Number of Restricted Paths From First to Last Node",
   "Category": "Shortest Path",
   "Difficulty": "Medium",
   "Problem Name": "Number of Restricted Paths From First to Last Node",
   "Leetcode URL": "https://leetcode.com/problems/number-of-restricted-paths-from-first-to-last-node/"
 },
 {
   "id": 316,
   "LeetCode_ID": 2290,
   "Name": "Minimum Obstacle Removal to Reach Corner",
   "Category": "Shortest Path",
   "Difficulty": "Hard",
   "Problem Name": "Minimum Obstacle Removal to Reach Corner",
   "Leetcode URL": "https://leetcode.com/problems/minimum-obstacle-removal-to-reach-corner/"
 },
 {
   "id": 317,
   "LeetCode_ID": 1928,
   "Name": "Minimum Cost to Reach Destination in Time",
   "Category": "Shortest Path",
   "Difficulty": "Hard",
   "Problem Name": "Minimum Cost to Reach Destination in Time",
   "Leetcode URL": "https://leetcode.com/problems/minimum-cost-to-reach-destination-in-time/"
 },
 {
   "id": 318,
   "LeetCode_ID": 1293,
   "Name": "Shortest Path in a Grid with Obstacles Elimination",
   "Category": "Shortest Path",
   "Difficulty": "Hard",
   "Problem Name": "Shortest Path in a Grid with Obstacles Elimination",
   "Leetcode URL": "https://leetcode.com/problems/shortest-path-in-a-grid-with-obstacles-elimination/"
 },
 {
   "id": 319,
   "LeetCode_ID": 2577,
   "Name": "Minimum Time to Visit a Cell In a Grid",
   "Category": "Shortest Path",
   "Difficulty": "Medium",
   "Problem Name": "Minimum Time to Visit a Cell In a Grid",
   "Leetcode URL": "https://leetcode.com/problems/minimum-time-to-visit-a-cell-in-a-grid/"
 },
 {
   "id": 320,
   "LeetCode_ID": 1129,
   "Name": "Shortest Path with Alternating Colors",
   "Category": "Shortest Path",
   "Difficulty": "Medium",
   "Problem Name": "Shortest Path with Alternating Colors",
   "Leetcode URL": "https://leetcode.com/problems/shortest-path-with-alternating-colors/"
 },
 {
   "id": 321,
   "LeetCode_ID": 455,
   "Name": "Assign Cookies",
   "Category": "Greedy",
   "Difficulty": "Easy",
   "Problem Name": "Assign Cookies",
   "Leetcode URL": "https://leetcode.com/problems/assign-cookies/"
 },
 {
   "id": 322,
   "LeetCode_ID": 55,
   "Name": "Jump Game",
   "Category": "Greedy",
   "Difficulty": "Medium",
   "Problem Name": "Jump Game",
   "Leetcode URL": "https://leetcode.com/problems/jump-game/"
 },
 {
   "id": 323,
   "LeetCode_ID": 45,
   "Name": "Jump Game II",
   "Category": "Greedy",
   "Difficulty": "Medium",
   "Problem Name": "Jump Game II",
   "Leetcode URL": "https://leetcode.com/problems/jump-game-ii/"
 },
 {
   "id": 324,
   "LeetCode_ID": 134,
   "Name": "Gas Station",
   "Category": "Greedy",
   "Difficulty": "Medium",
   "Problem Name": "Gas Station",
   "Leetcode URL": "https://leetcode.com/problems/gas-station/"
 },
 {
   "id": 325,
   "LeetCode_ID": 122,
   "Name": "Best Time to Buy and Sell Stock II",
   "Category": "Greedy",
   "Difficulty": "Easy",
   "Problem Name": "Best Time to Buy and Sell Stock II",
   "Leetcode URL": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/"
 },
 {
   "id": 326,
   "LeetCode_ID": 452,
   "Name": "Minimum Number of Arrows to Burst Balloons",
   "Category": "Greedy",
   "Difficulty": "Medium",
   "Problem Name": "Minimum Number of Arrows to Burst Balloons",
   "Leetcode URL": "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/"
 },
 {
   "id": 327,
   "LeetCode_ID": 1029,
   "Name": "Two City Scheduling",
   "Category": "Greedy",
   "Difficulty": "Medium",
   "Problem Name": "Two City Scheduling",
   "Leetcode URL": "https://leetcode.com/problems/two-city-scheduling/"
 },
 {
   "id": 328,
   "LeetCode_ID": 763,
   "Name": "Partition Labels",
   "Category": "Greedy",
   "Difficulty": "Medium",
   "Problem Name": "Partition Labels",
   "Leetcode URL": "https://leetcode.com/problems/partition-labels/"
 },
 {
   "id": 329,
   "LeetCode_ID": 1094,
   "Name": "Car Pooling",
   "Category": "Prefix Sum",
   "Difficulty": "Medium",
   "Problem Name": "Car Pooling",
   "Leetcode URL": "https://leetcode.com/problems/car-pooling/"
 },
 {
   "id": 330,
   "LeetCode_ID": 1710,
   "Name": "Maximum Units on a Truck",
   "Category": "Greedy",
   "Difficulty": "Easy",
   "Problem Name": "Maximum Units on a Truck",
   "Leetcode URL": "https://leetcode.com/problems/maximum-units-on-a-truck/"
 },
 {
   "id": 331,
   "LeetCode_ID": 881,
   "Name": "Boats to Save People",
   "Category": "Two Pointers",
   "Difficulty": "Medium",
   "Problem Name": "Boats to Save People",
   "Leetcode URL": "https://leetcode.com/problems/boats-to-save-people/"
 },
 {
   "id": 332,
   "LeetCode_ID": 1405,
   "Name": "Longest Happy String",
   "Category": "Greedy",
   "Difficulty": "Medium",
   "Problem Name": "Longest Happy String",
   "Leetcode URL": "https://leetcode.com/problems/longest-happy-string/"
 },
 {
   "id": 333,
   "LeetCode_ID": 135,
   "Name": "Candy",
   "Category": "Greedy",
   "Difficulty": "Hard",
   "Problem Name": "Candy",
   "Leetcode URL": "https://leetcode.com/problems/candy/"
 },
 {
   "id": 334,
   "LeetCode_ID": 630,
   "Name": "Course Schedule III",
   "Category": "Greedy",
   "Difficulty": "Hard",
   "Problem Name": "Course Schedule III",
   "Leetcode URL": "https://leetcode.com/problems/course-schedule-iii/"
 },
 {
   "id": 335,
   "LeetCode_ID": 139,
   "Name": "Word Break",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "Word Break",
   "Leetcode URL": "https://leetcode.com/problems/word-break/"
 },
 {
   "id": 336,
   "LeetCode_ID": 322,
   "Name": "Coin Change",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "Coin Change",
   "Leetcode URL": "https://leetcode.com/problems/coin-change/"
 },
 {
   "id": 337,
   "LeetCode_ID": 198,
   "Name": "House Robber",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "House Robber",
   "Leetcode URL": "https://leetcode.com/problems/house-robber/"
 },
 {
   "id": 338,
   "LeetCode_ID": 91,
   "Name": "Decode Ways",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "Decode Ways",
   "Leetcode URL": "https://leetcode.com/problems/decode-ways/"
 },
 {
   "id": 339,
   "LeetCode_ID": 62,
   "Name": "Unique Paths",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "Unique Paths",
   "Leetcode URL": "https://leetcode.com/problems/unique-paths/"
 },
 {
   "id": 340,
   "LeetCode_ID": 300,
   "Name": "Longest Increasing Subsequence",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "Longest Increasing Subsequence",
   "Leetcode URL": "https://leetcode.com/problems/longest-increasing-subsequence/"
 },
 {
   "id": 341,
   "LeetCode_ID": 416,
   "Name": "Partition Equal Subset Sum",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "Partition Equal Subset Sum",
   "Leetcode URL": "https://leetcode.com/problems/partition-equal-subset-sum/"
 },
 {
   "id": 342,
   "LeetCode_ID": 1143,
   "Name": "Longest Common Subsequence",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "Longest Common Subsequence",
   "Leetcode URL": "https://leetcode.com/problems/longest-common-subsequence/"
 },
 {
   "id": 343,
   "LeetCode_ID": 518,
   "Name": "Coin Change 2",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "Coin Change 2",
   "Leetcode URL": "https://leetcode.com/problems/coin-change-2/"
 },
 {
   "id": 344,
   "LeetCode_ID": 72,
   "Name": "Edit Distance",
   "Category": "Dynamic Programming",
   "Difficulty": "Hard",
   "Problem Name": "Edit Distance",
   "Leetcode URL": "https://leetcode.com/problems/edit-distance/"
 },
 {
   "id": 345,
   "LeetCode_ID": 120,
   "Name": "Triangle",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "Triangle",
   "Leetcode URL": "https://leetcode.com/problems/triangle/"
 },
 {
   "id": 346,
   "LeetCode_ID": 123,
   "Name": "Best Time to Buy and Sell Stock III",
   "Category": "Dynamic Programming",
   "Difficulty": "Hard",
   "Problem Name": "Best Time to Buy and Sell Stock III",
   "Leetcode URL": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/"
 },
 {
   "id": 347,
   "LeetCode_ID": 312,
   "Name": "Burst Balloons",
   "Category": "Dynamic Programming",
   "Difficulty": "Hard",
   "Problem Name": "Burst Balloons",
   "Leetcode URL": "https://leetcode.com/problems/burst-balloons/"
 },
 {
   "id": 348,
   "LeetCode_ID": 746,
   "Name": "Min Cost Climbing Stairs",
   "Category": "Dynamic Programming",
   "Difficulty": "Easy",
   "Problem Name": "Min Cost Climbing Stairs",
   "Leetcode URL": "https://leetcode.com/problems/min-cost-climbing-stairs/"
 },
 {
   "id": 349,
   "LeetCode_ID": 213,
   "Name": "House Robber II",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "House Robber II",
   "Leetcode URL": "https://leetcode.com/problems/house-robber-ii/"
 },
 {
   "id": 350,
   "LeetCode_ID": 740,
   "Name": "Delete and Earn",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "Delete and Earn",
   "Leetcode URL": "https://leetcode.com/problems/delete-and-earn/"
 },
 {
   "id": 351,
   "LeetCode_ID": 413,
   "Name": "Arithmetic Slices",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "Arithmetic Slices",
   "Leetcode URL": "https://leetcode.com/problems/arithmetic-slices/"
 },
 {
   "id": 352,
   "LeetCode_ID": 338,
   "Name": "Counting Bits",
   "Category": "Dynamic Programming",
   "Difficulty": "Easy",
   "Problem Name": "Counting Bits",
   "Leetcode URL": "https://leetcode.com/problems/counting-bits/"
 },
 {
   "id": 353,
   "LeetCode_ID": 983,
   "Name": "Minimum Cost For Tickets",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "Minimum Cost For Tickets",
   "Leetcode URL": "https://leetcode.com/problems/minimum-cost-for-tickets/"
 },
 {
   "id": 354,
   "LeetCode_ID": 1155,
   "Name": "Number of Dice Rolls With Target Sum",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "Number of Dice Rolls With Target Sum",
   "Leetcode URL": "https://leetcode.com/problems/number-of-dice-rolls-with-target-sum/"
 },
 {
   "id": 355,
   "LeetCode_ID": 279,
   "Name": "Perfect Squares",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "Perfect Squares",
   "Leetcode URL": "https://leetcode.com/problems/perfect-squares/"
 },
 {
   "id": 356,
   "LeetCode_ID": 673,
   "Name": "Number of Longest Increasing Subsequence",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "Number of Longest Increasing Subsequence",
   "Leetcode URL": "https://leetcode.com/problems/number-of-longest-increasing-subsequence/"
 },
 {
   "id": 357,
   "LeetCode_ID": 152,
   "Name": "Maximum Product Subarray",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "Maximum Product Subarray",
   "Leetcode URL": "https://leetcode.com/problems/maximum-product-subarray/"
 },
 {
   "id": 358,
   "LeetCode_ID": 918,
   "Name": "Maximum Sum Circular Subarray",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "Maximum Sum Circular Subarray",
   "Leetcode URL": "https://leetcode.com/problems/maximum-sum-circular-subarray/"
 },
 {
   "id": 359,
   "LeetCode_ID": 309,
   "Name": "Best Time to Buy and Sell Stock with Cooldown",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "Best Time to Buy and Sell Stock with Cooldown",
   "Leetcode URL": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/"
 },
 {
   "id": 360,
   "LeetCode_ID": 714,
   "Name": "Best Time to Buy and Sell Stock with Transaction Fee",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "Best Time to Buy and Sell Stock with Transaction Fee",
   "Leetcode URL": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/"
 },
 {
   "id": 361,
   "LeetCode_ID": 376,
   "Name": "Wiggle Subsequence",
   "Category": "Greedy",
   "Difficulty": "Medium",
   "Problem Name": "Wiggle Subsequence",
   "Leetcode URL": "https://leetcode.com/problems/wiggle-subsequence/"
 },
 {
   "id": 362,
   "LeetCode_ID": 343,
   "Name": "Integer Break",
   "Category": "Math & Geometry",
   "Difficulty": "Medium",
   "Problem Name": "Integer Break",
   "Leetcode URL": "https://leetcode.com/problems/integer-break/"
 },
 {
   "id": 363,
   "LeetCode_ID": 10,
   "Name": "Regular Expression Matching",
   "Category": "Dynamic Programming",
   "Difficulty": "Hard",
   "Problem Name": "Regular Expression Matching",
   "Leetcode URL": "https://leetcode.com/problems/regular-expression-matching/"
 },
 {
   "id": 364,
   "LeetCode_ID": 44,
   "Name": "Wildcard Matching",
   "Category": "Dynamic Programming",
   "Difficulty": "Hard",
   "Problem Name": "Wildcard Matching",
   "Leetcode URL": "https://leetcode.com/problems/wildcard-matching/"
 },
 {
   "id": 365,
   "LeetCode_ID": 115,
   "Name": "Distinct Subsequences",
   "Category": "Dynamic Programming",
   "Difficulty": "Hard",
   "Problem Name": "Distinct Subsequences",
   "Leetcode URL": "https://leetcode.com/problems/distinct-subsequences/"
 },
 {
   "id": 366,
   "LeetCode_ID": 516,
   "Name": "Longest Palindromic Subsequence",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "Longest Palindromic Subsequence",
   "Leetcode URL": "https://leetcode.com/problems/longest-palindromic-subsequence/"
 },
 {
   "id": 367,
   "LeetCode_ID": 64,
   "Name": "Minimum Path Sum",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "Minimum Path Sum",
   "Leetcode URL": "https://leetcode.com/problems/minimum-path-sum/"
 },
 {
   "id": 368,
   "LeetCode_ID": 63,
   "Name": "Unique Paths II",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "Unique Paths II",
   "Leetcode URL": "https://leetcode.com/problems/unique-paths-ii/"
 },
 {
   "id": 369,
   "LeetCode_ID": 221,
   "Name": "Maximal Square",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "Maximal Square",
   "Leetcode URL": "https://leetcode.com/problems/maximal-square/"
 },
 {
   "id": 370,
   "LeetCode_ID": 85,
   "Name": "Maximal Rectangle",
   "Category": "Monotonic Stack/Queue",
   "Difficulty": "Hard",
   "Problem Name": "Maximal Rectangle",
   "Leetcode URL": "https://leetcode.com/problems/maximal-rectangle/"
 },
 {
   "id": 371,
   "LeetCode_ID": 174,
   "Name": "Dungeon Game",
   "Category": "Dynamic Programming",
   "Difficulty": "Hard",
   "Problem Name": "Dungeon Game",
   "Leetcode URL": "https://leetcode.com/problems/dungeon-game/"
 },
 {
   "id": 372,
   "LeetCode_ID": 741,
   "Name": "Cherry Pickup",
   "Category": "Dynamic Programming",
   "Difficulty": "Hard",
   "Problem Name": "Cherry Pickup",
   "Leetcode URL": "https://leetcode.com/problems/cherry-pickup/"
 },
 {
   "id": 373,
   "LeetCode_ID": 188,
   "Name": "Best Time to Buy and Sell Stock IV",
   "Category": "Dynamic Programming",
   "Difficulty": "Hard",
   "Problem Name": "Best Time to Buy and Sell Stock IV",
   "Leetcode URL": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/"
 },
 {
   "id": 374,
   "LeetCode_ID": 307,
   "Name": "Range Sum Query - Mutable",
   "Category": "Segment Trees",
   "Difficulty": "Medium",
   "Problem Name": "Range Sum Query - Mutable",
   "Leetcode URL": "https://leetcode.com/problems/range-sum-query-mutable/"
 },
 {
   "id": 375,
   "LeetCode_ID": 315,
   "Name": "Count of Smaller Numbers After Self",
   "Category": "Segment Trees",
   "Difficulty": "Hard",
   "Problem Name": "Count of Smaller Numbers After Self",
   "Leetcode URL": "https://leetcode.com/problems/count-of-smaller-numbers-after-self/"
 },
 {
   "id": 376,
   "LeetCode_ID": 732,
   "Name": "My Calendar III",
   "Category": "Intervals",
   "Difficulty": "Hard",
   "Problem Name": "My Calendar III",
   "Leetcode URL": "https://leetcode.com/problems/my-calendar-iii/"
 },
 {
   "id": 377,
   "LeetCode_ID": 715,
   "Name": "Range Module",
   "Category": "Segment Trees",
   "Difficulty": "Hard",
   "Problem Name": "Range Module",
   "Leetcode URL": "https://leetcode.com/problems/range-module/"
 },
 {
   "id": 378,
   "LeetCode_ID": 493,
   "Name": "Reverse Pairs",
   "Category": "Divide and Conquer",
   "Difficulty": "Hard",
   "Problem Name": "Reverse Pairs",
   "Leetcode URL": "https://leetcode.com/problems/reverse-pairs/"
 },
 {
   "id": 379,
   "LeetCode_ID": 308,
   "Name": "Range Sum Query 2D - Mutable",
   "Category": "Segment Trees",
   "Difficulty": "Hard",
   "Problem Name": "Range Sum Query 2D - Mutable",
   "Leetcode URL": "https://leetcode.com/problems/range-sum-query-2d-mutable/"
 },
 {
   "id": 380,
   "LeetCode_ID": 699,
   "Name": "Falling Squares",
   "Category": "Segment Trees",
   "Difficulty": "Hard",
   "Problem Name": "Falling Squares",
   "Leetcode URL": "https://leetcode.com/problems/falling-squares/"
 },
 {
   "id": 381,
   "LeetCode_ID": 327,
   "Name": "Count of Range Sum",
   "Category": "Divide and Conquer",
   "Difficulty": "Hard",
   "Problem Name": "Count of Range Sum",
   "Leetcode URL": "https://leetcode.com/problems/count-of-range-sum/"
 },
 {
   "id": 382,
   "LeetCode_ID": 850,
   "Name": "Rectangle Area II",
   "Category": "Segment Trees",
   "Difficulty": "Hard",
   "Problem Name": "Rectangle Area II",
   "Leetcode URL": "https://leetcode.com/problems/rectangle-area-ii/"
 },
 {
   "id": 383,
   "LeetCode_ID": 2407,
   "Name": "Longest Increasing Subsequence II",
   "Category": "Segment Trees",
   "Difficulty": "Hard",
   "Problem Name": "Longest Increasing Subsequence II",
   "Leetcode URL": "https://leetcode.com/problems/longest-increasing-subsequence-ii/"
 },
 {
   "id": 384,
   "LeetCode_ID": 1649,
   "Name": "Create Sorted Array through Instructions",
   "Category": "Segment Trees",
   "Difficulty": "Hard",
   "Problem Name": "Create Sorted Array through Instructions",
   "Leetcode URL": "https://leetcode.com/problems/create-sorted-array-through-instructions/"
 },
 {
   "id": 385,
   "LeetCode_ID": 2158,
   "Name": "Amount of New Area Painted Each Day",
   "Category": "Segment Trees",
   "Difficulty": "Hard",
   "Problem Name": "Amount of New Area Painted Each Day",
   "Leetcode URL": "https://leetcode.com/problems/amount-of-new-area-painted-each-day/"
 },
 {
   "id": 386,
   "LeetCode_ID": 1157,
   "Name": "Online Majority Element In Subarray",
   "Category": "Segment Trees",
   "Difficulty": "Hard",
   "Problem Name": "Online Majority Element In Subarray",
   "Leetcode URL": "https://leetcode.com/problems/online-majority-element-in-subarray/"
 },
 {
   "id": 387,
   "LeetCode_ID": 56,
   "Name": "Merge Intervals",
   "Category": "Intervals",
   "Difficulty": "Medium",
   "Problem Name": "Merge Intervals",
   "Leetcode URL": "https://leetcode.com/problems/merge-intervals/"
 },
 {
   "id": 388,
   "LeetCode_ID": 57,
   "Name": "Insert Interval",
   "Category": "Intervals",
   "Difficulty": "Medium",
   "Problem Name": "Insert Interval",
   "Leetcode URL": "https://leetcode.com/problems/insert-interval/"
 },
 {
   "id": 389,
   "LeetCode_ID": 252,
   "Name": "Meeting Rooms",
   "Category": "Intervals",
   "Difficulty": "Easy",
   "Problem Name": "Meeting Rooms",
   "Leetcode URL": "https://leetcode.com/problems/meeting-rooms/"
 },
 {
   "id": 390,
   "LeetCode_ID": 435,
   "Name": "Non-overlapping Intervals",
   "Category": "Intervals",
   "Difficulty": "Medium",
   "Problem Name": "Non-overlapping Intervals",
   "Leetcode URL": "https://leetcode.com/problems/non-overlapping-intervals/"
 },
 {
   "id": 391,
   "LeetCode_ID": 1288,
   "Name": "Remove Covered Intervals",
   "Category": "Intervals",
   "Difficulty": "Medium",
   "Problem Name": "Remove Covered Intervals",
   "Leetcode URL": "https://leetcode.com/problems/remove-covered-intervals/"
 },
 {
   "id": 392,
   "LeetCode_ID": 986,
   "Name": "Interval List Intersections",
   "Category": "Intervals",
   "Difficulty": "Medium",
   "Problem Name": "Interval List Intersections",
   "Leetcode URL": "https://leetcode.com/problems/interval-list-intersections/"
 },
 {
   "id": 393,
   "LeetCode_ID": 759,
   "Name": "Employee Free Time",
   "Category": "Intervals",
   "Difficulty": "Hard",
   "Problem Name": "Employee Free Time",
   "Leetcode URL": "https://leetcode.com/problems/employee-free-time/"
 },
 {
   "id": 394,
   "LeetCode_ID": 1235,
   "Name": "Maximum Profit in Job Scheduling",
   "Category": "Dynamic Programming",
   "Difficulty": "Hard",
   "Problem Name": "Maximum Profit in Job Scheduling",
   "Leetcode URL": "https://leetcode.com/problems/maximum-profit-in-job-scheduling/"
 },
 {
   "id": 395,
   "LeetCode_ID": 1229,
   "Name": "Meeting Scheduler",
   "Category": "Intervals",
   "Difficulty": "Medium",
   "Problem Name": "Meeting Scheduler",
   "Leetcode URL": "https://leetcode.com/problems/meeting-scheduler/"
 },
 {
   "id": 396,
   "LeetCode_ID": 1024,
   "Name": "Video Stitching",
   "Category": "Intervals",
   "Difficulty": "Medium",
   "Problem Name": "Video Stitching",
   "Leetcode URL": "https://leetcode.com/problems/video-stitching/"
 },
 {
   "id": 397,
   "LeetCode_ID": 136,
   "Name": "Single Number",
   "Category": "Bit Manipulation",
   "Difficulty": "Easy",
   "Problem Name": "Single Number",
   "Leetcode URL": "https://leetcode.com/problems/single-number/"
 },
 {
   "id": 398,
   "LeetCode_ID": 191,
   "Name": "Number of 1 Bits",
   "Category": "Bit Manipulation",
   "Difficulty": "Easy",
   "Problem Name": "Number of 1 Bits",
   "Leetcode URL": "https://leetcode.com/problems/number-of-1-bits/"
 },
 {
   "id": 399,
   "LeetCode_ID": 190,
   "Name": "Reverse Bits",
   "Category": "Bit Manipulation",
   "Difficulty": "Easy",
   "Problem Name": "Reverse Bits",
   "Leetcode URL": "https://leetcode.com/problems/reverse-bits/"
 },
 {
   "id": 400,
   "LeetCode_ID": 371,
   "Name": "Sum of Two Integers",
   "Category": "Bit Manipulation",
   "Difficulty": "Medium",
   "Problem Name": "Sum of Two Integers",
   "Leetcode URL": "https://leetcode.com/problems/sum-of-two-integers/"
 },
 {
   "id": 401,
   "LeetCode_ID": 137,
   "Name": "Single Number II",
   "Category": "Bit Manipulation",
   "Difficulty": "Medium",
   "Problem Name": "Single Number II",
   "Leetcode URL": "https://leetcode.com/problems/single-number-ii/"
 },
 {
   "id": 402,
   "LeetCode_ID": 260,
   "Name": "Single Number III",
   "Category": "Bit Manipulation",
   "Difficulty": "Medium",
   "Problem Name": "Single Number III",
   "Leetcode URL": "https://leetcode.com/problems/single-number-iii/"
 },
 {
   "id": 403,
   "LeetCode_ID": 201,
   "Name": "Bitwise AND of Numbers Range",
   "Category": "Bit Manipulation",
   "Difficulty": "Medium",
   "Problem Name": "Bitwise AND of Numbers Range",
   "Leetcode URL": "https://leetcode.com/problems/bitwise-and-of-numbers-range/"
 },
 {
   "id": 404,
   "LeetCode_ID": 231,
   "Name": "Power of Two",
   "Category": "Bit Manipulation",
   "Difficulty": "Easy",
   "Problem Name": "Power of Two",
   "Leetcode URL": "https://leetcode.com/problems/power-of-two/"
 },
 {
   "id": 405,
   "LeetCode_ID": 1009,
   "Name": "Complement of Base 10 Integer",
   "Category": "Bit Manipulation",
   "Difficulty": "Easy",
   "Problem Name": "Complement of Base 10 Integer",
   "Leetcode URL": "https://leetcode.com/problems/complement-of-base-10-integer/"
 },
 {
   "id": 406,
   "LeetCode_ID": 421,
   "Name": "Maximum XOR of Two Numbers in an Array",
   "Category": "Tries",
   "Difficulty": "Medium",
   "Problem Name": "Maximum XOR of Two Numbers in an Array",
   "Leetcode URL": "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/"
 },
 {
   "id": 407,
   "LeetCode_ID": 1342,
   "Name": "Number of Steps to Reduce a Number to Zero",
   "Category": "Bit Manipulation",
   "Difficulty": "Easy",
   "Problem Name": "Number of Steps to Reduce a Number to Zero",
   "Leetcode URL": "https://leetcode.com/problems/number-of-steps-to-reduce-a-number-to-zero/"
 },
 {
   "id": 408,
   "LeetCode_ID": 1720,
   "Name": "Decode XORed Array",
   "Category": "Bit Manipulation",
   "Difficulty": "Easy",
   "Problem Name": "Decode XORed Array",
   "Leetcode URL": "https://leetcode.com/problems/decode-xored-array/"
 },
 {
   "id": 409,
   "LeetCode_ID": 204,
   "Name": "Count Primes",
   "Category": "Math & Geometry",
   "Difficulty": "Medium",
   "Problem Name": "Count Primes",
   "Leetcode URL": "https://leetcode.com/problems/count-primes/"
 },
 {
   "id": 410,
   "LeetCode_ID": 43,
   "Name": "Multiply Strings",
   "Category": "Math & Geometry",
   "Difficulty": "Medium",
   "Problem Name": "Multiply Strings",
   "Leetcode URL": "https://leetcode.com/problems/multiply-strings/"
 },
 {
   "id": 411,
   "LeetCode_ID": 13,
   "Name": "Roman to Integer",
   "Category": "HashMap/HashSet",
   "Difficulty": "Easy",
   "Problem Name": "Roman to Integer",
   "Leetcode URL": "https://leetcode.com/problems/roman-to-integer/"
 },
 {
   "id": 412,
   "LeetCode_ID": 12,
   "Name": "Integer to Roman",
   "Category": "String Manipulation",
   "Difficulty": "Medium",
   "Problem Name": "Integer to Roman",
   "Leetcode URL": "https://leetcode.com/problems/integer-to-roman/"
 },
 {
   "id": 413,
   "LeetCode_ID": 149,
   "Name": "Max Points on a Line",
   "Category": "Math & Geometry",
   "Difficulty": "Hard",
   "Problem Name": "Max Points on a Line",
   "Leetcode URL": "https://leetcode.com/problems/max-points-on-a-line/"
 },
 {
   "id": 414,
   "LeetCode_ID": 60,
   "Name": "Permutation Sequence",
   "Category": "Math & Geometry",
   "Difficulty": "Hard",
   "Problem Name": "Permutation Sequence",
   "Leetcode URL": "https://leetcode.com/problems/permutation-sequence/"
 },
 {
   "id": 415,
   "LeetCode_ID": 172,
   "Name": "Factorial Trailing Zeroes",
   "Category": "Math & Geometry",
   "Difficulty": "Medium",
   "Problem Name": "Factorial Trailing Zeroes",
   "Leetcode URL": "https://leetcode.com/problems/factorial-trailing-zeroes/"
 },
 {
   "id": 416,
   "LeetCode_ID": 7,
   "Name": "Reverse Integer",
   "Category": "Math & Geometry",
   "Difficulty": "Medium",
   "Problem Name": "Reverse Integer",
   "Leetcode URL": "https://leetcode.com/problems/reverse-integer/"
 },
 {
   "id": 417,
   "LeetCode_ID": 29,
   "Name": "Divide Two Integers",
   "Category": "Bit Manipulation",
   "Difficulty": "Medium",
   "Problem Name": "Divide Two Integers",
   "Leetcode URL": "https://leetcode.com/problems/divide-two-integers/"
 },
 {
   "id": 418,
   "LeetCode_ID": 223,
   "Name": "Rectangle Area",
   "Category": "Math & Geometry",
   "Difficulty": "Medium",
   "Problem Name": "Rectangle Area",
   "Leetcode URL": "https://leetcode.com/problems/rectangle-area/"
 },
 {
   "id": 419,
   "LeetCode_ID": 9,
   "Name": "Palindrome Number",
   "Category": "Math & Geometry",
   "Difficulty": "Easy",
   "Problem Name": "Palindrome Number",
   "Leetcode URL": "https://leetcode.com/problems/palindrome-number/"
 },
 {
   "id": 420,
   "LeetCode_ID": 166,
   "Name": "Fraction to Recurring Decimal",
   "Category": "HashMap/HashSet",
   "Difficulty": "Medium",
   "Problem Name": "Fraction to Recurring Decimal",
   "Leetcode URL": "https://leetcode.com/problems/fraction-to-recurring-decimal/"
 },
 {
   "id": 421,
   "LeetCode_ID": 271,
   "Name": "Encode and Decode Strings",
   "Category": "Design",
   "Difficulty": "Medium",
   "Problem Name": "Encode and Decode Strings",
   "Leetcode URL": "https://leetcode.com/problems/encode-and-decode-strings/"
 },
 {
   "id": 422,
   "LeetCode_ID": 853,
   "Name": "Car Fleet",
   "Category": "Greedy",
   "Difficulty": "Medium",
   "Problem Name": "Car Fleet",
   "Leetcode URL": "https://leetcode.com/problems/car-fleet/"
 },
 {
   "id": 423,
   "LeetCode_ID": 981,
   "Name": "Time Based Key Value Store",
   "Category": "Design",
   "Difficulty": "Medium",
   "Problem Name": "Time Based Key Value Store",
   "Leetcode URL": "https://leetcode.com/problems/time-based-key-value-store/"
 },
 {
   "id": 424,
   "LeetCode_ID": 572,
   "Name": "Subtree of Another Tree",
   "Category": "Tree DFS",
   "Difficulty": "Easy",
   "Problem Name": "Subtree of Another Tree",
   "Leetcode URL": "https://leetcode.com/problems/subtree-of-another-tree/"
 },
 {
   "id": 425,
   "LeetCode_ID": 1448,
   "Name": "Count Good Nodes In Binary Tree",
   "Category": "Tree DFS",
   "Difficulty": "Medium",
   "Problem Name": "Count Good Nodes In Binary Tree",
   "Leetcode URL": "https://leetcode.com/problems/count-good-nodes-in-binary-tree/"
 },
 {
   "id": 426,
   "LeetCode_ID": 1046,
   "Name": "Last Stone Weight",
   "Category": "Heap/Priority Queue",
   "Difficulty": "Easy",
   "Problem Name": "Last Stone Weight",
   "Leetcode URL": "https://leetcode.com/problems/last-stone-weight/"
 },
 {
   "id": 427,
   "LeetCode_ID": 355,
   "Name": "Design Twitter",
   "Category": "Design",
   "Difficulty": "Medium",
   "Problem Name": "Design Twitter",
   "Leetcode URL": "https://leetcode.com/problems/design-twitter/"
 },
 {
   "id": 428,
   "LeetCode_ID": 332,
   "Name": "Reconstruct Itinerary",
   "Category": "Graph DFS",
   "Difficulty": "Hard",
   "Problem Name": "Reconstruct Itinerary",
   "Leetcode URL": "https://leetcode.com/problems/reconstruct-itinerary/"
 },
 {
   "id": 429,
   "LeetCode_ID": 1584,
   "Name": "Min Cost to Connect All Points",
   "Category": "Heap/Priority Queue",
   "Difficulty": "Medium",
   "Problem Name": "Min Cost to Connect All Points",
   "Leetcode URL": "https://leetcode.com/problems/min-cost-to-connect-all-points/"
 },
 {
   "id": 430,
   "LeetCode_ID": 778,
   "Name": "Swim In Rising Water",
   "Category": "Binary Search",
   "Difficulty": "Hard",
   "Problem Name": "Swim In Rising Water",
   "Leetcode URL": "https://leetcode.com/problems/swim-in-rising-water/"
 },
 {
   "id": 431,
   "LeetCode_ID": 5,
   "Name": "Longest Palindromic Substring",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "Longest Palindromic Substring",
   "Leetcode URL": "https://leetcode.com/problems/longest-palindromic-substring/"
 },
 {
   "id": 432,
   "LeetCode_ID": 647,
   "Name": "Palindromic Substrings",
   "Category": "Two Pointers",
   "Difficulty": "Medium",
   "Problem Name": "Palindromic Substrings",
   "Leetcode URL": "https://leetcode.com/problems/palindromic-substrings/"
 },
 {
   "id": 433,
   "LeetCode_ID": 494,
   "Name": "Target Sum",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "Target Sum",
   "Leetcode URL": "https://leetcode.com/problems/target-sum/"
 },
 {
   "id": 434,
   "LeetCode_ID": 97,
   "Name": "Interleaving String",
   "Category": "Dynamic Programming",
   "Difficulty": "Medium",
   "Problem Name": "Interleaving String",
   "Leetcode URL": "https://leetcode.com/problems/interleaving-string/"
 },
 {
   "id": 435,
   "LeetCode_ID": 846,
   "Name": "Hand of Straights",
   "Category": "Greedy",
   "Difficulty": "Medium",
   "Problem Name": "Hand of Straights",
   "Leetcode URL": "https://leetcode.com/problems/hand-of-straights/"
 },
 {
   "id": 436,
   "LeetCode_ID": 1899,
   "Name": "Merge Triplets to Form Target Triplet",
   "Category": "Greedy",
   "Difficulty": "Medium",
   "Problem Name": "Merge Triplets to Form Target Triplet",
   "Leetcode URL": "https://leetcode.com/problems/merge-triplets-to-form-target-triplet/"
 },
 {
   "id": 437,
   "LeetCode_ID": 678,
   "Name": "Valid Parenthesis String",
   "Category": "Greedy",
   "Difficulty": "Medium",
   "Problem Name": "Valid Parenthesis String",
   "Leetcode URL": "https://leetcode.com/problems/valid-parenthesis-string/"
 },
 {
   "id": 438,
   "LeetCode_ID": 1851,
   "Name": "Minimum Interval to Include Each Query",
   "Category": "Heap/Priority Queue",
   "Difficulty": "Hard",
   "Problem Name": "Minimum Interval to Include Each Query",
   "Leetcode URL": "https://leetcode.com/problems/minimum-interval-to-include-each-query/"
 },
 {
   "id": 439,
   "LeetCode_ID": 2013,
   "Name": "Detect Squares",
   "Category": "HashMap/HashSet",
   "Difficulty": "Medium",
   "Problem Name": "Detect Squares",
   "Leetcode URL": "https://leetcode.com/problems/detect-squares/"
 },
 {
   "id": 440,
   "LeetCode_ID": 118,
   "Name": "Pascal's Triangle",
   "Category": "Arrays",
   "Difficulty": "Easy",
   "Problem Name": "Pascal's Triangle",
   "Leetcode URL": "https://leetcode.com/problems/pascals-triangle/"
 },
 {
   "id": 441,
   "LeetCode_ID": 31,
   "Name": "Next Permutation",
   "Category": "Arrays",
   "Difficulty": "Medium",
   "Problem Name": "Next Permutation",
   "Leetcode URL": "https://leetcode.com/problems/next-permutation/"
 },
 {
   "id": 442,
   "LeetCode_ID": 14,
   "Name": "Longest Common Prefix",
   "Category": "Two Pointers",
   "Difficulty": "Easy",
   "Problem Name": "Longest Common Prefix",
   "Leetcode URL": "https://leetcode.com/problems/longest-common-prefix/"
 },
 {
   "id": 443,
   "LeetCode_ID": 8,
   "Name": "String to Integer (atoi)",
   "Category": "Two Pointers",
   "Difficulty": "Medium",
   "Problem Name": "String to Integer (atoi)",
   "Leetcode URL": "https://leetcode.com/problems/string-to-integer-atoi/"
 }
];
}
