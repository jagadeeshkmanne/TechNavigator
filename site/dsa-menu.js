// DSA Basics Menu Data Structure
const dsaBasicsData = {
  "dataStructures": {
    "title": "Data Structures",
    "items": [
      {
        "name": "Arrays",
        "url": "/dsa-basics/arrays",
        "subitems": [
          {"name": "Introduction", "url": "/dsa-basics/arrays/introduction"},
          {"name": "Basic Operations", "url": "/dsa-basics/arrays/basic-operations"},
          {"name": "Videos", "url": "/dsa-basics/arrays/videos"},
          {"name": "Practice", "url": "/dsa-basics/arrays/practice"}
        ]
      },
      // Other data structures remain unchanged...
    ]
  },
  "algorithms": {
    "title": "Algorithms",
    "items": [
      // Algorithms data remains unchanged...
    ]
  }
};

// Create our own sidebar for DSA Basics
function createDsaBasicsSidebar() {
  // Only run on DSA Basics pages
  if (!window.location.pathname.includes('/dsa-basics/')) {
    return;
  }

  // Get the sidebar
  let sidebar = document.querySelector('.sidebar-nav');
  if (!sidebar) {
    console.error("Sidebar not found, creating new one");
    sidebar = document.createElement('ul');
    sidebar.className = 'sidebar-nav';
    const sidebarContainer = document.querySelector('.sidebar');
    if (sidebarContainer) {
      sidebarContainer.innerHTML = ''; // Clear the container
      sidebarContainer.appendChild(sidebar);
    } else {
      console.error("Sidebar container not found");
      return;
    }
  } else {
    // Clear existing sidebar - this is intentional for DSA Basics pages
    sidebar.innerHTML = '';
  }

  // Create main DSA Basics menu item
  const dsaBasicsItem = document.createElement('li');
  dsaBasicsItem.className = 'sidebar-nav-item expanded';
  dsaBasicsItem.innerHTML = `
    <div class="sidebar-nav-link main-category">
      <svg fill='none' height='16' stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' viewBox='0 0 24 24' width='16' xmlns='http://www.w3.org/2000/svg'>
        <path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/>
        <rect x='9' y='2' width='6' height='4' rx='1'/>
        <path d='M9 12h6'/>
        <path d='M12 9v6'/>
      </svg>
      <span>DSA Basics</span>
    </div>
    <ul class="sidebar-subnav" id="dsa-basics-subnav"></ul>
  `;
  sidebar.appendChild(dsaBasicsItem);

  // Get the subnav container
  const dsaBasicsSubnav = document.getElementById('dsa-basics-subnav');

  // Add CSS styles for nested menus
  addDsaBasicsStyles();

  // Add each category section
  Object.keys(dsaBasicsData).forEach(categoryKey => {
    const category = dsaBasicsData[categoryKey];
    
    // Add category header
    const categoryHeader = document.createElement('li');
    categoryHeader.className = 'sidebar-subnav-item';
    categoryHeader.innerHTML = `
      <a href="javascript:void(0)" class="sidebar-subnav-link category-header">
        <span>${category.title}</span>
        <svg class="toggle-icon" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </a>
      <ul class="sidebar-nested-nav"></ul>
    `;
    dsaBasicsSubnav.appendChild(categoryHeader);
    
    // Get the nested nav container
    const nestedNav = categoryHeader.querySelector('.sidebar-nested-nav');
    
    // Add items for this category
    category.items.forEach(item => {
      const hasSubitems = item.subitems && item.subitems.length > 0;
      
      const itemElement = document.createElement('li');
      itemElement.className = 'sidebar-nested-item';
      
      if (hasSubitems) {
        itemElement.innerHTML = `
          <a href="${item.url}" class="sidebar-nested-link">
            <span>${item.name}</span>
            <svg class="toggle-icon" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </a>
          <ul class="sidebar-deep-nav"></ul>
        `;
        
        // Get the deep nav container
        const deepNav = itemElement.querySelector('.sidebar-deep-nav');
        
        // Add subitems
        item.subitems.forEach(subitem => {
          const hasDeepSubitems = subitem.subitems && subitem.subitems.length > 0;
          
          const subitemElement = document.createElement('li');
          subitemElement.className = 'sidebar-deep-item';
          
          if (hasDeepSubitems) {
            subitemElement.innerHTML = `
              <a href="${subitem.url}" class="sidebar-deep-link">
                <span>${subitem.name}</span>
                <svg class="toggle-icon" xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" 
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </a>
              <ul class="sidebar-extra-nav"></ul>
            `;
            
            // Get the extra nav container
            const extraNav = subitemElement.querySelector('.sidebar-extra-nav');
            
            // Add deep subitems
            subitem.subitems.forEach(extraItem => {
              const extraItemElement = document.createElement('li');
              extraItemElement.className = 'sidebar-extra-item';
              extraItemElement.innerHTML = `
                <a href="${extraItem.url}" class="sidebar-extra-link">
                  <span>${extraItem.name}</span>
                </a>
              `;
              extraNav.appendChild(extraItemElement);
            });
          } else {
            subitemElement.innerHTML = `
              <a href="${subitem.url}" class="sidebar-deep-link">
                <span>${subitem.name}</span>
              </a>
            `;
          }
          
          deepNav.appendChild(subitemElement);
        });
      } else {
        itemElement.innerHTML = `
          <a href="${item.url}" class="sidebar-nested-link">
            <span>${item.name}</span>
          </a>
        `;
      }
      
      nestedNav.appendChild(itemElement);
    });
  });

  // Add click handlers for menu toggling
  addMenuToggleHandlers();
  
  // Highlight active menu items
  highlightActivePath();
}

