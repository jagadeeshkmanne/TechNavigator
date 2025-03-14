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

// Create simplified sidebar with just two tabs
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
    <ul class="sidebar-tabs" id="dsa-basics-tabs"></ul>
  `;
  sidebar.appendChild(dsaBasicsItem);

  // Add styles for the simplified sidebar
  addSimplifiedStyles();

  // Get the tabs container
  const tabsContainer = document.getElementById('dsa-basics-tabs');

  // Current URL for highlighting the active tab
  const currentURL = window.location.href.toLowerCase();
  
  // Determine which tab should be active
  const isDataStructures = isDataStructuresURL(currentURL);
  const isAlgorithms = isAlgorithmsURL(currentURL);

  // Create Data Structures tab
  const dsTab = document.createElement('li');
  dsTab.className = 'sidebar-tab' + (isDataStructures ? ' active' : '');
  dsTab.innerHTML = `
    <a href="javascript:void(0)" class="sidebar-tab-link" data-category="dataStructures">
      <span>Data Structures</span>
    </a>
    <div class="sidebar-tab-content" id="data-structures-content"></div>
  `;
  tabsContainer.appendChild(dsTab);

  // Create Algorithms tab
  const algoTab = document.createElement('li');
  algoTab.className = 'sidebar-tab' + (isAlgorithms ? ' active' : '');
  algoTab.innerHTML = `
    <a href="javascript:void(0)" class="sidebar-tab-link" data-category="algorithms">
      <span>Algorithms</span>
    </a>
    <div class="sidebar-tab-content" id="algorithms-content"></div>
  `;
  tabsContainer.appendChild(algoTab);

  // Populate Data Structures content
  const dsContent = document.getElementById('data-structures-content');
  dsContent.innerHTML = '';
  dsaBasicsData.dataStructures.items.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'sidebar-item';
    itemElement.innerHTML = `<a href="${item.url}" class="sidebar-item-link">${item.name}</a>`;
    dsContent.appendChild(itemElement);
  });

  // Populate Algorithms content
  const algoContent = document.getElementById('algorithms-content');
  algoContent.innerHTML = '';
  dsaBasicsData.algorithms.items.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'sidebar-item';
    itemElement.innerHTML = `<a href="${item.url}" class="sidebar-item-link">${item.name}</a>`;
    algoContent.appendChild(itemElement);
  });

  // Add tab click handlers
  addTabHandlers();
}

// Add styles for the simplified sidebar
function addSimplifiedStyles() {
  // Check if styles already exist
  if (document.getElementById('dsa-simplified-styles')) {
    return;
  }
  
  const styleElement = document.createElement('style');
  styleElement.id = 'dsa-simplified-styles';
  styleElement.textContent = `
    /* Simplified DSA Tabs Styles */
    .sidebar-tabs {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .sidebar-tab {
      flex: 1;
      text-align: center;
    }
    
    .sidebar-tab-link {
      display: block;
      padding: 10px;
      color: var(--text-muted, #888);
      text-decoration: none;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.2s;
    }
    
    .sidebar-tab.active .sidebar-tab-link {
      color: var(--primary-color, #f97316);
      border-bottom: 2px solid var(--primary-color, #f97316);
    }
    
    .sidebar-tab-content {
      display: none;
      padding: 10px 0;
    }
    
    .sidebar-tab.active .sidebar-tab-content {
      display: block;
    }
    
    .sidebar-item {
      margin-bottom: 6px;
    }
    
    .sidebar-item-link {
      display: block;
      padding: 6px 12px;
      color: var(--text-muted, #888);
      text-decoration: none;
      font-size: 12px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    
    .sidebar-item-link:hover {
      background-color: rgba(255, 255, 255, 0.05);
      color: var(--text-color, #fff);
    }
  `;
  document.head.appendChild(styleElement);
}

// Add tab click handlers
function addTabHandlers() {
  document.querySelectorAll('.sidebar-tab-link').forEach(tabLink => {
    tabLink.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove active class from all tabs
      document.querySelectorAll('.sidebar-tab').forEach(tab => {
        tab.classList.remove('active');
      });
      
      // Add active class to clicked tab
      this.parentElement.classList.add('active');
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
