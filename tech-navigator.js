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
    // Arrays
    {
      id: 1,
      leetcode_id: 121,
      name: "Best Time to Buy and Sell Stock",
      category: "Arrays",
      difficulty: "Easy",
      leetcode_url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/best-time-to-buy-and-sell-stock"
    },
    {
      id: 2,
      leetcode_id: 1,
      name: "Two Sum",
      category: "Arrays",
      difficulty: "Easy",
      leetcode_url: "https://leetcode.com/problems/two-sum/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/two-sum"
    },
    
    // Strings
    {
      id: 3,
      leetcode_id: 5,
      name: "Longest Palindromic Substring",
      category: "Strings",
      difficulty: "Medium",
      leetcode_url: "https://leetcode.com/problems/longest-palindromic-substring/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/longest-palindromic-substring"
    },
    
    // Prefix Sum
    {
      id: 4,
      leetcode_id: 560,
      name: "Subarray Sum Equals K",
      category: "Prefix Sum",
      difficulty: "Medium",
      leetcode_url: "https://leetcode.com/problems/subarray-sum-equals-k/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/subarray-sum-equals-k"
    },
    
    // HashMap/HashSet
    {
      id: 5, 
      leetcode_id: 217,
      name: "Contains Duplicate",
      category: "HashMap/HashSet",
      difficulty: "Easy",
      leetcode_url: "https://leetcode.com/problems/contains-duplicate/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/contains-duplicate"
    },
    
    // Two Pointers
    {
      id: 6,
      leetcode_id: 15,
      name: "3Sum",
      category: "Two Pointers",
      difficulty: "Medium",
      leetcode_url: "https://leetcode.com/problems/3sum/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/3sum"
    },
    
    // Sliding Window
    {
      id: 7,
      leetcode_id: 3,
      name: "Longest Substring Without Repeating Characters",
      category: "Sliding Window",
      difficulty: "Medium",
      leetcode_url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/longest-substring-without-repeating-characters"
    },
    
    // Binary Search
    {
      id: 8,
      leetcode_id: 704,
      name: "Binary Search",
      category: "Binary Search",
      difficulty: "Easy",
      leetcode_url: "https://leetcode.com/problems/binary-search/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/binary-search"
    },
    {
      id: 9,
      leetcode_id: 33,
      name: "Search in Rotated Sorted Array",
      category: "Binary Search",
      difficulty: "Medium",
      leetcode_url: "https://leetcode.com/problems/search-in-rotated-sorted-array/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/search-in-rotated-sorted-array"
    },
    
    // Cyclic Sort
    {
      id: 10,
      leetcode_id: 287,
      name: "Find the Duplicate Number",
      category: "Cyclic Sort",
      difficulty: "Medium",
      leetcode_url: "https://leetcode.com/problems/find-the-duplicate-number/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/find-the-duplicate-number"
    },
    
    // Matrix Traversal
    {
      id: 11,
      leetcode_id: 200,
      name: "Number of Islands",
      category: "Matrix Traversal",
      difficulty: "Medium",
      leetcode_url: "https://leetcode.com/problems/number-of-islands/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/number-of-islands"
    },
    
    // Stacks & Queues
    {
      id: 12,
      leetcode_id: 20,
      name: "Valid Parentheses",
      category: "Stacks & Queues",
      difficulty: "Easy",
      leetcode_url: "https://leetcode.com/problems/valid-parentheses/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/valid-parentheses"
    },
    {
      id: 13,
      leetcode_id: 155,
      name: "Min Stack",
      category: "Stacks & Queues",
      difficulty: "Medium",
      leetcode_url: "https://leetcode.com/problems/min-stack/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/min-stack"
    },
    
    // Monotonic Stack/Queue
    {
      id: 14,
      leetcode_id: 739,
      name: "Daily Temperatures",
      category: "Monotonic Stack/Queue",
      difficulty: "Medium",
      leetcode_url: "https://leetcode.com/problems/daily-temperatures/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/daily-temperatures"
    },
    
    // Linked Lists
    {
      id: 15,
      leetcode_id: 206,
      name: "Reverse Linked List",
      category: "Linked Lists",
      difficulty: "Easy",
      leetcode_url: "https://leetcode.com/problems/reverse-linked-list/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/reverse-linked-list"
    },
    {
      id: 16,
      leetcode_id: 21,
      name: "Merge Two Sorted Lists",
      category: "Linked Lists",
      difficulty: "Easy",
      leetcode_url: "https://leetcode.com/problems/merge-two-sorted-lists/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/merge-two-sorted-lists"
    },
    
    // Recursion
    {
      id: 17,
      leetcode_id: 70,
      name: "Climbing Stairs",
      category: "Recursion",
      difficulty: "Easy",
      leetcode_url: "https://leetcode.com/problems/climbing-stairs/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/climbing-stairs"
    },
    
    // Trees
    {
      id: 18,
      leetcode_id: 226,
      name: "Invert Binary Tree",
      category: "Trees",
      difficulty: "Easy",
      leetcode_url: "https://leetcode.com/problems/invert-binary-tree/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/invert-binary-tree"
    },
    
    // Tree DFS
    {
      id: 19,
      leetcode_id: 124,
      name: "Binary Tree Maximum Path Sum",
      category: "Tree DFS",
      difficulty: "Hard",
      leetcode_url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/binary-tree-maximum-path-sum"
    },
    
    // Tree BFS
    {
      id: 20,
      leetcode_id: 102,
      name: "Binary Tree Level Order Traversal",
      category: "Tree BFS",
      difficulty: "Medium",
      leetcode_url: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/binary-tree-level-order-traversal"
    },
    
    // Divide and Conquer
    {
      id: 21,
      leetcode_id: 215,
      name: "Kth Largest Element in an Array",
      category: "Divide and Conquer",
      difficulty: "Medium",
      leetcode_url: "https://leetcode.com/problems/kth-largest-element-in-an-array/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/kth-largest-element-in-an-array"
    },
    
    // Backtracking
    {
      id: 22,
      leetcode_id: 46,
      name: "Permutations",
      category: "Backtracking",
      difficulty: "Medium",
      leetcode_url: "https://leetcode.com/problems/permutations/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/permutations"
    },
    
    // Heap/Priority Queue
    {
      id: 23,
      leetcode_id: 23,
      name: "Merge k Sorted Lists",
      category: "Heap/Priority Queue",
      difficulty: "Hard",
      leetcode_url: "https://leetcode.com/problems/merge-k-sorted-lists/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/merge-k-sorted-lists"
    },
    
    // Tries
    {
      id: 24,
      leetcode_id: 208,
      name: "Implement Trie (Prefix Tree)",
      category: "Tries",
      difficulty: "Medium",
      leetcode_url: "https://leetcode.com/problems/implement-trie-prefix-tree/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/implement-trie-prefix-tree"
    },
    
    // Graphs
    {
      id: 25,
      leetcode_id: 133,
      name: "Clone Graph",
      category: "Graphs",
      difficulty: "Medium",
      leetcode_url: "https://leetcode.com/problems/clone-graph/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/clone-graph"
    },
    
    // Graph DFS
    {
      id: 26,
      leetcode_id: 417,
      name: "Pacific Atlantic Water Flow",
      category: "Graph DFS",
      difficulty: "Medium",
      leetcode_url: "https://leetcode.com/problems/pacific-atlantic-water-flow/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/pacific-atlantic-water-flow"
    },
    
    // Graph BFS
    {
      id: 27,
      leetcode_id: 127,
      name: "Word Ladder",
      category: "Graph BFS",
      difficulty: "Hard",
      leetcode_url: "https://leetcode.com/problems/word-ladder/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/word-ladder"
    },
    
    // Union Find
    {
      id: 28,
      leetcode_id: 323,
      name: "Number of Connected Components in an Undirected Graph",
      category: "Union Find",
      difficulty: "Medium",
      leetcode_url: "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/number-of-connected-components"
    },
    
    // Topological Sort
    {
      id: 29,
      leetcode_id: 210,
      name: "Course Schedule II",
      category: "Topological Sort",
      difficulty: "Medium",
      leetcode_url: "https://leetcode.com/problems/course-schedule-ii/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/course-schedule-ii"
    },
    
    // Shortest Path
    {
      id: 30,
      leetcode_id: 743,
      name: "Network Delay Time",
      category: "Shortest Path",
      difficulty: "Medium",
      leetcode_url: "https://leetcode.com/problems/network-delay-time/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/network-delay-time"
    },
    
    // Greedy
    {
      id: 31,
      leetcode_id: 55,
      name: "Jump Game",
      category: "Greedy",
      difficulty: "Medium",
      leetcode_url: "https://leetcode.com/problems/jump-game/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/jump-game"
    },
    
    // Dynamic Programming
    {
      id: 32,
      leetcode_id: 300,
      name: "Longest Increasing Subsequence",
      category: "Dynamic Programming",
      difficulty: "Medium",
      leetcode_url: "https://leetcode.com/problems/longest-increasing-subsequence/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/longest-increasing-subsequence"
    },
    {
      id: 33,
      leetcode_id: 322,
      name: "Coin Change",
      category: "Dynamic Programming",
      difficulty: "Medium",
      leetcode_url: "https://leetcode.com/problems/coin-change/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/coin-change"
    },
    {
      id: 34,
      leetcode_id: 72,
      name: "Edit Distance",
      category: "Dynamic Programming",
      difficulty: "Hard",
      leetcode_url: "https://leetcode.com/problems/edit-distance/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/edit-distance"
    },
    
    // Segment Trees
    {
      id: 35,
      leetcode_id: 307,
      name: "Range Sum Query - Mutable",
      category: "Segment Trees",
      difficulty: "Medium",
      leetcode_url: "https://leetcode.com/problems/range-sum-query-mutable/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/range-sum-query-mutable"
    },
    
    // Intervals
    {
      id: 36,
      leetcode_id: 56,
      name: "Merge Intervals",
      category: "Intervals",
      difficulty: "Medium",
      leetcode_url: "https://leetcode.com/problems/merge-intervals/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/merge-intervals"
    },
    
    // Bit Manipulation
    {
      id: 37,
      leetcode_id: 191,
      name: "Number of 1 Bits",
      category: "Bit Manipulation",
      difficulty: "Easy",
      leetcode_url: "https://leetcode.com/problems/number-of-1-bits/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/number-of-1-bits"
    },
    
    // Math & Geometry
    {
      id: 38,
      leetcode_id: 50,
      name: "Pow(x, n)",
      category: "Math & Geometry",
      difficulty: "Medium",
      leetcode_url: "https://leetcode.com/problems/powx-n/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/powx-n"
    },
    {
      id: 39,
      leetcode_id: 43,
      name: "Multiply Strings",
      category: "Math & Geometry",
      difficulty: "Medium",
      leetcode_url: "https://leetcode.com/problems/multiply-strings/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/multiply-strings"
    },
    
    // Design
    {
      id: 40,
      leetcode_id: 146,
      name: "LRU Cache",
      category: "Design",
      difficulty: "Medium",
      leetcode_url: "https://leetcode.com/problems/lru-cache/",
      status: false,
      revision: false,
      editorial_url: "https://blog.technavigator.io/lru-cache"
    }
  ];
}
