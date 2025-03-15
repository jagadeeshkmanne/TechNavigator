// Sidebar Interaction Enhancements for Tech Navigator - FIXED

// Function to enhance sidebar interactions
function enhanceSidebar() {
  console.log("Enhancing sidebar interactions");
  
  // Add ripple effect to clickable elements
  function createRipple(event) {
    const button = event.currentTarget;
    
    // Don't create ripple if this is a link with href (that's not javascript:void(0))
    if (button.tagName === 'A' && button.getAttribute('href') && 
        button.getAttribute('href') !== 'javascript:void(0)' && 
        button.getAttribute('href') !== '#') {
      return;
    }
    
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    // Position ripple based on click location
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.classList.add("ripple");
    
    // Remove existing ripples
    const ripple = button.querySelector(".ripple");
    if (ripple) {
      ripple.remove();
    }
    
    button.appendChild(circle);
  }
  
  // Add ripple styles only once
  const styleId = "sidebar-ripple-styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      .ripple {
        position: absolute;
        background-color: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
      }
      
      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
      
      .sidebar-nav-link, 
      .sidebar-subnav-link, 
      .dsa-menu-header, 
      .dsa-submenu-header, 
      .dsa-submenu-link,
      .dsa-deep-submenu-link,
      .dsa-tab-link,
      .sd-tab-link,
      .sd-menu-link {
        position: relative;
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Keep track of event handlers to prevent duplicates
  const handledElements = new Set();
  
  // FIX: Ensure we don't break or duplicate existing click handlers
  // Attach ripple effect to clickable elements
  const clickableElements = document.querySelectorAll(`
    .sidebar-nav-link, 
    .sidebar-subnav-link, 
    .dsa-menu-header, 
    .dsa-submenu-header, 
    .dsa-submenu-link,
    .dsa-deep-submenu-link,
    .dsa-tab-link,
    .sd-tab-link,
    .sd-menu-link
  `);
  
  clickableElements.forEach(element => {
    const elementId = element.getAttribute('data-id') || 
                     element.getAttribute('id') || 
                     element.getAttribute('href') || 
                     element.textContent.trim();
    
    // Only add ripple if not already handled
    if (!handledElements.has('ripple-' + elementId)) {
      element.addEventListener("click", createRipple);
      handledElements.add('ripple-' + elementId);
    }
  });
  
  // FIX: Preserve existing click handlers for main category toggles
  function setupMainCategoryToggles() {
    document.querySelectorAll('.sidebar-nav-link.main-category').forEach(link => {
      const elementId = link.getAttribute('data-id') || 
                       link.getAttribute('id') || 
                       link.getAttribute('href') || 
                       link.textContent.trim();
      
      // Only add toggle handling if not already handled
      if (!handledElements.has('toggle-' + elementId)) {
        // Remove any existing onclick attributes to avoid conflicts
        const originalOnClick = link.getAttribute('onclick');
        if (originalOnClick) {
          link.removeAttribute('onclick');
        }
        
        link.addEventListener('click', function(e) {
          // Don't interfere with normal link behavior if it has a real href
          if (this.getAttribute('href') && 
              this.getAttribute('href') !== 'javascript:void(0)' && 
              this.getAttribute('href') !== '#') {
            return;
          }
          
          e.preventDefault();
          
          // Toggle the expanded state
          const parent = this.closest('.sidebar-nav-item');
          if (parent) {
            parent.classList.toggle('expanded');
          }
        });
        
        handledElements.add('toggle-' + elementId);
      }
    });
  }
  
  // FIX: Setup DSA menu toggles without breaking existing ones
  function setupDsaMenuToggles() {
    // DSA menu item toggles
    document.querySelectorAll('.dsa-menu-header').forEach(header => {
      const elementId = header.getAttribute('data-id') || 
                       header.getAttribute('id') || 
                       header.querySelector('.dsa-menu-title')?.textContent.trim();
      
      if (!elementId) return;
      
      // Only add event handler if not already handled
      if (!handledElements.has('dsa-toggle-' + elementId)) {
        // Remove any existing onclick attributes to avoid conflicts
        const originalOnClick = header.getAttribute('onclick');
        if (originalOnClick) {
          header.removeAttribute('onclick');
        }
        
        header.addEventListener('click', function(e) {
          const parent = this.closest('.dsa-menu-item');
          if (parent) {
            parent.classList.toggle('expanded');
          }
        });
        
        handledElements.add('dsa-toggle-' + elementId);
      }
    });
    
    // DSA submenu toggles
    document.querySelectorAll('.dsa-submenu-header').forEach(header => {
      const elementId = header.getAttribute('data-id') || 
                       header.getAttribute('id') || 
                       header.querySelector('.dsa-submenu-title')?.textContent.trim();
      
      if (!elementId) return;
      
      // Only add event handler if not already handled
      if (!handledElements.has('dsa-subtoggle-' + elementId)) {
        // Remove any existing onclick attributes to avoid conflicts
        const originalOnClick = header.getAttribute('onclick');
        if (originalOnClick) {
          header.removeAttribute('onclick');
        }
        
        header.addEventListener('click', function(e) {
          const parent = this.closest('.dsa-submenu-item');
          if (parent) {
            parent.classList.toggle('expanded');
          }
        });
        
        handledElements.add('dsa-subtoggle-' + elementId);
      }
    });
  }
  
  // FIX: Setup tab toggles without breaking existing ones
  function setupTabToggles() {
    // DSA and System Design tab handling
    document.querySelectorAll('.dsa-tab-link, .sd-tab-link').forEach(tabLink => {
      const tabId = tabLink.getAttribute('data-tab');
      if (!tabId) return;
      
      // Only add event handler if not already handled
      if (!handledElements.has('tab-toggle-' + tabId)) {
        // Remove any existing onclick attributes if it exists, to avoid conflicts
        const originalOnClick = tabLink.getAttribute('onclick');
        if (originalOnClick) {
          tabLink.removeAttribute('onclick');
        }
        
        tabLink.addEventListener('click', function(e) {
          e.preventDefault();
          
          // Determine if this is DSA or SD tab
          const isDsa = this.classList.contains('dsa-tab-link');
          const tabType = isDsa ? 'dsa' : 'sd';
          
          // Remove active class from all tabs and panels
          document.querySelectorAll(`.${tabType}-tab`).forEach(tab => {
            tab.classList.remove('active');
          });
          document.querySelectorAll(`.${tabType}-tab-panel`).forEach(panel => {
            panel.classList.remove('active');
          });
          
          // Add active class to clicked tab
          this.parentElement.classList.add('active');
          
          // Show the corresponding panel
          const panel = document.getElementById(`${tabId}-panel`);
          if (panel) {
            panel.classList.add('active');
          }
          
          // Call the original onclick if it existed
          if (originalOnClick) {
            try {
              new Function(originalOnClick).call(this);
            } catch (err) {
              console.error('Error executing original onclick:', err);
            }
          }
        });
        
        handledElements.add('tab-toggle-' + tabId);
      }
    });
  }
  
  // Run menu setup functions
  setupMainCategoryToggles();
  setupDsaMenuToggles();
  setupTabToggles();
  
  // FIX: Highlight active items without breaking existing active states
  function highlightActiveItems() {
    const currentUrl = window.location.href.toLowerCase();
    
    // Check all sidebar links
    document.querySelectorAll('.sidebar-subnav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href && currentUrl.includes(href.toLowerCase())) {
        link.classList.add('active');
        
        // Expand parent items
        const navItem = link.closest('.sidebar-nav-item');
        if (navItem) {
          navItem.classList.add('expanded');
        }
      }
    });
    
    // Check DSA menu links
    document.querySelectorAll('.dsa-submenu-link, .dsa-deep-submenu-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href && currentUrl.includes(href.toLowerCase())) {
        link.classList.add('active');
        
        // Expand parent items
        const menuItem = link.closest('.dsa-menu-item');
        const submenuItem = link.closest('.dsa-submenu-item');
        
        if (submenuItem) {
          submenuItem.classList.add('expanded');
        }
        
        if (menuItem) {
          menuItem.classList.add('expanded');
          
          // Find tab panel and activate corresponding tab
          const panel = link.closest('.dsa-tab-panel');
          if (panel) {
            const tabId = panel.id.replace('-panel', '');
            const tab = document.querySelector(`.dsa-tab-link[data-tab="${tabId}"]`);
            if (tab) {
              // Set active for current tab and panel
              tab.parentElement.classList.add('active');
              panel.classList.add('active');
            }
          }
        }
      }
    });
    
    // Check System Design links
    document.querySelectorAll('.sd-menu-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href && currentUrl.includes(href.toLowerCase())) {
        link.classList.add('active');
        
        // Find tab panel and activate corresponding tab
        const panel = link.closest('.sd-tab-panel');
        if (panel) {
          const tabId = panel.id.replace('-panel', '');
          const tab = document.querySelector(`.sd-tab-link[data-tab="${tabId}"]`);
          if (tab) {
            // Set active for current tab and panel
            tab.parentElement.classList.add('active');
            panel.classList.add('active');
          }
        }
      }
    });
  }
  
  // Run highlight active items
  highlightActiveItems();
  
  console.log("Sidebar enhancements applied");
}

