// DSA Basics Menu Data Structure - Simplified to two main tabs
const dsaBasicsData = {
  "dataStructures": {
    "title": "Data Structures",
    "items": [
      {
        "name": "Arrays",
        "url": "https://www.technavigator.io/dsa-basics/arrays",
        "subitems": [
          {"name": "Introduction", "url": "https://www.technavigator.io/dsa-basics/arrays/introduction"},
          {"name": "Basic Operations", "url": "https://www.technavigator.io/dsa-basics/arrays/basic-operations"},
          {"name": "Videos", "url": "https://www.technavigator.io/dsa-basics/arrays/videos"},
          {"name": "Practice", "url": "https://www.technavigator.io/dsa-basics/arrays/practice"}
        ]
      },
      {
        "name": "Linked Lists",
        "url": "https://www.technavigator.io/dsa-basics/linked-lists",
        "subitems": [
          {"name": "Introduction", "url": "https://www.technavigator.io/dsa-basics/linked-lists/introduction"},
          {"name": "Basic Operations", "url": "https://www.technavigator.io/dsa-basics/linked-lists/basic-operations"},
          {"name": "Types", "url": "https://www.technavigator.io/dsa-basics/linked-lists/types"},
          {"name": "Videos", "url": "https://www.technavigator.io/dsa-basics/linked-lists/videos"},
          {"name": "Practice", "url": "https://www.technavigator.io/dsa-basics/linked-lists/practice"}
        ]
      },
      {
        "name": "Hash Tables",
        "url": "https://www.technavigator.io/dsa-basics/hash-tables"
      },
      {
        "name": "Stacks",
        "url": "https://www.technavigator.io/dsa-basics/stacks"
      },
      {
        "name": "Queues",
        "url": "https://www.technavigator.io/dsa-basics/queues"
      },
      {
        "name": "Trees",
        "url": "https://www.technavigator.io/dsa-basics/trees"
      },
      {
        "name": "Heaps",
        "url": "https://www.technavigator.io/dsa-basics/heaps"
      },
      {
        "name": "Tries",
        "url": "https://www.technavigator.io/dsa-basics/tries"
      },
      {
        "name": "Graphs",
        "url": "https://www.technavigator.io/dsa-basics/graphs"
      }
    ]
  },
  "algorithms": {
    "title": "Algorithms",
    "items": [
      {
        "name": "Searching Algorithms",
        "url": "https://www.technavigator.io/dsa-basics/searching-algorithms"
      },
      {
        "name": "Sorting Algorithms",
        "url": "https://www.technavigator.io/dsa-basics/sorting-algorithms"
      },
      {
        "name": "Graph Algorithms",
        "url": "https://www.technavigator.io/dsa-basics/graph-algorithms"
      },
      {
        "name": "Algorithm Techniques",
        "url": "https://www.technavigator.io/dsa-basics/algorithm-techniques"
      },
      {
        "name": "Advanced Algorithms",
        "url": "https://www.technavigator.io/dsa-basics/advanced-algorithms"
      }
    ]
  }
};

// Function to check if current page is a DSA Basics page
function isDsaBasicsPage() {
  const currentURL = window.location.href.toLowerCase();
  return currentURL.includes('dsa-basics') || 
         (currentURL.includes('technavigator.io') && 
          (currentURL.includes('/array') || 
           currentURL.includes('/linked-list') || 
           currentURL.includes('/stack') || 
           currentURL.includes('/queue') || 
           currentURL.includes('/tree') || 
           currentURL.includes('/graph') || 
           currentURL.includes('/algorithm') || 
           currentURL.includes('/search') || 
           currentURL.includes('/sort')));
}

// Function to determine if a URL is related to data structures
function isDataStructuresURL(url) {
  url = url.toLowerCase();
  return url.includes('datastructure-basics') || url.includes('data-structure-basics');
}

// Function to determine if a URL is related to algorithms
function isAlgorithmsURL(url) {
  url = url.toLowerCase();
  return url.includes('algorithm-basics') || url.includes('algorithms-basics');
}