// Add CSS styles
function addDsaBasicsStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* DSA Basics Menu Styles */
    .sidebar-nested-nav, .sidebar-deep-nav, .sidebar-extra-nav {
      list-style: none;
      padding-left: 15px;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }
    
    .sidebar-subnav-item.expanded > .sidebar-nested-nav,
    .sidebar-nested-item.expanded > .sidebar-deep-nav,
    .sidebar-deep-item.expanded > .sidebar-extra-nav {
      max-height: 1000px; /* Large enough to show all content */
    }
    
    .category-header {
      font-weight: 600;
      color: var(--text-color);
      opacity: 0.8;
    }
    
    .sidebar-nested-link, .sidebar-deep-link, .sidebar-extra-link {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 12px;
      border-radius: 4px;
      transition: background-color 0.2s, color 0.2s;
    }
    
    .sidebar-nested-link:hover, .sidebar-deep-link:hover, .sidebar-extra-link:hover {
      background-color: rgba(255, 255, 255, 0.05);
      color: var(--text-color);
    }
    
    .sidebar-nested-link.active, .sidebar-deep-link.active, .sidebar-extra-link.active {
      background-color: rgba(249, 115, 22, 0.1);
      color: var(--professional-orange);
      font-weight: 500;
    }
    
    .sidebar-deep-link {
      font-size: 11px;
    }
    
    .sidebar-extra-link {
      font-size: 10px;
    }
    
    .toggle-icon {
      transition: transform 0.3s;
    }
    
    .sidebar-subnav-item.expanded > .sidebar-subnav-link .toggle-icon,
    .sidebar-nested-item.expanded > .sidebar-nested-link .toggle-icon,
    .sidebar-deep-item.expanded > .sidebar-deep-link .toggle-icon {
      transform: rotate(90deg);
    }
  `;
  document.head.appendChild(styleElement);
}

// Add click handlers for expandable menu items
function addMenuToggleHandlers() {
  // Category headers
  document.querySelectorAll('.sidebar-subnav-link.category-header').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const parent = this.parentElement;
      parent.classList.toggle('expanded');
    });
  });
  
  // Items with subitems
  document.querySelectorAll('.sidebar-nested-link .toggle-icon').forEach(icon => {
    icon.parentElement.addEventListener('click', function(e) {
      if (e.target === icon || e.target.closest('.toggle-icon') === icon) {
        e.preventDefault();
        const parent = this.parentElement;
        parent.classList.toggle('expanded');
      }
    });
  });
  
  // Deep items with extra subitems
  document.querySelectorAll('.sidebar-deep-link .toggle-icon').forEach(icon => {
    icon.parentElement.addEventListener('click', function(e) {
      if (e.target === icon || e.target.closest('.toggle-icon') === icon) {
        e.preventDefault();
        const parent = this.parentElement;
        parent.classList.toggle('expanded');
      }
    });
  });
}

// Highlight the active path and expand parent items
function highlightActivePath() {
  const currentUrl = window.location.pathname;
  
  // Find all links
  const allLinks = [
    ...document.querySelectorAll('.sidebar-nested-link'),
    ...document.querySelectorAll('.sidebar-deep-link'),
    ...document.querySelectorAll('.sidebar-extra-link')
  ];
  
  // Find the active link
  for (const link of allLinks) {
    const href = link.getAttribute('href');
    if (href === currentUrl) {
      // Add active class to the link
      link.classList.add('active');
      
      // Expand all parent containers
      let parent = link.parentElement;
      while (parent) {
        if (parent.classList.contains('sidebar-nested-item') || 
            parent.classList.contains('sidebar-deep-item') ||
            parent.classList.contains('sidebar-subnav-item')) {
          parent.classList.add('expanded');
        }
        parent = parent.parentElement;
      }
      
      break;
    }
  }
}

// Fix the original populateSidebar function to handle DSA Basics pages
(function() {
  // Store the original function
  const originalPopulateSidebar = window.populateSidebar;
  
  // Replace with our version
  window.populateSidebar = function(problems) {
    // Check if we're on a DSA Basics page
    if (window.location.pathname.includes('/dsa-basics/')) {
      // If on a DSA Basics page, use our custom sidebar
      createDsaBasicsSidebar();
    } else {
      // Otherwise, call the original function for other pages
      if (typeof originalPopulateSidebar === 'function') {
        originalPopulateSidebar(problems);
      }
    }
  };
})();

// Fix the controlMenuVisibilityByURL function
(function() {
  // Store the original function
  const originalControlMenuVisibilityByURL = window.controlMenuVisibilityByURL;
  
  // Replace with our version
  window.controlMenuVisibilityByURL = function() {
    // Check if we're on a DSA Basics page
    if (window.location.pathname.includes('/dsa-basics/')) {
      // If on a DSA Basics page, use our custom sidebar
      createDsaBasicsSidebar();
    } else {
      // Otherwise, call the original function for other pages
      if (typeof originalControlMenuVisibilityByURL === 'function') {
        originalControlMenuVisibilityByURL();
      }
    }
  };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on a DSA Basics page and create our sidebar if needed
  if (window.location.pathname.includes('/dsa-basics/')) {
    createDsaBasicsSidebar();
  }
});
