// System Design Menu Data Structure
const systemDesignData = {
  "basics": {
    "title": "Basics",
    "items": [
      {"name": "Fundamentals", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Networking", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "API Design", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Caching", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Databases", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Data Distribution", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Distributed Systems", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Messaging Systems", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Capacity Planning", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Scaling & Resilience", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Observability", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Security", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "System Visualization", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Design Patterns", "url": "https://www.technavigator.io/2025/03/coming-soon.html"}
    ]
  },
  "realWorldSystems": {
    "title": "Design",
    "items": [
      {"name": "URL Shortener", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Rate Limiter", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Key-Value Store", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Distributed Message Queue", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Twitter/Social Network Feed", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Instagram/Photo Sharing", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "YouTube/Video Streaming", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Google Drive/Dropbox", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "WhatsApp/Discord Chat", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Uber/Lyft Ride Sharing", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Google Maps/Location Services", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "E-commerce Platform", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Payment Processing", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Ticket Booking System", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Flight Booking System", "url": "https://www.technavigator.io/2025/03/coming-soon.html"}
    ]
  }
};

// Function to check if current page is a System Design page
function isSystemDesignPage() {
  const currentURL = window.location.href.toLowerCase();
  return currentURL.includes('system-design');
}

// Add styles for the System Design menu
function addSystemDesignMenuStyles() {
  if (document.getElementById('system-design-menu-styles')) {
    return; // Styles already added
  }

  const styleElement = document.createElement('style');
  styleElement.id = 'system-design-menu-styles';
  styleElement.textContent = `
    /* System Design Menu Styles */
    .sd-tabs-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    
    .sd-tabs {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      background-color: rgba(0, 0, 0, 0.15);
      border-radius: 4px 4px 0 0;
    }
    
    .sd-tab {
      flex: 1;
      position: relative;
    }
    
    .sd-tab-link {
      display: block;
      padding: 10px 12px;
      text-align: center;
      color: #888;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s;
      border-radius: 4px 4px 0 0;
    }
    
    .sd-tab.active .sd-tab-link {
      color: #f97316;
      background-color: #1e1e1e;
      font-weight: 600;
    }
    
    .sd-tab.active .sd-tab-link:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background-color: #f97316;
    }
    
    .sd-tab-panels {
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 5px;
    }
    
    .sd-tab-panel {
      display: none;
      padding: 5px 0;
    }
    
    .sd-tab-panel.active {
      display: block;
    }
    
    .sd-menu-item {
      margin-bottom: 4px;
    }
    
    .sd-menu-link {
      display: block;
      padding: 6px 12px;
      color: #888;
      text-decoration: none;
      font-size: 13px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    
    .sd-menu-link:hover {
      background-color: rgba(255, 255, 255, 0.05);
      color: #eee;
    }
    
    .sd-menu-link.active {
      background-color: rgba(249, 115, 22, 0.1);
      color: #f97316;
      font-weight: 500;
    }
    
    /* Mobile Responsiveness */
    @media (max-width: 768px) {
      .sd-tab-link {
        padding: 8px 6px;
        font-size: 12px;
      }
      
      .sd-menu-link {
        padding: 5px 8px;
        font-size: 12px;
      }
    }
  `;
  document.head.appendChild(styleElement);
}

// Create the System Design menu
function createSystemDesignMenu() {
  try {
    // Only run on System Design pages
    if (!isSystemDesignPage()) {
      return;
    }

    console.log("Creating System Design Menu...");

    // Add styles
    addSystemDesignMenuStyles();

    // Create the container for the System Design menu
    const sdMenuContainer = document.createElement('div');
    sdMenuContainer.className = 'system-design-menu-container';

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
        document.body.appendChild(sdMenuContainer);
        return;
      }
    } else {
      // Clear existing sidebar
      sidebar.innerHTML = '';
    }

    // Current URL for matching links
    const currentURL = window.location.href.toLowerCase();
    
    // Determine which tab should be active
    // Default to the first tab, but check if URL contains clues
    let activeTabId = 'basics';
    
    // Check URL for keywords that might indicate which tab to show
    if (currentURL.includes('design') || 
        currentURL.includes('twitter') || 
        currentURL.includes('shortener') ||
        currentURL.includes('limiter') ||
        currentURL.includes('queue') ||
        currentURL.includes('chat') ||
        currentURL.includes('streaming') ||
        currentURL.includes('booking')) {
      activeTabId = 'realWorldSystems';
    }
    
    // Create menu structure
    sdMenuContainer.innerHTML = `
      <div class="sd-tabs-container">
        <ul class="sd-tabs" id="sd-tabs"></ul>
        <div class="sd-tab-panels" id="sd-tab-panels"></div>
      </div>
    `;
    
    // Append to sidebar
    const menuItem = document.createElement('li');
    menuItem.className = 'sidebar-nav-item expanded';
    menuItem.appendChild(sdMenuContainer);
    sidebar.appendChild(menuItem);
    
    // Populate tabs
    const tabsContainer = document.getElementById('sd-tabs');
    const tabPanelsContainer = document.getElementById('sd-tab-panels');
    
    if (!tabsContainer || !tabPanelsContainer) {
      console.error("Tab containers not found");
      return;
    }
    
    // Create tabs
    Object.keys(systemDesignData).forEach(categoryKey => {
      const category = systemDesignData[categoryKey];
      
      // Create the tab
      const tab = document.createElement('li');
      tab.className = `sd-tab ${categoryKey === activeTabId ? 'active' : ''}`; 
      tab.innerHTML = `
        <a href="javascript:void(0)" class="sd-tab-link" data-tab="${categoryKey}">
          ${category.title}
        </a>
      `;
      tabsContainer.appendChild(tab);
      
      // Create the tab panel
      const tabPanel = document.createElement('div');
      tabPanel.className = `sd-tab-panel ${categoryKey === activeTabId ? 'active' : ''}`;
      tabPanel.id = `${categoryKey}-panel`;
      
      // Add items to the panel
      let panelContent = '';
      category.items.forEach(item => {
        // Check if this menu item should be active
        const isActive = currentURL.includes(item.name.toLowerCase().replace(/[^a-z0-9]/g, '-'));
        
        panelContent += `
          <div class="sd-menu-item">
            <a href="${item.url}" class="sd-menu-link ${isActive ? 'active' : ''}" data-name="${item.name.toLowerCase()}">
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
    
    console.log("System Design Menu created successfully");
  } catch (error) {
    console.error("Error creating System Design menu:", error);
  }
}

// Add tab click handlers
function addTabClickHandlers() {
  document.querySelectorAll('.sd-tab-link').forEach(tabLink => {
    tabLink.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get the tab ID
      const tabId = this.getAttribute('data-tab');
      
      // Remove active class from all tabs and panels
      document.querySelectorAll('.sd-tab').forEach(tab => {
        tab.classList.remove('active');
      });
      document.querySelectorAll('.sd-tab-panel').forEach(panel => {
        panel.classList.remove('active');
      });
      
      // Add active class to clicked tab
      this.parentElement.classList.add('active');
      
      // Show the corresponding panel
      document.getElementById(`${tabId}-panel`).classList.add('active');
    });
  });
}

// Override the original functions
(function() {
  // Store original functions
  const originalPopulateSidebar = window.populateSidebar;
  const originalControlMenuVisibilityByURL = window.controlMenuVisibilityByURL;
  
  // Override populateSidebar
  window.populateSidebar = function(problems) {
    if (isSystemDesignPage()) {
      createSystemDesignMenu();
    } else if (typeof originalPopulateSidebar === 'function') {
      originalPopulateSidebar(problems);
    }
  };
  
  // Override controlMenuVisibilityByURL
  window.controlMenuVisibilityByURL = function() {
    if (isSystemDesignPage()) {
      createSystemDesignMenu();
    } else if (typeof originalControlMenuVisibilityByURL === 'function') {
      originalControlMenuVisibilityByURL();
    }
  };
})();

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  if (isSystemDesignPage()) {
    createSystemDesignMenu();
  }
});

// Re-check on window load
window.addEventListener('load', function() {
  if (isSystemDesignPage()) {
    createSystemDesignMenu();
  }
});