// Create simplified sidebar with tabs and submenus
function createSimplifiedSidebar() {
  // Only run on DSA Basics pages
  if (!isDsaBasicsPage()) {
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
    // Clear existing sidebar
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
    <div class="sidebar-tabs-container">
      <ul class="sidebar-tabs" id="dsa-basics-tabs"></ul>
      <div class="sidebar-tab-panels" id="dsa-tab-panels"></div>
    </div>
  `;
  sidebar.appendChild(dsaBasicsItem);

  // Add styles for the tabs and submenus
  addTabStyles();

  // Get the tabs container
  const tabsContainer = document.getElementById('dsa-basics-tabs');
  const tabPanelsContainer = document.getElementById('dsa-tab-panels');

  // Current URL for highlighting the active tab
  const currentURL = window.location.href.toLowerCase();
  
  // Determine which tab should be active
  const isDataStructures = isDataStructuresURL(currentURL);
  const isAlgorithms = isAlgorithmsURL(currentURL);
  const activeTab = isDataStructures ? 'dataStructures' : (isAlgorithms ? 'algorithms' : 'dataStructures');

  // Create tabs
  Object.keys(dsaBasicsData).forEach(categoryKey => {
    const category = dsaBasicsData[categoryKey];
    const isActive = categoryKey === activeTab;
    
    // Create the tab
    const tab = document.createElement('li');
    tab.className = 'sidebar-tab' + (isActive ? ' active' : '');
    tab.innerHTML = `
      <a href="javascript:void(0)" class="sidebar-tab-link" data-tab="${categoryKey}">
        ${category.title}
      </a>
    `;
    tabsContainer.appendChild(tab);
    
    // Create the tab panel
    const tabPanel = document.createElement('div');
    tabPanel.className = 'sidebar-tab-panel' + (isActive ? ' active' : '');
    tabPanel.id = `${categoryKey}-panel`;
    
    // Add items to the panel
    let panelContent = '';
    category.items.forEach(item => {
      const hasSubitems = item.subitems && item.subitems.length > 0;
      
      if (hasSubitems) {
        panelContent += `
          <div class="sidebar-menu-item expandable">
            <div class="sidebar-menu-header">
              <a href="${item.url}" class="sidebar-menu-link">${item.name}</a>
              <span class="toggle-icon">▼</span>
            </div>
            <ul class="sidebar-submenu">
        `;
        
        item.subitems.forEach(subitem => {
          panelContent += `
            <li class="sidebar-submenu-item">
              <a href="${subitem.url}" class="sidebar-submenu-link">${subitem.name}</a>
            </li>
          `;
        });
        
        panelContent += `
            </ul>
          </div>
        `;
      } else {
        panelContent += `
          <div class="sidebar-menu-item">
            <a href="${item.url}" class="sidebar-menu-link">${item.name}</a>
          </div>
        `;
      }
    });
    
    tabPanel.innerHTML = panelContent;
    tabPanelsContainer.appendChild(tabPanel);
  });

  // Add tab click handlers
  addTabHandlers();
  
  // Add submenu toggle handlers
  addSubmenuHandlers();
}

// Add styles for the tabs and submenus
function addTabStyles() {
  // Check if styles already exist
  if (document.getElementById('dsa-tab-styles')) {
    return;
  }
  
  const styleElement = document.createElement('style');
  styleElement.id = 'dsa-tab-styles';
  styleElement.textContent = `
    /* DSA Tabs and Submenus Styles */
    .sidebar-tabs-container {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    
    .sidebar-tabs {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      background-color: rgba(0, 0, 0, 0.15);
      border-radius: 4px 4px 0 0;
      position: relative;
      z-index: 1;
    }
    
    .sidebar-tab {
      flex: 1;
      position: relative;
    }
    
    .sidebar-tab-link {
      display: block;
      padding: 10px 12px;
      text-align: center;
      color: var(--text-muted, #888);
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s;
      border-radius: 4px 4px 0 0;
    }
    
    .sidebar-tab.active .sidebar-tab-link {
      color: var(--primary-color, #f97316);
      background-color: var(--background-color, #1e1e1e);
      font-weight: 600;
      position: relative;
      box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
    }
    
    /* Tab bottom border */
    .sidebar-tab.active .sidebar-tab-link:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background-color: var(--primary-color, #f97316);
    }
    
    .sidebar-tab-panels {
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 5px;
    }
    
    .sidebar-tab-panel {
      display: none;
      padding: 5px 0;
    }
    
    .sidebar-tab-panel.active {
      display: block;
    }
    
    /* Menu items within tab panels */
    .sidebar-menu-item {
      margin-bottom: 4px;
    }
    
    .sidebar-menu-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
    }
    
    .sidebar-menu-link {
      display: block;
      padding: 6px 12px;
      color: var(--text-muted, #888);
      text-decoration: none;
      font-size: 13px;
      border-radius: 4px;
      transition: background-color 0.2s;
      flex-grow: 1;
    }
    
    .sidebar-menu-link:hover {
      background-color: rgba(255, 255, 255, 0.05);
      color: var(--text-color, #eee);
    }
    
    .toggle-icon {
      font-size: 8px;
      color: var(--text-muted, #888);
      margin-right: 10px;
      transition: transform 0.3s;
    }
    
    .sidebar-menu-item.expanded .toggle-icon {
      transform: rotate(180deg);
    }
    
    /* Submenu styles */
    .sidebar-submenu {
      list-style: none;
      padding-left: 15px;
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }
    
    .sidebar-menu-item.expanded .sidebar-submenu {
      max-height: 500px;
    }
    
    .sidebar-submenu-item {
      margin: 2px 0;
    }
    
    .sidebar-submenu-link {
      display: block;
      padding: 4px 12px;
      color: var(--text-muted, #888);
      text-decoration: none;
      font-size: 12px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    
    .sidebar-submenu-link:hover {
      background-color: rgba(255, 255, 255, 0.05);
      color: var(--text-color, #eee);
    }
  `;
  document.head.appendChild(styleElement);
}

// Add tab click handlers
function addTabHandlers() {
  document.querySelectorAll('.sidebar-tab-link').forEach(tabLink => {
    tabLink.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get the tab ID
      const tabId = this.getAttribute('data-tab');
      
      // Remove active class from all tabs and panels
      document.querySelectorAll('.sidebar-tab').forEach(tab => {
        tab.classList.remove('active');
      });
      document.querySelectorAll('.sidebar-tab-panel').forEach(panel => {
        panel.classList.remove('active');
      });
      
      // Add active class to clicked tab
      this.parentElement.classList.add('active');
      
      // Show the corresponding panel
      document.getElementById(`${tabId}-panel`).classList.add('active');
    });
  });
}

// Add submenu toggle handlers
function addSubmenuHandlers() {
  document.querySelectorAll('.sidebar-menu-header').forEach(header => {
    header.addEventListener('click', function(e) {
      // If clicked on the link itself, allow normal navigation
      if (e.target.tagName === 'A') {
        return;
      }
      
      // Toggle expanded class on parent
      const menuItem = this.closest('.sidebar-menu-item');
      menuItem.classList.toggle('expanded');
      
      // Prevent link click if toggling
      e.preventDefault();
    });
  });
}

// Fix the original populateSidebar function to handle DSA Basics pages
(function() {
  // Store the original function
  const originalPopulateSidebar = window.populateSidebar;
  
  // Replace with our version
  window.populateSidebar = function(problems) {
    // Check if we're on a DSA Basics page
    if (isDsaBasicsPage()) {
      // If on a DSA Basics page, use our simplified sidebar
      createSimplifiedSidebar();
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
    if (isDsaBasicsPage()) {
      // If on a DSA Basics page, use our simplified sidebar
      createSimplifiedSidebar();
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
  if (isDsaBasicsPage()) {
    createSimplifiedSidebar();
  }
});

// Re-check on window load (in case images or other resources were still loading)
window.addEventListener('load', function() {
  // Check again after full page load
  if (isDsaBasicsPage()) {
    createSimplifiedSidebar();
  }
});
