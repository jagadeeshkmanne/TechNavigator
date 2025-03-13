// Sidebar navigation logic for Tech Navigator
document.addEventListener('DOMContentLoaded', function() {
  // Get categories once to use in sidebar navigation
  fetchCategories().then(categories => {
    populateSidebar(categories);
  });
});

// Fetch categories from tech-navigator.json
async function fetchCategories() {
  try {
    // Try to use window.problemsData if it exists (may have been loaded by tech-navigator.js already)
    if (window.problemsData && window.problemsData.length > 0) {
      return extractCategories(window.problemsData);
    }

    // Otherwise fetch data directly
    const response = await fetch('https://cdn.jsdelivr.net/gh/jagadeeshkmanne/TechNavigator@main/tech-navigator.json');
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    const problems = await response.json();
    
    // Save problem data to window object for use by tech-navigator.js
    window.sidebarProblemData = problems.map(problem => ({
      id: problem.id,
      name: problem.Name || problem['Problem Name'],
      category: problem.Category,
      difficulty: problem.Difficulty
    }));
    
    return extractCategories(window.sidebarProblemData);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return []; // Return empty array on error
  }
}

// Extract unique categories and count problems
function extractCategories(problems) {
  const categories = {};
  const categoryOrder = [
    'Arrays', 'Prefix Sum', 'HashMap/HashSet', 'Two Pointers', 
    'Sliding Window', 'Binary Search', 'Cyclic Sort', 'Matrix Traversal',
    'Stacks & Queues', 'Monotonic Stack/Queue', 'Linked Lists', 'Recursion',
    'Trees', 'Tree DFS', 'Tree BFS', 'Divide and Conquer', 
    'Backtracking', 'Heap/Priority Queue', 'Tries', 'Graphs',
    'Graph DFS', 'Graph BFS', 'Union Find', 'Topological Sort',
    'Shortest Path', 'Greedy', 'Dynamic Programming', 'Segment Trees',
    'Intervals', 'Bit Manipulation', 'Math & Geometry', 'Design'
  ];
  
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

// Populate sidebar with categories
function populateSidebar(categoryData) {
  const sidebar = document.querySelector('.sidebar-nav');
  if (!sidebar) return;
  
  sidebar.innerHTML = '';
  
  // DSA practice page URL
  const practicePage = '/p/practice.html';
  const isPracticePage = window.location.pathname.includes('/practice');
  
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
  
  if (isPracticePage) {
    // If on practice page, use in-page navigation
    allProblemsItem.innerHTML = `
      <a href="javascript:void(0)" class="sidebar-subnav-link" data-category="all">
        <span>All Problems</span>
        <span class="category-count">${categoryData.totalCount}</span>
      </a>
    `;
  } else {
    // If on other pages, link to practice page
    allProblemsItem.innerHTML = `
      <a href="${practicePage}" class="sidebar-subnav-link" data-category="all">
        <span>All Problems</span>
        <span class="category-count">${categoryData.totalCount}</span>
      </a>
    `;
  }
  dsaSubnav.appendChild(allProblemsItem);
  
  // Add all categories
  categoryData.orderedCategories.forEach(category => {
    const count = categoryData.categories[category];
    const subItem = document.createElement('li');
    subItem.className = 'sidebar-subnav-item';
    
    if (isPracticePage) {
      // If on practice page, use in-page navigation
      subItem.innerHTML = `
        <a href="javascript:void(0)" class="sidebar-subnav-link" data-category="${category}">
          <span>${category}</span>
          <span class="category-count">${count}</span>
        </a>
      `;
    } else {
      // If on other pages, link to practice page with category parameter
      subItem.innerHTML = `
        <a href="${practicePage}?category=${encodeURIComponent(category)}" class="sidebar-subnav-link" data-category="${category}">
          <span>${category}</span>
          <span class="category-count">${count}</span>
        </a>
      `;
    }
    dsaSubnav.appendChild(subItem);
  });
  
  // Add System Design link
  const sdItem = document.createElement('li');
  sdItem.className = 'sidebar-nav-item';
  sdItem.innerHTML = `
    <a href="https://blog.technavigator.io/search/label/system-design" class="sidebar-nav-link">
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
  
  // If we're on the practice page, add click handlers for in-page navigation
  if (isPracticePage) {
    // Wait for tech-navigator.js to load
    const checkInterval = setInterval(function() {
      if (typeof window.filterListByCategory === 'function') {
        clearInterval(checkInterval);
        
        // Add click handlers to all categories
        document.querySelectorAll('#dsa-subnav .sidebar-subnav-link').forEach(link => {
          link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            
            if (category === 'all') {
              window.populateListView();
            } else {
              window.filterListByCategory(category);
            }
            
            // Highlight active category
            document.querySelectorAll('#dsa-subnav .sidebar-subnav-link').forEach(l => {
              l.classList.remove('active');
            });
            this.classList.add('active');
          });
        });
        
        // Process URL parameter if present
        const urlParams = new URLSearchParams(window.location.search);
        const categoryParam = urlParams.get('category');
        
        if (categoryParam) {
          // Apply category filter
          window.filterListByCategory(categoryParam);
          
          // Update URL without reloading
          const url = new URL(window.location);
          url.searchParams.delete('category');
          window.history.replaceState({}, '', url);
          
          // Highlight active category
          const activeLink = document.querySelector(`.sidebar-subnav-link[data-category="${categoryParam}"]`);
          if (activeLink) {
            document.querySelectorAll('.sidebar-subnav-link').forEach(link => {
              link.classList.remove('active');
            });
            activeLink.classList.add('active');
          }
        }
      }
    }, 100);
  }
}
