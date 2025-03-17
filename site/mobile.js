// PART 1: MOBILE MENU CODE

// Function to create mobile toggle button
function createMobileMenuToggle() {
  // Check if button already exists
  if (document.querySelector('.mobile-menu-toggle')) {
    return;
  }
  
  // Create toggle button
  const toggleButton = document.createElement('button');
  toggleButton.className = 'mobile-menu-toggle';
  toggleButton.id = 'mobile-menu-toggle'; // Add ID for easier reference
  toggleButton.setAttribute('aria-label', 'Toggle menu');
  toggleButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  `;
  
  // Use onclick instead of addEventListener for better mobile compatibility
  toggleButton.onclick = function() {
    toggleMobileMenu();
    return false; // Prevent default
  };
  
  // Add to header (before the logo)
  const header = document.querySelector('.app-header');
  const logo = document.querySelector('.app-logo');
  
  if (header && logo) {
    header.insertBefore(toggleButton, logo);
  }
  
  // Add mobile menu styles
  addMobileMenuStyles();
  
  // Add swipe functionality
  addSwipeDetection();
}

// Add required CSS for mobile menu
function addMobileMenuStyles() {
  // Check if styles already exist
  if (document.getElementById('mobile-menu-styles')) {
    return;
  }
  
  const styleElement = document.createElement('style');
  styleElement.id = 'mobile-menu-styles';
  styleElement.textContent = `
    /* Mobile Menu Toggle Button */
    .mobile-menu-toggle {
      display: none;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      color: white;
      padding: 6px;
      margin-right: 0.5rem;
      cursor: pointer;
      z-index: 1001;
    }
    
    /* Force sidebar styles on mobile */
    @media screen and (max-width: 768px) {
      .mobile-menu-toggle {
        display: flex;
      }
      
      .sidebar {
        position: fixed !important;
        top: 56px !important;
        left: -100% !important;
        width: 80% !important;
        max-width: 300px !important;
        height: calc(100vh - 56px) !important;
        transition: left 0.3s ease !important;
        z-index: 100 !important;
        overflow-y: auto !important;
        box-shadow: none !important;
      }
      
      .sidebar.active {
        left: 0 !important;
        box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2) !important;
      }
      
      .main-content {
        margin-left: 0 !important;
        width: 100% !important;
      }
    }
  `;
  document.head.appendChild(styleElement);
}

// Improved function to toggle mobile menu
function toggleMobileMenu() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;
  
  // Check current state
  const isActive = sidebar.classList.contains('active');
  
  // Toggle class
  if (isActive) {
    sidebar.classList.remove('active');
  } else {
    // Force display block first, then add active class
    sidebar.style.display = 'block';
    sidebar.classList.add('active');
    
    // Force layout recalculation
    sidebar.offsetHeight;
  }
  
  // Force styles using setTimeout to ensure they apply
  setTimeout(function() {
    if (!isActive) {
      // Ensure sidebar is displayed and positioned correctly
      sidebar.style.left = '0';
      sidebar.style.display = 'block';
    } else {
      sidebar.style.left = '-100%';
    }
  }, 10);
}

// Function to handle swipe detection for the sidebar
function addSwipeDetection() {
  let touchStartX = 0;
  let touchEndX = 0;
  const minSwipeDistance = 50; // Minimum swipe distance in pixels
  
  // Detect touch start
  document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  }, {passive: true}); // Use passive listener for better performance
  
  // Detect touch end
  document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, {passive: true});
  
  // Handle swipe based on direction
  function handleSwipe() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    // Calculate swipe distance
    const swipeDistance = touchEndX - touchStartX;
    
    // Detect right swipe (open sidebar)
    if (swipeDistance > minSwipeDistance && window.innerWidth <= 768) {
      sidebar.style.display = 'block'; // Force display first
      sidebar.classList.add('active');
      sidebar.style.left = '0'; // Force left position
    }
    
    // Detect left swipe (close sidebar)
    if (swipeDistance < -minSwipeDistance && window.innerWidth <= 768) {
      sidebar.classList.remove('active');
      
      // Wait for animation to complete, then reset display
      setTimeout(() => {
        if (!sidebar.classList.contains('active')) {
          sidebar.style.left = '-100%';
        }
      }, 300);
    }
  }
  
  // Add click event to close sidebar when clicking outside
  document.addEventListener('click', function(e) {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    const toggleButton = document.getElementById('mobile-menu-toggle');
    
    // If sidebar is active and click is outside sidebar and not on toggle button
    if (sidebar.classList.contains('active') && 
        !sidebar.contains(e.target) && 
        (!toggleButton || !toggleButton.contains(e.target))) {
      sidebar.classList.remove('active');
    }
  });
}

// PART 2: RESPONSIVE TABLES CODE

// Improved function to make tables responsive with horizontal scrolling
function makeTablesResponsive() {
  // First, add required CSS if not already added
  addResponsiveTableStyles();
  
  // Find all tables
  const tables = document.querySelectorAll('.problem-table, .list-table');
  
  tables.forEach(table => {
    // Skip if already processed
    if (table.classList.contains('responsive-processed')) {
      return;
    }
    
    // Mark as processed
    table.classList.add('responsive-processed');
    
    // Make table scrollable on mobile by wrapping it
    const parent = table.parentElement;
    
    // Check if already wrapped in scroll container
    if (!parent.classList.contains('table-scroll-container')) {
      // Create the scroll container
      const scrollContainer = document.createElement('div');
      scrollContainer.className = 'table-scroll-container';
      
      // Replace table with scroll container containing the table
      parent.insertBefore(scrollContainer, table);
      scrollContainer.appendChild(table);
    }

    // Set minimum width to prevent column squishing
    table.style.minWidth = calculateTotalWidth(table) + 'px';
    
    // Force all cells to be visible (new code)
    const cells = table.querySelectorAll('th, td');
    cells.forEach(cell => {
      cell.style.display = 'table-cell';
      cell.style.visibility = 'visible';
    });
  });
}

// Calculate the total width needed for a table based on column widths
function calculateTotalWidth(table) {
  // Ensure a minimum total width of 350px for tables on mobile
  return 350;
}

// Add responsive table styles for horizontal scrolling with smaller fonts
function addResponsiveTableStyles() {
  // Check if styles are already added
  if (document.getElementById('responsive-table-styles')) {
    return;
  }
  
  const styleElement = document.createElement('style');
  styleElement.id = 'responsive-table-styles';
  styleElement.textContent = `
    /* Responsive Table Styles - Improved Fix */
    
    /* Table scroll container */
    .table-scroll-container {
      width: 100%;
      overflow-x: auto !important;
      -webkit-overflow-scrolling: touch !important;
      margin-bottom: 1rem;
      position: relative;
      scrollbar-width: thin;
    }
    
    /* Basic table styles for all views */
    .problem-table, .list-table {
      width: 100%;
      border-collapse: collapse;
      margin: 0;
      min-width: 350px; /* Ensure minimum width for horizontal scroll */
    }
    
    /* Mobile specific styles */
    @media screen and (max-width: 768px) {
      /* Force display for all columns */
      .problem-table th, .problem-table td,
      .list-table th, .list-table td {
        display: table-cell !important;
        visibility: visible !important;
      }
      
      /* Smaller font and padding for all tables */
      .problem-table th, .problem-table td,
      .list-table th, .list-table td {
        padding: 0.4rem 0.2rem !important;
        font-size: 0.65rem !important;
        white-space: nowrap !important; /* Prevent text wrapping */
      }
      
      /* Problem link text adjustments */
      .problem-link {
        max-width: 130px !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
        display: block !important;
        font-size: 0.65rem !important;
      }
      
      /* Smaller difficulty tags */
      .difficulty-tag {
        padding: 0.1rem 0.25rem !important;
        font-size: 0.55rem !important;
        white-space: nowrap !important;
        display: inline-block !important;
        max-width: 60px !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }
      
      /* Fix category display */
      .problem-category {
        white-space: nowrap !important;
        max-width: 70px !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        display: inline-block !important;
      }
      
      /* Fix checkbox and icon sizes */
      .status-checkbox input[type="checkbox"] {
        width: 14px !important;
        height: 14px !important;
      }
      
      .revision-star-wrapper svg, .editorial-wrapper svg {
        width: 14px !important;
        height: 14px !important;
      }
    }
  `;
  document.head.appendChild(styleElement);
}

// Function to optimize mobile display
function optimizeMobileDisplay() {
  // Hide text in navigation links on mobile
  if (window.innerWidth <= 480) {
    document.querySelectorAll('.nav-link span').forEach(span => {
      span.style.display = 'none';
    });
    
    // Simplify auth button
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn && !loginBtn.dataset.originalHtml) {
      loginBtn.dataset.originalHtml = loginBtn.innerHTML;
      loginBtn.innerHTML = `<img alt="Google" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" style="width: 18px;">`;
    }
  } else {
    document.querySelectorAll('.nav-link span').forEach(span => {
      span.style.display = '';
    });
    
    // Restore auth button
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn && loginBtn.dataset.originalHtml) {
      loginBtn.innerHTML = loginBtn.dataset.originalHtml;
    }
  }
}

