// DSA Menu data structure in JSON format
const dsaMenuData = {
  "fundamentals": {
    "title": "Fundamentals",
    "items": [
      {"name": "Introduction to DSA", "url": "/dsa-basics/introduction-to-dsa"},
      {"name": "Big O Notation", "url": "/dsa-basics/big-o-notation"},
      {"name": "Memory Concepts", "url": "/dsa-basics/memory-concepts"}
    ]
  },
  "dataStructures": {
    "title": "Data Structures",
    "items": [
      {
        "name": "Arrays",
        "url": "/dsa-basics/arrays",
        "subitems": [
          {"name": "Introduction", "url": "/dsa-basics/arrays/introduction"},
          {"name": "Basic Operations", "url": "/dsa-basics/arrays/basic-operations"},
          {"name": "Videos", "url": "/dsa-basics/arrays/videos"},
          {"name": "Practice", "url": "/dsa-basics/arrays/practice"}
        ]
      },
      {
        "name": "Linked Lists",
        "url": "/dsa-basics/linked-lists",
        "subitems": [
          {"name": "Introduction", "url": "/dsa-basics/linked-lists/introduction"},
          {"name": "Basic Operations", "url": "/dsa-basics/linked-lists/basic-operations"},
          {"name": "Types", "url": "/dsa-basics/linked-lists/types"},
          {"name": "Videos", "url": "/dsa-basics/linked-lists/videos"},
          {"name": "Practice", "url": "/dsa-basics/linked-lists/practice"}
        ]
      }
      // Add the rest of your data structures here
    ]
  },
  "algorithms": {
    "title": "Algorithms",
    "items": [
      {
        "name": "Searching Algorithms",
        "url": "/dsa-basics/searching-algorithms",
        "subitems": [
          {"name": "Linear Search", "url": "/dsa-basics/searching-algorithms/linear-search"},
          {"name": "Binary Search", "url": "/dsa-basics/searching-algorithms/binary-search"},
          {"name": "Practice", "url": "/dsa-basics/searching-algorithms/practice"}
        ]
      }
      // Add the rest of your algorithms here
    ]
  }
};

