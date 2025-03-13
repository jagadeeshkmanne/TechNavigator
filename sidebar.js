// Sidebar Navigation Module

// Global constants
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

// Function to populate sidebar with DSA categories
function populateSidebar() {
  const sidebar = document.querySelector('.sidebar-nav');
  if (!sidebar) return;
  
  sidebar.innerHTML = '';
  
  // The URL for the DSA practice page
 // Change this line in sidebar.js
const dsaPracticePage = '/p/practice.html'; // Update to match your actual page URL
  
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
    <a href="${dsaPracticePage}" class="sidebar-subnav-link" data-category="all">
      <span>All Problems</span>
    </a>
  `;
  dsaSubnav.appendChild(allProblemsItem);
  
  // Add all DSA categories with links to practice page with category parameter
  categoryOrder.forEach(category => {
    const subItem = document.createElement('li');
    subItem.className = 'sidebar-subnav-item';
    
    subItem.innerHTML = `
      <a href="${dsaPracticePage}?category=${encodeURIComponent(category)}" class="sidebar-subnav-link" data-category="${category}">
        <span>${category}</span>
      </a>
    `;
    dsaSubnav.appendChild(subItem);
  });
  
  // Create System Design main category
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
  
  // Add click event to toggle DSA categories dropdown
  const dsaMainCategory = document.querySelector('.sidebar-nav-item:first-child .sidebar-nav-link');
  if (dsaMainCategory) {
    dsaMainCategory.addEventListener('click', function(e) {
      e.preventDefault(); // Prevent default to just toggle, not navigate
      const parentItem = this.closest('.sidebar-nav-item');
      parentItem.classList.toggle('expanded');
    });
    
    // Expand DSA section by default
    dsaMainCategory.closest('.sidebar-nav-item').classList.add('expanded');
  }
  
  // Check if we're on the DSA practice page
  if (isDSAPracticePage()) {
    // If we're already on the DSA page, override navigation to use in-page filtering
    document.querySelectorAll('#dsa-subnav .sidebar-subnav-link').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Get the category from the data attribute
        const category = this.getAttribute('data-category');
        
        // Highlight the active link
        document.querySelectorAll('#dsa-subnav .sidebar-subnav-link').forEach(l => {
          l.classList.remove('active');
        });
        this.classList.add('active');
        
        // Check if filterListByCategory function exists (DSA script loaded)
        if (typeof filterListByCategory === 'function') {
          if (category === 'all') {
            if (typeof populateListView === 'function') {
              populateListView();
            }
          } else {
            filterListByCategory(category);
          }
        } else {
          console.warn('filterListByCategory function not found. DSA script may not be loaded.');
        }
      });
    });
    
    // Highlight the current category if specified in URL
    const urlParams = new URLSearchParams(window.location.search);
    const currentCategory = urlParams.get('category');
    
    if (currentCategory) {
      const activeLink = document.querySelector(`.sidebar-subnav-link[data-category="${currentCategory}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
      }
    } else {
      // If no category specified, highlight "All Problems"
      const allLink = document.querySelector('.sidebar-subnav-link[data-category="all"]');
      if (allLink) {
        allLink.classList.add('active');
      }
    }
  }
}

// Function to detect if we're on the DSA practice page
function isDSAPracticePage() {
  return window.location.pathname.includes('/p/dsa-practice.html') || 
         window.location.pathname.includes('/dsa-practice') ||
         window.location.search.includes('practiceMode=true');
}

// Initialize sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  populateSidebar();
});

// Expose functions globally
window.categoryOrder = categoryOrder;
