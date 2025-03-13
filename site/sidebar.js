// Sidebar Population and Interaction Script

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
      
      // Update URL without reloading
      history.pushState(
        null, 
        '', 
        `${window.location.pathname}?category=${encodeURIComponent(category)}`
      );
    }
  });
}

// Function to extract and count categories
function extractCategories(problems) {
  const categories = {};
  const categoryCounts = {};
  
  // Count problems in each category
  problems.forEach(problem => {
    if (!categories[problem.category]) {
      categories[problem.category] = [];
    }
    categories[problem.category].push(problem);
    categoryCounts[problem.category] = (categoryCounts[problem.category] || 0) + 1;
  });
  
  // Sort categories based on categoryOrder, then alphabetically
  const orderedCategories = [
    ...categoryOrder.filter(cat => categories[cat]),
    ...Object.keys(categories)
      .filter(cat => !categoryOrder.includes(cat))
      .sort()
  ];
  
  return {
    categories: categoryCounts,
    orderedCategories: orderedCategories,
    totalCount: problems.length
  };
}

// Function to control menu visibility based on URL
function controlMenuVisibilityByURL() {
  console.log("Running menu visibility control");
  const currentURL = window.location.pathname;
  
  const isDSAProblemsPage = currentURL.includes('dsa-problem') || 
                           currentURL.includes('/p/dashboard.html');
  const isDSABasicsPage = currentURL.includes('dsa-basics');
  const isSystemDesignPage = currentURL.includes('system-design');
  
  // Find all menu items
  const menuItems = document.querySelectorAll('.sidebar-nav-item');
  
  // Control visibility for each menu item
  menuItems.forEach(item => {
    const menuText = item.textContent.trim();
    
    if (menuText.includes('DSA Problems')) {
      item.style.display = isDSAProblemsPage ? 'block' : 'none';
    } 
    else if (menuText.includes('DSA Basics')) {
      item.style.display = isDSABasicsPage ? 'block' : 'none';
    }
    else if (menuText.includes('System Design')) {
      item.style.display = isSystemDesignPage ? 'block' : 'none';
    }
  });
}

// Populate sidebar with categories
function populateSidebar(problems) {
  console.log("Populating sidebar");
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
  
  // Add click event for "All Problems"
  allProblemsItem.querySelector('.sidebar-subnav-link').addEventListener('click', function() {
    const currentURL = window.location.pathname;
    if (currentURL.includes('dsa-problem') || currentURL.includes('dsa-basics')) {
      // Navigate to dashboard with category=all parameter
      window.location.href = '/p/dashboard.html?category=all';
    } else {
      // We're already in dashboard, just toggle the view
      toggleView('list');
      populateListView(window.problemsData);
      
      // Update URL
      history.pushState(null, '', `${window.location.pathname}?category=all`);
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
    
    // Add click event to filter list by category
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

// Initialize URL-based controls
function initializeURLBasedControls() {
  console.log("Initializing URL-based controls");
  
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
        }
        
        // Highlight the active category in the sidebar
        document.querySelectorAll('.sidebar-subnav-link').forEach(link => {
          link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`.sidebar-subnav-link[data-category="${categoryParam}"]`);
        if (activeLink) {
          activeLink.classList.add('active');
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

// Expose functions globally
window.populateSidebar = populateSidebar;
window.addCategoryClickHandlers = addCategoryClickHandlers;
window.controlMenuVisibilityByURL = controlMenuVisibilityByURL;
window.initializeURLBasedControls = initializeURLBasedControls;

// Execute when script loads
console.log("Sidebar.js loaded - Timestamp:", new Date().toISOString());

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log("DOM content loaded - initializing sidebar");
  initializeURLBasedControls();
});
