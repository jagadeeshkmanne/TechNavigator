// Function to create mobile toggle button
function createMobileMenuToggle() {
  // Check if button already exists
  if (document.querySelector('.mobile-menu-toggle')) {
    return;
  }
  
  // Create toggle button
  const toggleButton = document.createElement('button');
  toggleButton.className = 'mobile-menu-toggle';
  toggleButton.setAttribute('aria-label', 'Toggle menu');
  toggleButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" 
         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  `;
  
  // Add click event
  toggleButton.addEventListener('click', toggleMobileMenu);
  
  // Add to header (before the logo)
  const header = document.querySelector('.app-header');
  const logo = document.querySelector('.app-logo');
  
  if (header && logo) {
    header.insertBefore(toggleButton, logo);
  }
  
  // Add swipe functionality
  addSwipeDetection();
}

// Function to toggle mobile menu
function toggleMobileMenu() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.classList.toggle('active');
  }
}

// Function to handle swipe detection for the sidebar
function addSwipeDetection() {
  let touchStartX = 0;
  let touchEndX = 0;
  const minSwipeDistance = 50; // Minimum swipe distance in pixels
  
  // Detect touch start
  document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  }, false);
  
  // Detect touch end
  document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, false);
  
  // Handle swipe based on direction
  function handleSwipe() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    // Calculate swipe distance
    const swipeDistance = touchEndX - touchStartX;
    
    // Detect right swipe (open sidebar)
    if (swipeDistance > minSwipeDistance && window.innerWidth <= 768) {
      sidebar.classList.add('active');
    }
    
    // Detect left swipe (close sidebar)
    if (swipeDistance < -minSwipeDistance && window.innerWidth <= 768) {
      sidebar.classList.remove('active');
    }
  }
  
  // Add click event to close sidebar when clicking outside
  document.addEventListener('click', function(e) {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    
    // If sidebar is active and click is outside sidebar
    if (sidebar.classList.contains('active') && 
        !sidebar.contains(e.target) && 
        !e.target.classList.contains('mobile-menu-toggle')) {
      sidebar.classList.remove('active');
    }
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  createMobileMenuToggle();
  
  // Close sidebar after clicking a link (mobile UX improvement)
  const sidebarLinks = document.querySelectorAll('.sidebar-nav-link, .sidebar-subnav-link, .dsa-submenu-link, .sd-menu-link');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
          setTimeout(() => {
            sidebar.classList.remove('active');
          }, 150); // Small delay to allow the click to register first
        }
      }
    });
  });
  
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
    }
  }
});// Responsive Table Enhancement

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

// Initialize when DOM is loaded
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
