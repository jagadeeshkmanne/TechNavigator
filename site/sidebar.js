// Sidebar Population and Interaction Script

// Populate sidebar with categories
function populateSidebar(problems) {
  const sidebar = document.querySelector('.sidebar-nav');
  if (!sidebar) return;
  
  sidebar.innerHTML = '';
  
  // Categorize problems
  const categoryData = extractCategories(problems);
  
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
    <a href="javascript:void(0)" class="sidebar-subnav-link" data-category="all">
      <span>All Problems</span>
      <span class="category-count">${categoryData.totalCount}</span>
    </a>
  `;
  dsaSubnav.appendChild(allProblemsItem);
  
  // Add click event for "All Problems"
  allProblemsItem.querySelector('.sidebar-subnav-link').addEventListener('click', function() {
    toggleView('list');
    populateListView(window.problemsData);
  });
  
  // Add categories
  categoryData.orderedCategories.forEach(category => {
    const count = categoryData.categories[category];
    const subItem = document.createElement('li');
    subItem.className = 'sidebar-subnav-item';
    
    subItem.innerHTML = `
      <a href="javascript:void(0)" class="sidebar-subnav-link" data-category="${category}">
        <span>${category}</span>
        <span class="category-count">${count}</span>
      </a>
    `;
    dsaSubnav.appendChild(subItem);
    
    // Add click event to filter list by category
    subItem.querySelector('.sidebar-subnav-link').addEventListener('click', function() {
      filterListByCategory(category, window.problemsData);
    });
  });
  
  // Add System Design link
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
  
  // Add toggle functionality to DSA menu
  const dsaMainCategory = document.querySelector('.sidebar-nav-item:first-child .sidebar-nav-link');
  if (dsaMainCategory) {
    dsaMainCategory.addEventListener('click', function(e) {
      e.preventDefault();
      const parentItem = this.closest('.sidebar-nav-item');
      parentItem.classList.toggle('expanded');
    });
    
    // Expand DSA section by default
    dsaMainCategory.closest('.sidebar-nav-item').classList.add('expanded');
  }
}

// Category filter function
// Fix for sidebar.js - Updated filterListByCategory function

function filterListByCategory(category, problems) {
  // Ensure we're in list view
  window.currentView = 'list';
  
  // Update view buttons
  const categoryBtn = document.getElementById('category-view-btn');
  const listBtn = document.getElementById('list-view-btn');
  const revisionBtn = document.getElementById('revision-view-btn');
  
  // Show category button for "all" category
  if (categoryBtn) {
    categoryBtn.style.display = 'inline-block'; // Always show the category button
  }
  
  // Hide all containers
  document.getElementById('categories-container').style.display = 'none';
  document.getElementById('revision-container').style.display = 'none';
  document.getElementById('list-container').style.display = 'block';
  
  // Update active button classes
  if (categoryBtn) categoryBtn.classList.remove('active');
  if (listBtn) listBtn.classList.add('active');
  if (revisionBtn) revisionBtn.classList.remove('active');
  
  // Get the list container
  const tbody = document.getElementById('list-problems');
  if (!tbody) {
    console.error("List problems container not found");
    return;
  }
  
  tbody.innerHTML = '';
  
  // Update content title
  const contentTitle = document.querySelector('.content-title');
  if (contentTitle) {
    contentTitle.textContent = category === 'all' ? 'All Problems' : `${category} Problems`;
  }
  
  // Filter and sort problems
  let filteredProblems;
  
  if (category === 'all') {
    filteredProblems = [...problems].sort((a, b) => {
      // Sorting logic similar to original implementation
      const categoryA = a.category;
      const categoryB = b.category;
      const indexA = categoryOrder.indexOf(categoryA);
      const indexB = categoryOrder.indexOf(categoryB);
      
      // Existing sorting logic
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      if (categoryA !== categoryB) return categoryA.localeCompare(categoryB);
      
      const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
      const diffComp = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      
      if (diffComp !== 0) return diffComp;
      
      return a.name.localeCompare(b.name);
    });
  } else {
    filteredProblems = problems
      .filter(problem => problem.category === category)
      .sort((a, b) => {
        const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
        const diffComp = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        
        if (diffComp !== 0) return diffComp;
        
        return a.name.localeCompare(b.name);
      });
  }
  
  // Populate filtered problems
  filteredProblems.forEach(problem => {
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
  
  // Update sidebar active state
  document.querySelectorAll('.sidebar-subnav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  const activeLink = document.querySelector(`.sidebar-subnav-link[data-category="${category}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

// Expose functions globally
window.populateSidebar = populateSidebar;
window.filterListByCategory = filterListByCategory;
