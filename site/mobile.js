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
        min-height: 100% !important;
        transition: left 0.3s ease !important;
        z-index: 100 !important;
        overflow-y: auto !important;
        box-shadow: none !important;
        padding-bottom: 60px !important; /* Add extra padding at bottom for scroll space */
      }
      
      /* Fix for sidebar body to ensure proper height */
      .sidebar-body {
        height: auto !important;
        min-height: calc(100vh - 56px) !important;
      }
      
      /* Fix for sidebar-nav to ensure it fills the space */
      .sidebar-nav {
        min-height: calc(100vh - 120px) !important;
      }
      
      .sidebar.active {
        left: 0 !important;
        box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2) !important;
        display: block !important;
        bottom: 0 !important; /* Ensure it extends to bottom of screen */
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
    
    // Force height calculation first
    sidebar.style.height = `calc(100vh - 56px)`;
    sidebar.style.minHeight = `100%`;
    
    // Then add active class
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
      sidebar.style.height = `calc(100vh - 56px)`;
      sidebar.style.minHeight = `100%`;
      sidebar.style.bottom = '0';
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
      sidebar.style.height = `calc(100vh - 56px)`;
      sidebar.style.minHeight = `100%`;
      sidebar.style.bottom = '0';
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

// Function to apply full-height fix when DOM is loaded
function applySidebarHeightFix() {
  // Apply the height fix to sidebar elements
  const sidebar = document.querySelector('.sidebar');
  if (sidebar && window.innerWidth <= 768) {
    sidebar.style.height = `calc(100vh - 56px)`;
    sidebar.style.minHeight = `100%`;
    
    // Also fix any inner sidebar elements
    const sidebarBody = sidebar.querySelector('.sidebar-body');
    if (sidebarBody) {
      sidebarBody.style.height = 'auto';
      sidebarBody.style.minHeight = `calc(100vh - 56px)`;
    }
    
    const sidebarNav = sidebar.querySelector('.sidebar-nav');
    if (sidebarNav) {
      sidebarNav.style.minHeight = `calc(100vh - 120px)`;
    }
  }
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

    // Set minimum width on mobile to prevent column squishing
    if (window.innerWidth <= 768) {
      // Calculate and set minimum width for the table
      const minWidth = calculateTotalWidth(table);
      table.style.minWidth = minWidth + 'px';
    }
  });
}

// Calculate the total width needed for a table based on column widths
function calculateTotalWidth(table) {
  let totalWidth = 0;
  
  // Define column widths based on mobile breakpoint - first column (status) is hidden
  const columnWidths = [0, 30, 40, 150, 80, 70]; // Adjusted with 0 for hidden status column
  
  // Count actual columns in the table
  const headerCells = table.querySelectorAll('thead th');
  const columnCount = headerCells.length;
  
  // Sum up the widths of existing columns
  for (let i = 0; i < columnCount; i++) {
    if (i < columnWidths.length) {
      totalWidth += columnWidths[i];
    } else {
      // Default width for any extra columns
      totalWidth += 50;
    }
  }
  
  // Add a small buffer
  totalWidth += 5;
  
  return totalWidth;
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
    /* Responsive Table Styles - Prioritizing Editorial Column */
    
    /* Table scroll container */
    .table-scroll-container {
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      margin-bottom: 1rem;
      position: relative;
    }
    
    /* Basic table styles for all views */
    .problem-table, .list-table {
      width: 100%;
      border-collapse: collapse;
      margin: 0;
    }
    
    /* Mobile specific styles */
    @media screen and (max-width: 768px) {
      /* Hide status column on mobile to prioritize editorial */
      .problem-table th:nth-child(1), .problem-table td:nth-child(1),
      .list-table th:nth-child(1), .list-table td:nth-child(1) {
        display: none !important;
      }
      
      /* Ensure editorial column is visible and given more prominence */
      .problem-table th:nth-child(3), .problem-table td:nth-child(3),
      .list-table th:nth-child(3), .list-table td:nth-child(3) {
        display: table-cell !important;
        width: 40px !important;
        min-width: 40px !important;
        padding: 0.4rem 0.3rem !important;
      }
      
      /* Make editorial icon slightly larger for better visibility */
      .editorial-wrapper svg {
        width: 18px !important;
        height: 18px !important;
      }
      
      /* Ensure list view table has fixed column widths */
      .list-table th:nth-child(2), .list-table td:nth-child(2) { width: 30px; min-width: 30px; }
      .list-table th:nth-child(4), .list-table td:nth-child(4) { width: 150px; min-width: 150px; }
      .list-table th:nth-child(5), .list-table td:nth-child(5) { width: 80px; min-width: 80px; }
      .list-table th:nth-child(6), .list-table td:nth-child(6) { width: 70px; min-width: 70px; }
      
      /* Smaller font and padding for all tables */
      .problem-table th, .problem-table td,
      .list-table th, .list-table td {
        padding: 0.4rem 0.2rem !important;
        font-size: 0.65rem !important;
        white-space: nowrap !important; /* Prevent text wrapping */
      }
      
      /* Problem link text adjustments */
      .problem-link {
        max-width: 150px !important;
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
        max-width: 70px !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }
      
      /* Fix category display */
      .problem-category {
        white-space: nowrap !important;
        max-width: 80px !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        display: inline-block !important;
      }
      
      /* Fix checkbox and icon sizes */
      .status-checkbox input[type="checkbox"] {
        width: 14px !important;
        height: 14px !important;
      }
      
      .revision-star-wrapper svg {
        width: 14px !important;
        height: 14px !important;
      }
    }
    
    /* Even smaller screens */
    @media screen and (max-width: 480px) {
      /* Further reduce font size */
      .problem-table th, .problem-table td,
      .list-table th, .list-table td {
        padding: 0.3rem 0.15rem !important;
        font-size: 0.6rem !important;
      }
      
      .problem-link {
        font-size: 0.6rem !important;
        max-width: 140px !important;
      }
      
      /* Smaller difficulty tag */
      .difficulty-tag {
        font-size: 0.5rem !important;
        max-width: 65px !important;
      }
      
      /* Smaller category */
      .problem-category {
        max-width: 70px !important;
        font-size: 0.6rem !important;
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
  
  // Apply sidebar height fix
  applySidebarHeightFix();
  
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
  } else {
    // Re-apply sidebar height fix on resize to mobile
    applySidebarHeightFix();
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
window.applySidebarHeightFix = applySidebarHeightFix;

// Try initialization again after a short delay
setTimeout(function() {
  if (!document.querySelector('.mobile-menu-toggle')) {
    createMobileMenuToggle();
  }
  makeTablesResponsive();
  fixMenuTabs();
  applySidebarHeightFix();
}, 1000);