// Check if Tech Navigator menu is present
function checkForTechNavigatorMenus() {
  // Run sidebar enhancements if any Tech Navigator menu is present
  const hasSidebar = document.querySelector('.sidebar-nav, .dsa-tabs-container, .sd-tabs-container');
  if (hasSidebar) {
    enhanceSidebar();
    return true;
  }
  return false;
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initial check
  const initialized = checkForTechNavigatorMenus();
  
  // If not initialized, try again after a delay
  if (!initialized) {
    setTimeout(checkForTechNavigatorMenus, 1000);
  }
});

// Also run after page loads completely
window.addEventListener('load', () => {
  checkForTechNavigatorMenus();
  
  // Run again after a delay to catch any dynamically loaded menus
  setTimeout(checkForTechNavigatorMenus, 1500);
});

// Set up a mutation observer to detect when menu elements are added to the DOM
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === 'childList' && mutation.addedNodes.length) {
      // Check if any menu elements were added
      const hasMenuElements = Array.from(mutation.addedNodes).some(node => {
        if (node.nodeType !== Node.ELEMENT_NODE) return false;
        return node.classList?.contains('sidebar-nav-item') || 
               node.querySelector?.('.sidebar-nav, .dsa-tabs-container, .sd-tabs-container');
      });
      
      if (hasMenuElements) {
        // Run enhancements if menu elements were added
        enhanceSidebar();
        break;
      }
    }
  }
});

// Start observing the document body for changes
observer.observe(document.body, { childList: true, subtree: true });