// Function to generate the DSA Basics menu HTML
function generateDsaBasicsMenu() {
  // Check if on a DSA Basics page
  if (!window.location.pathname.includes('dsa-basics')) {
    return null;
  }
  
  // Create main container
  const container = document.createElement('ul');
  container.className = 'sidebar-subnav';
  
  // Add Fundamentals section
  const fundamentalsSection = document.createElement('li');
  fundamentalsSection.className = 'sidebar-subnav-item';
  fundamentalsSection.innerHTML = `
    <div class="sidebar-subnav-link main-category">
      <span>${dsaMenuData.fundamentals.title}</span>
      <svg class="category-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>
    <ul class="dsa-submenu"></ul>
  `;
  container.appendChild(fundamentalsSection);
  
  // Add fundamentals items
  const fundamentalsSubmenu = fundamentalsSection.querySelector('.dsa-submenu');
  dsaMenuData.fundamentals.items.forEach(item => {
    const menuItem = document.createElement('li');
    menuItem.className = 'dsa-menu-item';
    menuItem.innerHTML = `<a href="${item.url}" class="dsa-menu-link">${item.name}</a>`;
    fundamentalsSubmenu.appendChild(menuItem);
  });
  
  // Add Data Structures section
  const dataStructuresSection = document.createElement('li');
  dataStructuresSection.className = 'sidebar-subnav-item';
  dataStructuresSection.innerHTML = `
    <div class="sidebar-subnav-link main-category">
      <span>${dsaMenuData.dataStructures.title}</span>
      <svg class="category-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>
    <ul class="dsa-submenu"></ul>
  `;
  container.appendChild(dataStructuresSection);
  
  // Add data structures items
  const dataStructuresSubmenu = dataStructuresSection.querySelector('.dsa-submenu');
  dsaMenuData.dataStructures.items.forEach(item => {
    const menuItem = document.createElement('li');
    menuItem.className = 'dsa-menu-item';
    
    // If it has subitems
    if (item.subitems && item.subitems.length > 0) {
      menuItem.innerHTML = `
        <div class="dsa-menu-link with-children">
          <span>${item.name}</span>
          <svg class="submenu-arrow" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" 
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <ul class="dsa-subsubmenu"></ul>
      `;
      
      // Add subitems
      const subsubmenu = menuItem.querySelector('.dsa-subsubmenu');
      item.subitems.forEach(subitem => {
        const submenuItem = document.createElement('li');
        submenuItem.className = 'dsa-subsubmenu-item';
        
        // Handle the special case for tree traversal
        if (item.name === 'Trees' && subitem.name === 'Traversal' && subitem.subitems) {
          submenuItem.innerHTML = `
            <div class="dsa-subsubmenu-link with-children">
              <span>${subitem.name}</span>
              <svg class="submenu-arrow" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" 
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <ul class="dsa-deep-submenu"></ul>
          `;
          
          // Add deep level items
          const deepSubmenu = submenuItem.querySelector('.dsa-deep-submenu');
          subitem.subitems.forEach(deepItem => {
            const deepMenuItem = document.createElement('li');
            deepMenuItem.className = 'dsa-deep-submenu-item';
            deepMenuItem.innerHTML = `<a href="${deepItem.url}" class="dsa-deep-submenu-link">${deepItem.name}</a>`;
            deepSubmenu.appendChild(deepMenuItem);
          });
        } else {
          submenuItem.innerHTML = `<a href="${subitem.url}" class="dsa-subsubmenu-link">${subitem.name}</a>`;
        }
        
        subsubmenu.appendChild(submenuItem);
      });
    } else {
      menuItem.innerHTML = `<a href="${item.url}" class="dsa-menu-link">${item.name}</a>`;
    }
    
    dataStructuresSubmenu.appendChild(menuItem);
  });
  
  // Add Algorithms section
  const algorithmsSection = document.createElement('li');
  algorithmsSection.className = 'sidebar-subnav-item';
  algorithmsSection.innerHTML = `
    <div class="sidebar-subnav-link main-category">
      <span>${dsaMenuData.algorithms.title}</span>
      <svg class="category-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>
    <ul class="dsa-submenu"></ul>
  `;
  container.appendChild(algorithmsSection);
  
  // Add algorithms items (similar pattern to data structures)
  const algorithmsSubmenu = algorithmsSection.querySelector('.dsa-submenu');
  dsaMenuData.algorithms.items.forEach(item => {
    const menuItem = document.createElement('li');
    menuItem.className = 'dsa-menu-item';
    
    // If it has subitems
    if (item.subitems && item.subitems.length > 0) {
      menuItem.innerHTML = `
        <div class="dsa-menu-link with-children">
          <span>${item.name}</span>
          <svg class="submenu-arrow" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" 
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
        <ul class="dsa-subsubmenu"></ul>
      `;
      
      // Add subitems
      const subsubmenu = menuItem.querySelector('.dsa-subsubmenu');
      item.subitems.forEach(subitem => {
        const submenuItem = document.createElement('li');
        submenuItem.className = 'dsa-subsubmenu-item';
        
        // Handle nested subitems (like Shortest Path Algorithms)
        if (subitem.subitems && subitem.subitems.length > 0) {
          submenuItem.innerHTML = `
            <div class="dsa-subsubmenu-link with-children">
              <span>${subitem.name}</span>
              <svg class="submenu-arrow" xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" 
                   stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            <ul class="dsa-deep-submenu"></ul>
          `;
          
          // Add deep level items
          const deepSubmenu = submenuItem.querySelector('.dsa-deep-submenu');
          subitem.subitems.forEach(deepItem => {
            const deepMenuItem = document.createElement('li');
            deepMenuItem.className = 'dsa-deep-submenu-item';
            deepMenuItem.innerHTML = `<a href="${deepItem.url}" class="dsa-deep-submenu-link">${deepItem.name}</a>`;
            deepSubmenu.appendChild(deepMenuItem);
          });
        } else {
          submenuItem.innerHTML = `<a href="${subitem.url}" class="dsa-subsubmenu-link">${subitem.name}</a>`;
        }
        
        subsubmenu.appendChild(submenuItem);
      });
    } else {
      menuItem.innerHTML = `<a href="${item.url}" class="dsa-menu-link">${item.name}</a>`;
    }
    
    algorithmsSubmenu.appendChild(menuItem);
  });
  
  return container;
}

