// Sidebar Population and Interaction Script


// Function to control menu visibility based on URL
function controlMenuVisibilityByURL() {
  console.log("Running menu visibility control - Version 1.1");
  const currentURL = window.location.pathname;
  console.log("Current URL:", currentURL);
  
  const isDSAProblemsPage = currentURL.includes('dsa-problem') || 
                           currentURL.includes('/p/dashboard.html');
  const isDSABasicsPage = currentURL.includes('dsa-basics');
  const isSystemDesignPage = currentURL.includes('system-design');
  
  console.log("Is DSA Problems page:", isDSAProblemsPage);
  console.log("Is DSA Basics page:", isDSABasicsPage);
  console.log("Is System Design page:", isSystemDesignPage);
  
  // Find all menu items - using a more reliable selector
  const menuItems = document.querySelectorAll('.sidebar-nav-item');
  
  // Control visibility for each menu item
  menuItems.forEach((item, index) => {
    const menuText = item.textContent.trim();
    
    if (menuText.includes('DSA Problems')) {
      item.style.display = isDSAProblemsPage ? 'block' : 'none';
      console.log("DSA Problems menu visibility:", isDSAProblemsPage ? 'visible' : 'hidden');
    } 
    else if (menuText.includes('DSA Basics')) {
      item.style.display = isDSABasicsPage ? 'block' : 'none';
      console.log("DSA Basics menu visibility:", isDSABasicsPage ? 'visible' : 'hidden');
    }
    else if (menuText.includes('System Design')) {
      item.style.display = isSystemDesignPage ? 'block' : 'none';
      console.log("System Design menu visibility:", isSystemDesignPage ? 'visible' : 'hidden');
    }
  });
}

// Helper function for category click handlers
function addCategoryClickHandlers(element, category) {
  element.addEventListener('click', function() {
    const currentURL = window.location.pathname;
    if (currentURL.includes('dsa-problem') || currentURL.includes('dsa-basics')) {
      // Navigate to dashboard with category parameter
      window.location.href = `/p/dashboard.html?category=${encodeURIComponent(category)}`;
    } else {
      // We're already in dashboard, just filter
      filterListByCategory(category, window.problemsData);
    }
  });
}

