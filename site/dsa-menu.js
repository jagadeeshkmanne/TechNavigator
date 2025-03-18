// DSA Basics Menu Data Structure
const dsaBasicsData = {
  "dataStructures": {
    "title": "Data Structures",
    "items": [
      {
        "name": "Arrays",
        "url": "https://www.technavigator.io/2025/03/data-structure-basics-arrays-introduction.html"
      },
      {
        "name": "Linked Lists",
        "url": "https://www.technavigator.io/2025/03/data-structure-basics-linked-list.html"
      },
      {
        "name": "Hash Tables",
        "url": "https://www.technavigator.io/2025/03/coming-soon.html"
      },
      {
        "name": "Stacks",
        "url": "https://www.technavigator.io/2025/03/coming-soon.html"
      },
      {
        "name": "Queues",
        "url": "https://www.technavigator.io/2025/03/coming-soon.html"
      },
      {
        "name": "Trees",
        "url": "https://www.technavigator.io/2025/03/coming-soon.html"
      },
      {
        "name": "Heaps",
        "url": "https://www.technavigator.io/2025/03/coming-soon.html"
      },
      {
        "name": "Tries",
        "url": "https://www.technavigator.io/2025/03/coming-soon.html"
      },
      {
        "name": "Graphs",
        "url": "https://www.technavigator.io/2025/03/coming-soon.html"
      }
    ]
  },
  "algorithms": {
    "title": "Algorithms",
    "items": [
      {
        "name": "Searching Algorithms",
        "url": "https://www.technavigator.io/2025/03/coming-soon.html"
      },
      {
        "name": "Sorting Algorithms",
        "url": "https://www.technavigator.io/2025/03/coming-soon.html"
      },
      {
        "name": "Graph Algorithms",
        "url": "https://www.technavigator.io/2025/03/coming-soon.html"
      },
      {
        "name": "Algorithm Techniques",
        "url": "https://www.technavigator.io/2025/03/coming-soon.html"
      },
      {
        "name": "Advanced Algorithms",
        "url": "https://www.technavigator.io/2025/03/coming-soon.html"
      }
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

// Add styles for the DSA menu (updated to exactly match System Design menu)
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
      color: var(--text-muted);
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s;
      border-radius: 4px 4px 0 0;
      cursor: pointer;
    }
    
    .dsa-tab-link:hover {
      color: #f97316;
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
      margin-left: 1.5rem;
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
    
    .dsa-menu-link {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 12px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s, color 0.2s;
    }
    
    .dsa-menu-link:hover {
      background-color: rgba(255, 255, 255, 0.05);
      color: #eee;
    }
    
    .dsa-menu-link.active {
      background-color: rgba(249, 115, 22, 0.1);
      color: #f97316;
      font-weight: 500;
    }
    
    /* Mobile Responsiveness */
    @media (max-width: 768px) {
      .dsa-tab-link {
        padding: 8px 6px;
        font-size: 12px;
      }
      
      .dsa-menu-link {
        padding: 5px 8px;
        font-size: 12px;
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

    // Create the container for the DSA menu
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

    // Current URL for matching links
    const currentURL = window.location.href.toLowerCase();
    
    // Determine which tab should be active
    let activeTabId = 'dataStructures'; // Default to data structures tab
    
    // Function to check if a URL matches
    const isUrlActive = (url) => {
      const normalizedUrl = url.toLowerCase();
      return currentURL.includes(normalizedUrl) || 
             currentURL.includes(normalizedUrl.replace('https://www.technavigator.io', ''));
    };
    
    // Check if any item in algorithms is active
    const isAlgorithmsActive = dsaBasicsData.algorithms.items.some(item => 
      isUrlActive(item.url)
    );
    
    // If an algorithms item is active, set the active tab
    if (isAlgorithmsActive) {
      activeTabId = 'algorithms';
    }

    // Create menu structure
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
      tab.className = `dsa-tab ${categoryKey === activeTabId ? 'active' : ''}`; 
      tab.innerHTML = `
        <a href="javascript:void(0)" class="dsa-tab-link" data-tab="${categoryKey}">
          ${category.title}
        </a>
      `;
      tabsContainer.appendChild(tab);
      
      // Create the tab panel
      const tabPanel = document.createElement('div');
      tabPanel.className = `dsa-tab-panel ${categoryKey === activeTabId ? 'active' : ''}`;
      tabPanel.id = `${categoryKey}-panel`;
      
      // Add items to the panel
      let panelContent = '';
      category.items.forEach(item => {
        // Check if this menu item should be active based on its href
        const isActive = isUrlActive(item.url);
        
        panelContent += `
          <div class="dsa-menu-item">
            <a href="${item.url}" class="dsa-menu-link ${isActive ? 'active' : ''}" data-name="${item.name.toLowerCase()}">
              ${item.name}
            </a>
          </div>
        `;
      });
      
      tabPanel.innerHTML = panelContent;
      tabPanelsContainer.appendChild(tabPanel);
    });
    
    // Add tab click handlers
    addTabClickHandlers();
    
    console.log("DSA Menu created successfully");
  } catch (error) {
    console.error("Error creating DSA menu:", error);
  }
}

// Add tab click handlers
function addTabClickHandlers() {
  document.querySelectorAll('.dsa-tab-link').forEach(tabLink => {
    tabLink.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get the tab ID
      const tabId = this.getAttribute('data-tab');
      
      // Remove active class from all tabs and panels
      document.querySelectorAll('.dsa-tab').forEach(tab => {
        tab.classList.remove('active');
      });
      document.querySelectorAll('.dsa-tab-panel').forEach(panel => {
        panel.classList.remove('active');
      });
      
      // Add active class to clicked tab
      this.parentElement.classList.add('active');
      
      // Show the corresponding panel
      document.getElementById(`${tabId}-panel`).classList.add('active');
    });
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  if (isDsaBasicsPage()) {
    createDsaMenu();
  }
});

// Re-check on window load
window.addEventListener('load', function() {
  if (isDsaBasicsPage()) {
    createDsaMenu();
  }
});
