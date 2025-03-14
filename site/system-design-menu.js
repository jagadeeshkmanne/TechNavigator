// System Design Menu Data Structure
const systemDesignData = {
  "basics": {
    "title": "Basics",
    "items": [
      {"name": "System Design Fundamentals", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
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
    
    .sd-menu-section {
      margin-bottom: 15px;
    }
    
    .sd-menu-section.active .sd-menu-title {
      background-color: rgba(249, 115, 22, 0.2);
      color: #f97316;
    }
    
    .sd-menu-title {
      font-size: 15px;
      font-weight: 600;
      color: #eee;
      margin-bottom: 10px;
      padding: 8px 10px;
      border-left: 3px solid #f97316;
      background-color: rgba(249, 115, 22, 0.1);
      transition: all 0.2s;
    }
    
    .sd-menu-items {
      list-style: none;
      padding-left: 15px;
      margin: 0;
    }
    
    .sd-menu-item {
      margin: 6px 0;
    }
    
    .sd-menu-link {
      display: block;
      padding: 6px 10px;
      font-size: 14px;
      color: #888;
      text-decoration: none;
      border-radius: 4px;
      transition: all 0.2s;
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
      .sd-menu-section {
        margin-bottom: 10px;
      }
      
      .sd-menu-title {
        font-size: 14px;
        padding: 6px 8px;
      }
      
      .sd-menu-link {
        padding: 5px 8px;
        font-size: 13px;
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
    
    // Determine which section should be active based on URL
    let activeSection = null;
    let activeItem = null;
    
    // First pass: find the active item
    Object.keys(systemDesignData).forEach(sectionKey => {
      const section = systemDesignData[sectionKey];
      
      section.items.forEach(item => {
        // Extract topic from URL if present
        const urlParams = new URLSearchParams(window.location.search);
        const topicParam = urlParams.get('topic');
        
        // Check if this item should be active
        const itemNameInUrl = item.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        if (
          // Direct URL match
          currentURL.includes(itemNameInUrl) ||
          // Topic parameter match
          (topicParam && topicParam.toLowerCase() === item.name.toLowerCase()) ||
          // Path segment match
          currentURL.split('/').some(segment => segment.toLowerCase() === itemNameInUrl)
        ) {
          activeItem = item;
          activeSection = sectionKey;
        }
      });
    });
    
    // If no specific item is active but we're on a system design page,
    // determine the section based on URL segments
    if (!activeSection && currentURL.includes('system-design')) {
      if (currentURL.includes('basics') || currentURL.split('/').some(segment => systemDesignData.basics.items.some(item => 
        segment.toLowerCase() === item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')))) {
        activeSection = 'basics';
      } else if (currentURL.includes('design') || currentURL.split('/').some(segment => systemDesignData.realWorldSystems.items.some(item => 
        segment.toLowerCase() === item.name.toLowerCase().replace(/[^a-z0-9]/g, '-')))) {
        activeSection = 'realWorldSystems';
      } else {
        // Default to basics if no matching content
        activeSection = 'basics';
      }
    }
    
    // Generate menu content
    let menuContent = '';
    
    // Add each category
    Object.keys(systemDesignData).forEach(sectionKey => {
      const section = systemDesignData[sectionKey];
      const isSectionActive = sectionKey === activeSection;
      
      menuContent += `
        <div class="sd-menu-section ${isSectionActive ? 'active' : ''}">
          <div class="sd-menu-title">${section.title}</div>
          <ul class="sd-menu-items">
      `;
      
      // Add items
      section.items.forEach(item => {
        const isItemActive = activeItem && item.name === activeItem.name;
        
        menuContent += `
          <li class="sd-menu-item">
            <a href="${item.url}" class="sd-menu-link ${isItemActive ? 'active' : ''}" 
               data-name="${item.name.toLowerCase()}">${item.name}</a>
          </li>
        `;
      });
      
      menuContent += `
          </ul>
        </div>
      `;
    });
    
    // Set the menu content
    sdMenuContainer.innerHTML = menuContent;
    
    // Append to sidebar
    const menuItem = document.createElement('li');
    menuItem.className = 'sidebar-nav-item expanded';
    menuItem.appendChild(sdMenuContainer);
    sidebar.appendChild(menuItem);

    console.log("System Design Menu created successfully");
  } catch (error) {
    console.error("Error creating System Design menu:", error);
  }
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