// Add DSA menu styles
function addDsaMenuStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* DSA Menu Styles */
    .dsa-submenu, .dsa-subsubmenu, .dsa-deep-submenu {
      list-style: none;
      padding-left: 15px;
      margin: 0;
      overflow: hidden;
      max-height: 0;
      transition: max-height 0.3s ease;
    }
    
    .sidebar-subnav-item.expanded > .dsa-submenu,
    .dsa-menu-item.expanded > .dsa-subsubmenu,
    .dsa-subsubmenu-item.expanded > .dsa-deep-submenu {
      max-height: 1000px;
    }
    
    .sidebar-subnav-link.main-category {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 10px;
      font-weight: 500;
      cursor: pointer;
    }
    
    .dsa-menu-link, .dsa-subsubmenu-link, .dsa-deep-submenu-link {
      display: block;
      padding: 6px 10px;
      color: #e6e6e6;
      text-decoration: none;
      font-size: 13px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    
    .dsa-menu-link.with-children, .dsa-subsubmenu-link.with-children {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
    }
    
    .dsa-menu-link:hover, .dsa-subsubmenu-link:hover, .dsa-deep-submenu-link:hover {
      background-color: rgba(97, 218, 251, 0.1);
    }
    
    .dsa-subsubmenu-link {
      padding-left: 15px;
      font-size: 12px;
    }
    
    .dsa-deep-submenu-link {
      padding-left: 18px;
      font-size: 11px;
    }
    
    .category-arrow, .submenu-arrow {
      transition: transform 0.3s ease;
    }
    
    .sidebar-subnav-item.expanded .category-arrow,
    .dsa-menu-item.expanded .submenu-arrow,
    .dsa-subsubmenu-item.expanded .submenu-arrow {
      transform: rotate(180deg);
    }
    
    /* Active page indicator */
    .dsa-menu-link.active, .dsa-subsubmenu-link.active, .dsa-deep-submenu-link.active {
      background-color: rgba(97, 218, 251, 0.2);
      color: #61dafb;
      font-weight: 500;
    }
  `;
  document.head.appendChild(styleElement);
}

// Hook into the original populateSidebar function from sidebar.js
(function() {
  // Store original populateSidebar function
  const originalPopulateSidebar = window.populateSidebar;
  
  // Override with our version
  window.populateSidebar = function(problems) {
    // Call the original function first
    originalPopulateSidebar(problems);
    
    // On DSA Basics pages, replace the dummy links
    if (window.location.pathname.includes('dsa-basics')) {
      // Get the DSA Basics subnav
      const dsaBasicsSubnav = document.getElementById('dsa-basics-subnav');
      if (dsaBasicsSubnav) {
        // Generate our menu
        const dsaMenu = generateDsaBasicsMenu();
        if (dsaMenu) {
          // Replace content
          dsaBasicsSubnav.innerHTML = '';
          dsaBasicsSubnav.appendChild(dsaMenu);
          
          // Add event listeners to the menu
          addMenuToggleEvents();
          
          // Highlight active menu item
          highlightActiveMenuItem();
        }
      }
    }
  };
})();

// Add toggle events for expandable menu items
function addMenuToggleEvents() {
  // Toggle main categories
  document.querySelectorAll('.sidebar-subnav-link.main-category').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const parent = this.parentElement;
      parent.classList.toggle('expanded');
    });
  });
  
  // Toggle menu items with children
  document.querySelectorAll('.dsa-menu-link.with-children').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const parent = this.parentElement;
      parent.classList.toggle('expanded');
    });
  });
  
  // Toggle subsubmenu items with children
  document.querySelectorAll('.dsa-subsubmenu-link.with-children').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const parent = this.parentElement;
      parent.classList.toggle('expanded');
    });
  });
}

// Highlight active menu item based on current URL
function highlightActiveMenuItem() {
  const currentUrl = window.location.pathname;
  
  // Find and highlight matching menu item
  const allLinks = document.querySelectorAll('.dsa-menu-link, .dsa-subsubmenu-link, .dsa-deep-submenu-link');
  allLinks.forEach(link => {
    if (link.getAttribute('href') === currentUrl) {
      link.classList.add('active');
      
      // Expand all parent menus
      let parent = link.parentElement;
      while (parent) {
        if (parent.classList.contains('dsa-menu-item') || 
            parent.classList.contains('dsa-subsubmenu-item') ||
            parent.classList.contains('sidebar-subnav-item')) {
          parent.classList.add('expanded');
        }
        parent = parent.parentElement;
      }
    }
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Add styles
  addDsaMenuStyles();
  
  // If sidebar has already been populated, update it
  if (document.getElementById('dsa-basics-subnav')) {
    const dsaMenu = generateDsaBasicsMenu();
    if (dsaMenu) {
      const dsaBasicsSubnav = document.getElementById('dsa-basics-subnav');
      dsaBasicsSubnav.innerHTML = '';
      dsaBasicsSubnav.appendChild(dsaMenu);
      
      // Add event listeners
      addMenuToggleEvents();
      
      // Highlight active item
      highlightActiveMenuItem();
    }
  }
});