// PART 3: MENU TABS FIX

// Fix for DSA and System Design tabs
function fixMenuTabs() {
  // Fix for DSA tabs
  const dsaTabs = document.querySelectorAll('.dsa-tab-link');
  dsaTabs.forEach(tab => {
    // Remove any existing event listeners
    const newTab = tab.cloneNode(true);
    tab.parentNode.replaceChild(newTab, tab);
    
    // Add click event
    newTab.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Get the tab ID
      const tabId = this.getAttribute('data-tab');
      
      // Remove active class from all tabs and panels
      document.querySelectorAll('.dsa-tab').forEach(t => {
        t.classList.remove('active');
      });
      document.querySelectorAll('.dsa-tab-panel').forEach(panel => {
        panel.classList.remove('active');
      });
      
      // Add active class to clicked tab
      this.parentElement.classList.add('active');
      
      // Show the corresponding panel
      const panel = document.getElementById(`${tabId}-panel`);
      if (panel) {
        panel.classList.add('active');
      }
    });
  });
  
  // Fix for System Design tabs
  const sdTabs = document.querySelectorAll('.sd-tab-link');
  sdTabs.forEach(tab => {
    // Remove any existing event listeners
    const newTab = tab.cloneNode(true);
    tab.parentNode.replaceChild(newTab, tab);
    
    // Add click event
    newTab.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Get the tab ID
      const tabId = this.getAttribute('data-tab');
      
      // Remove active class from all tabs and panels
      document.querySelectorAll('.sd-tab').forEach(t => {
        t.classList.remove('active');
      });
      document.querySelectorAll('.sd-tab-panel').forEach(panel => {
        panel.classList.remove('active');
      });
      
      // Add active class to clicked tab
      this.parentElement.classList.add('active');
      
      // Show the corresponding panel
      const panel = document.getElementById(`${tabId}-panel`);
      if (panel) {
        panel.classList.add('active');
      }
    });
  });
}

