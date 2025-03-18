// If we found a matching link
  if (activeLink) {
    // Add active class to the link
    activeLink.classList.add('active');
    
    // Expand parent menu items
    let parent = activeLink.parentElement;
    while (parent) {
      // For submenu item
      if (parent.classList.contains('dsa-menu-item')) {
        parent.classList.add('expanded');
        
        // Determine which tab this belongs to
        const panel = parent.closest('.dsa-tab-panel');
        if (panel) {
          activeTabId = panel.id.replace('-panel', '');
        }
      }
      
      parent = parent.parentElement;
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
      
      /* Improve menu headers */
      .dsa-menu-header, .dsa-submenu-header {
        padding: 10px 12px !important;
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
