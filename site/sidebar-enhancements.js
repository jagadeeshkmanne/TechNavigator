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
  const style = document.createElement('style');
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
    .dsa-tab-link,
    .sd-tab-link,
    .sd-menu-link {
      position: relative;
      overflow: hidden;
    }
  `;
  document.head.appendChild(style);
  
  // Attach ripple effect to clickable elements
  const clickableElements = document.querySelectorAll(`
    .sidebar-nav-link, 
    .sidebar-subnav-link, 
    .dsa-menu-header, 
    .dsa-submenu-header, 
    .dsa-submenu-link,
    .dsa-tab-link,
    .sd-tab-link,
    .sd-menu-link
  `);
  
  clickableElements.forEach(element => {
    element.addEventListener("click", createRipple);
  });
  
  // Enhance active state detection
  function updateActiveState() {
    const currentUrl = window.location.href.toLowerCase();
    
    // Check all sidebar links
    document.querySelectorAll('.sidebar-subnav-link').forEach(link => {
      if (link.getAttribute('href') && 
          currentUrl.includes(link.getAttribute('href').toLowerCase())) {
        link.classList.add('active');
        
        // Expand parent items
        const navItem = link.closest('.sidebar-nav-item');
        if (navItem) {
          navItem.classList.add('expanded');
        }
      }
    });
    
    // Check DSA and System Design links
    document.querySelectorAll('.dsa-submenu-link, .sd-menu-link').forEach(link => {
      if (link.getAttribute('href') && 
          currentUrl.includes(link.getAttribute('href').toLowerCase())) {
        link.classList.add('active');
        
        // Expand parent items and activate tab
        const menuItem = link.closest('.dsa-menu-item, .dsa-submenu-item');
        if (menuItem) {
          menuItem.classList.add('expanded');
          
          // Find tab panel and activate corresponding tab
          const panel = link.closest('.dsa-tab-panel, .sd-tab-panel');
          if (panel) {
            const tabId = panel.id.replace('-panel', '');
            const tab = document.querySelector(`.dsa-tab-link[data-tab="${tabId}"], 
                                              .sd-tab-link[data-tab="${tabId}"]`);
            if (tab) {
              // Remove active class from all tabs and panels
              document.querySelectorAll('.dsa-tab, .sd-tab').forEach(t => {
                t.classList.remove('active');
              });
              document.querySelectorAll('.dsa-tab-panel, .sd-tab-panel').forEach(p => {
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
  }
  
  // Add subtle scroll effect to sidebar navigation
  function addSmoothScrolling() {
    document.querySelectorAll('.sidebar-nav-link, .sidebar-subnav-link').forEach(link => {
      link.addEventListener('click', function(e) {
        // Don't interfere with normal link behavior if it has a real href
        if (this.getAttribute('href') && 
            this.getAttribute('href') !== 'javascript:void(0)' && 
            this.getAttribute('href') !== '#') {
          return;
        }
        
        e.preventDefault();
        
        // Add a small visual animation when clicked
        this.style.transform = 'scale(0.98)';
        setTimeout(() => {
          this.style.transform = '';
        }, 150);
        
        // If this is a main category, toggle expanded state
        if (this.classList.contains('main-category')) {
          const parent = this.closest('.sidebar-nav-item');
          if (parent) {
            parent.classList.toggle('expanded');
          }
        }
      });
    });
  }
  
  // Run enhancement functions
  updateActiveState();
  addSmoothScrolling();
  
  // Add simple hover effect for menu items
  const menuItems = document.querySelectorAll('.sidebar-nav-item');
  menuItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.style.transform = 'translateX(3px)';
    });
    
    item.addEventListener('mouseleave', () => {
      item.style.transform = '';
    });
  });
  
  console.log("Sidebar enhancements applied");
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', enhanceSidebar);

// Also run after a short delay to handle dynamically loaded content
setTimeout(enhanceSidebar, 1000);

// Add listener for any navigation events that might change the active state
window.addEventListener('popstate', enhanceSidebar);