// Function to add listeners to view toggle buttons
function addViewButtonListeners() {
  // Re-apply table responsiveness after view changes
  const viewButtons = document.querySelectorAll('#category-view-btn, #list-view-btn, #revision-view-btn');
  viewButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Short delay to allow view to change
      setTimeout(makeTablesResponsive, 100);
    });
  });
}

// PART 4: INITIALIZATION

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu initialization
  createMobileMenuToggle();
  
  // Responsive tables initialization
  makeTablesResponsive();
  optimizeMobileDisplay();
  
  // Add view button listeners for table refresh
  addViewButtonListeners();
  
  // Menu tabs initialization
  setTimeout(fixMenuTabs, 1000);
  
  // Close sidebar after clicking a link (mobile UX improvement)
  document.body.addEventListener('click', function(e) {
    if (window.innerWidth <= 768) {
      // Check if the clicked element is a link or inside a link
      const isLink = e.target.tagName === 'A' || 
                     e.target.closest('a') || 
                     e.target.classList.contains('sidebar-nav-link') || 
                     e.target.classList.contains('sidebar-subnav-link') ||
                     e.target.classList.contains('dsa-submenu-link') || 
                     e.target.classList.contains('sd-menu-link');
      
      if (isLink) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && sidebar.classList.contains('active')) {
          setTimeout(() => {
            sidebar.classList.remove('active');
          }, 150); // Small delay to allow the click to register first
        }
      }
    }
  }, { capture: true }); // Use capture to ensure this runs before other handlers
  
  // Add viewport meta tag if not present
  if (!document.querySelector('meta[name="viewport"]')) {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    document.head.appendChild(meta);
  }
  
  // Set up an observer to handle dynamically added tables
  const observer = new MutationObserver(function(mutations) {
    let shouldProcessTables = false;
    let shouldProcessMenuTabs = false;
    
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        // Check if new tables were added
        const addedNodes = Array.from(mutation.addedNodes);
        
        // Check for new tables
        const hasNewTable = addedNodes.some(node => {
          if (node.nodeType !== 1) return false;
          
          // Check if the node itself is a table
          if (node.classList && 
              (node.classList.contains('problem-table') || 
               node.classList.contains('list-table'))) {
            return true;
          }
          
          // Check if the node contains tables
          if (node.querySelectorAll) {
            return node.querySelectorAll('.problem-table, .list-table').length > 0;
          }
          
          return false;
        });
        
        // Check for new menu tabs
        const hasMenuTabs = addedNodes.some(node => {
          if (node.nodeType !== 1) return false;
          
          return node.querySelectorAll && 
                (node.querySelectorAll('.dsa-tab-link').length > 0 || 
                 node.querySelectorAll('.sd-tab-link').length > 0);
        });
        
        if (hasNewTable) {
          shouldProcessTables = true;
        }
        
        if (hasMenuTabs) {
          shouldProcessMenuTabs = true;
        }
      }
    });
    
    if (shouldProcessTables) {
      makeTablesResponsive();
    }
    
    if (shouldProcessMenuTabs) {
      setTimeout(fixMenuTabs, 500);
    }
  });
  
  // Start observing the document
  observer.observe(document.body, { childList: true, subtree: true });
});

