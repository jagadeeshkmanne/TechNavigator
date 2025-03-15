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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  createMobileMenuToggle();
  
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
});

// Function to make tables responsive
function makeTablesResponsive() {
  // Find all tables
  const tables = document.querySelectorAll('.problem-table, .list-table');
  
  tables.forEach(table => {
    // Skip if already processed
    if (table.classList.contains('responsive-processed')) {
      return;
    }
    
    // Mark as processed
    table.classList.add('responsive-processed');
    
    // Find all table rows in tbody
    const rows = table.querySelectorAll('tbody tr');
    
    // Get header text for data labels
    const headerCells = table.querySelectorAll('thead th');
    const headerTexts = Array.from(headerCells).map(th => th.textContent.trim());
    
    // Add data attributes to cells for better mobile display
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      cells.forEach((cell, index) => {
        if (index < headerTexts.length) {
          cell.setAttribute('data-label', headerTexts[index]);
        }
      });
    });
    
    // Make table scrollable on mobile
    const parent = table.parentElement;
    if (!parent.classList.contains('table-scroll-container')) {
      const scrollContainer = document.createElement('div');
      scrollContainer.className = 'table-scroll-container';
      scrollContainer.style.overflowX = 'auto';
      scrollContainer.style.width = '100%';
      
      // Replace table with scroll container containing the table
      parent.insertBefore(scrollContainer, table);
      scrollContainer.appendChild(table);
    }
  });
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

// Initialize responsive tables and mobile display when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  makeTablesResponsive();
  optimizeMobileDisplay();
  
  // Set up an observer to handle dynamically added tables
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        // Check if new tables were added
        const addedNodes = Array.from(mutation.addedNodes);
        const hasNewTable = addedNodes.some(node => {
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
        
        if (hasNewTable) {
          makeTablesResponsive();
        }
      }
    });
  });
  
  // Start observing the document
  observer.observe(document.body, { childList: true, subtree: true });
});

// Re-apply on window resize
window.addEventListener('resize', function() {
  optimizeMobileDisplay();
});

// Make the function globally available
window.makeTablesResponsive = makeTablesResponsive;
window.toggleMobileMenu = toggleMobileMenu;

// Try initialization again after a short delay
setTimeout(function() {
  if (!document.querySelector('.mobile-menu-toggle')) {
    createMobileMenuToggle();
  }
  makeTablesResponsive();
}, 1000);

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
    
    /* Table scroll container */
    .table-scroll-container {
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      margin-bottom: 1rem;
    }
    
    /* Mobile table styles */
    @media screen and (max-width: 768px) {
      .problem-table, .list-table {
        min-width: 600px;
      }
    }
  `;
  document.head.appendChild(style);
});
