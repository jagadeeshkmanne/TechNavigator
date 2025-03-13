// DSA Practice Page Module

// Function to get URL parameters
function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  const results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Function to initialize the Tech Navigator content
function initTechNavigator() {
  // Create the Tech Navigator container if it doesn't exist
  let techNavigatorContainer = document.getElementById('tech-navigator-container');
  if (!techNavigatorContainer) {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    // Create container
    techNavigatorContainer = document.createElement('div');
    techNavigatorContainer.id = 'tech-navigator-container';
    
    // Create the content structure
    techNavigatorContainer.innerHTML = `
      <h1 class="content-title">DSA Practice</h1>
      
      <!-- Statistics Info -->
      <div class="problem-status-info">
        <div class="status-group">
          <span class="status-dot easy"></span>
          <span class="status-count" id="easy-count">Easy: 0/0</span>
        </div>
        <div class="status-group">
          <span class="status-dot medium"></span>
          <span class="status-count" id="medium-count">Medium: 0/0</span>
        </div>
        <div class="status-group">
          <span class="status-dot hard"></span>
          <span class="status-count" id="hard-count">Hard: 0/0</span>
        </div>
        <div class="status-group">
          <div class="progress-pill" id="overall-progress-pill">
            <div class="circle-progress">
              <svg viewBox="0 0 36 36">
                <circle class="circle-bg" cx="18" cy="18" r="15"></circle>
                <circle id="overall-progress" class="circle-progress-bar" cx="18" cy="18" r="15" style="stroke-dasharray: 94.2478, 94.2478; stroke-dashoffset: 94.2478;"></circle>
              </svg>
            </div>
            <span id="overall-progress-text">0% Completed</span>
          </div>
        </div>
      </div>

      <!-- View Toggle Buttons -->
      <div class="view-toggle-container">
        <button id="list-view-btn" class="view-toggle-btn active">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 6h13"></path>
            <path d="M8 12h13"></path>
            <path d="M8 18h13"></path>
            <path d="M3 6h.01"></path>
            <path d="M3 12h.01"></path>
            <path d="M3 18h.01"></path>
          </svg>
          List View
        </button>      
        <button id="category-view-btn" class="view-toggle-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 6h18"></path>
            <path d="M3 12h18"></path>
            <path d="M3 18h18"></path>
          </svg>
          Category View
        </button>
        <button id="revision-view-btn" class="view-toggle-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" 
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          Revision List
          <span class="revision-count" id="revision-count">0</span>
        </button>
      </div>
      
      <!-- Loading Spinner -->
      <div class="loading-spinner" id="loading-spinner">
        <div class="spinner"></div>
      </div>
      
      <!-- Accordion Categories Container -->
      <div class="accordion-container" id="categories-container">
        <!-- Will be populated by JavaScript -->
      </div>
      
      <!-- List View Container -->
      <div id="list-container">
        <table class="list-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Review</th>
              <th>Editorial</th>
              <th>Problem</th>
              <th>Category</th>
              <th>Difficulty</th>
            </tr>
          </thead>
          <tbody id="list-problems">
            <!-- Will be populated by JavaScript -->
          </tbody>
        </table>
      </div>
    
      <!-- Revision List Container -->
      <div id="revision-container" style="display: none;">
        <table class="list-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Review</th>
              <th>Editorial</th>
              <th>Problem</th>
              <th>Category</th>
              <th>Difficulty</th>
            </tr>
          </thead>
          <tbody id="revision-problems">
            <!-- Will be populated by JavaScript -->
          </tbody>
        </table>
      </div>
    `;
    
    // Hide the blog content
    const blogPosts = document.getElementById('Blog1');
    if (blogPosts) {
      blogPosts.style.display = 'none';
    }
    
    // Replace the content
    mainContent.appendChild(techNavigatorContainer);
  }
}

// Function to setup event handlers for DSA features
function setupDSAEventHandlers() {
  // Set up event handlers for buttons requiring authentication
  document.body.addEventListener('click', function(event) {
    // Delegation for revision-view-btn and similar auth-required features
    if (event.target.id === 'revision-view-btn' || event.target.closest('#revision-view-btn')) {
      if (typeof window.isUserLoggedIn === 'function' && !window.isUserLoggedIn()) {
        event.preventDefault();
        if (typeof window.showLoginRequiredModal === 'function') {
          window.showLoginRequiredModal('Please sign in to access your revision list.');
        } else {
          alert('Please sign in to access your revision list.');
        }
        return false;
      }
    }
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the tech navigator container
  initTechNavigator();
  
  // Setup DSA event handlers
  setupDSAEventHandlers();
  
  // Load Tech Navigator Script
  const techNavigatorScript = document.createElement('script');
  techNavigatorScript.src = 'https://jagadeeshkmanne.github.io/TechNavigator/tech-navigator.js';
  techNavigatorScript.onload = function() {
    console.log('Tech Navigator script loaded successfully');
    
    // Check for category parameter
    const category = getUrlParameter('category');
    if (category && typeof filterListByCategory === 'function') {
      // Apply filter if category parameter is present
      filterListByCategory(category);
      
      // Update URL without reloading to remove the parameter
      const url = new URL(window.location);
      url.searchParams.delete('category');
      window.history.replaceState({}, '', url);
      
      // Ensure the correct sidebar item is highlighted
      const activeLink = document.querySelector(`.sidebar-subnav-link[data-category="${category}"]`);
      if (activeLink) {
        document.querySelectorAll('.sidebar-subnav-link').forEach(link => {
          link.classList.remove('active');
        });
        activeLink.classList.add('active');
      }
    }
  };
  document.body.appendChild(techNavigatorScript);
  
  // Hook into auth events
  document.addEventListener('userLoggedIn', function(event) {
    // When user logs in, load their data if tech navigator is ready
    if (typeof loadUserData === 'function' && event.detail && event.detail.uid) {
      loadUserData(event.detail.uid);
    }
  });
  
  document.addEventListener('userLoggedOut', function() {
    // When user logs out, reset problem data if tech navigator is ready
    if (typeof problemsData !== 'undefined') {
      // Reset problem data to default (all unchecked)
      problemsData.forEach(problem => {
        problem.status = false;
        problem.revision = false;
      });
      
      // Refresh UI with reset data
      if (typeof loadProblems === 'function') {
        loadProblems(problemsData);
      }
      
      if (typeof populateListView === 'function') {
        populateListView();
      }
    }
  });
});
