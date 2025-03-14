// DSA Basics Menu Data Structure
const dsaBasicsData = [
  { name: "Introduction to DSA", url: "/dsa-basics/introduction-to-dsa" },
  { name: "Big O Notation", url: "/dsa-basics/big-o-notation" },
  { name: "Memory Concepts", url: "/dsa-basics/memory-concepts" },
  
  // Arrays
  { name: "Arrays", url: "/dsa-basics/arrays", isHeader: true },
  { name: "Introduction", url: "/dsa-basics/arrays/introduction", indented: true },
  { name: "Basic Operations", url: "/dsa-basics/arrays/basic-operations", indented: true },
  { name: "Videos", url: "/dsa-basics/arrays/videos", indented: true },
  { name: "Practice", url: "/dsa-basics/arrays/practice", indented: true },
  
  // Linked Lists
  { name: "Linked Lists", url: "/dsa-basics/linked-lists", isHeader: true },
  { name: "Introduction", url: "/dsa-basics/linked-lists/introduction", indented: true },
  { name: "Basic Operations", url: "/dsa-basics/linked-lists/basic-operations", indented: true },
  { name: "Types", url: "/dsa-basics/linked-lists/types", indented: true },
  { name: "Videos", url: "/dsa-basics/linked-lists/videos", indented: true },
  { name: "Practice", url: "/dsa-basics/linked-lists/practice", indented: true },
  
  // Hash Tables
  { name: "Hash Tables", url: "/dsa-basics/hash-tables", isHeader: true },
  { name: "Introduction", url: "/dsa-basics/hash-tables/introduction", indented: true },
  { name: "Basic Operations", url: "/dsa-basics/hash-tables/basic-operations", indented: true },
  { name: "Collision Handling", url: "/dsa-basics/hash-tables/collision-handling", indented: true },
  { name: "Videos", url: "/dsa-basics/hash-tables/videos", indented: true },
  { name: "Practice", url: "/dsa-basics/hash-tables/practice", indented: true },
  
  // Stacks
  { name: "Stacks", url: "/dsa-basics/stacks", isHeader: true },
  { name: "Introduction", url: "/dsa-basics/stacks/introduction", indented: true },
  { name: "Basic Operations", url: "/dsa-basics/stacks/basic-operations", indented: true },
  { name: "Applications", url: "/dsa-basics/stacks/applications", indented: true },
  { name: "Videos", url: "/dsa-basics/stacks/videos", indented: true },
  { name: "Practice", url: "/dsa-basics/stacks/practice", indented: true },
  
  // Queues
  { name: "Queues", url: "/dsa-basics/queues", isHeader: true },
  { name: "Introduction", url: "/dsa-basics/queues/introduction", indented: true },
  { name: "Basic Operations", url: "/dsa-basics/queues/basic-operations", indented: true },
  { name: "Types", url: "/dsa-basics/queues/types", indented: true },
  { name: "Videos", url: "/dsa-basics/queues/videos", indented: true },
  { name: "Practice", url: "/dsa-basics/queues/practice", indented: true },
  
  // Trees
  { name: "Trees", url: "/dsa-basics/trees", isHeader: true },
  { name: "Introduction", url: "/dsa-basics/trees/introduction", indented: true },
  { name: "Basic Operations", url: "/dsa-basics/trees/basic-operations", indented: true },
  { name: "Types", url: "/dsa-basics/trees/types", indented: true },
  { name: "Traversal", url: "/dsa-basics/trees/traversal", indented: true },
  { name: "Inorder Traversal", url: "/dsa-basics/trees/traversal/inorder", moreIndented: true },
  { name: "Preorder Traversal", url: "/dsa-basics/trees/traversal/preorder", moreIndented: true },
  { name: "Postorder Traversal", url: "/dsa-basics/trees/traversal/postorder", moreIndented: true },
  { name: "Level Order Traversal", url: "/dsa-basics/trees/traversal/level-order", moreIndented: true },
  { name: "Videos", url: "/dsa-basics/trees/videos", indented: true },
  { name: "Practice", url: "/dsa-basics/trees/practice", indented: true },
  
  // Heaps
  { name: "Heaps", url: "/dsa-basics/heaps", isHeader: true },
  { name: "Introduction", url: "/dsa-basics/heaps/introduction", indented: true },
  { name: "Basic Operations", url: "/dsa-basics/heaps/basic-operations", indented: true },
  { name: "Types", url: "/dsa-basics/heaps/types", indented: true },
  { name: "Videos", url: "/dsa-basics/heaps/videos", indented: true },
  { name: "Practice", url: "/dsa-basics/heaps/practice", indented: true },
  
  // Tries
  { name: "Tries", url: "/dsa-basics/tries", isHeader: true },
  { name: "Introduction", url: "/dsa-basics/tries/introduction", indented: true },
  { name: "Basic Operations", url: "/dsa-basics/tries/basic-operations", indented: true },
  { name: "Applications", url: "/dsa-basics/tries/applications", indented: true },
  { name: "Videos", url: "/dsa-basics/tries/videos", indented: true },
  { name: "Practice", url: "/dsa-basics/tries/practice", indented: true },
  
  // Graphs
  { name: "Graphs", url: "/dsa-basics/graphs", isHeader: true },
  { name: "Introduction", url: "/dsa-basics/graphs/introduction", indented: true },
  { name: "Representations", url: "/dsa-basics/graphs/representations", indented: true },
  { name: "Basic Operations", url: "/dsa-basics/graphs/basic-operations", indented: true },
  { name: "Videos", url: "/dsa-basics/graphs/videos", indented: true },
  { name: "Practice", url: "/dsa-basics/graphs/practice", indented: true }
  
  // Add more items for other algorithms
];

