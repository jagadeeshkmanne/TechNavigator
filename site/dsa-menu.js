// DSA Basics Menu Data Structure
const dsaBasicsData = {
  "dataStructures": {
    "title": "Data Structures",
    "items": [
      {"name": "Arrays", "url": "https://www.technavigator.io/2025/03/data-structure-basics-arrays-introduction.html"},
      {"name": "Linked Lists", "url": "https://www.technavigator.io/2025/03/data-structure-basics-linked-list.html"},
      {"name": "Hash Tables", "url": "https://www.technavigator.io/2025/03/data-structure-basics-hash-tables.html"},
      {"name": "Stacks", "url": "https://www.technavigator.io/2025/03/data-structure-basics-stacks.html"},
      {"name": "Queues", "url": "https://www.technavigator.io/2025/03/data-structure-basics-queue.html"},
      {"name": "Trees", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Heaps", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Tries", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Graphs", "url": "https://www.technavigator.io/2025/03/coming-soon.html"}
    ]
  },
  "algorithms": {
    "title": "Algorithms",
    "items": [
      {"name": "Searching Algorithms", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Sorting Algorithms", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Graph Algorithms", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Algorithm Techniques", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Advanced Algorithms", "url": "https://www.technavigator.io/2025/03/coming-soon.html"}
    ]
  }
};

// Function to check if current page is a DSA Basics page
function isDsaBasicsPage() {
  const currentURL = window.location.href.toLowerCase();
  return currentURL.includes('datastructure-basics') || 
         currentURL.includes('data-structure-basics') ||
         currentURL.includes('algorithm-basics') || 
         currentURL.includes('algorithms-basics') ||
         currentURL.includes('/2025/03/coming-soon.html');
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

// Make the switchDsaTab function globally available
window.switchDsaTab = function(tabId) {
  console.log("Switching to tab:", tabId);
  
  // Remove active class from all tabs and panels
  document.querySelectorAll('.dsa-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  document.querySelectorAll('.dsa-tab-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  
  // Add active class to clicked tab
  const clickedTab = document.querySelector(`.dsa-tab-link[data-tab="${tabId}"]`);
  if (clickedTab) {
    clickedTab.parentElement.classList.add('active');
  }
  
  // Show the corresponding panel
  const panel = document.getElementById(`${tabId}-panel`);
  if (panel) {
    panel.classList.add('active');
  }
};

// Add styles for the DSA menu
function addDsaMenuStyles() {
  if (document.getElementById('dsa-menu-styles')) {
    return; // Styles already added
  }

  const styleElement = document.createElement('style');
  styleElement.id = 'dsa-menu-styles';
  styleElement.textContent = `
    /* DSA Menu Styles */
    .dsa-tabs-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    
    .dsa-tabs {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      background-color: rgba(0, 0, 0, 0.15);
      border-radius: 4px 4px 0 0;
    }
    
    .dsa-tab {
      flex: 1;
      position: relative;
    }
    
    .dsa-tab-link {
      display: block;
      padding: 10px 12px;
      text-align: center;
      color: #888;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s;
      border-radius: 4px 4px 0 0;
      cursor: pointer;
      position: relative;
      z-index: 5;
    }
    
    .dsa-tab.active .dsa-tab-link {
      color: #f97316;
      background-color: #1e1e1e;
      font-weight: 600;
    }
    
    .dsa-tab.active .dsa-tab-link:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background-color: #f97316;
    }
    
    .dsa-tab-panels {
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 5px;
      position: relative;
      z-index: 1;
    }
    
    .dsa-tab-panel {
      display: none;
      padding: 5px 0;
    }
    
    .dsa-tab-panel.active {
      display: block;
    }
    
    .dsa-menu-item {
      margin-bottom: 4px;
    }
    
    .dsa-submenu-link {
      display: block;
      padding: 6px 12px;
      color: #888;
      text-decoration: none;
      font-size: 13px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    
    .dsa-submenu-link:hover {
      background-color: rgba(255, 255, 255, 0.05);
      color: #eee;
    }
    
    .dsa-submenu-link.active {
      background-color: rgba(249, 115, 22, 0.1);
      color: #f97316;
      font-weight: 500;
    }
    
    /* Mobile-specific styles */
    @media screen and (max-width: 768px) {
      .dsa-tab-link {
        padding: 12px 8px;
        font-size: 12px;
      }
      
      .dsa-submenu-link {
        padding: 8px 12px;
        margin: 2px 0;
      }
    }
  `;
  document.head.appendChild(styleElement);
}

// Create the DSA menu
function createDsaMenu() {
  try {
    // Only run on DSA Basics pages
    if (!isDsaBasicsPage()) {
      return;
    }

    console.log("Creating DSA Menu...");

    // Add styles
    addDsaMenuStyles();

    // Create the menu structure
    const dsaMenuContainer = document.createElement('div');
    dsaMenuContainer.className = 'dsa-menu-container';

    // Get the sidebar or create a new one
    let sidebar = document.querySelector('.sidebar-nav');
    if (!sidebar) {
      console.log("Sidebar not found, creating new one");
      sidebar = document.createElement('ul');
      sidebar.className = 'sidebar-nav';
      const sidebarContainer = document.querySelector('.sidebar');
      if (sidebarContainer) {
        sidebarContainer.innerHTML = ''; // Clear the container
        sidebarContainer.appendChild(sidebar);
      } else {
        console.log("Sidebar container not found, inserting at body");
        document.body.appendChild(dsaMenuContainer);
        return;
      }
    } else {
      // Clear existing sidebar
      sidebar.innerHTML = '';
    }

    // Create the menu structure
    dsaMenuContainer.innerHTML = `
      <div class="dsa-tabs-container">
        <ul class="dsa-tabs" id="dsa-tabs"></ul>
        <div class="dsa-tab-panels" id="dsa-tab-panels"></div>
      </div>
    `;

    // Append to sidebar
    const menuItem = document.createElement('li');
    menuItem.className = 'sidebar-nav-item expanded';
    menuItem.appendChild(dsaMenuContainer);
    sidebar.appendChild(menuItem);

    // Current URL for matching links
    const currentURL = window.location.href.toLowerCase();
    
    // Determine which tab should be active by default
    const isDataStructures = isDataStructuresURL(currentURL);
    const isAlgorithms = isAlgorithmsURL(currentURL);
    const defaultActiveTab = isAlgorithms ? 'algorithms' : 'dataStructures';

    // Populate tabs
    const tabsContainer = document.getElementById('dsa-tabs');
    const tabPanelsContainer = document.getElementById('dsa-tab-panels');

    if (!tabsContainer || !tabPanelsContainer) {
      console.error("Tab containers not found");
      return;
    }

    // Create tabs
    Object.keys(dsaBasicsData).forEach(categoryKey => {
      const category = dsaBasicsData[categoryKey];
      
      // Create the tab
      const tab = document.createElement('li');
      tab.className = 'dsa-tab'; 
      
      // Use inline onclick for better mobile compatibility
      tab.innerHTML = `
        <a href="javascript:void(0)" class="dsa-tab-link" data-tab="${categoryKey}" onclick="switchDsaTab('${categoryKey}')">
          ${category.title}
        </a>
      `;
      tabsContainer.appendChild(tab);
      
      // Create the tab panel
      const tabPanel = document.createElement('div');
      tabPanel.className = 'dsa-tab-panel';
      tabPanel.id = `${categoryKey}-panel`;
      
      // Add items to the panel
      let panelContent = '';
      category.items.forEach(item => {
        panelContent += `
          <div class="dsa-menu-item" data-name="${item.name.toLowerCase()}">
            <a href="${item.url}" class="dsa-submenu-link">
              ${item.name}
            </a>
          </div>
        `;
      });
      
      tabPanel.innerHTML = panelContent;
      tabPanelsContainer.appendChild(tabPanel);
    });

    // Highlight active items
    highlightActiveItem(currentURL, defaultActiveTab);

    console.log("DSA Menu created successfully");
  } catch (error) {
    console.error("Error creating DSA menu:", error);
  }
}

// Highlight active item based on URL
function highlightActiveItem(currentURL, defaultActiveTab) {
  let activeLink = null;
  let activeTabId = defaultActiveTab;
  
  // Find all links in the sidebar
  const allLinks = document.querySelectorAll('.dsa-submenu-link');
  
  // Try to find an exact match for the current URL
  for (const link of allLinks) {
    const href = link.getAttribute('href').toLowerCase();
    if (currentURL.includes(href)) {
      activeLink = link;
      break;
    }
  }
  
  // If we found a matching link
  if (activeLink) {
    // Add active class to the link
    activeLink.classList.add('active');
    
    // Determine which tab this belongs to
    const panel = activeLink.closest('.dsa-tab-panel');
    if (panel) {
      activeTabId = panel.id.replace('-panel', '');
    }
  }
  
  // Activate the correct tab
  const activeTab = document.querySelector(`.dsa-tab-link[data-tab="${activeTabId}"]`);
  if (activeTab) {
    // Remove active class from all tabs and panels
    document.querySelectorAll('.dsa-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelectorAll('.dsa-tab-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    
    // Add active class to the tab
    activeTab.parentElement.classList.add('active');
    
    // Show the corresponding panel
    document.getElementById(`${activeTabId}-panel`).classList.add('active');
  }
}

// Add mobile-specific fixes
function addMobileFixes() {
  // Add styles for better mobile experience
  const mobileCss = document.createElement('style');
  mobileCss.textContent = `
    @media screen and (max-width: 768px) {
      /* Force tabs to be clickable */
      .dsa-tab-link, .sd-tab-link {
        pointer-events: auto !important;
        position: relative !important;
        z-index: 50 !important;
      }
      
      /* Increase tap target size */
      .dsa-tab-link, .sd-tab-link {
        padding: 12px 8px !important;
      }
      
      /* Make sure active panels display */
      .dsa-tab-panel.active, .sd-tab-panel.active {
        display: block !important;
      }
      
      /* Fix z-index issues */
      .dsa-tab, .sd-tab {
        position: relative !important;
      }
      
      /* Add active state for mobile */
      .dsa-tab.active, .sd-tab.active {
        background-color: rgba(249, 115, 22, 0.1) !important;
        position: relative !important;
      }
    }
  `;
  document.head.appendChild(mobileCss);
}

// Override the original functions
(function() {
  // Store original functions
  const originalPopulateSidebar = window.populateSidebar;
  const originalControlMenuVisibilityByURL = window.controlMenuVisibilityByURL;
  
  // Override populateSidebar
  window.populateSidebar = function(problems) {
    if (isDsaBasicsPage()) {
      createDsaMenu();
    } else if (typeof originalPopulateSidebar === 'function') {
      originalPopulateSidebar(problems);
    }
  };
  
  // Override controlMenuVisibilityByURL
  window.controlMenuVisibilityByURL = function() {
    if (isDsaBasicsPage()) {
      createDsaMenu();
    } else if (typeof originalControlMenuVisibilityByURL === 'function') {
      originalControlMenuVisibilityByURL();
    }
  };
})();

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  if (isDsaBasicsPage()) {
    // Apply mobile fixes first
    addMobileFixes();
    
    // Create menu
    createDsaMenu();
  }
});

// Re-check on window load
window.addEventListener('load', function() {
  if (isDsaBasicsPage()) {
    createDsaMenu();
    
    // If we're on the coming soon page, check if this is called from the menu
    if (window.location.href.toLowerCase().includes('/2025/03/coming-soon.html')) {
      // Make sure the menu is always visible on this page
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        sidebar.style.display = 'block';
      }
      
      // Force the sidebar to be visible
      const sidebarToggle = document.querySelector('.sidebar-toggle');
      if (sidebarToggle) {
        sidebarToggle.classList.add('active');
      }
    }
    
    // Try again after a short delay to ensure everything is processed
    setTimeout(function() {
      // Check if tabs are working
      const tabs = document.querySelectorAll('.dsa-tab-link');
      if (tabs.length > 0) {
        console.log("DSA tabs found, ensuring they're clickable");
        
        // Force tabs to be clickable with inline handlers
        tabs.forEach(tab => {
          if (!tab.getAttribute('onclick')) {
            const tabId = tab.getAttribute('data-tab');
            tab.setAttribute('onclick', `switchDsaTab('${tabId}')`);
          }
        });
      }
    }, 1000);
  }
});
