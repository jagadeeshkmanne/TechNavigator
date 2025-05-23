function initializeLoginModal() {
  const modalCloseBtn = document.querySelector('#login-required-modal .modal-close-btn');
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', function() {
      document.getElementById('login-required-modal').style.display = 'none';
    });
  }

  const modalOverlay = document.querySelector('#login-required-modal .modal-overlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', function() {
      document.getElementById('login-required-modal').style.display = 'none';
    });
  }
}

// Call this function after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeLoginModal();
});
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .then(() => {
    console.log("Firebase persistence set to LOCAL");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });
// Global variables
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
  'Math & Geometry',
  'Design'
];

async function getProblems() {
  try {
    const response = await fetch('https://cdn.jsdelivr.net/gh/jagadeeshkmanne/TechNavigator@main/tech-navigator.json');
    
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
    
    // If fetch fails, show an error message
    document.getElementById('loading-spinner').innerHTML = `
      <div style="text-align: center; color: red;">
        <h2>Failed to Load Problems</h2>
        <p>Unable to retrieve problem list. Please check your internet connection.</p>
        <p>Error: ${error.message}</p>
      </div>
    `;
    
    // Prevent further execution
    throw error;
  }
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
  
  // Populate list view
  populateListView();
}

// Populate the list view
function populateListView() {
  const tbody = document.getElementById('list-problems');
  tbody.innerHTML = '';
  
  // Reset content title when showing all problems
  const contentTitle = document.querySelector('.content-title');
  if (contentTitle) {
    contentTitle.textContent = 'All Problems';
  }
  
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

// Function to filter list view by category
// Function to filter list view by category
// Function to filter list view by category
function filterListByCategory(category) {
  // Switch to list view 
  currentView = 'list';
  
  // Hide category view button when showing a specific category
  const categoryBtn = document.getElementById('category-view-btn');
  if (category === 'all') {
    // When showing all problems, display the category view button
    categoryBtn.style.display = '';
  } else {
    // When showing a specific category, hide the category view button
    categoryBtn.style.display = 'none';
  }
  
  // Update UI for view buttons
  const listBtn = document.getElementById('list-view-btn');
  const revisionBtn = document.getElementById('revision-view-btn');
  
  // Hide all containers
  document.getElementById('categories-container').style.display = 'none';
  document.getElementById('revision-container').style.display = 'none';
  document.getElementById('list-container').style.display = 'block';
  
  // Update active button classes
  categoryBtn.classList.remove('active');
  listBtn.classList.add('active');
  revisionBtn.classList.remove('active');
  
  // Get the list container
  const tbody = document.getElementById('list-problems');
  tbody.innerHTML = '';
  
  // Update the content title to show filtered view
  const contentTitle = document.querySelector('.content-title');
  if (contentTitle) {
    contentTitle.textContent = category === 'all' ? 'All Problems' : `${category} Problems`;
  }
  
  // Filter problems by category and sort them
  let filteredProblems;
  
  if (category === 'all') {
    // If 'all', include all problems
    filteredProblems = [...problemsData].sort((a, b) => {
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
  } else {
    // Otherwise, filter by the specified category
    filteredProblems = problemsData
      .filter(problem => problem.category === category)
      .sort((a, b) => {
        // Sort by difficulty
        const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
        const diffComp = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        
        if (diffComp !== 0) return diffComp;
        
        // If same difficulty, sort by name
        return a.name.localeCompare(b.name);
      });
  }
  
  // Add rows for each problem
  filteredProblems.forEach(problem => {
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
  
  // Make the active category visually distinct in the sidebar
  document.querySelectorAll('.sidebar-subnav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  const activeLink = document.querySelector(`.sidebar-subnav-link[data-category="${category === 'all' ? 'all' : category}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

// Function to populate sidebar
// Function to populate sidebar
function populateSidebar() {
  const sidebar = document.querySelector('.sidebar-nav');
  sidebar.innerHTML = '';
  
  // Create DSA main category
  const dsaItem = document.createElement('li');
  dsaItem.className = 'sidebar-nav-item';
  dsaItem.innerHTML = `
    <div class="sidebar-nav-link main-category">
      <span>Data Structures & Algorithms</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" 
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </div>
    <ul class="sidebar-subnav" id="dsa-subnav"></ul>
  `;
  sidebar.appendChild(dsaItem);
  
  // Add all DSA categories as subitems
  const dsaSubnav = document.getElementById('dsa-subnav');
  
  // Add "All Problems" at the top
  const allProblemsItem = document.createElement('li');
  allProblemsItem.className = 'sidebar-subnav-item';
  allProblemsItem.innerHTML = `
    <a class="sidebar-subnav-link" data-category="all">
      <span>All Problems</span>
      <span class="category-count">${problemsData.length}</span>
    </a>
  `;
  dsaSubnav.appendChild(allProblemsItem);
  
  // Add click event for "All Problems"
  allProblemsItem.querySelector('.sidebar-subnav-link').addEventListener('click', function() {
    // Switch to list view and show all problems
    toggleView('list');
    // Reset content title
    const contentTitle = document.querySelector('.content-title');
    if (contentTitle) {
      contentTitle.textContent = 'All Problems';
    }
    // Populate with all problems
    populateListView();
  });
  
  // Add categories
  categoryOrder.forEach(category => {
    const subItem = document.createElement('li');
    subItem.className = 'sidebar-subnav-item';
    
    // Count problems in this category
    const categoryProblems = problemsData.filter(p => p.category === category);
    const totalCount = categoryProblems.length;
    
    if (totalCount > 0) {
      subItem.innerHTML = `
        <a class="sidebar-subnav-link" data-category="${category}">
          <span>${category}</span>
          <span class="category-count">${totalCount}</span>
        </a>
      `;
      dsaSubnav.appendChild(subItem);
      
      // Add click event to filter list by category
      subItem.querySelector('.sidebar-subnav-link').addEventListener('click', function() {
        filterListByCategory(category);
      });
    }
  });
  
  // Create System Design main category
  const sdItem = document.createElement('li');
  sdItem.className = 'sidebar-nav-item';
  sdItem.innerHTML = `
    <a href="https://blog.technavigator.io" class="sidebar-nav-link">
      <span>System Design</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" 
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="7" y1="17" x2="17" y2="7"></line>
        <polyline points="7 7 17 7 17 17"></polyline>
      </svg>
    </a>
  `;
  sidebar.appendChild(sdItem);
}

// Function to load problems marked for revision
// Modify the loadRevisionList function to handle empty states
function loadRevisionList() {
  const tbody = document.getElementById('revision-problems');
  tbody.innerHTML = '';
  
  // Filter problems marked for revision
  const revisionProblems = problemsData.filter(problem => problem.revision);
  
  console.log('Revision problems:', revisionProblems); // Debug log
  
  if (revisionProblems.length === 0) {
    // No revision problems found
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state" style="text-align: center; padding: 20px;">
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

// Toggle between views (category, list, and revision)
function toggleView(view) {
  if (!currentUser && view === 'revision') {
    showLoginRequiredModal('Please sign in to access your revision list.');
    return;
  } 
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
    
    // Always populate list view
    populateListView();
  } else if (view === 'revision') {
    revisionContainer.style.display = 'block';
    revisionBtn.classList.add('active');
    
    // Load the revision list
    loadRevisionList();
  }
}

function removeFromRevision(problemId) {
  // Find the problem in the local data
  const problemIndex = problemsData.findIndex(p => p.id == problemId);
  if (problemIndex === -1) {
    console.error('Problem not found in local data:', problemId);
    return;
  }
  
  // Update local data
  problemsData[problemIndex].revision = false;
  
  // Update revision count
  const revisionCount = problemsData.filter(p => p.revision).length;
  document.getElementById('revision-count').textContent = revisionCount;
  
  // Update UI
  updateRevisionUi(problemId, false);
  
  // Reload revision list
  loadRevisionList();
  
    // Update Firebase if user is logged in
   if (currentUser) {
     db.collection('users').doc(currentUser.uid).collection('problems').doc(problemId.toString())
       .set({
         revision: false
       }, { merge: true })
       .then(() => {
         console.log('Problem removed from revision in Firebase');
       })
       .catch(error => {
         console.error("Error removing problem from revision in Firebase:", error);
       });
   }
}
    // Toggle accordion open/close
function toggleAccordion(accordionElement) {
  accordionElement.classList.toggle('expanded');
}

// Update problem status
function updateProblemStatus(problemId, status) {
  if (!currentUser) {
    // Optional: You can pass a custom message here
    showLoginRequiredModal('Please sign in to update problem status.');
    return;
  } 
  console.log('Updating problem status', problemId, status);
  
  // Find the problem in the local data
  const problemIndex = problemsData.findIndex(p => p.id == problemId);
  if (problemIndex === -1) {
    console.error('Problem not found in local data:', problemId);
    return;
  }
  
  // Update local data
  problemsData[problemIndex].status = status;
  
  // Update UI in all views
  updateProblemStatusUi(problemId, status);
  
  // Update global counts
  updateCounts(problemsData);
  
  // Update Firebase if user is logged in
  // Update Firebase if user is logged in
   if (currentUser) {
     db.collection('users').doc(currentUser.uid).collection('problems').doc(problemId.toString())
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
  if (!currentUser) {
    // Optional: You can pass a custom message here
    showLoginRequiredModal('Please sign in to mark problems for revision.');
    return;
  }

  // Find the problem in the local data
  const problemIndex = problemsData.findIndex(p => p.id == problemId);
  if (problemIndex === -1) {
    console.error('Problem not found in local data:', problemId);
    return;
  }
  
  // Update local data
  problemsData[problemIndex].revision = revision;
  
  // Update UI in all views
  updateRevisionUi(problemId, revision);
  
  // Update revision count
  const revisionCount = problemsData.filter(p => p.revision).length;
  document.getElementById('revision-count').textContent = revisionCount;
  
  // If current view is revision, reload revision list
  if (currentView === 'revision') {
    loadRevisionList();
  }
  
  // Update Firebase if user is logged in
  // Update Firebase if user is logged in
   if (currentUser) {
     db.collection('users').doc(currentUser.uid).collection('problems').doc(problemId.toString())
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

async function loadUserData(userId) {
    try {
        console.log('Loading user data from Firebase...');
        const snapshot = await db.collection('users').doc(userId).collection('problems').get();
        
        if (snapshot.empty) {
            console.log('No user data found in Firebase');
            return;
        }
        
        // Update local problem data with Firebase data
        snapshot.forEach(doc => {
            const problemId = parseInt(doc.id);
            const problemData = doc.data();
            
            // Find the problem in the local data
            const problemIndex = problemsData.findIndex(p => p.id === problemId);
            if (problemIndex !== -1) {
                // Update local data with Firebase data
                if (problemData.status !== undefined) {
                    problemsData[problemIndex].status = problemData.status;
                }
                if (problemData.revision !== undefined) {
                    problemsData[problemIndex].revision = problemData.revision;
                }
            }
        });
        
        console.log('User data loaded from Firebase');
        
        // Refresh UI with loaded data
        loadProblems(problemsData);
        populateListView();
        loadRevisionList();
        
        // Return to the current view
        toggleView(currentView);
        
    } catch (error) {
        console.error('Error loading user data from Firebase:', error);
    }
}

// Document Ready Function
document.addEventListener('DOMContentLoaded', async function() {
  console.log('Document loaded, initializing app...');
  
  // Show loading spinner
  document.getElementById('loading-spinner').style.display = 'flex';
  document.getElementById('categories-container').style.display = 'none';
  
  try {
    // Fetch problems from remote JSON first
    const problems = await getProblems();
    
    // Set global problems data
    problemsData = problems;
    
    // Load problems to UI
    loadProblems(problems);
     // Populate list view by default
    populateListView();
    
    // Set default view to list
    toggleView('list');
    
    // Populate the sidebar
    populateSidebar();

    // Add click event to toggle DSA categories
    const dsaMainCategory = document.querySelector('.sidebar-nav-item:first-child .sidebar-nav-link');
    if (dsaMainCategory) {
      dsaMainCategory.addEventListener('click', function() {
        const parentItem = this.closest('.sidebar-nav-item');
        parentItem.classList.toggle('expanded');
      });
      
      // Expand DSA section by default
      dsaMainCategory.closest('.sidebar-nav-item').classList.add('expanded');
    }
     
  } catch (error) {
    console.error('Failed to initialize app:', error);
    return;
  }
  
  // Set up Firebase auth state changes
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
    
    // Load user data from Firebase
    loadUserData(user.uid);
  } else {
    // User is signed out
    authContainer.classList.remove('signed-in');
    
    // Reset problem data to default (all unchecked)
    problemsData.forEach(problem => {
      problem.status = false;
      problem.revision = false;
    });
    
    // Refresh UI with reset data
    loadProblems(problemsData);
    populateListView();
    
    // Return to the current view
    toggleView(currentView);
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

  // Setup revision link
  document.getElementById('revision-view-btn').addEventListener('click', function() {
    toggleView('revision');
  });
  
  // Setup view toggle buttons
  document.getElementById('category-view-btn').addEventListener('click', function() {
    toggleView('category');
  });
  
  document.getElementById('list-view-btn').addEventListener('click', function() {
    toggleView('list');
  });
});
