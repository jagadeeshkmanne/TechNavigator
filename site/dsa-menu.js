// DSA Basics Menu Data Structure (Simplified with URLs)
// Modifying the createDsaMenu function to work with simplified data structure
function createDsaMenu() {
  try {
    // Only run on DSA Basics pages
    if (!isDsaBasicsPage()) {
      return;
    }

    console.log("Creating DSA Menu...");

    // Add styles
    addDsaMenuStyles();

    // Create the menu structure
    const dsaMenuContainer = document.createElement('div');
    dsaMenuContainer.className = 'dsa-menu-container';

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
        document.body.appendChild(dsaMenuContainer);
        return;
      }
    } else {
      // Clear existing sidebar
      sidebar.innerHTML = '';
    }

    // Create the menu structure
    dsaMenuContainer.innerHTML = `
      <div class="dsa-tabs-container">
        <ul class="dsa-tabs" id="dsa-tabs"></ul>
        <div class="dsa-tab-panels" id="dsa-tab-panels"></div>
      </div>
    `;

    // Append to sidebar
    const menuItem = document.createElement('li');
    menuItem.className = 'sidebar-nav-item expanded';
    menuItem.appendChild(dsaMenuContainer);
    sidebar.appendChild(menuItem);

    // Current URL for matching links
    const currentURL = window.location.href.toLowerCase();
    
    // Determine which tab should be active by default
    const isDataStructures = isDataStructuresURL(currentURL);
    const isAlgorithms = isAlgorithmsURL(currentURL);
    const defaultActiveTab = isAlgorithms ? 'algorithms' : 'dataStructures';

    // Populate tabs
    const tabsContainer = document.getElementById('dsa-tabs');
    const tabPanelsContainer = document.getElementById('dsa-tab-panels');

    if (!tabsContainer || !tabPanelsContainer) {
      console.error("Tab containers not found");
      return;
    }

    // Create tabs
    Object.keys(dsaBasicsData).forEach(categoryKey => {
      const category = dsaBasicsData[categoryKey];
      
      // Create the tab
      const tab = document.createElement('li');
      tab.className = 'dsa-tab'; 
      
      // Use inline onclick for better mobile compatibility
      tab.innerHTML = `
        <a href="javascript:void(0)" class="dsa-tab-link" data-tab="${categoryKey}" onclick="switchDsaTab('${categoryKey}')">
          ${category.title}
        </a>
      `;
      tabsContainer.appendChild(tab);
      
      // Create the tab panel
      const tabPanel = document.createElement('div');
      tabPanel.className = 'dsa-tab-panel';
      tabPanel.id = `${categoryKey}-panel`;
      
      // Add items to the panel
      let panelContent = '';
      category.items.forEach(item => {
        panelContent += `
          <div class="dsa-menu-item" data-name="${item.name.toLowerCase()}">
            <div class="dsa-menu-header" onclick="toggleDsaMenuItem(this)">
              <span class="dsa-menu-title">${item.name}</span>
              <span class="dsa-toggle-icon">▼</span>
            </div>
            <ul class="dsa-submenu">
              <li class="dsa-submenu-item">
                <a href="${item.url}" class="dsa-submenu-link" data-name="introduction">Introduction</a>
              </li>
              <li class="dsa-submenu-item">
                <a href="${item.url}" class="dsa-submenu-link" data-name="basic-operations">Basic Operations</a>
              </li>
              <li class="dsa-submenu-item">
                <a href="${item.url}" class="dsa-submenu-link" data-name="practice">Practice</a>
              </li>
            </ul>
          </div>
        `;
      });
      
      tabPanel.innerHTML = panelContent;
      tabPanelsContainer.appendChild(tabPanel);
    });

    // Define global toggle function for menu items
    if (!window.toggleDsaMenuItem) {
      window.toggleDsaMenuItem = function(header) {
        // Get all menu items at this level
        const allMenuItems = document.querySelectorAll('.dsa-menu-item');
        const menuItem = header.closest('.dsa-menu-item');
        
        // If this item is already expanded, just collapse it
        if (menuItem.classList.contains('expanded')) {
          menuItem.classList.remove('expanded');
          return;
        }
        
        // Collapse all other items at this level
        allMenuItems.forEach(item => {
          item.classList.remove('expanded');
        });
        
        // Expand only this item
        menuItem.classList.add('expanded');
      };
    }

    // Highlight active items
    highlightActiveItem(currentURL, defaultActiveTab);

    console.log("DSA Menu created successfully");
  } catch (error) {
    console.error("Error creating DSA menu:", error);
  }
}

  "dataStructures": {
    "title": "Data Structures",
    "items": [
      {"name": "Arrays", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Linked Lists", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Hash Tables", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Stacks", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Queues", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Trees", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Heaps", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Tries", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Graphs", "url": "https://www.technavigator.io/2025/03/coming-soon.html"}
    ]
  },
  "algorithms": {
    "title": "Algorithms",
    "items": [
      {"name": "Searching Algorithms", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Sorting Algorithms", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Graph Algorithms", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Algorithm Techniques", "url": "https://www.technavigator.io/2025/03/coming-soon.html"},
      {"name": "Advanced Algorithms", "url": "https://www.technavigator.io/2025/03/coming-soon.html"}
    ]
  }
};