// This function will update the DSA Basics sidebar with our custom content
function updateDsaBasicsSidebar() {
  // Only run on DSA basics pages
  if (!window.location.pathname.includes('/dsa-basics/')) {
    return;
  }
  
  console.log("Updating DSA Basics sidebar");
  
  // Find the DSA Basics subnav
  const dsaBasicsSubnav = document.getElementById('dsa-basics-subnav');
  if (!dsaBasicsSubnav) {
    console.error("DSA Basics subnav not found");
    return;
  }
  
  // Clear existing content
  dsaBasicsSubnav.innerHTML = '';
  
  // Simple CSS for indentation
  const style = document.createElement('style');
  style.textContent = `
    .sidebar-subnav-item.indented .sidebar-subnav-link {
      padding-left: 30px;
      font-size: 11px;
    }
    
    .sidebar-subnav-item.more-indented .sidebar-subnav-link {
      padding-left: 45px;
      font-size: 10px;
    }
    
    .sidebar-subnav-item.header .sidebar-subnav-link {
      font-weight: 600;
      color: var(--professional-orange);
      font-size: 13px;
    }
  `;
  document.head.appendChild(style);
  
  // Add each item to the menu
  dsaBasicsData.forEach(item => {
    const menuItem = document.createElement('li');
    menuItem.className = 'sidebar-subnav-item';
    
    if (item.isHeader) {
      menuItem.classList.add('header');
    }
    
    if (item.indented) {
      menuItem.classList.add('indented');
    }
    
    if (item.moreIndented) {
      menuItem.classList.add('more-indented');
    }
    
    menuItem.innerHTML = `
      <a href="${item.url}" class="sidebar-subnav-link">
        <span>${item.name}</span>
      </a>
    `;
    
    dsaBasicsSubnav.appendChild(menuItem);
  });
  
  // Highlight active menu item
  highlightActiveMenuItem();
}

// Highlight the active menu item
function highlightActiveMenuItem() {
  const currentUrl = window.location.pathname;
  
  document.querySelectorAll('.sidebar-subnav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentUrl) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Hook into the existing sidebar.js
(function() {
  // Make sure the sidebar is properly initialized
  const initInterval = setInterval(() => {
    // Check if we're on a DSA basics page
    if (window.location.pathname.includes('/dsa-basics/')) {
      // Find the DSA Basics menu item
      const dsaBasicsItem = document.querySelector('.sidebar-nav-item');
      if (dsaBasicsItem && dsaBasicsItem.textContent.includes('DSA Basics')) {
        // Make it visible and expanded
        dsaBasicsItem.style.display = 'block';
        dsaBasicsItem.classList.add('expanded');
        
        // Update the menu content
        updateDsaBasicsSidebar();
        
        // Clear the interval once we've found and updated the menu
        clearInterval(initInterval);
      }
    } else {
      // Clear the interval if we're not on a DSA basics page
      clearInterval(initInterval);
    }
  }, 100);
  
  // Set a timeout to stop checking after a reasonable amount of time
  setTimeout(() => clearInterval(initInterval), 5000);
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on a DSA basics page
  if (window.location.pathname.includes('/dsa-basics/')) {
    // Wait a short amount of time for the sidebar to initialize
    setTimeout(updateDsaBasicsSidebar, 500);
  }
});

// Override the controlMenuVisibilityByURL function to update our menu
(function() {
  // Store the original function
  const originalControlMenuVisibilityByURL = window.controlMenuVisibilityByURL;
  
  // Replace with our version
  window.controlMenuVisibilityByURL = function() {
    // Call the original function
    if (typeof originalControlMenuVisibilityByURL === 'function') {
      originalControlMenuVisibilityByURL();
    }
    
    // On DSA Basics pages, update our menu
    if (window.location.pathname.includes('/dsa-basics/')) {
      // Find the DSA Basics menu item and make it visible
      const dsaBasicsItem = document.querySelector('.sidebar-nav-item');
      if (dsaBasicsItem && dsaBasicsItem.textContent.includes('DSA Basics')) {
        dsaBasicsItem.style.display = 'block';
        dsaBasicsItem.classList.add('expanded');
      }
      
      // Update the menu content
      setTimeout(updateDsaBasicsSidebar, 100);
    }
  };
})();