// Populate sidebar with categories
function populateSidebar(problems) {
  console.log("Populating sidebar - Version 1.1");
  const sidebar = document.querySelector('.sidebar-nav');
  if (!sidebar) {
    console.error("Sidebar element not found");
    return;
  }
  
  sidebar.innerHTML = '';
  
  // Categorize problems
  const categoryData = extractCategories(problems);
  
  // 1. Create DSA Basics menu item with subitems
  const dsaBasicsItem = document.createElement('li');
  dsaBasicsItem.className = 'sidebar-nav-item';
  dsaBasicsItem.innerHTML = `
    <div class="sidebar-nav-link main-category">
      <span>DSA Basics</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" 
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </div>
    <ul class="sidebar-subnav" id="dsa-basics-subnav"></ul>
  `;
  sidebar.appendChild(dsaBasicsItem);
  
  // Add DSA Basics subitems
  const dsaBasicsSubnav = document.getElementById('dsa-basics-subnav');
  
  // Add dummy DSA Basics links
  const dsaBasicsLinks = [
    { name: 'Arrays & Strings', count: 12 },
    { name: 'Linked Lists', count: 8 },
    { name: 'Trees & Graphs', count: 15 },
    { name: 'Recursion & DP', count: 10 },
    { name: 'Time Complexity', count: 5 }
  ];
  
  dsaBasicsLinks.forEach(link => {
    const subItem = document.createElement('li');
    subItem.className = 'sidebar-subnav-item';
    
    subItem.innerHTML = `
      <a href="https://technavigator.io/dsa-basics/${link.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" class="sidebar-subnav-link">
        <span>${link.name}</span>
        <span class="category-count">${link.count}</span>
      </a>
    `;
    dsaBasicsSubnav.appendChild(subItem);
  });
  
  // 2. Create DSA Problems main category
  const dsaProblemsItem = document.createElement('li');
  dsaProblemsItem.className = 'sidebar-nav-item';
  dsaProblemsItem.innerHTML = `
    <div class="sidebar-nav-link main-category">
      <span>DSA Problems</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" 
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </div>
    <ul class="sidebar-subnav" id="dsa-problems-subnav"></ul>
  `;
  sidebar.appendChild(dsaProblemsItem);
  
  // Add all DSA categories as subitems
  const dsaProblemsSubnav = document.getElementById('dsa-problems-subnav');
  
  // Add "All Problems" at the top
  const allProblemsItem = document.createElement('li');
  allProblemsItem.className = 'sidebar-subnav-item';
  allProblemsItem.innerHTML = `
    <a href="javascript:void(0)" class="sidebar-subnav-link" data-category="all">
      <span>All Problems</span>
      <span class="category-count">${categoryData.totalCount}</span>
    </a>
  `;
  dsaProblemsSubnav.appendChild(allProblemsItem);
  
  // Add click event for "All Problems" with URL awareness
  allProblemsItem.querySelector('.sidebar-subnav-link').addEventListener('click', function() {
    const currentURL = window.location.pathname;
    if (currentURL.includes('dsa-problem') || currentURL.includes('dsa-basics')) {
      // Navigate to dashboard with category=all parameter
      window.location.href = '/p/dashboard.html?category=all';
    } else {
      // We're already in dashboard, just toggle the view
      toggleView('list');
      populateListView(window.problemsData);
    }
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
    dsaProblemsSubnav.appendChild(subItem);
    
    // Add click event to filter list by category, with URL awareness
    const categoryLink = subItem.querySelector('.sidebar-subnav-link');
    addCategoryClickHandlers(categoryLink, category);
  });
  
  // 3. Add System Design with subitems
  const sdItem = document.createElement('li');
  sdItem.className = 'sidebar-nav-item';
  sdItem.innerHTML = `
    <div class="sidebar-nav-link main-category">
      <span>System Design</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" 
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </div>
    <ul class="sidebar-subnav" id="system-design-subnav"></ul>
  `;
  sidebar.appendChild(sdItem);
  
  // Add System Design subitems
  const systemDesignSubnav = document.getElementById('system-design-subnav');
  
  // Add dummy System Design links
  const systemDesignLinks = [
    { name: 'Scalability', count: 7 },
    { name: 'Availability', count: 5 },
    { name: 'Load Balancing', count: 3 },
    { name: 'Caching', count: 4 },
    { name: 'Database Design', count: 8 },
    { name: 'Microservices', count: 6 }
  ];
  
  systemDesignLinks.forEach(link => {
    const subItem = document.createElement('li');
    subItem.className = 'sidebar-subnav-item';
    
    subItem.innerHTML = `
      <a href="https://blog.technavigator.io/system-design/${link.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}" class="sidebar-subnav-link">
        <span>${link.name}</span>
        <span class="category-count">${link.count}</span>
      </a>
    `;
    systemDesignSubnav.appendChild(subItem);
  });
  
  // Add toggle functionality to all main category items
  const mainCategories = document.querySelectorAll('.sidebar-nav-item .main-category');
  mainCategories.forEach(mainCategory => {
    mainCategory.addEventListener('click', function(e) {
      e.preventDefault();
      const parentItem = this.closest('.sidebar-nav-item');
      parentItem.classList.toggle('expanded');
    });
    
    // Expand main categories by default
    mainCategory.closest('.sidebar-nav-item').classList.add('expanded');
  });
  
  // Check URL parameters and apply filter if needed
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  if (categoryParam) {
    console.log("Found category param:", categoryParam);
    if (categoryParam === 'all') {
      toggleView('list');
      populateListView(window.problemsData);
    } else {
      filterListByCategory(categoryParam, window.problemsData);
    }
    
    // Highlight the active category in the sidebar
    const activeLink = document.querySelector(`.sidebar-subnav-link[data-category="${categoryParam}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }
  
  // Apply URL-based visibility
  controlMenuVisibilityByURL();
}

// Category filter function
function filterListByCategory(category, problems) {
  console.log("filterListByCategory called with category:", category);
  console.log("Number of problems:", problems ? problems.length : 0);
  
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
  const categoriesContainer = document.getElementById('categories-container');
  const revisionContainer = document.getElementById('revision-container');
  const listContainer = document.getElementById('list-container');
  
  if (categoriesContainer) categoriesContainer.style.display = 'none';
  if (revisionContainer) revisionContainer.style.display = 'none';
  if (listContainer) listContainer.style.display = 'block';
  
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
  
  console.log("Filtered problems:", filteredProblems.length);
  
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

// Enhanced function to initialize URL-based controls
function initializeURLBasedControls() {
  console.log("Initializing URL-based controls - Version 1.1");
  
  // Control initial menu visibility
  controlMenuVisibilityByURL();
  
  // Handle URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  
  if (categoryParam) {
    console.log("Category parameter detected:", categoryParam);
    
    // Wait for problems data to be loaded
    const checkDataInterval = setInterval(() => {
      if (window.problemsData && window.problemsData.length > 0) {
        clearInterval(checkDataInterval);
        
        console.log("Problems data loaded, applying category filter:", categoryParam);
        
        if (categoryParam === 'all') {
          console.log("Showing all problems");
          toggleView('list');
          populateListView(window.problemsData);
        } else {
          console.log("Filtering to category:", categoryParam);
          filterListByCategory(categoryParam, window.problemsData);
          
          // Make sure the category is highlighted in the sidebar
          const activeLink = document.querySelector(`.sidebar-subnav-link[data-category="${categoryParam}"]`);
          if (activeLink) {
            activeLink.classList.add('active');
          }
        }
      }
    }, 100);
    
    // Add a timeout to prevent infinite waiting
    setTimeout(() => {
      clearInterval(checkDataInterval);
      console.log("Timed out waiting for problems data");
    }, 10000);
  }
}

// Execute when script loads
console.log("Sidebar.js loaded - Version 1.1 - Timestamp:", new Date().toISOString());

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM content loaded - initializing sidebar");
  initializeURLBasedControls();
});
// Add this to your sidebar.js file

// Keep track of the currently applied category filter
window.currentCategoryFilter = null;

// Modify the initializeURLBasedControls function
function initializeURLBasedControls() {
  console.log("Initializing URL-based controls - Version 1.2");
  
  // Control initial menu visibility
  controlMenuVisibilityByURL();
  
  // Handle URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  
  if (categoryParam) {
    console.log("Category parameter detected:", categoryParam);
    window.currentCategoryFilter = categoryParam; // Save the current filter
    
    // Wait for problems data to be loaded
    const checkDataInterval = setInterval(() => {
      if (window.problemsData && window.problemsData.length > 0) {
        clearInterval(checkDataInterval);
        
        console.log("Problems data loaded, applying category filter:", categoryParam);
        
        if (categoryParam === 'all') {
          console.log("Showing all problems");
          toggleView('list');
          populateListView(window.problemsData);
        } else {
          console.log("Filtering to category:", categoryParam);
          filterListByCategory(categoryParam, window.problemsData);
        }
      }
    }, 100);
    
    // Add a timeout to prevent infinite waiting
    setTimeout(() => {
      clearInterval(checkDataInterval);
      console.log("Timed out waiting for problems data");
    }, 10000);
  }
}

// Override the populateListView function to respect the current category filter
const originalPopulateListView = window.populateListView;
window.populateListView = function(problems) {
  console.log("Modified populateListView called with current filter:", window.currentCategoryFilter);
  
  // If we have an active category filter, use it instead of showing all problems
  if (window.currentCategoryFilter && window.currentCategoryFilter !== 'all') {
    console.log("Applying saved category filter instead of showing all problems");
    filterListByCategory(window.currentCategoryFilter, problems);
    return;
  }
  
  // Otherwise, proceed with normal list view
  originalPopulateListView(problems);
};
// Expose functions globally
window.populateSidebar = populateSidebar;
window.filterListByCategory = filterListByCategory;
window.controlMenuVisibilityByURL = controlMenuVisibilityByURL;
window.initializeURLBasedControls = initializeURLBasedControls;
