// Sidebar Interaction Enhancements for Tech Navigator

// Function to enhance sidebar interactions
function enhanceSidebar() {
  console.log("Enhancing sidebar interactions");
  
  // Add ripple effect to clickable elements
  function createRipple(event) {
    const button = event.currentTarget;
    
    // Don't create ripple if this is a link with href
    if (button.tagName === 'A' && button.getAttribute('href') !== 'javascript:void(0)' && 
        button.getAttribute('href') !== '#' && button.getAttribute('href')) {
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
  
  // Add ripple styles
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
    // Only add event listener once
    if (!element.hasAttribute('data-ripple-added')) {
      element.addEventListener("click", createRipple);
      element.setAttribute('data-ripple-added', 'true');
    }
  });
  
  // Enhance active state detection for all menu types
  function updateActiveState() {
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
              // Remove active class from all tabs and panels
              document.querySelectorAll('.dsa-tab').forEach(t => {
                t.classList.remove('active');
              });
              document.querySelectorAll('.dsa-tab-panel').forEach(p => {
                p.classList.remove('active');
              });
              
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
            // Remove active class from all tabs and panels
            document.querySelectorAll('.sd-tab').forEach(t => {
              t.classList.remove('active');
            });
            document.querySelectorAll('.sd-tab-panel').forEach(p => {
              p.classList.remove('active');
            });
            
            // Set active for current tab and panel
            tab.parentElement.classList.add('active');
            panel.classList.add('active');
          }
        }
      }
    });
  }
  
  // Add click handlers for all menu types
  function setupMenuInteractions() {
    // Main sidebar category toggles
    document.querySelectorAll('.sidebar-nav-link.main-category').forEach(link => {
      if (!link.hasAttribute('data-handler-added')) {
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
        link.setAttribute('data-handler-added', 'true');
      }
    });
    
    // DSA menu item toggles
    document.querySelectorAll('.dsa-menu-header').forEach(header => {
      if (!header.hasAttribute('data-handler-added')) {
        header.addEventListener('click', function() {
          const parent = this.closest('.dsa-menu-item');
          if (parent) {
            // If this item is already expanded, just collapse it
            if (parent.classList.contains('expanded')) {
              parent.classList.remove('expanded');
            } else {
              // Expand this item and collapse others
              const allItems = document.querySelectorAll('.dsa-menu-item');
              allItems.forEach(item => {
                item.classList.remove('expanded');
              });
              parent.classList.add('expanded');
            }
          }
        });
        header.setAttribute('data-handler-added', 'true');
      }
    });
    
    // DSA submenu toggles
    document.querySelectorAll('.dsa-submenu-header').forEach(header => {
      if (!header.hasAttribute('data-handler-added')) {
        header.addEventListener('click', function() {
          const parent = this.closest('.dsa-submenu-item');
          if (parent) {
            // If this item is already expanded, just collapse it
            if (parent.classList.contains('expanded')) {
              parent.classList.remove('expanded');
            } else {
              // Expand this item and collapse others
              const siblingItems = Array.from(parent.parentElement.children).filter(
                el => el.classList.contains('dsa-submenu-item')
              );
              siblingItems.forEach(item => {
                item.classList.remove('expanded');
              });
              parent.classList.add('expanded');
            }
          }
        });
        header.setAttribute('data-handler-added', 'true');
      }
    });
    
    // DSA and System Design tab handling
    document.querySelectorAll('.dsa-tab-link, .sd-tab-link').forEach(tabLink => {
      if (!tabLink.hasAttribute('data-handler-added')) {
        tabLink.addEventListener('click', function(e) {
          e.preventDefault();
          
          // Get the tab ID
          const tabId = this.getAttribute('data-tab');
          if (!tabId) return;
          
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
        });
        tabLink.setAttribute('data-handler-added', 'true');
      }
    });
  }
  
  // Add hover effects for menu items
  function addHoverEffects() {
    // All menu containers
    const containers = document.querySelectorAll('.sidebar-nav-item, .dsa-menu-item, .sd-menu-item');
    containers.forEach(container => {
      if (!container.hasAttribute('data-hover-added')) {
        container.addEventListener('mouseenter', () => {
          container.style.transform = 'translateX(2px)';
        });
        
        container.addEventListener('mouseleave', () => {
          container.style.transform = '';
        });
        container.setAttribute('data-hover-added', 'true');
      }
    });
    
    // All clickable menu items
    const items = document.querySelectorAll(`
      .sidebar-nav-link:not(.main-category), 
      .sidebar-subnav-link, 
      .dsa-submenu-link,
      .dsa-deep-submenu-link,
      .sd-menu-link
    `);
    
    items.forEach(item => {
      if (!item.hasAttribute('data-hover-added')) {
        item.addEventListener('mouseenter', () => {
          item.style.borderLeftWidth = '3px';
        });
        
        item.addEventListener('mouseleave', () => {
          item.style.borderLeftWidth = '2px';
        });
        item.setAttribute('data-hover-added', 'true');
      }
    });
  }
  
  // Run all enhancements
  updateActiveState();
  setupMenuInteractions();
  addHoverEffects();
  
  console.log("Sidebar enhancements applied");
}

// Check if Tech Navigator DSA menu is present
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