// Reinitialize on window resize
window.addEventListener('resize', function() {
  // Close mobile menu when switching to desktop view
  if (window.innerWidth > 768) {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.remove('active');
      sidebar.style.left = ''; // Reset inline styles
      sidebar.style.display = ''; // Reset inline styles
    }
  }
  
  optimizeMobileDisplay();
  
  // Re-apply table responsiveness on resize
  makeTablesResponsive();
});

// Fix for z-index issues
document.addEventListener('DOMContentLoaded', function() {
  const style = document.createElement('style');
  style.textContent = `
    .dsa-tab, .sd-tab {
      position: relative;
      z-index: 5;
    }
    .dsa-tab-link, .sd-tab-link {
      position: relative;
      z-index: 5;
      pointer-events: auto !important;
    }
    .dsa-tab-panels, .sd-tab-panels {
      position: relative;
      z-index: 3;
    }
  `;
  document.head.appendChild(style);
});

// Make functions globally available
window.toggleMobileMenu = toggleMobileMenu;
window.makeTablesResponsive = makeTablesResponsive;
window.fixMenuTabs = fixMenuTabs;

// Try initialization again after a short delay
setTimeout(function() {
  if (!document.querySelector('.mobile-menu-toggle')) {
    createMobileMenuToggle();
  }
  makeTablesResponsive();
  fixMenuTabs();
}, 1000);
