// Tech Navigator Main Script

// Global variables
window.currentView = 'list';

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
  
  // Create accordions for ALL categories in the order specified
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
        const hasEditorial = problem.editorial_url && 
                             typeof problem.editorial_url === 'string' && 
                             problem.editorial_url.trim() !== '';
        
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
        const hasEditorial = problem.editorial_url && 
                             typeof problem.editorial_url === 'string' && 
                             problem.editorial_url.trim() !== '';
        
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
}

// Populate the list view
// Replace or modify the existing populateListView function with this implementation
function populateListView(problems) {
  console.log('Populating list view with ALL problems:', problems.length);
  
  // Ensure we're clearing any previous content
  const tbody = document.getElementById('list-problems');
  tbody.innerHTML = '';
  
  // Reset content title
  const contentTitle = document.querySelector('.content-title');
  if (contentTitle) {
    contentTitle.textContent = 'All Problems';
  }
  
  // First sort by category according to categoryOrder, then by difficulty and name
  const sortedProblems = [...problems].sort((a, b) => {
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
    const hasEditorial = problem.editorial_url && 
                         typeof problem.editorial_url === 'string' && 
                         problem.editorial_url.trim() !== '';
    
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
// Revision list view
function loadRevisionList(problems) {
  if (!problems) {
    console.error("No problems data provided to loadRevisionList");
    return;
  }
  
  const tbody = document.getElementById('revision-problems');
  if (!tbody) {
    console.error("Revision problems container not found");
    return;
  }
  
  tbody.innerHTML = '';
  
  // Filter problems marked for revision
  const revisionProblems = problems.filter(problem => problem.revision);
  
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
  
  // Sort revision problems
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
  
  // Add rows for revision problems
  sortedProblems.forEach(problem => {
    const row = document.createElement('tr');
    row.className = 'problem-row';
    row.dataset.id = problem.id;
    
    // Check if the problem has a valid editorial URL
    const hasEditorial = problem.editorial_url && 
                         typeof problem.editorial_url === 'string' && 
                         problem.editorial_url.trim() !== '';
    
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

// Toggle view between category, list, and revision
function toggleView(view) {
  // Store the current view type
  window.currentView = view;
  
  const categoryContainer = document.getElementById('categories-container');
  const listContainer = document.getElementById('list-container');
  const revisionContainer = document.getElementById('revision-container');
  
  const categoryBtn = document.getElementById('category-view-btn');
  const listBtn = document.getElementById('list-view-btn');
  const revisionBtn = document.getElementById('revision-view-btn');
  
  // Check if user is logged in before showing revision view
  if (view === 'revision' && !window.currentUser) {
    showLoginRequiredModal('Please sign in to access your revision list.');
    return;
  }
  
  // Hide all containers and remove active class
  categoryContainer.style.display = 'none';
  listContainer.style.display = 'none';
  revisionContainer.style.display = 'none';
  
  categoryBtn.classList.remove('active');
  listBtn.classList.remove('active');
  revisionBtn.classList.remove('active');
  
  // Make sure category view button is visible for all views
  categoryBtn.style.display = ''; // Reset to default display value
  
  // Show selected view
  switch(view) {
    case 'category':
      categoryContainer.style.display = 'block';
      categoryBtn.classList.add('active');
      break;
    case 'list':
      listContainer.style.display = 'block';
      listBtn.classList.add('active');
      
      // Always ensure problems are loaded
      if (window.problemsData) {
        // Check URL for category parameter
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        
        console.log('Toggling list view - Category Param:', categoryParam);
        
        // Force population of problems
        setTimeout(() => {
          if (categoryParam === 'all') {
            console.log('Forcing population of ALL problems');
            populateListView(window.problemsData);
          } else if (categoryParam) {
            filterListByCategory(categoryParam, window.problemsData);
          } else {
            // Default to populating all problems
            populateListView(window.problemsData);
          }
        }, 0);
      } else {
        console.error('Problems data not loaded');
      }
      break;
    case 'revision':
      revisionContainer.style.display = 'block';
      revisionBtn.classList.add('active');
      loadRevisionList(window.problemsData);
      break;
  }
}
// Add a new function to filter list by category
function filterListByCategory(category, problems) {
  console.log("Filtering problems by category:", category);
  
  // Filter problems
  const filteredProblems = category === 'all' 
    ? problems 
    : problems.filter(problem => problem.category === category);
  
  const tbody = document.getElementById('list-problems');
  tbody.innerHTML = '';
  
  // Update content title
  const contentTitle = document.querySelector('.content-title');
  if (contentTitle) {
    contentTitle.textContent = category === 'all' 
      ? 'All Problems' 
      : `${category} Problems`;
  }
  
  // Sort filtered problems
  const sortedProblems = [...filteredProblems].sort((a, b) => {
    const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
    const diffComp = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    
    if (diffComp !== 0) return diffComp;
    
    return a.name.localeCompare(b.name);
  });
  
  // Add rows for filtered problems
  sortedProblems.forEach(problem => {
    const row = document.createElement('tr');
    row.className = 'problem-row';
    row.dataset.id = problem.id;
    
    // Check if the problem has a valid editorial URL
    const hasEditorial = problem.editorial_url && 
                         typeof problem.editorial_url === 'string' && 
                         problem.editorial_url.trim() !== '';
    
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

// Expose the filterListByCategory function globally
window.filterListByCategory = filterListByCategory;

// Update problem status
function updateProblemStatus(problemId, status) {
  console.log("updateProblemStatus called for problem:", problemId, "status:", status);
  console.log("Current user state:", window.currentUser ? "Logged in" : "Not logged in");
  
  // Check login status before allowing update
  if (!window.currentUser) {
    console.log("User not logged in, showing login modal");
    showLoginRequiredModal('Please sign in to update problem status.');
    
    // Reset the checkbox state
    const checkbox = document.getElementById(`list-status-${problemId}`) || 
                    document.getElementById(`status-${problemId}`) ||
                    document.getElementById(`revision-status-${problemId}`);
    
    if (checkbox) {
      checkbox.checked = !status; // Revert the checkbox
    }
    
    return;
  }
  
  // Find and update problem in local data
  const problemIndex = window.problemsData.findIndex(p => p.id == problemId);
  if (problemIndex === -1) {
    console.error('Problem not found in local data:', problemId);
    return;
  }
  
  // Update local data
  window.problemsData[problemIndex].status = status;
  
  // Update UI in all views
  updateProblemStatusUi(problemId, status);
  
  // Update global counts
  updateCounts(window.problemsData);
  
  // Update Firebase if user is logged in and function exists
  if (window.currentUser && typeof updateProblemStatusInFirebase === 'function') {
    console.log("Updating problem status in Firebase");
    updateProblemStatusInFirebase(problemId, status);
  } else {
    console.warn("Could not update Firebase: ", typeof updateProblemStatusInFirebase !== 'function' ? 
                "updateProblemStatusInFirebase function not found" : "User not logged in");
  }
}

// Toggle revision status
function toggleRevision(problemId, revision) {
  console.log("toggleRevision called for problem:", problemId, "revision:", revision);
  console.log("Current user state:", window.currentUser ? "Logged in" : "Not logged in");
  
  // Check login status before allowing update
  if (!window.currentUser) {
    console.log("User not logged in, showing login modal");
    showLoginRequiredModal('Please sign in to mark problems for revision.');
    return;
  }

  // Find and update problem in local data
  const problemIndex = window.problemsData.findIndex(p => p.id == problemId);
  if (problemIndex === -1) {
    console.error('Problem not found in local data:', problemId);
    return;
  }
  
  // Update local data
  window.problemsData[problemIndex].revision = revision;
  
  // Update UI in all views
  updateRevisionUi(problemId, revision);
  
  // Update revision count
  const revisionCount = window.problemsData.filter(p => p.revision).length;
  const revisionCountElement = document.getElementById('revision-count');
  if (revisionCountElement) {
    revisionCountElement.textContent = revisionCount;
  }
  
  // If current view is revision, reload revision list
  if (window.currentView === 'revision') {
    loadRevisionList(window.problemsData);
  }
  
  // Update Firebase if user is logged in and function exists
  if (window.currentUser && typeof toggleRevisionInFirebase === 'function') {
    console.log("Updating revision status in Firebase");
    try {
      toggleRevisionInFirebase(problemId, revision);
    } catch (error) {
      console.error("Error updating Firebase:", error);
    }
  } else {
    console.warn("Could not update revision in Firebase: ", typeof toggleRevisionInFirebase !== 'function' ? 
                "toggleRevisionInFirebase function not found" : "User not logged in");
  }
}

// Remove problem from revision list
function removeFromRevision(problemId) {
  console.log("removeFromRevision called for problem:", problemId);
  
  // Check if user is logged in
  if (!window.currentUser) {
    console.log("User not logged in, showing login modal");
    showLoginRequiredModal('Please sign in to update your revision list.');
    return;
  }
  
  // Find and update problem in local data
  const problemIndex = window.problemsData.findIndex(p => p.id == problemId);
  if (problemIndex === -1) {
    console.error('Problem not found in local data:', problemId);
    return;
  }
  
  // Update local data
  window.problemsData[problemIndex].revision = false;
  
  // Update revision count
  const revisionCount = window.problemsData.filter(p => p.revision).length;
  const revisionCountElement = document.getElementById('revision-count');
  if (revisionCountElement) {
    revisionCountElement.textContent = revisionCount;
  }
  
  // Update UI
  updateRevisionUi(problemId, false);
  
  // Reload revision list
  loadRevisionList(window.problemsData);
  
  // Update Firebase if user is logged in and function exists
  if (window.currentUser && typeof toggleRevisionInFirebase === 'function') {
    console.log("Updating revision status in Firebase");
    toggleRevisionInFirebase(problemId, false);
  } else {
    console.warn("Could not update revision in Firebase: ", typeof toggleRevisionInFirebase !== 'function' ? 
                "toggleRevisionInFirebase function not found" : "User not logged in");
  }
}

// Update problem status UI across views
function updateProblemStatusUi(problemId, status) {
  console.log("Updating UI for problem", problemId, "status:", status);
  
  try {
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
    if (window.currentView === 'category') {
      const categoryRow = document.querySelector(`.problem-row[data-id="${problemId}"]`);
      if (categoryRow) {
        const category = categoryRow.closest('.accordion-category');
        if (category) {
          const categoryTitle = category.querySelector('.category-title');
          if (categoryTitle) {
            const categoryName = categoryTitle.textContent.trim();
            
            // Get all problems in this category
            const categoryProblems = window.problemsData.filter(p => p.category === categoryName);
            
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
  } catch (error) {
    console.error("Error updating problem status UI:", error);
  }
}

// Update revision UI across views
function updateRevisionUi(problemId, revision) {
  console.log("Updating revision UI for problem", problemId, "revision:", revision);
  
  try {
    // Update all revision stars for this problem across all views
    const allStars = document.querySelectorAll(`.problem-row[data-id="${problemId}"] .revision-star`);
    
    allStars.forEach(starSvg => {
      if (revision) {
        starSvg.setAttribute('fill', 'currentColor');
        starSvg.classList.add('marked');
      } else {
        starSvg.setAttribute('fill', 'none');
        starSvg.classList.remove('marked');
      }
    });
    
    // Also update the onclick attributes for the wrapper elements
    const allWrappers = document.querySelectorAll(`.problem-row[data-id="${problemId}"] .revision-star-wrapper`);
    
    allWrappers.forEach(wrapper => {
      // Update the onclick attribute to toggle to the opposite state
      if (wrapper.closest('#revision-container')) {
        // In revision view, clicking should remove from revision
        wrapper.setAttribute('onclick', `removeFromRevision(${problemId})`);
      } else {
        // In other views, clicking should toggle revision
        wrapper.setAttribute('onclick', `toggleRevision(${problemId}, ${!revision})`);
      }
    });
    
  } catch (error) {
    console.error("Error updating revision UI:", error);
  }
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
  const easyCountElement = document.getElementById('easy-count');
  if (easyCountElement) {
    easyCountElement.textContent = `Easy: ${completedEasy}/${totalEasy}`;
  }
  
  const mediumCountElement = document.getElementById('medium-count');
  if (mediumCountElement) {
    mediumCountElement.textContent = `Medium: ${completedMedium}/${totalMedium}`;
  }
  
  const hardCountElement = document.getElementById('hard-count');
  if (hardCountElement) {
    hardCountElement.textContent = `Hard: ${completedHard}/${totalHard}`;
  }
  
  // Update overall progress
  const totalProblems = problems.length;
  const completedProblems = problems.filter(p => p.status).length;
  const progressPercentage = totalProblems > 0 ? Math.round((completedProblems / totalProblems) * 100) : 0;
  
  const progressTextElement = document.getElementById('overall-progress-text');
  if (progressTextElement) {
    progressTextElement.textContent = `${progressPercentage}% Completed`;
  }
  
  // Update the circular progress bar
  const circle = document.getElementById('overall-progress');
  if (circle) {
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = `${circumference - (progressPercentage / 100) * circumference}`;
  }
  
  // Update revision count
  const revisionCount = problems.filter(p => p.revision).length;
  const revisionCountElement = document.getElementById('revision-count');
  if (revisionCountElement) {
    revisionCountElement.textContent = revisionCount;
  }
}

// Toggle accordion open/close
function toggleAccordion(accordionElement) {
  accordionElement.classList.toggle('expanded');
}

// Show login required modal
// In tech-navigator.js, modify the showLoginRequiredModal function:
function showLoginRequiredModal(message) {
  console.log("Showing login required modal:", message);
  
  const modal = document.getElementById('login-required-modal');
  if (!modal) {
    console.error("Login modal element not found");
    return;
  }
  
  const modalMessage = modal.querySelector('.modal-message');
  if (modalMessage) {
    modalMessage.textContent = message || 'Please sign in to continue.';
  }
  
  // Add these lines to ensure the modal is centered
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.right = '0';
  modal.style.bottom = '0';
  modal.style.zIndex = '10000';
}

// Initialize view toggle buttons
function initializeViewToggleButtons() {
  // List view button
  const listViewBtn = document.getElementById('list-view-btn');
  if (listViewBtn) {
    listViewBtn.addEventListener('click', () => toggleView('list'));
  }
  
  // Category view button
  const categoryViewBtn = document.getElementById('category-view-btn');
  if (categoryViewBtn) {
    categoryViewBtn.addEventListener('click', () => toggleView('category'));
  }
  
  // Revision view button
  const revisionViewBtn = document.getElementById('revision-view-btn');
  if (revisionViewBtn) {
    revisionViewBtn.addEventListener('click', () => toggleView('revision'));
  }
}

// Close login required modal
function initializeLoginModal() {
  const modal = document.getElementById('login-required-modal');
  if (!modal) {
    console.error("Login modal element not found");
    return;
  }
  
  // Close button
  const closeBtn = modal.querySelector('.modal-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }
  
  // Overlay click
  const overlay = modal.querySelector('.modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }
}

// Document Ready Initialization
document.addEventListener('DOMContentLoaded', function() {
  // Initialize login modal
  initializeLoginModal();
  
  // Initialize view toggle buttons
  initializeViewToggleButtons();
});

// Expose global functions
window.toggleView = toggleView;
window.updateProblemStatus = updateProblemStatus;
window.toggleRevision = toggleRevision;
window.removeFromRevision = removeFromRevision;
window.toggleAccordion = toggleAccordion;
window.showLoginRequiredModal = showLoginRequiredModal;
