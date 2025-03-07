/***********************
 * FIREBASE CONFIGURATION AND SETUP
 ***********************/
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrGGDDax_OpD6NSP6R5SznVy9ThAIohBo",
  authDomain: "technavigator-226d0.firebaseapp.com",
  projectId: "technavigator-226d0",
  storageBucket: "technavigator-226d0.firebasestorage.app",
  messagingSenderId: "1057850023813",
  appId: "1:1057850023813:web:bfcf67f80bc27fe22b2eec",
  measurementId: "G-FSXMH7L0ES"
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Set up Google Auth provider
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Current user state 
let currentUser = null;

// Auth state listener
auth.onAuthStateChanged((user) => {
  if (user) {
    // User signed in
    currentUser = user;
    console.log("User signed in:", user.displayName || user.email);
    
    // Update UI with user info
    const userElement = document.getElementById('user-name');
    if (userElement) {
      userElement.textContent = user.displayName || user.email;
    }
    
    const userImg = document.getElementById('user-img');
    if (userImg && user.photoURL) {
      userImg.src = user.photoURL;
      userImg.style.display = 'block';
    }
    
    document.getElementById('auth-container').classList.add('signed-in');
    
    // Load user progress from Firebase
    loadProgressFromFirebase().then(() => {
      // Reinitialize the grid after loading progress to ensure checkboxes appear
      if (currentCategory) {
        initializeGrid(currentCategory);
        updateCategoryCounter(currentCategory);
      }
      updateOverallProgress();
    });
  } else {
    // User signed out
    currentUser = null;
    document.getElementById('auth-container').classList.remove('signed-in');
    // Fallback to localStorage when logged out
    loadProblemStatuses();
    // Reinitialize grid without checkboxes
    if (currentCategory) {
      initializeGrid(currentCategory);
      changeCategory(currentCategory);
    }
  }
});


// Sign in with Google
function signInWithGoogle() {
  auth.signInWithPopup(googleProvider)
    .then((result) => {
      console.log("Google sign in successful");
    })
    .catch((error) => {
      console.error("Google Sign In Error:", error.message);
      alert("Sign in error: " + error.message);
    });
}

// Sign out function
function signOut() {
  auth.signOut()
    .then(() => {
      console.log("User signed out");
    })
    .catch((error) => {
      console.error("Sign out error:", error);
    });
}

async function loadProgressFromFirebase() {
  if (!currentUser) return Promise.resolve();
  
  try {
    // Get the user's progress document
    const progressDoc = await db.collection('user_progress')
      .doc(currentUser.uid)
      .get();
    
    if (progressDoc.exists) {
      const data = progressDoc.data();
      const problems = data.problems || {};
      
      // Update all problem instances across all categories
      Object.keys(problemDataByCategory).forEach(category => {
        if (!problemStatuses[category]) {
          problemStatuses[category] = {};
        }
        
        problemDataByCategory[category].forEach(problem => {
          // Update problem status if we have it
          if (problems.hasOwnProperty(problem.leetcode_id)) {
            problem.status = problems[problem.leetcode_id];
            
            // Also update in our tracking object
            problemStatuses[category][problem.leetcode_id] = problems[problem.leetcode_id];
          }
        });
      });
      
      // Update grid if needed
      updateGrid();
      
      // Update progress counters
      Object.keys(problemDataByCategory).forEach(cat => {
        if (cat !== 'all') {
          updateCategoryCounter(cat);
        }
      });
      updateOverallProgress();
      
      console.log(`Loaded progress from Firebase for ${Object.keys(problems).length} problems`);
    } else {
      console.log(`No existing progress, creating new document`);
      // Initialize with local storage data
      const allProblems = {};
      let hasLocalData = false;
      
      // We'll gather status from localStorage, but in a leetcode_id-centric way
      const processedIds = new Set();
      
      Object.keys(problemDataByCategory).forEach(category => {
        if (category === 'all') return;
        
        const localData = localStorage.getItem(`tech-navigator-${category}-progress`);
        if (localData) {
          const categoryProblems = JSON.parse(localData);
          
          Object.keys(categoryProblems).forEach(problemId => {
            // Only process each leetcode_id once
            if (!processedIds.has(problemId)) {
              allProblems[problemId] = categoryProblems[problemId];
              processedIds.add(problemId);
              hasLocalData = true;
            }
          });
        }
      });
      
      // If we found any local data, save it to Firebase
      if (hasLocalData) {
        await saveProgressToFirebase(allProblems);
      }
    }
    
    return Promise.resolve();
  } catch (error) {
    console.error("Error loading progress from Firebase:", error);
    return Promise.reject(error);
  }
}

// Save progress to Firebase
async function saveProgressToFirebase(problems) {
  if (!currentUser) return;
  
  try {
    await db.collection('user_progress')
      .doc(currentUser.uid)
      .set({
        problems: problems,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      });
    
    console.log(`Progress saved to Firebase`);
  } catch (error) {
    console.error("Error saving progress to Firebase:", error);
  }
}


/***********************
 * TRANSFORM JSON DATA INTO CATEGORIES
 ***********************/
const CATEGORIES_DATA = {
  "NeetCode 150": {
    "problems": [
  {
    "id": 1,
    "leetcode_id": 217,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Contains Duplicate",
    "leetcode": "https://leetcode.com/problems/contains-duplicate/",
    "requirements": "Hash set to detect duplicates in an array"
  },
  {
    "id": 2,
    "leetcode_id": 242,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Valid Anagram",
    "leetcode": "https://leetcode.com/problems/valid-anagram/",
    "requirements": "Character counting or sorting to compare strings"
  },
  {
    "id": 3,
    "leetcode_id": 1,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Two Sum",
    "leetcode": "https://leetcode.com/problems/two-sum/",
    "requirements": "Hash map to track complements for target sum"
  },
  {
    "id": 4,
    "leetcode_id": 49,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Group Anagrams",
    "leetcode": "https://leetcode.com/problems/group-anagrams/",
    "requirements": "String sorting and hash map grouping"
  },
  {
    "id": 5,
    "leetcode_id": 347,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Top K Frequent Elements",
    "leetcode": "https://leetcode.com/problems/top-k-frequent-elements/",
    "requirements": "Hash map counting and heap for top K elements"
  },
  {
    "id": 6,
    "leetcode_id": 271,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Encode and Decode Strings",
    "leetcode": "https://leetcode.com/problems/encode-and-decode-strings/",
    "requirements": "String parsing with length encoding"
  },
  {
    "id": 7,
    "leetcode_id": 238,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Product of Array Except Self",
    "leetcode": "https://leetcode.com/problems/product-of-array-except-self/",
    "requirements": "Prefix and suffix products calculation"
  },
  {
    "id": 8,
    "leetcode_id": 36,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Valid Sudoku",
    "leetcode": "https://leetcode.com/problems/valid-sudoku/",
    "requirements": "Grid validation with hash sets"
  },
  {
    "id": 9,
    "leetcode_id": 128,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Longest Consecutive Sequence",
    "leetcode": "https://leetcode.com/problems/longest-consecutive-sequence/",
    "requirements": "Hash set and sequence tracking"
  },
  {
    "id": 10,
    "leetcode_id": 125,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Valid Palindrome",
    "leetcode": "https://leetcode.com/problems/valid-palindrome/",
    "requirements": "Two-pointer technique with character validation"
  },
  {
    "id": 11,
    "leetcode_id": 167,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Two Sum II Input Array Is Sorted",
    "leetcode": "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
    "requirements": "Two-pointer technique in sorted array"
  },
  {
    "id": 12,
    "leetcode_id": 15,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "3Sum",
    "leetcode": "https://leetcode.com/problems/3sum/",
    "requirements": "Sorting and two-pointer technique"
  },
  {
    "id": 13,
    "leetcode_id": 11,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Container With Most Water",
    "leetcode": "https://leetcode.com/problems/container-with-most-water/",
    "requirements": "Two-pointer technique to maximize area"
  },
  {
    "id": 14,
    "leetcode_id": 121,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Best Time to Buy and Sell Stock",
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    "requirements": "Array traversal and tracking maximum difference"
  },
  {
    "id": 15,
    "leetcode_id": 3,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Longest Substring Without Repeating Characters",
    "leetcode": "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    "requirements": "Sliding window with character tracking"
  },
  {
    "id": 16,
    "leetcode_id": 424,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Longest Repeating Character Replacement",
    "leetcode": "https://leetcode.com/problems/longest-repeating-character-replacement/",
    "requirements": "Sliding window with character frequency counting"
  },
  {
    "id": 17,
    "leetcode_id": 76,
    "difficulty": "Hard",
    "frequency": "Medium",
    "problem": "Minimum Window Substring",
    "leetcode": "https://leetcode.com/problems/minimum-window-substring/",
    "requirements": "Sliding window with character frequency matching"
  },
  {
    "id": 18,
    "leetcode_id": 20,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Valid Parentheses",
    "leetcode": "https://leetcode.com/problems/valid-parentheses/",
    "requirements": "Stack to track opening and closing brackets"
  },
  {
    "id": 19,
    "leetcode_id": 153,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Find Minimum in Rotated Sorted Array",
    "leetcode": "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
    "requirements": "Modified binary search in rotated array"
  },
  {
    "id": 20,
    "leetcode_id": 33,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Search in Rotated Sorted Array",
    "leetcode": "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    "requirements": "Modified binary search with pivot handling"
  },
  {
    "id": 21,
    "leetcode_id": 206,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Reverse Linked List",
    "leetcode": "https://leetcode.com/problems/reverse-linked-list/",
    "requirements": "Iterative or recursive pointer manipulation"
  },
  {
    "id": 22,
    "leetcode_id": 21,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Merge Two Sorted Lists",
    "leetcode": "https://leetcode.com/problems/merge-two-sorted-lists/",
    "requirements": "Linked list merging with dummy head"
  },
  {
    "id": 23,
    "leetcode_id": 143,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Reorder List",
    "leetcode": "https://leetcode.com/problems/reorder-list/",
    "requirements": "Fast/slow pointers, reversing, and merging"
  },
  {
    "id": 24,
    "leetcode_id": 19,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Remove Nth Node From End of List",
    "leetcode": "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
    "requirements": "Two pointers with gap technique"
  },
  {
    "id": 25,
    "leetcode_id": 141,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Linked List Cycle",
    "leetcode": "https://leetcode.com/problems/linked-list-cycle/",
    "requirements": "Fast and slow pointer (Floyd's cycle detection)"
  },
  {
    "id": 26,
    "leetcode_id": 23,
    "difficulty": "Hard",
    "frequency": "Medium",
    "problem": "Merge K Sorted Lists",
    "leetcode": "https://leetcode.com/problems/merge-k-sorted-lists/",
    "requirements": "Priority queue or divide and conquer"
  },
  {
    "id": 27,
    "leetcode_id": 226,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Invert Binary Tree",
    "leetcode": "https://leetcode.com/problems/invert-binary-tree/",
    "requirements": "Recursive tree traversal and node swapping"
  },
  {
    "id": 28,
    "leetcode_id": 104,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Maximum Depth of Binary Tree",
    "leetcode": "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
    "requirements": "Recursive or iterative tree traversal"
  },
  {
    "id": 29,
    "leetcode_id": 100,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Same Tree",
    "leetcode": "https://leetcode.com/problems/same-tree/",
    "requirements": "Recursive structure comparison"
  },
  {
    "id": 30,
    "leetcode_id": 572,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Subtree of Another Tree",
    "leetcode": "https://leetcode.com/problems/subtree-of-another-tree/",
    "requirements": "Recursive tree matching"
  },
  {
    "id": 31,
    "leetcode_id": 235,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Lowest Common Ancestor of a Binary Search Tree",
    "leetcode": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
    "requirements": "BST property traversal"
  },
  {
    "id": 32,
    "leetcode_id": 102,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Binary Tree Level Order Traversal",
    "leetcode": "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    "requirements": "BFS with queue"
  },
  {
    "id": 33,
    "leetcode_id": 98,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Validate Binary Search Tree",
    "leetcode": "https://leetcode.com/problems/validate-binary-search-tree/",
    "requirements": "Recursive BST property validation"
  },
  {
    "id": 34,
    "leetcode_id": 230,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Kth Smallest Element in a BST",
    "leetcode": "https://leetcode.com/problems/kth-smallest-element-in-a-bst/",
    "requirements": "Inorder traversal counting"
  },
  {
    "id": 35,
    "leetcode_id": 105,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Construct Binary Tree from Preorder and Inorder Traversal",
    "leetcode": "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/",
    "requirements": "Recursive tree construction"
  },
  {
    "id": 36,
    "leetcode_id": 124,
    "difficulty": "Hard",
    "frequency": "Medium",
    "problem": "Binary Tree Maximum Path Sum",
    "leetcode": "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
    "requirements": "Recursive path calculation with global tracking"
  },
  {
    "id": 37,
    "leetcode_id": 297,
    "difficulty": "Hard",
    "frequency": "Medium",
    "problem": "Serialize and Deserialize Binary Tree",
    "leetcode": "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
    "requirements": "String encoding and decoding of tree structure"
  },
  {
    "id": 38,
    "leetcode_id": 208,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Implement Trie (Prefix Tree)",
    "leetcode": "https://leetcode.com/problems/implement-trie-prefix-tree/",
    "requirements": "Custom trie data structure implementation"
  },
  {
    "id": 39,
    "leetcode_id": 211,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Design Add and Search Words Data Structure",
    "leetcode": "https://leetcode.com/problems/design-add-and-search-words-data-structure/",
    "requirements": "Trie with wildcard search"
  },
  {
    "id": 40,
    "leetcode_id": 212,
    "difficulty": "Hard",
    "frequency": "Medium",
    "problem": "Word Search II",
    "leetcode": "https://leetcode.com/problems/word-search-ii/",
    "requirements": "Trie and backtracking on grid"
  },
  {
    "id": 41,
    "leetcode_id": 295,
    "difficulty": "Hard",
    "frequency": "Medium",
    "problem": "Find Median from Data Stream",
    "leetcode": "https://leetcode.com/problems/find-median-from-data-stream/",
    "requirements": "Heap-based data structure design"
  },
  {
    "id": 42,
    "leetcode_id": 39,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Combination Sum",
    "leetcode": "https://leetcode.com/problems/combination-sum/",
    "requirements": "Backtracking with sum target"
  },
  {
    "id": 43,
    "leetcode_id": 79,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Word Search",
    "leetcode": "https://leetcode.com/problems/word-search/",
    "requirements": "DFS with backtracking on grid"
  },
  {
    "id": 44,
    "leetcode_id": 200,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Number of Islands",
    "leetcode": "https://leetcode.com/problems/number-of-islands/",
    "requirements": "DFS or BFS grid traversal"
  },
  {
    "id": 45,
    "leetcode_id": 133,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Clone Graph",
    "leetcode": "https://leetcode.com/problems/clone-graph/",
    "requirements": "BFS or DFS with hash map tracking"
  },
  {
    "id": 46,
    "leetcode_id": 417,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Pacific Atlantic Water Flow",
    "leetcode": "https://leetcode.com/problems/pacific-atlantic-water-flow/",
    "requirements": "Multi-source BFS or DFS"
  },
  {
    "id": 47,
    "leetcode_id": 207,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Course Schedule",
    "leetcode": "https://leetcode.com/problems/course-schedule/",
    "requirements": "Directed graph cycle detection"
  },
  {
    "id": 48,
    "leetcode_id": 323,
    "difficulty": "Medium", 
    "frequency": "Medium",
    "problem": "Number of Connected Components In An Undirected Graph",
    "leetcode": "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/",
    "requirements": "DFS or Union-Find"
  },
  {
    "id": 49,
    "leetcode_id": 261,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Graph Valid Tree",
    "leetcode": "https://leetcode.com/problems/graph-valid-tree/",
    "requirements": "Cycle detection in undirected graph"
  },
  {
    "id": 50,
    "leetcode_id": 70,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Climbing Stairs",
    "leetcode": "https://leetcode.com/problems/climbing-stairs/",
    "requirements": "Dynamic programming with state transition"
  },
  {
    "id": 51,
    "leetcode_id": 322,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Coin Change",
    "leetcode": "https://leetcode.com/problems/coin-change/",
    "requirements": "Dynamic programming with minimization"
  },
  {
    "id": 52,
    "leetcode_id": 300,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Longest Increasing Subsequence",
    "leetcode": "https://leetcode.com/problems/longest-increasing-subsequence/",
    "requirements": "Dynamic programming with binary search optimization"
  },
  {
    "id": 53,
    "leetcode_id": 1143,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Longest Common Subsequence",
    "leetcode": "https://leetcode.com/problems/longest-common-subsequence/",
    "requirements": "2D dynamic programming grid"
  },
  {
    "id": 54,
    "leetcode_id": 139,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Word Break",
    "leetcode": "https://leetcode.com/problems/word-break/",
    "requirements": "Dynamic programming with string matching"
  },
  {
    "id": 55,
    "leetcode_id": 377,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Combination Sum IV",
    "leetcode": "https://leetcode.com/problems/combination-sum-iv/",
    "requirements": "Dynamic programming counting combinations"
  },
  {
    "id": 56,
    "leetcode_id": 198,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "House Robber",
    "leetcode": "https://leetcode.com/problems/house-robber/",
    "requirements": "Dynamic programming with adjacent constraints"
  },
  {
    "id": 57,
    "leetcode_id": 213,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "House Robber II",
    "leetcode": "https://leetcode.com/problems/house-robber-ii/",
    "requirements": "Dynamic programming with circular array handling"
  },
  {
    "id": 58,
    "leetcode_id": 91,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Decode Ways",
    "leetcode": "https://leetcode.com/problems/decode-ways/",
    "requirements": "Dynamic programming with string parsing"
  },
  {
    "id": 59,
    "leetcode_id": 62,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Unique Paths",
    "leetcode": "https://leetcode.com/problems/unique-paths/",
    "requirements": "2D dynamic programming grid traversal"
  },
  {
    "id": 60,
    "leetcode_id": 55,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Jump Game",
    "leetcode": "https://leetcode.com/problems/jump-game/",
    "requirements": "Greedy approach or dynamic programming"
  },
  {
    "id": 61,
    "leetcode_id": 268,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Missing Number",
    "leetcode": "https://leetcode.com/problems/missing-number/",
    "requirements": "Math formula or XOR technique"
  },
  {
    "id": 62,
    "leetcode_id": 190,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Reverse Bits",
    "leetcode": "https://leetcode.com/problems/reverse-bits/",
    "requirements": "Bit manipulation to reverse binary representation"
  },
  {
    "id": 63,
    "leetcode_id": 191,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Number of 1 Bits",
    "leetcode": "https://leetcode.com/problems/number-of-1-bits/",
    "requirements": "Bit manipulation to count set bits"
  },
  {
    "id": 64,
    "leetcode_id": 338,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Counting Bits",
    "leetcode": "https://leetcode.com/problems/counting-bits/",
    "requirements": "Dynamic programming with bit manipulation"
  },
  {
    "id": 65,
    "leetcode_id": 371,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Sum of Two Integers",
    "leetcode": "https://leetcode.com/problems/sum-of-two-integers/",
    "requirements": "Bit manipulation to implement addition without + operator"
  },
  {
    "id": 66,
    "leetcode_id": 53,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Maximum Subarray",
    "leetcode": "https://leetcode.com/problems/maximum-subarray/",
    "requirements": "Kadane's algorithm or dynamic programming"
  },
  {
    "id": 67,
    "leetcode_id": 152,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Maximum Product Subarray",
    "leetcode": "https://leetcode.com/problems/maximum-product-subarray/",
    "requirements": "Dynamic programming with min/max tracking"
  },
  {
    "id": 68,
    "leetcode_id": 1186,
    "difficulty": "Medium",
    "frequency": "Low",
    "problem": "Find Valid Matrix Given Row and Column Sums",
    "leetcode": "https://leetcode.com/problems/find-valid-matrix-given-row-and-column-sums/",
    "requirements": "Greedy algorithm with matrix construction"
  },
  {
    "id": 69,
    "leetcode_id": 704,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Binary Search",
    "leetcode": "https://leetcode.com/problems/binary-search/",
    "requirements": "Basic binary search implementation"
  },
  {
    "id": 70,
    "leetcode_id": 74,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Search a 2D Matrix",
    "leetcode": "https://leetcode.com/problems/search-a-2d-matrix/",
    "requirements": "Binary search in 2D sorted matrix"
  },
  {
    "id": 71,
    "leetcode_id": 875,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Koko Eating Bananas",
    "leetcode": "https://leetcode.com/problems/koko-eating-bananas/",
    "requirements": "Binary search for minimum rate"
  },
  {
    "id": 72,
    "leetcode_id": 4,
    "difficulty": "Hard",
    "frequency": "Medium",
    "problem": "Median of Two Sorted Arrays",
    "leetcode": "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    "requirements": "Binary search in two sorted arrays"
  },
  {
    "id": 73,
    "leetcode_id": 202,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Happy Number",
    "leetcode": "https://leetcode.com/problems/happy-number/",
    "requirements": "Hash set to detect cycles in number sequences"
  },
  {
    "id": 74,
    "leetcode_id": 66,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Plus One",
    "leetcode": "https://leetcode.com/problems/plus-one/",
    "requirements": "Array manipulation with carry handling"
  },
  {
    "id": 75,
    "leetcode_id": 50,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Pow(x, n)",
    "leetcode": "https://leetcode.com/problems/powx-n/",
    "requirements": "Fast power algorithm using binary exponentiation"
  },
  {
    "id": 76,
    "leetcode_id": 43,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Multiply Strings",
    "leetcode": "https://leetcode.com/problems/multiply-strings/",
    "requirements": "String manipulation and implementing multiplication algorithm"
  },
  {
    "id": 77,
    "leetcode_id": 2013,
    "difficulty": "Medium",
    "frequency": "Low",
    "problem": "Detect Squares",
    "leetcode": "https://leetcode.com/problems/detect-squares/",
    "requirements": "Geometric calculations and data structure design"
  },
  {
    "id": 78,
    "leetcode_id": 136,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Single Number",
    "leetcode": "https://leetcode.com/problems/single-number/",
    "requirements": "XOR operation to find unique element"
  },
  {
    "id": 79,
    "leetcode_id": 7,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Reverse Integer",
    "leetcode": "https://leetcode.com/problems/reverse-integer/",
    "requirements": "Math operations with overflow handling"
  },
  {
    "id": 80,
    "leetcode_id": 896,
    "difficulty": "Easy",
    "frequency": "Low",
    "problem": "Monotonic Array",
    "leetcode": "https://leetcode.com/problems/monotonic-array/",
    "requirements": "Array traversal with condition checking"
  },
  {
    "id": 81,
    "leetcode_id": 150,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Evaluate Reverse Polish Notation",
    "leetcode": "https://leetcode.com/problems/evaluate-reverse-polish-notation/",
    "requirements": "Stack-based expression evaluation"
  },
  {
    "id": 82,
    "leetcode_id": 22,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Generate Parentheses",
    "leetcode": "https://leetcode.com/problems/generate-parentheses/",
    "requirements": "Backtracking with valid parentheses constraints"
  },
  {
    "id": 83,
    "leetcode_id": 739,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Daily Temperatures",
    "leetcode": "https://leetcode.com/problems/daily-temperatures/",
    "requirements": "Monotonic stack for next greater element"
  },
  {
    "id": 84,
    "leetcode_id": 853,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Car Fleet",
    "leetcode": "https://leetcode.com/problems/car-fleet/",
    "requirements": "Sorting and simulation"
  },
  {
    "id": 85,
    "leetcode_id": 155,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Min Stack",
    "leetcode": "https://leetcode.com/problems/min-stack/",
    "requirements": "Stack design with constant time minimum"
  },
  {
    "id": 86,
    "leetcode_id": 84,
    "difficulty": "Hard",
    "frequency": "Medium",
    "problem": "Largest Rectangle in Histogram",
    "leetcode": "https://leetcode.com/problems/largest-rectangle-in-histogram/",
    "requirements": "Monotonic stack for area calculation"
  },
  {
    "id": 87,
    "leetcode_id": 456,
    "difficulty": "Medium",
    "frequency": "Low",
    "problem": "132 Pattern",
    "leetcode": "https://leetcode.com/problems/132-pattern/",
    "requirements": "Stack-based pattern matching"
  },
  {
    "id": 88,
    "leetcode_id": 239,
    "difficulty": "Hard",
    "frequency": "Medium",
    "problem": "Sliding Window Maximum",
    "leetcode": "https://leetcode.com/problems/sliding-window-maximum/",
    "requirements": "Monotonic queue for sliding window maximum"
  },
  {
    "id": 89,
    "leetcode_id": 641,
    "difficulty": "Medium",
    "frequency": "Low",
    "problem": "Design Circular Deque",
    "leetcode": "https://leetcode.com/problems/design-circular-deque/",
    "requirements": "Array-based deque implementation"
  },
  {
    "id": 90,
    "leetcode_id": 622,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Design Circular Queue",
    "leetcode": "https://leetcode.com/problems/design-circular-queue/",
    "requirements": "Array-based circular queue implementation"
  },
  {
    "id": 91,
    "leetcode_id": 146,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "LRU Cache",
    "leetcode": "https://leetcode.com/problems/lru-cache/",
    "requirements": "Hash map with doubly linked list"
  },
  {
    "id": 92,
    "leetcode_id": 380,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Insert Delete GetRandom O(1)",
    "leetcode": "https://leetcode.com/problems/insert-delete-getrandom-o1/",
    "requirements": "Hash map with array for constant time operations"
  },
  {
    "id": 93,
    "leetcode_id": 460,
    "difficulty": "Hard",
    "frequency": "Medium",
    "problem": "LFU Cache",
    "leetcode": "https://leetcode.com/problems/lfu-cache/",
    "requirements": "Complex data structure design with frequency tracking"
  },
  {
    "id": 94,
    "leetcode_id": 54,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Spiral Matrix",
    "leetcode": "https://leetcode.com/problems/spiral-matrix/",
    "requirements": "Matrix traversal with direction changes"
  },
  {
    "id": 95,
    "leetcode_id": 73,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Set Matrix Zeroes",
    "leetcode": "https://leetcode.com/problems/set-matrix-zeroes/",
    "requirements": "Matrix manipulation with in-place markers"
  },
  {
    "id": 96,
    "leetcode_id": 48,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Rotate Image",
    "leetcode": "https://leetcode.com/problems/rotate-image/",
    "requirements": "Matrix rotation with in-place transformations"
  },
  {
    "id": 97,
    "leetcode_id": 56,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Merge Intervals",
    "leetcode": "https://leetcode.com/problems/merge-intervals/",
    "requirements": "Interval merging with sorting"
  },
  {
    "id": 98,
    "leetcode_id": 57,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Insert Interval",
    "leetcode": "https://leetcode.com/problems/insert-interval/",
    "requirements": "Interval manipulation with boundary handling"
  },
  {
    "id": 99,
    "leetcode_id": 435,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Non-overlapping Intervals",
    "leetcode": "https://leetcode.com/problems/non-overlapping-intervals/",
    "requirements": "Greedy interval scheduling"
  },
  {
    "id": 100,
    "leetcode_id": 252,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Meeting Rooms",
    "leetcode": "https://leetcode.com/problems/meeting-rooms/",
    "requirements": "Interval overlap checking"
  },
  {
    "id": 101,
    "leetcode_id": 253,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Meeting Rooms II",
    "leetcode": "https://leetcode.com/problems/meeting-rooms-ii/",
    "requirements": "Interval scheduling with priority queue"
  },
  {
    "id": 102,
    "leetcode_id": 57,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Insert Interval",
    "leetcode": "https://leetcode.com/problems/insert-interval/",
    "requirements": "Interval manipulation with boundary handling"
  },
  {
    "id": 103,
    "leetcode_id": 42,
    "difficulty": "Hard",
    "frequency": "Medium",
    "problem": "Trapping Rain Water",
    "leetcode": "https://leetcode.com/problems/trapping-rain-water/",
    "requirements": "Two-pointer or dynamic programming approach"
  },
  {
    "id": 104,
    "leetcode_id": 287,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Find the Duplicate Number",
    "leetcode": "https://leetcode.com/problems/find-the-duplicate-number/",
    "requirements": "Floyd's cycle detection algorithm"
  },
  {
    "id": 105,
    "leetcode_id": 24,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Swap Nodes in Pairs",
    "leetcode": "https://leetcode.com/problems/swap-nodes-in-pairs/",
    "requirements": "Linked list node manipulation"
  },
  {
    "id": 106,
    "leetcode_id": 138,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Copy List with Random Pointer",
    "leetcode": "https://leetcode.com/problems/copy-list-with-random-pointer/",
    "requirements": "Hash map for node mapping or interleaving technique"
  },
  {
    "id": 107,
    "leetcode_id": 973,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "K Closest Points to Origin",
    "leetcode": "https://leetcode.com/problems/k-closest-points-to-origin/",
    "requirements": "Heap or quickselect algorithm"
  },
  {
    "id": 108,
    "leetcode_id": 215,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Kth Largest Element in an Array",
    "leetcode": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
    "requirements": "Heap or quickselect algorithm"
  },
  {
    "id": 109,
    "leetcode_id": 78,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Subsets",
    "leetcode": "https://leetcode.com/problems/subsets/",
    "requirements": "Backtracking or bit manipulation"
  },
  {
    "id": 110,
    "leetcode_id": 46,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Permutations",
    "leetcode": "https://leetcode.com/problems/permutations/",
    "requirements": "Backtracking with swapping or visited tracking"
  },
  {
    "id": 111,
    "leetcode_id": 51,
    "difficulty": "Hard",
    "frequency": "Medium",
    "problem": "N-Queens",
    "leetcode": "https://leetcode.com/problems/n-queens/",
    "requirements": "Backtracking with constraint checking"
  },
  {
    "id": 112,
    "leetcode_id": 93,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Restore IP Addresses",
    "leetcode": "https://leetcode.com/problems/restore-ip-addresses/",
    "requirements": "Backtracking with IP address validation"
  },
  {
    "id": 113,
    "leetcode_id": 17,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Letter Combinations of a Phone Number",
    "leetcode": "https://leetcode.com/problems/letter-combinations-of-a-phone-number/",
    "requirements": "Backtracking or iterative combination building"
  },
  {
    "id": 114,
    "leetcode_id": 131,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Palindrome Partitioning",
    "leetcode": "https://leetcode.com/problems/palindrome-partitioning/",
    "requirements": "Backtracking with palindrome checking"
  },
  {
    "id": 115,
    "leetcode_id": 129,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Sum Root to Leaf Numbers",
    "leetcode": "https://leetcode.com/problems/sum-root-to-leaf-numbers/",
    "requirements": "DFS tree traversal with path sum"
  },
  {
    "id": 116,
    "leetcode_id": 210,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Course Schedule II",
    "leetcode": "https://leetcode.com/problems/course-schedule-ii/",
    "requirements": "Topological sort in directed graph"
  },
  {
    "id": 117,
    "leetcode_id": 684,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Redundant Connection",
    "leetcode": "https://leetcode.com/problems/redundant-connection/",
    "requirements": "Union-Find algorithm for cycle detection"
  },
  {
    "id": 118,
    "leetcode_id": 127,
    "difficulty": "Hard",
    "frequency": "Medium",
    "problem": "Word Ladder",
    "leetcode": "https://leetcode.com/problems/word-ladder/",
    "requirements": "BFS with word transformation graph"
  },
  {
    "id": 119,
    "leetcode_id": 994,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Rotting Oranges",
    "leetcode": "https://leetcode.com/problems/rotting-oranges/",
    "requirements": "BFS with multi-source propagation"
  },
  {
    "id": 120,
    "leetcode_id": 926,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Flip String to Monotone Increasing",
    "leetcode": "https://leetcode.com/problems/flip-string-to-monotone-increasing/",
    "requirements": "Dynamic programming with state transitions"
  },
  {
    "id": 121,
    "leetcode_id": 198,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "House Robber",
    "leetcode": "https://leetcode.com/problems/house-robber/",
    "requirements": "Dynamic programming with adjacent constraints"
  },
  {
    "id": 122,
    "leetcode_id": 416,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Partition Equal Subset Sum",
    "leetcode": "https://leetcode.com/problems/partition-equal-subset-sum/",
    "requirements": "Dynamic programming subset sum problem"
  },
  {
    "id": 123,
    "leetcode_id": 2,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Add Two Numbers",
    "leetcode": "https://leetcode.com/problems/add-two-numbers/",
    "requirements": "Linked list manipulation with carry handling"
  },
  {
    "id": 124,
    "leetcode_id": 42,
    "difficulty": "Hard",
    "frequency": "Medium",
    "problem": "Trapping Rain Water",
    "leetcode": "https://leetcode.com/problems/trapping-rain-water/",
    "requirements": "Two-pointer or dynamic programming approach"
  },
  {
    "id": 125,
    "leetcode_id": 74,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Search a 2D Matrix",
    "leetcode": "https://leetcode.com/problems/search-a-2d-matrix/",
    "requirements": "Binary search in 2D matrix"
  },
  {
    "id": 126,
    "leetcode_id": 75,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Sort Colors",
    "leetcode": "https://leetcode.com/problems/sort-colors/",
    "requirements": "Dutch national flag algorithm"
  },
  {
    "id": 127,
    "leetcode_id": 13,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Roman to Integer",
    "leetcode": "https://leetcode.com/problems/roman-to-integer/",
    "requirements": "String parsing with symbol mapping"
  },
  {
    "id": 128,
    "leetcode_id": 80,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Remove Duplicates from Sorted Array II",
    "leetcode": "https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/",
    "requirements": "Two-pointer technique with count tracking"
  },
  {
    "id": 129,
    "leetcode_id": 5,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Longest Palindromic Substring",
    "leetcode": "https://leetcode.com/problems/longest-palindromic-substring/",
    "requirements": "Dynamic programming or expand around center"
  },
  {
    "id": 130,
    "leetcode_id": 647,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Palindromic Substrings",
    "leetcode": "https://leetcode.com/problems/palindromic-substrings/",
    "requirements": "Dynamic programming or expand around center"
  },
  {
    "id": 131,
    "leetcode_id": 91,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Decode Ways",
    "leetcode": "https://leetcode.com/problems/decode-ways/",
    "requirements": "Dynamic programming with string parsing"
  },
  {
    "id": 132,
    "leetcode_id": 678,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Valid Parenthesis String",
    "leetcode": "https://leetcode.com/problems/valid-parenthesis-string/",
    "requirements": "Greedy approach with boundary tracking"
  },
  {
    "id": 133,
    "leetcode_id": 14,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Longest Common Prefix",
    "leetcode": "https://leetcode.com/problems/longest-common-prefix/",
    "requirements": "String comparison for common prefix"
  },
  {
    "id": 134,
    "leetcode_id": 424,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Longest Repeating Character Replacement",
    "leetcode": "https://leetcode.com/problems/longest-repeating-character-replacement/",
    "requirements": "Sliding window with character frequency counting"
  },
  {
    "id": 135,
    "leetcode_id": 1631,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Path With Minimum Effort",
    "leetcode": "https://leetcode.com/problems/path-with-minimum-effort/",
    "requirements": "Dijkstra's algorithm or binary search with BFS"
  },
  {
    "id": 136,
    "leetcode_id": 684,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Redundant Connection",
    "leetcode": "https://leetcode.com/problems/redundant-connection/",
    "requirements": "Union-Find for cycle detection"
  },
  {
    "id": 137,
    "leetcode_id": 378,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Kth Smallest Element in a Sorted Matrix",
    "leetcode": "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/",
    "requirements": "Binary search or min heap approach"
  },
  {
    "id": 138,
    "leetcode_id": 26,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Remove Duplicates from Sorted Array",
    "leetcode": "https://leetcode.com/problems/remove-duplicates-from-sorted-array/",
    "requirements": "Two-pointer technique for in-place modification"
  },
  {
    "id": 139,
    "leetcode_id": 844,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Backspace String Compare",
    "leetcode": "https://leetcode.com/problems/backspace-string-compare/",
    "requirements": "Stack or two-pointer approach"
  },
  {
    "id": 140,
    "leetcode_id": 323,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Number of Connected Components In An Undirected Graph",
    "leetcode": "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/",
    "requirements": "DFS or Union-Find algorithm"
  },
  {
    "id": 141,
    "leetcode_id": 743,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Network Delay Time",
    "leetcode": "https://leetcode.com/problems/network-delay-time/",
    "requirements": "Dijkstra's algorithm for shortest path"
  },
  {
    "id": 142,
    "leetcode_id": 8,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "String to Integer (atoi)",
    "leetcode": "https://leetcode.com/problems/string-to-integer-atoi/",
    "requirements": "String parsing with boundary handling"
  },
  {
    "id": 143,
    "leetcode_id": 310,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Minimum Height Trees",
    "leetcode": "https://leetcode.com/problems/minimum-height-trees/",
    "requirements": "BFS from leaf nodes inward"
  },
  {
    "id": 144,
    "leetcode_id": 57,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Insert Interval",
    "leetcode": "https://leetcode.com/problems/insert-interval/",
    "requirements": "Interval manipulation with boundary handling"
  },
  {
    "id": 145,
    "leetcode_id": 240,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Search a 2D Matrix II",
    "leetcode": "https://leetcode.com/problems/search-a-2d-matrix-ii/",
    "requirements": "Efficient search in sorted 2D matrix"
  },
  {
    "id": 146,
    "leetcode_id": 160,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Intersection of Two Linked Lists",
    "leetcode": "https://leetcode.com/problems/intersection-of-two-linked-lists/",
    "requirements": "Two-pointer technique with linked lists"
  },
  {
    "id": 147,
    "leetcode_id": 98,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Validate Binary Search Tree",
    "leetcode": "https://leetcode.com/problems/validate-binary-search-tree/",
    "requirements": "Recursive BST property validation"
  },
  {
    "id": 148,
    "leetcode_id": 199,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Binary Tree Right Side View",
    "leetcode": "https://leetcode.com/problems/binary-tree-right-side-view/",
    "requirements": "BFS or DFS with level tracking"
  },
  {
    "id": 149,
    "leetcode_id": 34,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Find First and Last Position of Element in Sorted Array",
    "leetcode": "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/",
    "requirements": "Binary search for range boundaries"
  },
  {
    "id": 150,
    "leetcode_id": 994,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Rotting Oranges",
    "leetcode": "https://leetcode.com/problems/rotting-oranges/",
    "requirements": "BFS with multi-source propagation"
  }
]
  },
  "Arrays": {
    "tip": "Arrays are the most fundamental data structure. Focus on understanding basic operations like traversal, insertion, deletion, and in-place manipulation. Look for problems involving direct array access, traversal, and simple transformations without specialized algorithms.",
    "problems": [
  {
    "id": 1,
    "leetcode_id": 121,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Best Time to Buy and Sell Stock",
    "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
    "requirements": "Array traversal and tracking maximum difference"
  },
  {
    "id": 2,
    "leetcode_id": 448,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Find All Numbers Disappeared in an Array",
    "leetcode": "https://leetcode.com/problems/find-all-numbers-disappeared-in-an-array/",
    "requirements": "Basic array traversal and element marking"
  },
  {
    "id": 3,
    "leetcode_id": 1431,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Kids With the Greatest Number of Candies",
    "leetcode": "https://leetcode.com/problems/kids-with-the-greatest-number-of-candies/",
    "requirements": "Simple array comparison and boolean array creation"
  },
  {
    "id": 4,
    "leetcode_id": 169,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Majority Element",
    "leetcode": "https://leetcode.com/problems/majority-element/",
    "requirements": "Basic array traversal and counting"
  },
  {
    "id": 5,
    "leetcode_id": 485,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Max Consecutive Ones",
    "leetcode": "https://leetcode.com/problems/max-consecutive-ones/",
    "requirements": "Basic array traversal and counting"
  },
  {
    "id": 6,
    "leetcode_id": 66,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Plus One",
    "leetcode": "https://leetcode.com/problems/plus-one/",
    "requirements": "Array representation of numbers"
  },
  {
    "id": 7,
    "leetcode_id": 27,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Remove Element",
    "leetcode": "https://leetcode.com/problems/remove-element/",
    "requirements": "Basic in-place array element removal"
  },
  {
    "id": 8,
    "leetcode_id": 48,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Rotate Image",
    "leetcode": "https://leetcode.com/problems/rotate-image/",
    "requirements": "2D array in-place rotation"
  },
  {
    "id": 9,
    "leetcode_id": 1480,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Running Sum of 1d Array",
    "leetcode": "https://leetcode.com/problems/running-sum-of-1d-array/",
    "requirements": "Simple array traversal and accumulation"
  },
  {
    "id": 10,
    "leetcode_id": 73,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Set Matrix Zeroes",
    "leetcode": "https://leetcode.com/problems/set-matrix-zeroes/",
    "requirements": "2D array in-place modification"
  },
  {
    "id": 11,
    "leetcode_id": 1470,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Shuffle the Array",
    "leetcode": "https://leetcode.com/problems/shuffle-the-array/",
    "requirements": "Array reorganization with specific pattern"
  },
  {
    "id": 12,
    "leetcode_id": 54,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Spiral Matrix",
    "leetcode": "https://leetcode.com/problems/spiral-matrix/",
    "requirements": "2D array traversal pattern"
  },
  {
    "id": 13,
    "leetcode_id": 977,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Squares of a Sorted Array",
    "leetcode": "https://leetcode.com/problems/squares-of-a-sorted-array/",
    "requirements": "Basic array transformation"
  },
  {
    "id": 14,
    "leetcode_id": 36,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Valid Sudoku",
    "leetcode": "https://leetcode.com/problems/valid-sudoku/",
    "requirements": "2D array validation"
  },
  {
    "id": 15,
    "leetcode_id": 867,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Transpose Matrix",
    "leetcode": "https://leetcode.com/problems/transpose-matrix/",
    "requirements": "Basic 2D array manipulation"
  }
]
  },
  "Prefix Sum": {
    "tip": "Prefix sum is a technique where you precompute cumulative sums of array elements to enable O(1) range queries. It's ideal for problems involving subarray sums or finding ranges with specific properties. Look for problems asking about 'sum of subarray', 'range sum', or situations where you need to repeatedly calculate sums over different portions of an array.",
    "problems": [
  {
    "id": 1,
    "leetcode_id": 238,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Product of Array Except Self",
    "leetcode": "https://leetcode.com/problems/product-of-array-except-self/",
    "requirements": "Prefix and suffix products (multiplicative variant)"
  },
  {
    "id": 2,
    "leetcode_id": 304,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Range Sum Query 2D - Immutable",
    "leetcode": "https://leetcode.com/problems/range-sum-query-2d-immutable/",
    "requirements": "2D prefix sum for rectangle queries"
  },
  {
    "id": 3,
    "leetcode_id": 724,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Find Pivot Index",
    "leetcode": "https://leetcode.com/problems/find-pivot-index/",
    "requirements": "Prefix sum to find a balance point"
  },
  {
    "id": 4,
    "leetcode_id": 1423,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Maximum Points You Can Obtain from Cards",
    "leetcode": "https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/",
    "requirements": "Prefix sum from both ends"
  },
  {
    "id": 5,
    "leetcode_id": 1732,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Find the Highest Altitude",
    "leetcode": "https://leetcode.com/problems/find-the-highest-altitude/",
    "requirements": "Simple prefix sum with maximum tracking"
  },
  {
    "id": 6,
    "leetcode_id": 1685,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Sum of Absolute Differences in a Sorted Array",
    "leetcode": "https://leetcode.com/problems/sum-of-absolute-differences-in-a-sorted-array/",
    "requirements": "Prefix sum for calculating absolute differences"
  },
  {
    "id": 7,
    "leetcode_id": 303,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Range Sum Query - Immutable",
    "leetcode": "https://leetcode.com/problems/range-sum-query-immutable/",
    "requirements": "Pure prefix sum for range queries"
  },
  {
    "id": 8,
    "leetcode_id": 370,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Range Addition",
    "leetcode": "https://leetcode.com/problems/range-addition/",
    "requirements": "Prefix sum with difference array technique"
  },
  {
    "id": 9,
    "leetcode_id": 528,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Random Pick with Weight",
    "leetcode": "https://leetcode.com/problems/random-pick-with-weight/",
    "requirements": "Prefix sum for weighted random selection"
  },
  {
    "id": 10,
    "leetcode_id": 1314,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Matrix Block Sum",
    "leetcode": "https://leetcode.com/problems/matrix-block-sum/",
    "requirements": "2D prefix sum for block summation"
  },
  {
    "id": 11,
    "leetcode_id": 1588,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Sum of All Odd Length Subarrays",
    "leetcode": "https://leetcode.com/problems/sum-of-all-odd-length-subarrays/",
    "requirements": "Prefix sum for efficient subarray calculations"
  },
  {
    "id": 12,
    "leetcode_id": 2017,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Grid Game",
    "leetcode": "https://leetcode.com/problems/grid-game/",
    "requirements": "Prefix sum on 2D grid to find optimal path"
  },
  {
    "id": 13,
    "leetcode_id": 1352,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Product of the Last K Numbers",
    "leetcode": "https://leetcode.com/problems/product-of-the-last-k-numbers/",
    "requirements": "Running product (multiplicative prefix sum)"
  },
  {
    "id": 14,
    "leetcode_id": 2270,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Number of Ways to Split Array",
    "leetcode": "https://leetcode.com/problems/number-of-ways-to-split-array/",
    "requirements": "Prefix sum to find split points"
  },
  {
    "id": 15,
    "leetcode_id": 1177,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Can Make Palindrome from Substring",
    "leetcode": "https://leetcode.com/problems/can-make-palindrome-from-substring/",
    "requirements": "Prefix sum of character counts"
  }
]
  },
  "HashMap/HashSet": {
    "tip": "Hash maps and sets provide O(1) lookup, insertion, and deletion. They're ideal for problems involving frequency counting, finding duplicates/unique elements, or establishing relationships between elements. Look for problems mentioning 'unique', 'occurrence', 'first', or that require finding or counting specific elements.",
    "problems":[
  {
    "id": 1,
    "leetcode_id": 1,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Two Sum",
    "leetcode": "https://leetcode.com/problems/two-sum/",
    "requirements": "Using hashmap to find complement elements"
  },
  {
    "id": 2,
    "leetcode_id": 242,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Valid Anagram",
    "leetcode": "https://leetcode.com/problems/valid-anagram/",
    "requirements": "Character frequency counting with hashmap"
  },
  {
    "id": 3,
    "leetcode_id": 217,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Contains Duplicate",
    "leetcode": "https://leetcode.com/problems/contains-duplicate/",
    "requirements": "Using hashset to track seen elements"
  },
  {
    "id": 4,
    "leetcode_id": 49,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Group Anagrams",
    "leetcode": "https://leetcode.com/problems/group-anagrams/",
    "requirements": "Using hashmap with custom key"
  },
  {
    "id": 5,
    "leetcode_id": 347,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Top K Frequent Elements",
    "leetcode": "https://leetcode.com/problems/top-k-frequent-elements/",
    "requirements": "Using hashmap for frequency counting"
  },
  {
    "id": 6,
    "leetcode_id": 560,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Subarray Sum Equals K",
    "leetcode": "https://leetcode.com/problems/subarray-sum-equals-k/",
    "requirements": "Using hashmap to track cumulative sums"
  },
  {
    "id": 7,
    "leetcode_id": 205,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Isomorphic Strings",
    "leetcode": "https://leetcode.com/problems/isomorphic-strings/",
    "requirements": "Using hashmaps to track character mappings"
  },
  {
    "id": 8,
    "leetcode_id": 380,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Insert Delete GetRandom O(1)",
    "leetcode": "https://leetcode.com/problems/insert-delete-getrandom-o1/",
    "requirements": "Using hashmap with array for O(1) operations"
  },
  {
    "id": 9,
    "leetcode_id": 36,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Valid Sudoku",
    "leetcode": "https://leetcode.com/problems/valid-sudoku/",
    "requirements": "Using hashsets to validate uniqueness"
  },
  {
    "id": 10,
    "leetcode_id": 438,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Find All Anagrams in a String",
    "leetcode": "https://leetcode.com/problems/find-all-anagrams-in-a-string/",
    "requirements": "Character frequency counting with hashmap"
  },
  {
    "id": 11,
    "leetcode_id": 350,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Intersection of Two Arrays II",
    "leetcode": "https://leetcode.com/problems/intersection-of-two-arrays-ii/",
    "requirements": "Using hashmap to count elements in first array"
  },
  {
    "id": 12,
    "leetcode_id": 387,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "First Unique Character in a String",
    "leetcode": "https://leetcode.com/problems/first-unique-character-in-a-string/",
    "requirements": "Character frequency counting with hashmap"
  },
  {
    "id": 13,
    "leetcode_id": 219,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Contains Duplicate II",
    "leetcode": "https://leetcode.com/problems/contains-duplicate-ii/",
    "requirements": "Hashmap with positional information"
  },
  {
    "id": 14,
    "leetcode_id": 290,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Word Pattern",
    "leetcode": "https://leetcode.com/problems/word-pattern/",
    "requirements": "Using hashmaps for bijection mapping"
  },
  {
    "id": 15,
    "leetcode_id": 454,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "4Sum II",
    "leetcode": "https://leetcode.com/problems/4sum-ii/",
    "requirements": "Using hashmap to store sum frequencies"
  },
  {
    "id": 16,
    "leetcode_id": 525,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Contiguous Array",
    "leetcode": "https://leetcode.com/problems/contiguous-array/",
    "requirements": "Using hashmap to track sum-to-index mapping"
  },
  {
    "id": 17,
    "leetcode_id": 1010,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Pairs of Songs With Total Durations Divisible by 60",
    "leetcode": "https://leetcode.com/problems/pairs-of-songs-with-total-durations-divisible-by-60/",
    "requirements": "Using hashmap to count remainders"
  },
  {
    "id": 18,
    "leetcode_id": 705,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Design HashSet",
    "leetcode": "https://leetcode.com/problems/design-hashset/",
    "requirements": "Implementing a HashSet from scratch"
  },
  {
    "id": 19,
    "leetcode_id": 299,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Bulls and Cows",
    "leetcode": "https://leetcode.com/problems/bulls-and-cows/",
    "requirements": "Using hashmap for frequency counting"
  },
  {
    "id": 20,
    "leetcode_id": 359,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Logger Rate Limiter",
    "leetcode": "https://leetcode.com/problems/logger-rate-limiter/",
    "requirements": "Using hashmap to track timestamps"
  }
]
  },
  "Two Pointers": {
    "tip": "The two pointers technique involves using two pointers to iterate through a data structure (typically an array). This approach is useful for finding pairs, subarrays, or elements that satisfy specific conditions with optimal time complexity. Look for problems involving searching for pairs, subsequences, or where you need to process arrays from both ends or at different speeds.",
    "problems":[
  {
    "id": 1,
    "leetcode_id": 26,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Remove Duplicates from Sorted Array",
    "leetcode": "https://leetcode.com/problems/remove-duplicates-from-sorted-array/",
    "requirements": "Two pointers for in-place array modification"
  },
  {
    "id": 2,
    "leetcode_id": 283,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Move Zeroes",
    "leetcode": "https://leetcode.com/problems/move-zeroes/",
    "requirements": "Two pointers for in-place array reordering"
  },
  {
    "id": 3,
    "leetcode_id": 125,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Valid Palindrome",
    "leetcode": "https://leetcode.com/problems/valid-palindrome/",
    "requirements": "Two pointers from opposite ends"
  },
  {
    "id": 4,
    "leetcode_id": 15,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "3Sum",
    "leetcode": "https://leetcode.com/problems/3sum/",
    "requirements": "Two pointers with sorting"
  },
  {
    "id": 5,
    "leetcode_id": 11,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Container With Most Water",
    "leetcode": "https://leetcode.com/problems/container-with-most-water/",
    "requirements": "Two pointers from opposite ends"
  },
  {
    "id": 6,
    "leetcode_id": 42,
    "difficulty": "Hard",
    "frequency": "High",
    "problem": "Trapping Rain Water",
    "leetcode": "https://leetcode.com/problems/trapping-rain-water/",
    "requirements": "Two pointers from opposite ends"
  },
  {
    "id": 7,
    "leetcode_id": 75,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Sort Colors",
    "leetcode": "https://leetcode.com/problems/sort-colors/",
    "requirements": "Three pointers (Dutch national flag algorithm)"
  },
  {
    "id": 8,
    "leetcode_id": 977,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Squares of a Sorted Array",
    "leetcode": "https://leetcode.com/problems/squares-of-a-sorted-array/",
    "requirements": "Two pointers from opposite ends"
  },
  {
    "id": 9,
    "leetcode_id": 167,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Two Sum II - Input Array Is Sorted",
    "leetcode": "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
    "requirements": "Two pointers from opposite ends"
  },
  {
    "id": 10,
    "leetcode_id": 88,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Merge Sorted Array",
    "leetcode": "https://leetcode.com/problems/merge-sorted-array/",
    "requirements": "Two pointers from the end"
  },
  {
    "id": 11,
    "leetcode_id": 344,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Reverse String",
    "leetcode": "https://leetcode.com/problems/reverse-string/",
    "requirements": "Two pointers from opposite ends"
  },
  {
    "id": 12,
    "leetcode_id": 27,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Remove Element",
    "leetcode": "https://leetcode.com/problems/remove-element/",
    "requirements": "Two pointers for in-place element removal"
  },
  {
    "id": 13,
    "leetcode_id": 18,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "4Sum",
    "leetcode": "https://leetcode.com/problems/4sum/",
    "requirements": "Two pointers with sorting"
  },
  {
    "id": 14,
    "leetcode_id": 16,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "3Sum Closest",
    "leetcode": "https://leetcode.com/problems/3sum-closest/",
    "requirements": "Two pointers with sorting"
  },
  {
    "id": 15,
    "leetcode_id": 680,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Valid Palindrome II",
    "leetcode": "https://leetcode.com/problems/valid-palindrome-ii/",
    "requirements": "Two pointers with one-character deletion"
  },
  {
    "id": 16,
    "leetcode_id": 581,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Shortest Unsorted Continuous Subarray",
    "leetcode": "https://leetcode.com/problems/shortest-unsorted-continuous-subarray/",
    "requirements": "Two pointers from opposite ends"
    }
]
  },
  "Sliding Window": {
    "tip": "The sliding window technique is used to perform operations on a dynamic contiguous sequence of elements, typically an array or string. It's ideal for problems involving subarrays or substrings of variable or fixed length, and often reduces time complexity from O(n²) to O(n). Look for problems asking about 'consecutive elements', 'subarray/substring with condition', or problems where you need to find the longest/shortest/optimal segment that satisfies certain criteria.",
    "problems": [
  {
    "id": 1,
    "leetcode_id": 3,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Longest Substring Without Repeating Characters",
    "leetcode": "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    "requirements": "Variable-size sliding window with hashset"
  },
  {
    "id": 2,
    "leetcode_id": 209,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Minimum Size Subarray Sum",
    "leetcode": "https://leetcode.com/problems/minimum-size-subarray-sum/",
    "requirements": "Variable-size sliding window with sum tracking"
  },
  {
    "id": 3,
    "leetcode_id": 567,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Permutation in String",
    "leetcode": "https://leetcode.com/problems/permutation-in-string/",
    "requirements": "Fixed-size sliding window with character frequency"
  },
  {
    "id": 4,
    "leetcode_id": 438,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Find All Anagrams in a String",
    "leetcode": "https://leetcode.com/problems/find-all-anagrams-in-a-string/",
    "requirements": "Fixed-size sliding window with character frequency"
  },
  {
    "id": 5,
    "leetcode_id": 239,
    "difficulty": "Hard",
    "frequency": "High",
    "problem": "Sliding Window Maximum",
    "leetcode": "https://leetcode.com/problems/sliding-window-maximum/",
    "requirements": "Fixed-size sliding window with maximum tracking using deque"
  },
  {
    "id": 6,
    "leetcode_id": 76,
    "difficulty": "Hard",
    "frequency": "High",
    "problem": "Minimum Window Substring",
    "leetcode": "https://leetcode.com/problems/minimum-window-substring/",
    "requirements": "Variable-size sliding window with character frequency"
  },
  {
    "id": 7,
    "leetcode_id": 1004,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Max Consecutive Ones III",
    "leetcode": "https://leetcode.com/problems/max-consecutive-ones-iii/",
    "requirements": "Variable-size sliding window with flip counting"
  },
  {
    "id": 8,
    "leetcode_id": 424,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Longest Repeating Character Replacement",
    "leetcode": "https://leetcode.com/problems/longest-repeating-character-replacement/",
    "requirements": "Variable-size sliding window with character replacement"
  },
  {
    "id": 9,
    "leetcode_id": 340,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Longest Substring with At Most K Distinct Characters",
    "leetcode": "https://leetcode.com/problems/longest-substring-with-at-most-k-distinct-characters/",
    "requirements": "Variable-size sliding window with character count limit"
  },
  {
    "id": 10,
    "leetcode_id": 1438,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit",
    "leetcode": "https://leetcode.com/problems/longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit/",
    "requirements": "Variable-size sliding window with min/max tracking"
  },
  {
    "id": 11,
    "leetcode_id": 992,
    "difficulty": "Hard",
    "frequency": "Medium",
    "problem": "Subarrays with K Different Integers",
    "leetcode": "https://leetcode.com/problems/subarrays-with-k-different-integers/",
    "requirements": "Sliding window with exact K distinct integers"
  },
  {
    "id": 12,
    "leetcode_id": 1658,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Minimum Operations to Reduce X to Zero",
    "leetcode": "https://leetcode.com/problems/minimum-operations-to-reduce-x-to-zero/",
    "requirements": "Sliding window to find maximum subarray with target sum"
  },
  {
    "id": 13,
    "leetcode_id": 1456,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Maximum Number of Vowels in a Substring of Given Length",
    "leetcode": "https://leetcode.com/problems/maximum-number-of-vowels-in-a-substring-of-given-length/",
    "requirements": "Fixed-size sliding window with vowel counting"
  },
  {
    "id": 14,
    "leetcode_id": 1695,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Maximum Erasure Value",
    "leetcode": "https://leetcode.com/problems/maximum-erasure-value/",
    "requirements": "Variable-size sliding window with unique elements"
  },
  {
    "id": 15,
    "leetcode_id": 159,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Longest Substring with At Most Two Distinct Characters",
    "leetcode": "https://leetcode.com/problems/longest-substring-with-at-most-two-distinct-characters/",
    "requirements": "Variable-size sliding window with character count limit"
  },
  {
    "id": 16,
    "leetcode_id": 1248,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Count Number of Nice Subarrays",
    "leetcode": "https://leetcode.com/problems/count-number-of-nice-subarrays/",
    "requirements": "Sliding window to count subarrays with exactly K odd numbers"
  }
]
  },
  "Binary Search": {
    "tip": "Binary search is an efficient algorithm for finding a target value in a sorted array, reducing time complexity from O(n) to O(log n). It's also applicable to problems involving monotonic functions, finding minimum/maximum values with certain properties, or determining exact/approximate positions. Look for problems with sorted arrays, monotonic conditions, or where you can establish a clear search space with left and right boundaries.",
    "problems":[
  {
    "id": 1,
    "leetcode_id": 704,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Binary Search",
    "leetcode": "https://leetcode.com/problems/binary-search/",
    "requirements": "Classic binary search in a sorted array"
  },
  {
    "id": 2,
    "leetcode_id": 35,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Search Insert Position",
    "leetcode": "https://leetcode.com/problems/search-insert-position/",
    "requirements": "Binary search to find insertion point"
  },
  {
    "id": 3,
    "leetcode_id": 278,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "First Bad Version",
    "leetcode": "https://leetcode.com/problems/first-bad-version/",
    "requirements": "Binary search to find first occurrence"
  },
  {
    "id": 4,
    "leetcode_id": 69,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Sqrt(x)",
    "leetcode": "https://leetcode.com/problems/sqrtx/",
    "requirements": "Binary search for numerical computation"
  },
  {
    "id": 5,
    "leetcode_id": 33,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Search in Rotated Sorted Array",
    "leetcode": "https://leetcode.com/problems/search-in-rotated-sorted-array/",
    "requirements": "Binary search in rotated sorted array"
  },
  {
    "id": 6,
    "leetcode_id": 34,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Find First and Last Position of Element in Sorted Array",
    "leetcode": "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/",
    "requirements": "Binary search for range bounds"
  },
  {
    "id": 7,
    "leetcode_id": 74,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Search a 2D Matrix",
    "leetcode": "https://leetcode.com/problems/search-a-2d-matrix/",
    "requirements": "Binary search on 2D matrix"
  },
  {
    "id": 8,
    "leetcode_id": 153,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Find Minimum in Rotated Sorted Array",
    "leetcode": "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
    "requirements": "Binary search in rotated sorted array"
  },
  {
    "id": 9,
    "leetcode_id": 4,
    "difficulty": "Hard",
    "frequency": "High",
    "problem": "Median of Two Sorted Arrays",
    "leetcode": "https://leetcode.com/problems/median-of-two-sorted-arrays/",
    "requirements": "Binary search on smaller array to find partition point"
  },
  {
    "id": 10,
    "leetcode_id": 875,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Koko Eating Bananas",
    "leetcode": "https://leetcode.com/problems/koko-eating-bananas/",
    "requirements": "Binary search on answer space"
  },
  {
    "id": 11,
    "leetcode_id": 1011,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Capacity To Ship Packages Within D Days",
    "leetcode": "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/",
    "requirements": "Binary search on answer space"
  },
  {
    "id": 12,
    "leetcode_id": 378,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Kth Smallest Element in a Sorted Matrix",
    "leetcode": "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/",
    "requirements": "Binary search with counting elements"
  },
  {
    "id": 13,
    "leetcode_id": 162,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Find Peak Element",
    "leetcode": "https://leetcode.com/problems/find-peak-element/",
    "requirements": "Binary search in unsorted array with condition"
  },
  {
    "id": 14,
    "leetcode_id": 240,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Search a 2D Matrix II",
    "leetcode": "https://leetcode.com/problems/search-a-2d-matrix-ii/",
    "requirements": "Binary search in partially sorted 2D matrix"
  },
  {
    "id": 15,
    "leetcode_id": 540,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Single Element in a Sorted Array",
    "leetcode": "https://leetcode.com/problems/single-element-in-a-sorted-array/",
    "requirements": "Binary search with parity check"
  },
  {
    "id": 16,
    "leetcode_id": 81,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Search in Rotated Sorted Array II",
    "leetcode": "https://leetcode.com/problems/search-in-rotated-sorted-array-ii/",
    "requirements": "Binary search in rotated sorted array with duplicates"
  }
]
  },
  "Cyclic Sort": {
    "tip": "Cyclic sort is a pattern for sorting arrays containing numbers in a given range (typically 1 to n or 0 to n-1). It works by placing each number in its correct position based on its value, making it highly efficient for problems involving missing numbers, duplicates, or where elements have constrained values. Look for array problems where values correspond to indices and you need O(n) time with O(1) extra space.",
    "problems": [
      {
        "id": 181,
        "leetcode_id": 268,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Missing Number",
        "leetcode": "https://leetcode.com/problems/missing-number/",
        "requirements": "Find the missing number in range [0,n]"
      },
      {
        "id": 182,
        "leetcode_id": 448,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Find All Numbers Disappeared in an Array",
        "leetcode": "https://leetcode.com/problems/find-all-numbers-disappeared-in-an-array/",
        "requirements": "Find all missing numbers in range [1,n]"
      },
      {
        "id": 183,
        "leetcode_id": 287,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Find the Duplicate Number",
        "leetcode": "https://leetcode.com/problems/find-the-duplicate-number/",
        "requirements": "Find duplicate in range [1,n] with O(1) space"
      },
      {
        "id": 184,
        "leetcode_id": 442,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Find All Duplicates in an Array",
        "leetcode": "https://leetcode.com/problems/find-all-duplicates-in-an-array/",
        "requirements": "Find all duplicates in range [1,n] with O(1) space"
      },
      {
        "id": 185,
        "leetcode_id": 41,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "First Missing Positive",
        "leetcode": "https://leetcode.com/problems/first-missing-positive/",
        "requirements": "Find first missing positive integer with O(1) space"
      },
      {
        "id": 186,
        "leetcode_id": 645,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Set Mismatch",
        "leetcode": "https://leetcode.com/problems/set-mismatch/",
        "requirements": "Find duplicate and missing number in range [1,n]"
      },
      {
        "id": 187,
        "leetcode_id": 765,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Couples Holding Hands",
        "leetcode": "https://leetcode.com/problems/couples-holding-hands/",
        "requirements": "Cycle detection and swapping"
      }
    ]
  },
  "Matrix Traversal": {
    "tip": "Matrix traversal problems involve navigating 2D arrays in specific patterns or searching for paths/elements with certain properties. These problems often use techniques like row/column iteration, diagonal traversal, spiral ordering, or directional movement with coordinates. Look for problems involving grids, boards, or 2D arrays that require systematic exploration or path-finding.",
    "problems": [
  {
    "id": 1,
    "leetcode_id": 48,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Rotate Image",
    "leetcode": "https://leetcode.com/problems/rotate-image/",
    "requirements": "In-place matrix rotation"
  },
  {
    "id": 2,
    "leetcode_id": 54,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Spiral Matrix",
    "leetcode": "https://leetcode.com/problems/spiral-matrix/",
    "requirements": "Spiral traversal pattern"
  },
  {
    "id": 3,
    "leetcode_id": 73,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Set Matrix Zeroes",
    "leetcode": "https://leetcode.com/problems/set-matrix-zeroes/",
    "requirements": "Matrix modification with constraints"
  },
  {
    "id": 4,
    "leetcode_id": 36,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Valid Sudoku",
    "leetcode": "https://leetcode.com/problems/valid-sudoku/",
    "requirements": "Grid validation with hash sets"
  },
  {
    "id": 5,
    "leetcode_id": 74,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Search a 2D Matrix",
    "leetcode": "https://leetcode.com/problems/search-a-2d-matrix/",
    "requirements": "Binary search in matrix"
  },
  {
    "id": 6,
    "leetcode_id": 240,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Search a 2D Matrix II",
    "leetcode": "https://leetcode.com/problems/search-a-2d-matrix-ii/",
    "requirements": "Efficient matrix searching"
  },
  {
    "id": 7,
    "leetcode_id": 289,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Game of Life",
    "leetcode": "https://leetcode.com/problems/game-of-life/",
    "requirements": "In-place cell state updates"
  },
  {
    "id": 8,
    "leetcode_id": 378,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Kth Smallest Element in a Sorted Matrix",
    "leetcode": "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/",
    "requirements": "Matrix element selection"
  },
  {
    "id": 9,
    "leetcode_id": 463,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Island Perimeter",
    "leetcode": "https://leetcode.com/problems/island-perimeter/",
    "requirements": "Grid traversal with adjacent cell checking"
  },
  {
    "id": 10,
    "leetcode_id": 867,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Transpose Matrix",
    "leetcode": "https://leetcode.com/problems/transpose-matrix/",
    "requirements": "Basic matrix transformation"
  },
  {
    "id": 11,
    "leetcode_id": 1329,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Sort the Matrix Diagonally",
    "leetcode": "https://leetcode.com/problems/sort-the-matrix-diagonally/",
    "requirements": "Diagonal traversal and sorting"
  },
  {
    "id": 12,
    "leetcode_id": 59,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Spiral Matrix II",
    "leetcode": "https://leetcode.com/problems/spiral-matrix-ii/",
    "requirements": "Spiral filling pattern"
  },
  {
    "id": 13,
    "leetcode_id": 2022,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Convert 1D Array Into 2D Array",
    "leetcode": "https://leetcode.com/problems/convert-1d-array-into-2d-array/",
    "requirements": "Array to matrix conversion"
  },
  {
    "id": 14,
    "leetcode_id": 766,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Toeplitz Matrix",
    "leetcode": "https://leetcode.com/problems/toeplitz-matrix/",
    "requirements": "Diagonal pattern verification"
  },
  {
    "id": 15,
    "leetcode_id": 1292,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Maximum Side Length of a Square with Sum Less than or Equal to Threshold",
    "leetcode": "https://leetcode.com/problems/maximum-side-length-of-a-square-with-sum-less-than-or-equal-to-threshold/",
    "requirements": "Matrix prefix sum with binary search"
  }
]
  },
  "Stacks & Queues": {
    "tip": "Stacks (LIFO - Last In, First Out) and Queues (FIFO - First In, First Out) are fundamental data structures for solving problems involving order-sensitive operations. Stacks excel at problems involving matched pairs, recursion simulation, and reversal. Queues are ideal for breadth-first search, level order traversal, and maintaining processing order. Look for problems involving parentheses matching, expression evaluation, or where the most recent or oldest element needs special handling.",
    "problems": [
  {
    "id": 1,
    "leetcode_id": 20,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Valid Parentheses",
    "leetcode": "https://leetcode.com/problems/valid-parentheses/",
    "requirements": "Check valid nested parentheses using stack"
  },
  {
    "id": 2,
    "leetcode_id": 155,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Min Stack",
    "leetcode": "https://leetcode.com/problems/min-stack/",
    "requirements": "Stack with constant time minimum element retrieval"
  },
  {
    "id": 3,
    "leetcode_id": 232,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Implement Queue using Stacks",
    "leetcode": "https://leetcode.com/problems/implement-queue-using-stacks/",
    "requirements": "Queue implementation using only stacks"
  },
  {
    "id": 4,
    "leetcode_id": 394,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Decode String",
    "leetcode": "https://leetcode.com/problems/decode-string/",
    "requirements": "Decoding nested encoded strings using stack"
  },
  {
    "id": 5,
    "leetcode_id": 150,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Evaluate Reverse Polish Notation",
    "leetcode": "https://leetcode.com/problems/evaluate-reverse-polish-notation/",
    "requirements": "Evaluate postfix expression using stack"
  },
  {
    "id": 6,
    "leetcode_id": 739,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Daily Temperatures",
    "leetcode": "https://leetcode.com/problems/daily-temperatures/",
    "requirements": "Find next warmer temperature using stack"
  },
  {
    "id": 7,
    "leetcode_id": 227,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Basic Calculator II",
    "leetcode": "https://leetcode.com/problems/basic-calculator-ii/",
    "requirements": "Calculate expression with +,-,*,/ using stack"
  },
  {
    "id": 8,
    "leetcode_id": 84,
    "difficulty": "Hard",
    "frequency": "High",
    "problem": "Largest Rectangle in Histogram",
    "leetcode": "https://leetcode.com/problems/largest-rectangle-in-histogram/",
    "requirements": "Find largest rectangle area using stack"
  },
  {
    "id": 9,
    "leetcode_id": 42,
    "difficulty": "Hard",
    "frequency": "High",
    "problem": "Trapping Rain Water",
    "leetcode": "https://leetcode.com/problems/trapping-rain-water/",
    "requirements": "Calculate trapped water using stack approach"
  },
  {
    "id": 10,
    "leetcode_id": 239,
    "difficulty": "Hard",
    "frequency": "High",
    "problem": "Sliding Window Maximum",
    "leetcode": "https://leetcode.com/problems/sliding-window-maximum/",
    "requirements": "Find maximum in sliding window using deque"
  },
  {
    "id": 11,
    "leetcode_id": 496,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Next Greater Element I",
    "leetcode": "https://leetcode.com/problems/next-greater-element-i/",
    "requirements": "Find next greater element using stack"
  },
  {
    "id": 12,
    "leetcode_id": 1047,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Remove All Adjacent Duplicates In String",
    "leetcode": "https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/",
    "requirements": "Remove adjacent duplicate characters using stack"
  },
  {
    "id": 13,
    "leetcode_id": 402,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Remove K Digits",
    "leetcode": "https://leetcode.com/problems/remove-k-digits/",
    "requirements": "Remove k digits to form smallest number using stack"
  },
  {
    "id": 14,
    "leetcode_id": 844,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Backspace String Compare",
    "leetcode": "https://leetcode.com/problems/backspace-string-compare/",
    "requirements": "Compare strings with backspace characters using stack"
  },
  {
    "id": 15,
    "leetcode_id": 32,
    "difficulty": "Hard",
    "frequency": "Medium",
    "problem": "Longest Valid Parentheses",
    "leetcode": "https://leetcode.com/problems/longest-valid-parentheses/",
    "requirements": "Find longest valid parentheses substring using stack"
  }
]
  },
  "Monotonic Stack/Queue": {
    "tip": "A monotonic stack or queue maintains elements in a strictly increasing or decreasing order by popping elements that violate this property. They're exceptionally useful for solving 'next greater/smaller element' problems, finding spans, and handling scenarios where you need to efficiently track the nearest element that's larger or smaller. Look for problems involving finding the next/previous greater/smaller element, maximum areas, or temperature/stock price patterns.",
    "problems": [
  {
    "id": 1,
    "leetcode_id": 739,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Daily Temperatures",
    "leetcode": "https://leetcode.com/problems/daily-temperatures/",
    "requirements": "Find next warmer day using monotonic decreasing stack"
  },
  {
    "id": 2,
    "leetcode_id": 496,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Next Greater Element I",
    "leetcode": "https://leetcode.com/problems/next-greater-element-i/",
    "requirements": "Find next greater element using monotonic decreasing stack"
  },
  {
    "id": 3,
    "leetcode_id": 84,
    "difficulty": "Hard",
    "frequency": "High",
    "problem": "Largest Rectangle in Histogram",
    "leetcode": "https://leetcode.com/problems/largest-rectangle-in-histogram/",
    "requirements": "Find largest rectangle area using monotonic increasing stack"
  },
  {
    "id": 4,
    "leetcode_id": 42,
    "difficulty": "Hard",
    "frequency": "High",
    "problem": "Trapping Rain Water",
    "leetcode": "https://leetcode.com/problems/trapping-rain-water/",
    "requirements": "Calculate trapped water using monotonic stack"
  },
  {
    "id": 5,
    "leetcode_id": 239,
    "difficulty": "Hard",
    "frequency": "High",
    "problem": "Sliding Window Maximum",
    "leetcode": "https://leetcode.com/problems/sliding-window-maximum/",
    "requirements": "Find maximum in sliding window using monotonic decreasing queue"
  },
  {
    "id": 6,
    "leetcode_id": 402,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Remove K Digits",
    "leetcode": "https://leetcode.com/problems/remove-k-digits/",
    "requirements": "Create smallest number by removing digits using monotonic increasing stack"
  },
  {
    "id": 7,
    "leetcode_id": 316,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Remove Duplicate Letters",
    "leetcode": "https://leetcode.com/problems/remove-duplicate-letters/",
    "requirements": "Lexicographically smallest string using monotonic stack"
  },
  {
    "id": 8,
    "leetcode_id": 503,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Next Greater Element II",
    "leetcode": "https://leetcode.com/problems/next-greater-element-ii/",
    "requirements": "Find next greater element in circular array using monotonic stack"
  },
  {
    "id": 9,
    "leetcode_id": 901,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Online Stock Span",
    "leetcode": "https://leetcode.com/problems/online-stock-span/",
    "requirements": "Calculate consecutive smaller/equal elements using monotonic stack"
  },
  {
    "id": 10,
    "leetcode_id": 456,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "132 Pattern",
    "leetcode": "https://leetcode.com/problems/132-pattern/",
    "requirements": "Find 132 pattern using monotonic stack"
  },
  {
    "id": 11,
    "leetcode_id": 907,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Sum of Subarray Minimums",
    "leetcode": "https://leetcode.com/problems/sum-of-subarray-minimums/",
    "requirements": "Find sum of all subarray minimums using monotonic stack"
  },
  {
    "id": 12,
    "leetcode_id": 1019,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Next Greater Node In Linked List",
    "leetcode": "https://leetcode.com/problems/next-greater-node-in-linked-list/",
    "requirements": "Find next greater node in linked list using monotonic stack"
  },
  {
    "id": 13,
    "leetcode_id": 1856,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Maximum Subarray Min-Product",
    "leetcode": "https://leetcode.com/problems/maximum-subarray-min-product/",
    "requirements": "Find maximum min-product subarray using monotonic stack"
  },
  {
    "id": 14,
    "leetcode_id": 2104,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Sum of Subarray Ranges",
    "leetcode": "https://leetcode.com/problems/sum-of-subarray-ranges/",
    "requirements": "Find sum of (max-min) for all subarrays using monotonic stacks"
  },
  {
    "id": 15,
    "leetcode_id": 1475,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Final Prices With a Special Discount in a Shop",
    "leetcode": "https://leetcode.com/problems/final-prices-with-a-special-discount-in-a-shop/",
    "requirements": "Apply discounts using monotonic increasing stack"
  }
]
  },
  "Linked Lists": {
    "tip": "Linked lists are linear data structures where elements are stored in nodes, each pointing to the next node in the sequence. They excel at insertions and deletions but have O(n) access time. Common techniques include the two-pointer approach (slow/fast pointers), dummy head nodes, and in-place manipulations. Look for problems involving traversal, list modifications, finding cycles, or reversing portions of a list.",
    "problems": [
  {
    "id": 1,
    "leetcode_id": 206,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Reverse Linked List",
    "leetcode": "https://leetcode.com/problems/reverse-linked-list/",
    "requirements": "Basic linked list reversal"
  },
  {
    "id": 2,
    "leetcode_id": 21,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Merge Two Sorted Lists",
    "leetcode": "https://leetcode.com/problems/merge-two-sorted-lists/",
    "requirements": "Merge sorted linked lists"
  },
  {
    "id": 3,
    "leetcode_id": 141,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Linked List Cycle",
    "leetcode": "https://leetcode.com/problems/linked-list-cycle/",
    "requirements": "Detect cycle using fast/slow pointers"
  },
  {
    "id": 4,
    "leetcode_id": 19,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Remove Nth Node From End of List",
    "leetcode": "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
    "requirements": "Remove node with single pass using two pointers"
  },
  {
    "id": 5,
    "leetcode_id": 2,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Add Two Numbers",
    "leetcode": "https://leetcode.com/problems/add-two-numbers/",
    "requirements": "Add numbers represented by linked lists"
  },
  {
    "id": 6,
    "leetcode_id": 160,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Intersection of Two Linked Lists",
    "leetcode": "https://leetcode.com/problems/intersection-of-two-linked-lists/",
    "requirements": "Find intersection point of two lists"
  },
  {
    "id": 7,
    "leetcode_id": 234,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Palindrome Linked List",
    "leetcode": "https://leetcode.com/problems/palindrome-linked-list/",
    "requirements": "Check if linked list is palindrome"
  },
  {
    "id": 8,
    "leetcode_id": 876,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Middle of the Linked List",
    "leetcode": "https://leetcode.com/problems/middle-of-the-linked-list/",
    "requirements": "Find middle node using fast/slow pointers"
  },
  {
    "id": 9,
    "leetcode_id": 142,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Linked List Cycle II",
    "leetcode": "https://leetcode.com/problems/linked-list-cycle-ii/",
    "requirements": "Find cycle start using fast/slow pointers"
  },
  {
    "id": 10,
    "leetcode_id": 92,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Reverse Linked List II",
    "leetcode": "https://leetcode.com/problems/reverse-linked-list-ii/",
    "requirements": "Reverse linked list between positions"
  },
  {
    "id": 11,
    "leetcode_id": 138,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Copy List with Random Pointer",
    "leetcode": "https://leetcode.com/problems/copy-list-with-random-pointer/",
    "requirements": "Deep copy list with additional pointer"
  },
  {
    "id": 12,
    "leetcode_id": 148,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Sort List",
    "leetcode": "https://leetcode.com/problems/sort-list/",
    "requirements": "Sort linked list in O(n log n) time"
  },
  {
    "id": 13,
    "leetcode_id": 23,
    "difficulty": "Hard",
    "frequency": "High",
    "problem": "Merge k Sorted Lists",
    "leetcode": "https://leetcode.com/problems/merge-k-sorted-lists/",
    "requirements": "Merge k sorted linked lists"
  },
  {
    "id": 14,
    "leetcode_id": 24,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Swap Nodes in Pairs",
    "leetcode": "https://leetcode.com/problems/swap-nodes-in-pairs/",
    "requirements": "Swap adjacent linked list nodes"
  },
  {
    "id": 15,
    "leetcode_id": 146,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "LRU Cache",
    "leetcode": "https://leetcode.com/problems/lru-cache/",
    "requirements": "Implement LRU cache using hashmap and linked list"
  }
]
  },
  "Fast & Slow Pointers": {
    "tip": "Fast & Slow Pointers (also known as the Hare & Tortoise algorithm) is a technique where two pointers move through a sequence at different speeds. This approach is particularly useful for cycle detection, finding middle elements, or identifying pattern lengths in linked lists and arrays. Look for problems where one pointer moves faster than another to detect cycles or find midpoints in a single pass.",
    "problems": [
  {
    "id": 1,
    "leetcode_id": 141,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Linked List Cycle",
    "leetcode": "https://leetcode.com/problems/linked-list-cycle/",
    "requirements": "Detect if linked list has a cycle"
  },
  {
    "id": 2,
    "leetcode_id": 142,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Linked List Cycle II",
    "leetcode": "https://leetcode.com/problems/linked-list-cycle-ii/",
    "requirements": "Find the node where cycle begins"
  },
  {
    "id": 3,
    "leetcode_id": 876,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Middle of the Linked List",
    "leetcode": "https://leetcode.com/problems/middle-of-the-linked-list/",
    "requirements": "Find middle node of linked list"
  },
  {
    "id": 4,
    "leetcode_id": 234,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Palindrome Linked List",
    "leetcode": "https://leetcode.com/problems/palindrome-linked-list/",
    "requirements": "Check if linked list is palindrome using middle finding"
  },
  {
    "id": 5,
    "leetcode_id": 287,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Find the Duplicate Number",
    "leetcode": "https://leetcode.com/problems/find-the-duplicate-number/",
    "requirements": "Find duplicate in array using cycle detection"
  },
  {
    "id": 6,
    "leetcode_id": 19,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Remove Nth Node From End of List",
    "leetcode": "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
    "requirements": "Remove nth node from end using offset pointers"
  },
  {
    "id": 7,
    "leetcode_id": 143,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Reorder List",
    "leetcode": "https://leetcode.com/problems/reorder-list/",
    "requirements": "Reorder list using middle finding and reversal"
  },
  {
    "id": 8,
    "leetcode_id": 160,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Intersection of Two Linked Lists",
    "leetcode": "https://leetcode.com/problems/intersection-of-two-linked-lists/",
    "requirements": "Find intersection point of two linked lists"
  },
  {
    "id": 9,
    "leetcode_id": 202,
    "difficulty": "Easy",
    "frequency": "Medium",
    "problem": "Happy Number",
    "leetcode": "https://leetcode.com/problems/happy-number/",
    "requirements": "Detect cycle in number sequence"
  },
  {
    "id": 10,
    "leetcode_id": 148,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Sort List",
    "leetcode": "https://leetcode.com/problems/sort-list/",
    "requirements": "Sort linked list using merge sort with middle finding"
  },
  {
    "id": 11,
    "leetcode_id": 457,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Circular Array Loop",
    "leetcode": "https://leetcode.com/problems/circular-array-loop/",
    "requirements": "Detect cycle in circular array"
  },
  {
    "id": 12,
    "leetcode_id": 61,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Rotate List",
    "leetcode": "https://leetcode.com/problems/rotate-list/",
    "requirements": "Rotate linked list by finding length"
  }
]
  },
  "Linked List Reversal": {
    "tip": "Linked list reversal is a fundamental technique that involves changing the direction of pointers in a linked list. This pattern is used for both complete reversal and partial reversal (such as reversing segments or groups). Key concepts include tracking previous/current/next pointers, handling edge cases, and maintaining proper connections. Look for problems involving reversing entire lists, portions of lists, or where reversal is used as a step in solving a more complex problem.",
    "problems": [
      {
        "id": 1,
        "leetcode_id": 206,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Reverse Linked List",
        "leetcode": "https://leetcode.com/problems/reverse-linked-list/",
        "requirements": "Reverse entire linked list (iterative and recursive)"
      },
      {
        "id": 2,
        "leetcode_id": 92,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Reverse Linked List II",
        "leetcode": "https://leetcode.com/problems/reverse-linked-list-ii/",
        "requirements": "Reverse linked list from position m to n"
      },
      {
        "id": 3,
        "leetcode_id": 25,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Reverse Nodes in k-Group",
        "leetcode": "https://leetcode.com/problems/reverse-nodes-in-k-group/",
        "requirements": "Reverse nodes in groups of k"
      },
      {
        "id": 4,
        "leetcode_id": 24,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Swap Nodes in Pairs",
        "leetcode": "https://leetcode.com/problems/swap-nodes-in-pairs/",
        "requirements": "Reverse nodes in groups of 2"
      },
      {
        "id": 5,
        "leetcode_id": 234,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Palindrome Linked List",
        "leetcode": "https://leetcode.com/problems/palindrome-linked-list/",
        "requirements": "Check if list is palindrome by reversing second half"
      },
      {
        "id": 6,
        "leetcode_id": 143,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Reorder List",
        "leetcode": "https://leetcode.com/problems/reorder-list/",
        "requirements": "Reorder list by reversing second half and merging"
      },
      {
        "id": 7,
        "leetcode_id": 61,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Rotate List",
        "leetcode": "https://leetcode.com/problems/rotate-list/",
        "requirements": "Rotate linked list to the right (involves list manipulation)"
      },
      {
        "id": 8,
        "leetcode_id": 2074,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Reverse Nodes in Even Length Groups",
        "leetcode": "https://leetcode.com/problems/reverse-nodes-in-even-length-groups/",
        "requirements": "Reverse nodes in groups with even length"
      },
      {
        "id": 9,
        "leetcode_id": 1721,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Swapping Nodes in a Linked List",
        "leetcode": "https://leetcode.com/problems/swapping-nodes-in-a-linked-list/",
        "requirements": "Swap values of kth node from beginning and end"
      },
      {
        "id": 10,
        "leetcode_id": 328,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Odd Even Linked List",
        "leetcode": "https://leetcode.com/problems/odd-even-linked-list/",
        "requirements": "Group odd and even indexed nodes (list manipulation)"
      }
    ]
  },
  "Recursion": {
    "tip": "Recursion is a technique where a function calls itself to solve a smaller instance of the same problem, relying on a base case to terminate. For these introductory problems, focus on understanding the recursive structure: identifying base cases, breaking problems into smaller subproblems, and combining subproblem solutions. Look for patterns that can be naturally expressed in terms of their smaller versions.",
    "problems": [
    {
        "id": 1,
        "leetcode_id": 206,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Reverse Linked List",
        "leetcode": "https://leetcode.com/problems/reverse-linked-list/",
        "requirements": "Reverse a singly linked list iteratively or recursively"
    },
    {
        "id": 2,
        "leetcode_id": 21,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Merge Two Sorted Lists",
        "leetcode": "https://leetcode.com/problems/merge-two-sorted-lists/",
        "requirements": "Merge two sorted linked lists into one sorted list"
    },
    {
        "id": 3,
        "leetcode_id": 509,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Fibonacci Number",
        "leetcode": "https://leetcode.com/problems/fibonacci-number/",
        "requirements": "Calculate the nth Fibonacci number recursively"
    },
    {
        "id": 4,
        "leetcode_id": 70,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Climbing Stairs",
        "leetcode": "https://leetcode.com/problems/climbing-stairs/",
        "requirements": "Calculate number of distinct ways to climb n stairs"
    },
    {
        "id": 5,
        "leetcode_id": 50,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Pow(x, n)",
        "leetcode": "https://leetcode.com/problems/powx-n/",
        "requirements": "Implement power function with optimized recursion"
    },
    {
        "id": 6,
        "leetcode_id": 394,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Decode String",
        "leetcode": "https://leetcode.com/problems/decode-string/",
        "requirements": "Decode a string with repeated substrings"
    },
    {
        "id": 7,
        "leetcode_id": 24,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Swap Nodes in Pairs",
        "leetcode": "https://leetcode.com/problems/swap-nodes-in-pairs/",
        "requirements": "Swap every two adjacent nodes in a linked list"
    },
    {
        "id": 8,
        "leetcode_id": 25,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Reverse Nodes in k-Group",
        "leetcode": "https://leetcode.com/problems/reverse-nodes-in-k-group/",
        "requirements": "Reverse nodes in groups of k"
    },
    {
        "id": 9,
        "leetcode_id": 234,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Palindrome Linked List",
        "leetcode": "https://leetcode.com/problems/palindrome-linked-list/",
        "requirements": "Check if a linked list is a palindrome"
    },
    {
        "id": 10,
        "leetcode_id": 344,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Reverse String",
        "leetcode": "https://leetcode.com/problems/reverse-string/",
        "requirements": "Reverse a string in-place using recursion"
    },
    {
        "id": 11,
        "leetcode_id": 2,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Add Two Numbers",
        "leetcode": "https://leetcode.com/problems/add-two-numbers/",
        "requirements": "Add two numbers represented by linked lists"
    },
    {
        "id": 12,
        "leetcode_id": 19,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Remove Nth Node From End of List",
        "leetcode": "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
        "requirements": "Remove the nth node from the end of the list"
    },
    {
        "id": 13,
        "leetcode_id": 203,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Remove Linked List Elements",
        "leetcode": "https://leetcode.com/problems/remove-linked-list-elements/",
        "requirements": "Remove all elements with a given value"
    },
    {
        "id": 14,
        "leetcode_id": 1823,
        "difficulty": "Medium",
        "frequency": "Low",
        "problem": "Find the Winner of the Circular Game",
        "leetcode": "https://leetcode.com/problems/find-the-winner-of-the-circular-game/",
        "requirements": "Find the winner of a circular elimination game"
    },
    {
        "id": 15,
        "leetcode_id": 143,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Reorder List",
        "leetcode": "https://leetcode.com/problems/reorder-list/",
        "requirements": "Reorder list to L0 → Ln → L1 → Ln-1 → L2 → Ln-2 →…"
    },
    {
        "id": 16,
        "leetcode_id": 160,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Intersection of Two Linked Lists",
        "leetcode": "https://leetcode.com/problems/intersection-of-two-linked-lists/",
        "requirements": "Find the node where two linked lists intersect"
    },
    {
        "id": 17,
        "leetcode_id": 876,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Middle of the Linked List",
        "leetcode": "https://leetcode.com/problems/middle-of-the-linked-list/",
        "requirements": "Return the middle node of the linked list"
    }
]
  },
  "Trees": {
    "tip": "Trees are hierarchical data structures with a root node and child nodes. Key operations include traversal, searching, insertion, and deletion. The problems here focus on binary trees and binary search trees (BST), covering basic tree operations, checking tree properties, and simple transformations. Look for problems involving tree structure verification, path finding, or node value relationships.",
    "problems": [
    {
        "id": 1,
        "leetcode_id": 226,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Invert Binary Tree",
        "leetcode": "https://leetcode.com/problems/invert-binary-tree/",
        "requirements": "Swap left and right children for all nodes"
    },
    {
        "id": 2,
        "leetcode_id": 104,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Maximum Depth of Binary Tree",
        "leetcode": "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
        "requirements": "Find the maximum depth of the tree"
    },
    {
        "id": 3,
        "leetcode_id": 100,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Same Tree",
        "leetcode": "https://leetcode.com/problems/same-tree/",
        "requirements": "Check if two trees are identical"
    },
    {
        "id": 4,
        "leetcode_id": 101,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Symmetric Tree",
        "leetcode": "https://leetcode.com/problems/symmetric-tree/",
        "requirements": "Check if a tree is a mirror of itself"
    },
    {
        "id": 5,
        "leetcode_id": 112,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Path Sum",
        "leetcode": "https://leetcode.com/problems/path-sum/",
        "requirements": "Check if a root-to-leaf path exists with a given sum"
    },
    {
        "id": 6,
        "leetcode_id": 94,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Binary Tree Inorder Traversal",
        "leetcode": "https://leetcode.com/problems/binary-tree-inorder-traversal/",
        "requirements": "Perform inorder traversal"
    },
    {
        "id": 7,
        "leetcode_id": 144,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Binary Tree Preorder Traversal",
        "leetcode": "https://leetcode.com/problems/binary-tree-preorder-traversal/",
        "requirements": "Perform preorder traversal"
    },
    {
        "id": 8,
        "leetcode_id": 145,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Binary Tree Postorder Traversal",
        "leetcode": "https://leetcode.com/problems/binary-tree-postorder-traversal/",
        "requirements": "Perform postorder traversal"
    },
    {
        "id": 9,
        "leetcode_id": 257,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Binary Tree Paths",
        "leetcode": "https://leetcode.com/problems/binary-tree-paths/",
        "requirements": "Find all root-to-leaf paths"
    },
    {
        "id": 10,
        "leetcode_id": 98,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Validate Binary Search Tree",
        "leetcode": "https://leetcode.com/problems/validate-binary-search-tree/",
        "requirements": "Check if a tree follows BST properties"
    },
    {
        "id": 11,
        "leetcode_id": 700,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Search in a Binary Search Tree",
        "leetcode": "https://leetcode.com/problems/search-in-a-binary-search-tree/",
        "requirements": "Find a node with a given value in BST"
    },
    {
        "id": 12,
        "leetcode_id": 235,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Lowest Common Ancestor of a Binary Search Tree",
        "leetcode": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
        "requirements": "Find the lowest common ancestor in a BST"
    },
    {
        "id": 13,
        "leetcode_id": 236,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Lowest Common Ancestor of a Binary Tree",
        "leetcode": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
        "requirements": "Find the lowest common ancestor in a binary tree"
    },
    {
        "id": 14,
        "leetcode_id": 230,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Kth Smallest Element in a BST",
        "leetcode": "https://leetcode.com/problems/kth-smallest-element-in-a-bst/",
        "requirements": "Find the kth smallest element in a BST"
    },
    {
        "id": 15,
        "leetcode_id": 110,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Balanced Binary Tree",
        "leetcode": "https://leetcode.com/problems/balanced-binary-tree/",
        "requirements": "Check if a binary tree is height-balanced"
    },
    {
        "id": 16,
        "leetcode_id": 543,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Diameter of Binary Tree",
        "leetcode": "https://leetcode.com/problems/diameter-of-binary-tree/",
        "requirements": "Find the longest path between any two nodes"
    }
]
  },
  "Tree DFS": {
    "tip": "Tree DFS (Depth-First Search) involves exploring a tree as far as possible along each branch before backtracking. The three main DFS traversals are preorder (root, left, right), inorder (left, root, right), and postorder (left, right, root). This pattern is excellent for problems involving path finding, tree structure validation, and node relationship analysis. Look for problems where you need to exhaust all paths, find specific paths, or make decisions based on parent-child relationships.",
    "problems": [
    {
        "id": 1,
        "leetcode_id": 94,
        "difficulty": "Easy",
        "problem": "Binary Tree Inorder Traversal",
        "leetcode": "https://leetcode.com/problems/binary-tree-inorder-traversal/",
        "requirements": "Implement inorder traversal (Left, Root, Right)"
    },
    {
        "id": 2,
        "leetcode_id": 144,
        "difficulty": "Easy",
        "problem": "Binary Tree Preorder Traversal",
        "leetcode": "https://leetcode.com/problems/binary-tree-preorder-traversal/",
        "requirements": "Implement preorder traversal (Root, Left, Right)"
    },
    {
        "id": 3,
        "leetcode_id": 145,
        "difficulty": "Easy",
        "problem": "Binary Tree Postorder Traversal",
        "leetcode": "https://leetcode.com/problems/binary-tree-postorder-traversal/",
        "requirements": "Implement postorder traversal (Left, Right, Root)"
    },
    {
        "id": 4,
        "leetcode_id": 98,
        "difficulty": "Medium",
        "problem": "Validate Binary Search Tree",
        "leetcode": "https://leetcode.com/problems/validate-binary-search-tree/",
        "requirements": "Check if a binary tree is a valid BST using DFS"
    },
    {
        "id": 5,
        "leetcode_id": 112,
        "difficulty": "Easy",
        "problem": "Path Sum",
        "leetcode": "https://leetcode.com/problems/path-sum/",
        "requirements": "Check if a root-to-leaf path with a given sum exists"
    },
    {
        "id": 6,
        "leetcode_id": 113,
        "difficulty": "Medium",
        "problem": "Path Sum II",
        "leetcode": "https://leetcode.com/problems/path-sum-ii/",
        "requirements": "Find all root-to-leaf paths with a given sum"
    },
    {
        "id": 7,
        "leetcode_id": 257,
        "difficulty": "Easy",
        "problem": "Binary Tree Paths",
        "leetcode": "https://leetcode.com/problems/binary-tree-paths/",
        "requirements": "Find all root-to-leaf paths"
    },
    {
        "id": 8,
        "leetcode_id": 236,
        "difficulty": "Medium",
        "problem": "Lowest Common Ancestor of a Binary Tree",
        "leetcode": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
        "requirements": "Find the lowest common ancestor using DFS"
    },
    {
        "id": 9,
        "leetcode_id": 124,
        "difficulty": "Hard",
        "problem": "Binary Tree Maximum Path Sum",
        "leetcode": "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
        "requirements": "Find the path with the maximum sum using DFS"
    },
    {
        "id": 10,
        "leetcode_id": 543,
        "difficulty": "Easy",
        "problem": "Diameter of Binary Tree",
        "leetcode": "https://leetcode.com/problems/diameter-of-binary-tree/",
        "requirements": "Find the longest path between any two nodes"
    },
    {
        "id": 11,
        "leetcode_id": 110,
        "difficulty": "Easy",
        "problem": "Balanced Binary Tree",
        "leetcode": "https://leetcode.com/problems/balanced-binary-tree/",
        "requirements": "Check if a tree is height-balanced using DFS"
    },
    {
        "id": 12,
        "leetcode_id": 105,
        "difficulty": "Medium",
        "problem": "Construct Binary Tree from Preorder and Inorder Traversal",
        "leetcode": "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/",
        "requirements": "Build a binary tree from given traversal sequences"
    },
    {
        "id": 13,
        "leetcode_id": 114,
        "difficulty": "Medium",
        "problem": "Flatten Binary Tree to Linked List",
        "leetcode": "https://leetcode.com/problems/flatten-binary-tree-to-linked-list/",
        "requirements": "Transform a tree into a linked list using DFS"
    },
    {
        "id": 14,
        "leetcode_id": 99,
        "difficulty": "Hard",
        "problem": "Recover Binary Search Tree",
        "leetcode": "https://leetcode.com/problems/recover-binary-search-tree/",
        "requirements": "Fix a BST where two nodes are swapped using inorder traversal"
    },
    {
        "id": 15,
        "leetcode_id": 863,
        "difficulty": "Medium",
        "problem": "All Nodes Distance K in Binary Tree",
        "leetcode": "https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree/",
        "requirements": "Find all nodes at distance K from a target node"
    },
    {
        "id": 16,
        "leetcode_id": 297,
        "difficulty": "Hard",
        "problem": "Serialize and Deserialize Binary Tree",
        "leetcode": "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
        "requirements": "Convert a tree to a string and back"
    }
]
  },
  "Tree BFS": {
    "tip": "Tree BFS (Breadth-First Search) involves exploring a tree level by level using a queue. This pattern is excellent for problems that require level-order traversal, finding the shortest path, or working with the tree in a level-by-level manner. Look for problems involving level ordering, nearest neighbors, or when you need to process nodes based on their distance from the root.",
    "problems": [
    {
        "id": 1,
        "leetcode_id": 102,
        "difficulty": "Medium",
        "problem": "Binary Tree Level Order Traversal",
        "leetcode": "https://leetcode.com/problems/binary-tree-level-order-traversal/",
        "requirements": "Return nodes level by level from top to bottom"
    },
    {
        "id": 2,
        "leetcode_id": 107,
        "difficulty": "Medium",
        "problem": "Binary Tree Level Order Traversal II",
        "leetcode": "https://leetcode.com/problems/binary-tree-level-order-traversal-ii/",
        "requirements": "Return nodes level by level from bottom to top"
    },
    {
        "id": 3,
        "leetcode_id": 103,
        "difficulty": "Medium",
        "problem": "Binary Tree Zigzag Level Order Traversal",
        "leetcode": "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/",
        "requirements": "Zigzag level order traversal (alternating directions)"
    },
    {
        "id": 4,
        "leetcode_id": 199,
        "difficulty": "Medium",
        "problem": "Binary Tree Right Side View",
        "leetcode": "https://leetcode.com/problems/binary-tree-right-side-view/",
        "requirements": "Return rightmost node at each level"
    },
    {
        "id": 5,
        "leetcode_id": 104,
        "difficulty": "Easy",
        "problem": "Maximum Depth of Binary Tree",
        "leetcode": "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
        "requirements": "Find depth of tree using BFS"
    },
    {
        "id": 6,
        "leetcode_id": 111,
        "difficulty": "Easy",
        "problem": "Minimum Depth of Binary Tree",
        "leetcode": "https://leetcode.com/problems/minimum-depth-of-binary-tree/",
        "requirements": "Find shortest path from root to leaf"
    },
    {
        "id": 7,
        "leetcode_id": 637,
        "difficulty": "Easy",
        "problem": "Average of Levels in Binary Tree",
        "leetcode": "https://leetcode.com/problems/average-of-levels-in-binary-tree/",
        "requirements": "Calculate average of each level"
    },
    {
        "id": 8,
        "leetcode_id": 116,
        "difficulty": "Medium",
        "problem": "Populating Next Right Pointers in Each Node",
        "leetcode": "https://leetcode.com/problems/populating-next-right-pointers-in-each-node/",
        "requirements": "Connect nodes at same level (perfect binary tree)"
    },
    {
        "id": 9,
        "leetcode_id": 117,
        "difficulty": "Medium",
        "problem": "Populating Next Right Pointers in Each Node II",
        "leetcode": "https://leetcode.com/problems/populating-next-right-pointers-in-each-node-ii/",
        "requirements": "Connect nodes at same level (any binary tree)"
    },
    {
        "id": 10,
        "leetcode_id": 513,
        "difficulty": "Medium",
        "problem": "Find Bottom Left Tree Value",
        "leetcode": "https://leetcode.com/problems/find-bottom-left-tree-value/",
        "requirements": "Find leftmost value in bottom level"
    },
    {
        "id": 11,
        "leetcode_id": 958,
        "difficulty": "Medium",
        "problem": "Check Completeness of a Binary Tree",
        "leetcode": "https://leetcode.com/problems/check-completeness-of-a-binary-tree/",
        "requirements": "Check if tree is complete using BFS"
    },
    {
        "id": 12,
        "leetcode_id": 993,
        "difficulty": "Easy",
        "problem": "Cousins in Binary Tree",
        "leetcode": "https://leetcode.com/problems/cousins-in-binary-tree/",
        "requirements": "Check if nodes are at same level but different parents"
    },
    {
        "id": 13,
        "leetcode_id": 1161,
        "difficulty": "Medium",
        "problem": "Maximum Level Sum of a Binary Tree",
        "leetcode": "https://leetcode.com/problems/maximum-level-sum-of-a-binary-tree/",
        "requirements": "Find level with maximum sum"
    },
    {
        "id": 14,
        "leetcode_id": 662,
        "difficulty": "Medium",
        "problem": "Maximum Width of Binary Tree",
        "leetcode": "https://leetcode.com/problems/maximum-width-of-binary-tree/",
        "requirements": "Find maximum width using level-order traversal"
    },
    {
        "id": 15,
        "leetcode_id": 429,
        "difficulty": "Medium",
        "problem": "N-ary Tree Level Order Traversal",
        "leetcode": "https://leetcode.com/problems/n-ary-tree-level-order-traversal/",
        "requirements": "Level order traversal for N-ary tree"
    },
    {
        "id": 16,
        "leetcode_id": 987,
        "difficulty": "Hard",
        "problem": "Vertical Order Traversal of a Binary Tree",
        "leetcode": "https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/",
        "requirements": "Traverse tree vertically with sorting by column and level"
    }
]
  },
  "Divide and Conquer": {
    "tip": "Divide and Conquer is an algorithmic paradigm where a problem is broken into smaller subproblems, solved independently, and then combined to form the solution to the original problem. This approach is most effective for problems that can be naturally split into similar subproblems, such as searching, sorting, and computational geometry. Look for problems where dividing the input and solving smaller parts independently leads to an efficient solution.",
    "problems": [
    {
        "id": 1,
        "leetcode_id": 169,
        "difficulty": "Easy",
        "problem": "Majority Element",
        "leetcode": "https://leetcode.com/problems/majority-element/",
        "requirements": "Find element appearing more than n/2 times"
    },
    {
        "id": 2,
        "leetcode_id": 53,
        "difficulty": "Medium",
        "problem": "Maximum Subarray",
        "leetcode": "https://leetcode.com/problems/maximum-subarray/",
        "requirements": "Find contiguous subarray with largest sum"
    },
    {
        "id": 3,
        "leetcode_id": 215,
        "difficulty": "Medium",
        "problem": "Kth Largest Element in an Array",
        "leetcode": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
        "requirements": "Find kth largest element using quickselect"
    },
    {
        "id": 4,
        "leetcode_id": 912,
        "difficulty": "Medium",
        "problem": "Sort an Array",
        "leetcode": "https://leetcode.com/problems/sort-an-array/",
        "requirements": "Implement sorting algorithm like merge sort"
    },
    {
        "id": 5,
        "leetcode_id": 4,
        "difficulty": "Hard",
        "problem": "Median of Two Sorted Arrays",
        "leetcode": "https://leetcode.com/problems/median-of-two-sorted-arrays/",
        "requirements": "Find median efficiently without merging"
    },
    {
        "id": 6,
        "leetcode_id": 33,
        "difficulty": "Medium",
        "problem": "Search in Rotated Sorted Array",
        "leetcode": "https://leetcode.com/problems/search-in-rotated-sorted-array/",
        "requirements": "Find target in rotated array using modified binary search"
    },
    {
        "id": 7,
        "leetcode_id": 148,
        "difficulty": "Medium",
        "problem": "Sort List",
        "leetcode": "https://leetcode.com/problems/sort-list/",
        "requirements": "Sort linked list using merge sort"
    },
    {
        "id": 8,
        "leetcode_id": 23,
        "difficulty": "Hard",
        "problem": "Merge k Sorted Lists",
        "leetcode": "https://leetcode.com/problems/merge-k-sorted-lists/",
        "requirements": "Merge k sorted linked lists efficiently"
    },
    {
        "id": 9,
        "leetcode_id": 50,
        "difficulty": "Medium",
        "problem": "Pow(x, n)",
        "leetcode": "https://leetcode.com/problems/powx-n/",
        "requirements": "Implement power function efficiently"
    },
    {
        "id": 10,
        "leetcode_id": 105,
        "difficulty": "Medium",
        "problem": "Construct Binary Tree from Preorder and Inorder Traversal",
        "leetcode": "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/",
        "requirements": "Build tree from traversal sequences"
    },
    {
        "id": 11,
        "leetcode_id": 108,
        "difficulty": "Easy",
        "problem": "Convert Sorted Array to Binary Search Tree",
        "leetcode": "https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/",
        "requirements": "Convert sorted array to height-balanced BST"
    },
    {
        "id": 12,
        "leetcode_id": 109,
        "difficulty": "Medium",
        "problem": "Convert Sorted List to Binary Search Tree",
        "leetcode": "https://leetcode.com/problems/convert-sorted-list-to-binary-search-tree/",
        "requirements": "Convert sorted linked list to height-balanced BST"
    },
    {
        "id": 13,
        "leetcode_id": 654,
        "difficulty": "Medium",
        "problem": "Maximum Binary Tree",
        "leetcode": "https://leetcode.com/problems/maximum-binary-tree/",
        "requirements": "Build tree by recursively finding maximum"
    },
    {
        "id": 14,
        "leetcode_id": 218,
        "difficulty": "Hard",
        "problem": "The Skyline Problem",
        "leetcode": "https://leetcode.com/problems/the-skyline-problem/",
        "requirements": "Find skyline formed by buildings"
    },
    {
        "id": 15,
        "leetcode_id": 427,
        "difficulty": "Medium",
        "problem": "Construct Quad Tree",
        "leetcode": "https://leetcode.com/problems/construct-quad-tree/",
        "requirements": "Build quad tree by recursively dividing grid"
    },
    {
        "id": 16,
        "leetcode_id": 973,
        "difficulty": "Medium",
        "problem": "K Closest Points to Origin",
        "leetcode": "https://leetcode.com/problems/k-closest-points-to-origin/",
        "requirements": "Find k closest points using quickselect"
    }
]
  },
  "Backtracking": {
    "tip": "Backtracking is an algorithmic technique for solving problems recursively by trying to build a solution incrementally, abandoning a solution ('backtracking') as soon as it determines that the candidate cannot possibly be completed to a valid solution. This pattern is particularly useful for problems involving permutations, combinations, partitioning, and constraint satisfaction. Look for problems where you need to explore all possible configurations and can eliminate invalid candidates early.",
    "problems": [
    {
        "id": 1,
        "leetcode_id": 46,
        "difficulty": "Medium",
        "problem": "Permutations",
        "leetcode": "https://leetcode.com/problems/permutations/",
        "requirements": "Generate all possible permutations of an array"
    },
    {
        "id": 2,
        "leetcode_id": 78,
        "difficulty": "Medium",
        "problem": "Subsets",
        "leetcode": "https://leetcode.com/problems/subsets/",
        "requirements": "Generate all possible subsets of an array"
    },
    {
        "id": 3,
        "leetcode_id": 39,
        "difficulty": "Medium",
        "problem": "Combination Sum",
        "leetcode": "https://leetcode.com/problems/combination-sum/",
        "requirements": "Find all unique combinations that sum to target"
    },
    {
        "id": 4,
        "leetcode_id": 17,
        "difficulty": "Medium",
        "problem": "Letter Combinations of a Phone Number",
        "leetcode": "https://leetcode.com/problems/letter-combinations-of-a-phone-number/",
        "requirements": "Generate all letter combinations from phone digits"
    },
    {
        "id": 5,
        "leetcode_id": 22,
        "difficulty": "Medium",
        "problem": "Generate Parentheses",
        "leetcode": "https://leetcode.com/problems/generate-parentheses/",
        "requirements": "Generate all valid parentheses combinations"
    },
    {
        "id": 6,
        "leetcode_id": 79,
        "difficulty": "Medium",
        "problem": "Word Search",
        "leetcode": "https://leetcode.com/problems/word-search/",
        "requirements": "Search for word in 2D board of characters"
    },
    {
        "id": 7,
        "leetcode_id": 51,
        "difficulty": "Hard",
        "problem": "N-Queens",
        "leetcode": "https://leetcode.com/problems/n-queens/",
        "requirements": "Place N queens on NxN chessboard without attacking"
    },
    {
        "id": 8,
        "leetcode_id": 37,
        "difficulty": "Hard",
        "problem": "Sudoku Solver",
        "leetcode": "https://leetcode.com/problems/sudoku-solver/",
        "requirements": "Solve 9x9 Sudoku puzzle"
    },
    {
        "id": 9,
        "leetcode_id": 131,
        "difficulty": "Medium",
        "problem": "Palindrome Partitioning",
        "leetcode": "https://leetcode.com/problems/palindrome-partitioning/",
        "requirements": "Partition string into palindrome substrings"
    },
    {
        "id": 10,
        "leetcode_id": 93,
        "difficulty": "Medium",
        "problem": "Restore IP Addresses",
        "leetcode": "https://leetcode.com/problems/restore-ip-addresses/",
        "requirements": "Restore all valid IP addresses from string"
    },
    {
        "id": 11,
        "leetcode_id": 40,
        "difficulty": "Medium",
        "problem": "Combination Sum II",
        "leetcode": "https://leetcode.com/problems/combination-sum-ii/",
        "requirements": "Find combinations that sum to target with no repeated elements"
    },
    {
        "id": 12,
        "leetcode_id": 47,
        "difficulty": "Medium",
        "problem": "Permutations II",
        "leetcode": "https://leetcode.com/problems/permutations-ii/",
        "requirements": "Generate all permutations with duplicates"
    },
    {
        "id": 13,
        "leetcode_id": 90,
        "difficulty": "Medium",
        "problem": "Subsets II",
        "leetcode": "https://leetcode.com/problems/subsets-ii/",
        "requirements": "Generate all subsets of array with duplicates"
    },
    {
        "id": 14,
        "leetcode_id": 473,
        "difficulty": "Medium",
        "problem": "Matchsticks to Square",
        "leetcode": "https://leetcode.com/problems/matchsticks-to-square/",
        "requirements": "Form a square with given matchsticks"
    },
    {
        "id": 15,
        "leetcode_id": 698,
        "difficulty": "Medium",
        "problem": "Partition to K Equal Sum Subsets",
        "leetcode": "https://leetcode.com/problems/partition-to-k-equal-sum-subsets/",
        "requirements": "Partition array into k equal sum subsets"
    },
    {
        "id": 16,
        "leetcode_id": 784,
        "difficulty": "Medium",
        "problem": "Letter Case Permutation",
        "leetcode": "https://leetcode.com/problems/letter-case-permutation/",
        "requirements": "Generate all possible case variations"
    }
]
  },
  "Heap/Priority Queue": {
    "tip": "Heaps and priority queues are data structures that provide efficient access to the minimum or maximum element. They excel at problems involving finding the kth smallest/largest element, merging sorted lists, or scheduling tasks by priority. Look for problems involving 'top k elements', dynamic ordering, or where you need to repeatedly find and remove the minimum/maximum element.",
    "problems": [
    {
        "id": 1,
        "leetcode_id": 215,
        "difficulty": "Medium",
        "problem": "Kth Largest Element in an Array",
        "leetcode": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
        "requirements": "Find kth largest element using min heap"
    },
    {
        "id": 2,
        "leetcode_id": 347,
        "difficulty": "Medium",
        "problem": "Top K Frequent Elements",
        "leetcode": "https://leetcode.com/problems/top-k-frequent-elements/",
        "requirements": "Find k most frequent elements using heap"
    },
    {
        "id": 3,
        "leetcode_id": 23,
        "difficulty": "Hard",
        "problem": "Merge k Sorted Lists",
        "leetcode": "https://leetcode.com/problems/merge-k-sorted-lists/",
        "requirements": "Merge k sorted linked lists using priority queue"
    },
    {
        "id": 4,
        "leetcode_id": 295,
        "difficulty": "Hard",
        "problem": "Find Median from Data Stream",
        "leetcode": "https://leetcode.com/problems/find-median-from-data-stream/",
        "requirements": "Design data structure for median with heaps"
    },
    {
        "id": 5,
        "leetcode_id": 973,
        "difficulty": "Medium",
        "problem": "K Closest Points to Origin",
        "leetcode": "https://leetcode.com/problems/k-closest-points-to-origin/",
        "requirements": "Find k closest points using max heap"
    },
    {
        "id": 6,
        "leetcode_id": 703,
        "difficulty": "Easy",
        "problem": "Kth Largest Element in a Stream",
        "leetcode": "https://leetcode.com/problems/kth-largest-element-in-a-stream/",
        "requirements": "Design class to find kth largest element"
    },
    {
        "id": 7,
        "leetcode_id": 253,
        "difficulty": "Medium",
        "problem": "Meeting Rooms II",
        "leetcode": "https://leetcode.com/problems/meeting-rooms-ii/",
        "requirements": "Find minimum meeting rooms required"
    },
    {
        "id": 8,
        "leetcode_id": 218,
        "difficulty": "Hard",
        "problem": "The Skyline Problem",
        "leetcode": "https://leetcode.com/problems/the-skyline-problem/",
        "requirements": "Find skyline formed by buildings"
    },
    {
        "id": 9,
        "leetcode_id": 621,
        "difficulty": "Medium",
        "problem": "Task Scheduler",
        "leetcode": "https://leetcode.com/problems/task-scheduler/",
        "requirements": "Schedule tasks with cooling periods"
    },
    {
        "id": 10,
        "leetcode_id": 239,
        "difficulty": "Hard",
        "problem": "Sliding Window Maximum",
        "leetcode": "https://leetcode.com/problems/sliding-window-maximum/",
        "requirements": "Find maximum in sliding window"
    },
    {
        "id": 11,
        "leetcode_id": 373,
        "difficulty": "Medium",
        "problem": "Find K Pairs with Smallest Sums",
        "leetcode": "https://leetcode.com/problems/find-k-pairs-with-smallest-sums/",
        "requirements": "Find k pairs with smallest sums"
    },
    {
        "id": 12,
        "leetcode_id": 378,
        "difficulty": "Medium",
        "problem": "Kth Smallest Element in a Sorted Matrix",
        "leetcode": "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/",
        "requirements": "Find kth smallest element in matrix"
    },
    {
        "id": 13,
        "leetcode_id": 871,
        "difficulty": "Hard",
        "problem": "Minimum Number of Refueling Stops",
        "leetcode": "https://leetcode.com/problems/minimum-number-of-refueling-stops/",
        "requirements": "Minimize stops to reach destination"
    },
    {
        "id": 14,
        "leetcode_id": 1642,
        "difficulty": "Medium",
        "problem": "Furthest Building You Can Reach",
        "leetcode": "https://leetcode.com/problems/furthest-building-you-can-reach/",
        "requirements": "Maximize distance with ladders and bricks"
    },
    {
        "id": 15,
        "leetcode_id": 1675,
        "difficulty": "Hard",
        "problem": "Minimize Deviation in Array",
        "leetcode": "https://leetcode.com/problems/minimize-deviation-in-array/",
        "requirements": "Minimize max-min difference with operations"
    }
]
  },
  "Tries": {
    "tip": "Tries (prefix trees) are specialized tree structures optimized for retrieval operations on a dynamic set of strings. They excel at problems involving prefix matching, auto-completion, spell checking, and word dictionaries. Look for problems involving string searches, prefix operations, or when you need to efficiently store and query a large set of strings.",
    "problems": [
    {
        "id": 1,
        "leetcode_id": 208,
        "difficulty": "Medium",
        "problem": "Implement Trie (Prefix Tree)",
        "leetcode": "https://leetcode.com/problems/implement-trie-prefix-tree/",
        "requirements": "Implement a basic trie with insert, search, and startsWith operations"
    },
    {
        "id": 2,
        "leetcode_id": 211,
        "difficulty": "Medium",
        "problem": "Design Add and Search Words Data Structure",
        "leetcode": "https://leetcode.com/problems/design-add-and-search-words-data-structure/",
        "requirements": "Design trie supporting wildcard search"
    },
    {
        "id": 3,
        "leetcode_id": 212,
        "difficulty": "Hard",
        "problem": "Word Search II",
        "leetcode": "https://leetcode.com/problems/word-search-ii/",
        "requirements": "Find words from dictionary in a board using trie"
    },
    {
        "id": 4,
        "leetcode_id": 1023,
        "difficulty": "Medium",
        "problem": "Camelcase Matching",
        "leetcode": "https://leetcode.com/problems/camelcase-matching/",
        "requirements": "Check if query matches pattern with additional lowercase letters"
    },
    {
        "id": 5,
        "leetcode_id": 648,
        "difficulty": "Medium",
        "problem": "Replace Words",
        "leetcode": "https://leetcode.com/problems/replace-words/",
        "requirements": "Replace words with their root in a sentence"
    },
    {
        "id": 6,
        "leetcode_id": 677,
        "difficulty": "Medium",
        "problem": "Map Sum Pairs",
        "leetcode": "https://leetcode.com/problems/map-sum-pairs/",
        "requirements": "Get sum of values with given prefix"
    },
    {
        "id": 7,
        "leetcode_id": 720,
        "difficulty": "Medium",
        "problem": "Longest Word in Dictionary",
        "leetcode": "https://leetcode.com/problems/longest-word-in-dictionary/",
        "requirements": "Find longest word built one character at a time"
    },
    {
        "id": 8,
        "leetcode_id": 1268,
        "difficulty": "Medium",
        "problem": "Search Suggestions System",
        "leetcode": "https://leetcode.com/problems/search-suggestions-system/",
        "requirements": "Implement search autocomplete system"
    },
    {
        "id": 9,
        "leetcode_id": 745,
        "difficulty": "Hard",
        "problem": "Prefix and Suffix Search",
        "leetcode": "https://leetcode.com/problems/prefix-and-suffix-search/",
        "requirements": "Design structure for prefix and suffix search"
    },
    {
        "id": 10,
        "leetcode_id": 676,
        "difficulty": "Medium",
        "problem": "Implement Magic Dictionary",
        "leetcode": "https://leetcode.com/problems/implement-magic-dictionary/",
        "requirements": "Search words with exactly one character replaced"
    },
    {
        "id": 11,
        "leetcode_id": 1032,
        "difficulty": "Hard",
        "problem": "Stream of Characters",
        "leetcode": "https://leetcode.com/problems/stream-of-characters/",
        "requirements": "Query if stream suffix is in word list"
    },
    {
        "id": 12,
        "leetcode_id": 692,
        "difficulty": "Medium",
        "problem": "Top K Frequent Words",
        "leetcode": "https://leetcode.com/problems/top-k-frequent-words/",
        "requirements": "Find k most frequent words using trie and heap"
    },
    {
        "id": 13,
        "leetcode_id": 1065,
        "difficulty": "Medium",
        "problem": "Index Pairs of a String",
        "leetcode": "https://leetcode.com/problems/index-pairs-of-a-string/",
        "requirements": "Find start/end indices of all words from dictionary in text"
    },
    {
        "id": 14,
        "leetcode_id": 642,
        "difficulty": "Hard",
        "problem": "Design Search Autocomplete System",
        "leetcode": "https://leetcode.com/problems/design-search-autocomplete-system/",
        "requirements": "Design system showing top searches as you type"
    },
    {
        "id": 15,
        "leetcode_id": 472,
        "difficulty": "Hard",
        "problem": "Concatenated Words",
        "leetcode": "https://leetcode.com/problems/concatenated-words/",
        "requirements": "Find words that can be formed by concatenating other words"
    },
    {
        "id": 16,
        "leetcode_id": 336,
        "difficulty": "Hard",
        "problem": "Palindrome Pairs",
        "leetcode": "https://leetcode.com/problems/palindrome-pairs/",
        "requirements": "Find pairs of words that form palindromes"
    }
]
  },
  "Graphs": {
    "tip": "Graphs represent connections between objects and are used to model networks, relationships, and systems. This section focuses on basic graph traversal (DFS/BFS) and fundamental operations on graph structures. Look for problems involving connected components, simple path finding, and basic graph properties.",
    "problems": [
    {
        "id": 1,
        "leetcode_id": 133,
        "difficulty": "Medium",
        "problem": "Clone Graph",
        "leetcode": "https://leetcode.com/problems/clone-graph/",
        "requirements": "Create deep copy of graph using DFS/BFS"
    },
    {
        "id": 2,
        "leetcode_id": 695,
        "difficulty": "Medium",
        "problem": "Max Area of Island",
        "leetcode": "https://leetcode.com/problems/max-area-of-island/",
        "requirements": "Find largest connected component in grid"
    },
    {
        "id": 3,
        "leetcode_id": 733,
        "difficulty": "Easy",
        "problem": "Flood Fill",
        "leetcode": "https://leetcode.com/problems/flood-fill/",
        "requirements": "Fill connected component with new color"
    },
    {
        "id": 4,
        "leetcode_id": 797,
        "difficulty": "Medium",
        "problem": "All Paths From Source to Target",
        "leetcode": "https://leetcode.com/problems/all-paths-from-source-to-target/",
        "requirements": "Find all paths from node 0 to node n-1 in DAG"
    },
    {
        "id": 5,
        "leetcode_id": 841,
        "difficulty": "Medium",
        "problem": "Keys and Rooms",
        "leetcode": "https://leetcode.com/problems/keys-and-rooms/",
        "requirements": "Check if all rooms can be visited"
    },
    {
        "id": 6,
        "leetcode_id": 997,
        "difficulty": "Easy",
        "problem": "Find the Town Judge",
        "leetcode": "https://leetcode.com/problems/find-the-town-judge/",
        "requirements": "Find node with in-degree n-1 and out-degree 0"
    },
    {
        "id": 7,
        "leetcode_id": 1971,
        "difficulty": "Easy",
        "problem": "Find if Path Exists in Graph",
        "leetcode": "https://leetcode.com/problems/find-if-path-exists-in-graph/",
        "requirements": "Check if path exists between two nodes"
    },
    {
        "id": 8,
        "leetcode_id": 1466,
        "difficulty": "Medium",
        "problem": "Reorder Routes to Make All Paths Lead to the City Zero",
        "leetcode": "https://leetcode.com/problems/reorder-routes-to-make-all-paths-lead-to-the-city-zero/",
        "requirements": "Count edges to reorient in a tree"
    },
    {
        "id": 9,
        "leetcode_id": 1306,
        "difficulty": "Medium",
        "problem": "Jump Game III",
        "leetcode": "https://leetcode.com/problems/jump-game-iii/",
        "requirements": "Check if zero can be reached by jumping"
    },
    {
        "id": 10,
        "leetcode_id": 690,
        "difficulty": "Medium",
        "problem": "Employee Importance",
        "leetcode": "https://leetcode.com/problems/employee-importance/",
        "requirements": "Calculate total importance of employees"
    },
    {
        "id": 11,
        "leetcode_id": 1267,
        "difficulty": "Medium",
        "problem": "Count Servers that Communicate",
        "leetcode": "https://leetcode.com/problems/count-servers-that-communicate/",
        "requirements": "Count servers that connect to others"
    },
    {
        "id": 12,
        "leetcode_id": 1557,
        "difficulty": "Medium",
        "problem": "Minimum Number of Vertices to Reach All Nodes",
        "leetcode": "https://leetcode.com/problems/minimum-number-of-vertices-to-reach-all-nodes/",
        "requirements": "Find nodes with zero in-degree in DAG"
    },
    {
        "id": 13,
        "leetcode_id": 2192,
        "difficulty": "Medium",
        "problem": "All Ancestors of a Node in a Directed Acyclic Graph",
        "leetcode": "https://leetcode.com/problems/all-ancestors-of-a-node-in-a-directed-acyclic-graph/",
        "requirements": "Find all ancestors of each node in DAG"
    },
    {
        "id": 14,
        "leetcode_id": 1436,
        "difficulty": "Easy",
        "problem": "Destination City",
        "leetcode": "https://leetcode.com/problems/destination-city/",
        "requirements": "Find city with no outgoing path"
    },
    {
        "id": 15,
        "leetcode_id": 1202,
        "difficulty": "Medium",
        "problem": "Smallest String With Swaps",
        "leetcode": "https://leetcode.com/problems/smallest-string-with-swaps/",
        "requirements": "Find lexicographically smallest string after swaps using basic graph traversal"
    }
]
  },
  "Graph DFS": {
    "tip": "Graph DFS (Depth-First Search) explores a graph by going as deep as possible along each branch before backtracking. It's particularly useful for problems involving path finding, cycle detection, connected components, and topological sorting. Look for problems where you need to thoroughly explore each branch, find all possible paths, or analyze graph structures recursively.",
    "problems": [
    {
        "id": 1,
        "leetcode_id": 200,
        "difficulty": "Medium",
        "problem": "Number of Islands",
        "leetcode": "https://leetcode.com/problems/number-of-islands/",
        "requirements": "Count connected land cells in grid using DFS"
    },
    {
        "id": 2,
        "leetcode_id": 133,
        "difficulty": "Medium",
        "problem": "Clone Graph",
        "leetcode": "https://leetcode.com/problems/clone-graph/",
        "requirements": "Create deep copy of graph using DFS"
    },
    {
        "id": 3,
        "leetcode_id": 695,
        "difficulty": "Medium",
        "problem": "Max Area of Island",
        "leetcode": "https://leetcode.com/problems/max-area-of-island/",
        "requirements": "Find largest connected component in grid using DFS"
    },
    {
        "id": 4,
        "leetcode_id": 733,
        "difficulty": "Easy",
        "problem": "Flood Fill",
        "leetcode": "https://leetcode.com/problems/flood-fill/",
        "requirements": "Fill connected component with new color using DFS"
    },
    {
        "id": 5,
        "leetcode_id": 797,
        "difficulty": "Medium",
        "problem": "All Paths From Source to Target",
        "leetcode": "https://leetcode.com/problems/all-paths-from-source-to-target/",
        "requirements": "Find all paths from node 0 to node n-1 in DAG using DFS"
    },
    {
        "id": 6,
        "leetcode_id": 841,
        "difficulty": "Medium",
        "problem": "Keys and Rooms",
        "leetcode": "https://leetcode.com/problems/keys-and-rooms/",
        "requirements": "Check if all rooms can be visited using DFS"
    },
    {
        "id": 7,
        "leetcode_id": 1254,
        "difficulty": "Medium",
        "problem": "Number of Closed Islands",
        "leetcode": "https://leetcode.com/problems/number-of-closed-islands/",
        "requirements": "Count islands not touching boundary using DFS"
    },
    {
        "id": 8,
        "leetcode_id": 1020,
        "difficulty": "Medium",
        "problem": "Number of Enclaves",
        "leetcode": "https://leetcode.com/problems/number-of-enclaves/",
        "requirements": "Count land cells not connected to boundary using DFS"
    },
    {
        "id": 9,
        "leetcode_id": 79,
        "difficulty": "Medium",
        "problem": "Word Search",
        "leetcode": "https://leetcode.com/problems/word-search/",
        "requirements": "Search for word in grid using DFS"
    },
    {
        "id": 10,
        "leetcode_id": 130,
        "difficulty": "Medium",
        "problem": "Surrounded Regions",
        "leetcode": "https://leetcode.com/problems/surrounded-regions/",
        "requirements": "Capture regions surrounded by X using DFS"
    },
    {
        "id": 11,
        "leetcode_id": 417,
        "difficulty": "Medium",
        "problem": "Pacific Atlantic Water Flow",
        "leetcode": "https://leetcode.com/problems/pacific-atlantic-water-flow/",
        "requirements": "Find cells with paths to both oceans using DFS"
    },
    {
        "id": 12,
        "leetcode_id": 1559,
        "difficulty": "Medium",
        "problem": "Detect Cycles in 2D Grid",
        "leetcode": "https://leetcode.com/problems/detect-cycles-in-2d-grid/",
        "requirements": "Check if grid contains cycle using DFS"
    },
    {
        "id": 13,
        "leetcode_id": 547,
        "difficulty": "Medium",
        "problem": "Number of Provinces",
        "leetcode": "https://leetcode.com/problems/number-of-provinces/",
        "requirements": "Count connected components in graph using DFS"
    },
    {
        "id": 14,
        "leetcode_id": 1376,
        "difficulty": "Medium",
        "problem": "Time Needed to Inform All Employees",
        "leetcode": "https://leetcode.com/problems/time-needed-to-inform-all-employees/",
        "requirements": "Find maximum time to inform all employees using DFS"
    },
    {
        "id": 15,
        "leetcode_id": 529,
        "difficulty": "Medium",
        "problem": "Minesweeper",
        "leetcode": "https://leetcode.com/problems/minesweeper/",
        "requirements": "Implement Minesweeper game using DFS"
    },
    {
        "id": 16,
        "leetcode_id": 1306,
        "difficulty": "Medium",
        "problem": "Jump Game III",
        "leetcode": "https://leetcode.com/problems/jump-game-iii/",
        "requirements": "Check if zero can be reached using DFS"
    }
]
  },     
  "Graph BFS": {
    "tip": "Graph BFS (Breadth-First Search) explores a graph level by level, visiting all neighbors of a node before moving to the next level. It's ideal for finding the shortest path in unweighted graphs and solving problems where distance or levels from a source are important. Look for problems requiring the minimum number of steps or level-by-level processing.",
    "problems": [
    {
        "id": 1,
        "leetcode_id": 133,
        "difficulty": "Medium",
        "problem": "Clone Graph",
        "leetcode": "https://leetcode.com/problems/clone-graph/",
        "requirements": "Create deep copy of graph using BFS"
    },
    {
        "id": 2,
        "leetcode_id": 994,
        "difficulty": "Medium",
        "problem": "Rotting Oranges",
        "leetcode": "https://leetcode.com/problems/rotting-oranges/",
        "requirements": "Find minimum time for all oranges to rot using BFS"
    },
    {
        "id": 3,
        "leetcode_id": 733,
        "difficulty": "Easy",
        "problem": "Flood Fill",
        "leetcode": "https://leetcode.com/problems/flood-fill/",
        "requirements": "Fill connected component with new color using BFS"
    },
    {
        "id": 4,
        "leetcode_id": 1091,
        "difficulty": "Medium",
        "problem": "Shortest Path in Binary Matrix",
        "leetcode": "https://leetcode.com/problems/shortest-path-in-binary-matrix/",
        "requirements": "Find shortest path from top-left to bottom-right using BFS"
    },
    {
        "id": 5,
        "leetcode_id": 934,
        "difficulty": "Medium",
        "problem": "Shortest Bridge",
        "leetcode": "https://leetcode.com/problems/shortest-bridge/",
        "requirements": "Find shortest bridge connecting two islands using BFS"
    },
    {
        "id": 6,
        "leetcode_id": 127,
        "difficulty": "Hard",
        "problem": "Word Ladder",
        "leetcode": "https://leetcode.com/problems/word-ladder/",
        "requirements": "Find shortest transformation sequence using BFS"
    },
    {
        "id": 7,
        "leetcode_id": 752,
        "difficulty": "Medium",
        "problem": "Open the Lock",
        "leetcode": "https://leetcode.com/problems/open-the-lock/",
        "requirements": "Find minimum rotations to unlock using BFS"
    },
    {
        "id": 8,
        "leetcode_id": 542,
        "difficulty": "Medium",
        "problem": "01 Matrix",
        "leetcode": "https://leetcode.com/problems/01-matrix/",
        "requirements": "Find distance of each cell to nearest 0 using BFS"
    },
    {
        "id": 9,
        "leetcode_id": 1162,
        "difficulty": "Medium",
        "problem": "As Far from Land as Possible",
        "leetcode": "https://leetcode.com/problems/as-far-from-land-as-possible/",
        "requirements": "Find maximum distance from land using BFS"
    },
    {
        "id": 10,
        "leetcode_id": 909,
        "difficulty": "Medium",
        "problem": "Snakes and Ladders",
        "leetcode": "https://leetcode.com/problems/snakes-and-ladders/",
        "requirements": "Find minimum moves to reach end using BFS"
    },
    {
        "id": 11,
        "leetcode_id": 1926,
        "difficulty": "Medium",
        "problem": "Nearest Exit from Entrance in Maze",
        "leetcode": "https://leetcode.com/problems/nearest-exit-from-entrance-in-maze/",
        "requirements": "Find nearest exit from maze using BFS"
    },
    {
        "id": 12,
        "leetcode_id": 286,
        "difficulty": "Medium",
        "problem": "Walls and Gates",
        "leetcode": "https://leetcode.com/problems/walls-and-gates/",
        "requirements": "Fill rooms with distance to nearest gate using BFS"
    },
    {
        "id": 13,
        "leetcode_id": 1306,
        "difficulty": "Medium",
        "problem": "Jump Game III",
        "leetcode": "https://leetcode.com/problems/jump-game-iii/",
        "requirements": "Check if zero can be reached using BFS"
    },
    {
        "id": 14,
        "leetcode_id": 841,
        "difficulty": "Medium",
        "problem": "Keys and Rooms",
        "leetcode": "https://leetcode.com/problems/keys-and-rooms/",
        "requirements": "Check if all rooms can be visited using BFS"
    },
    {
        "id": 15,
        "leetcode_id": 1730,
        "difficulty": "Medium",
        "problem": "Shortest Path to Get Food",
        "leetcode": "https://leetcode.com/problems/shortest-path-to-get-food/",
        "requirements": "Find shortest path to food using BFS"
    },
    {
        "id": 16,
        "leetcode_id": 433,
        "difficulty": "Medium",
        "problem": "Minimum Genetic Mutation",
        "leetcode": "https://leetcode.com/problems/minimum-genetic-mutation/",
        "requirements": "Find minimum mutations to reach target gene using BFS"
    }
]
  },
  "Union Find": {
    "tip": "Union Find (also known as Disjoint Set) is a data structure for efficiently tracking a partition of elements into disjoint subsets. It's ideal for problems involving grouping elements, finding connected components, detecting cycles in undirected graphs, or dynamically tracking element relationships. Look for problems that involve merging elements into sets, determining if two elements belong to the same group, or situations where relationships between elements can be represented as an equivalence relation (reflexive, symmetric, transitive).",
    "problems": [
    {
        "id": 1,
        "leetcode_id": 547,
        "difficulty": "Medium",
        "problem": "Number of Provinces",
        "leetcode": "https://leetcode.com/problems/number-of-provinces/",
        "requirements": "Finding connected components in a graph using Union Find"
    },
    {
        "id": 2,
        "leetcode_id": 200,
        "difficulty": "Medium",
        "problem": "Number of Islands",
        "leetcode": "https://leetcode.com/problems/number-of-islands/",
        "requirements": "Finding connected land cells in grid using Union Find"
    },
    {
        "id": 3,
        "leetcode_id": 684,
        "difficulty": "Medium",
        "problem": "Redundant Connection",
        "leetcode": "https://leetcode.com/problems/redundant-connection/",
        "requirements": "Finding edges that form cycles in undirected graph"
    },
    {
        "id": 4,
        "leetcode_id": 323,
        "difficulty": "Medium",
        "problem": "Number of Connected Components in an Undirected Graph",
        "leetcode": "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/",
        "requirements": "Counting distinct connected components in a graph"
    },
    {
        "id": 5,
        "leetcode_id": 128,
        "difficulty": "Medium",
        "problem": "Longest Consecutive Sequence",
        "leetcode": "https://leetcode.com/problems/longest-consecutive-sequence/",
        "requirements": "Finding longest consecutive elements sequence with Union Find"
    },
    {
        "id": 6,
        "leetcode_id": 721,
        "difficulty": "Medium",
        "problem": "Accounts Merge",
        "leetcode": "https://leetcode.com/problems/accounts-merge/",
        "requirements": "Merging accounts based on common emails using Union Find"
    },
    {
        "id": 7,
        "leetcode_id": 1319,
        "difficulty": "Medium",
        "problem": "Number of Operations to Make Network Connected",
        "leetcode": "https://leetcode.com/problems/number-of-operations-to-make-network-connected/",
        "requirements": "Finding minimum connections needed to connect all components"
    },
    {
        "id": 8,
        "leetcode_id": 990,
        "difficulty": "Medium",
        "problem": "Satisfiability of Equality Equations",
        "leetcode": "https://leetcode.com/problems/satisfiability-of-equality-equations/",
        "requirements": "Checking if equality and inequality equations can be satisfied"
    },
    {
        "id": 9,
        "leetcode_id": 305,
        "difficulty": "Hard",
        "problem": "Number of Islands II",
        "leetcode": "https://leetcode.com/problems/number-of-islands-ii/",
        "requirements": "Tracking connected components as new land appears"
    },
    {
        "id": 10,
        "leetcode_id": 839,
        "difficulty": "Hard",
        "problem": "Similar String Groups",
        "leetcode": "https://leetcode.com/problems/similar-string-groups/",
        "requirements": "Grouping strings based on similarity rules"
    },
    {
        "id": 11,
        "leetcode_id": 695,
        "difficulty": "Medium",
        "problem": "Max Area of Island",
        "leetcode": "https://leetcode.com/problems/max-area-of-island/",
        "requirements": "Finding largest connected component in grid using Union Find"
    },
    {
        "id": 12,
        "leetcode_id": 1202,
        "difficulty": "Medium",
        "problem": "Smallest String With Swaps",
        "leetcode": "https://leetcode.com/problems/smallest-string-with-swaps/",
        "requirements": "Finding lexicographically smallest string after swaps using Union Find"
    },
    {
        "id": 13,
        "leetcode_id": 261,
        "difficulty": "Medium",
        "problem": "Graph Valid Tree",
        "leetcode": "https://leetcode.com/problems/graph-valid-tree/",
        "requirements": "Checking if a graph forms a valid tree"
    },
    {
        "id": 14,
        "leetcode_id": 886,
        "difficulty": "Medium",
        "problem": "Possible Bipartition",
        "leetcode": "https://leetcode.com/problems/possible-bipartition/",
        "requirements": "Dividing people into two groups without dislikes using Union Find"
    },
    {
        "id": 15,
        "leetcode_id": 1135,
        "difficulty": "Medium",
        "problem": "Connecting Cities With Minimum Cost",
        "leetcode": "https://leetcode.com/problems/connecting-cities-with-minimum-cost/",
        "requirements": "Finding minimum spanning tree cost using Kruskal's algorithm"
    },
    {
        "id": 16,
        "leetcode_id": 1202,
        "difficulty": "Medium",
        "problem": "Smallest String With Swaps",
        "leetcode": "https://leetcode.com/problems/smallest-string-with-swaps/",
        "requirements": "Finding lexicographically smallest string after swaps using Union Find"
    }
]
  },
  "Topological Sort": {
    "tip": "Topological Sort is an algorithm for ordering the vertices of a directed acyclic graph (DAG) such that for every directed edge (u, v), vertex u comes before vertex v in the ordering. It's ideal for problems involving dependencies, scheduling, or any situation where tasks need to be completed in a specific order. Look for problems mentioning 'prerequisites', 'dependencies', 'build order', or 'scheduling'. Topological Sort is only applicable to DAGs - if the graph contains a cycle, no valid topological ordering exists.",
    "problems": [
    {
        "id": 1,
        "leetcode_id": 207,
        "difficulty": "Medium",
        "problem": "Course Schedule",
        "leetcode": "https://leetcode.com/problems/course-schedule/",
        "requirements": "Determine if it's possible to finish all courses given prerequisites"
    },
    {
        "id": 2,
        "leetcode_id": 210,
        "difficulty": "Medium",
        "problem": "Course Schedule II",
        "leetcode": "https://leetcode.com/problems/course-schedule-ii/",
        "requirements": "Return the ordering of courses to take to finish all courses"
    },
    {
        "id": 3,
        "leetcode_id": 269,
        "difficulty": "Hard",
        "problem": "Alien Dictionary",
        "leetcode": "https://leetcode.com/problems/alien-dictionary/",
        "requirements": "Determine the order of characters in an alien language"
    },
    {
        "id": 4,
        "leetcode_id": 329,
        "difficulty": "Hard",
        "problem": "Longest Increasing Path in a Matrix",
        "leetcode": "https://leetcode.com/problems/longest-increasing-path-in-a-matrix/",
        "requirements": "Find the length of the longest increasing path in a matrix"
    },
    {
        "id": 5,
        "leetcode_id": 444,
        "difficulty": "Medium",
        "problem": "Sequence Reconstruction",
        "leetcode": "https://leetcode.com/problems/sequence-reconstruction/",
        "requirements": "Check if a sequence can be uniquely reconstructed from subsequences"
    },
    {
        "id": 6,
        "leetcode_id": 310,
        "difficulty": "Medium",
        "problem": "Minimum Height Trees",
        "leetcode": "https://leetcode.com/problems/minimum-height-trees/",
        "requirements": "Find the roots that give minimum height trees with topological pruning"
    },
    {
        "id": 7,
        "leetcode_id": 802,
        "difficulty": "Medium",
        "problem": "Find Eventual Safe States",
        "leetcode": "https://leetcode.com/problems/find-eventual-safe-states/",
        "requirements": "Find all nodes that eventually lead to terminal nodes"
    },
    {
        "id": 8,
        "leetcode_id": 1203,
        "difficulty": "Hard",
        "problem": "Sort Items by Groups Respecting Dependencies",
        "leetcode": "https://leetcode.com/problems/sort-items-by-groups-respecting-dependencies/",
        "requirements": "Sort items respecting both group and item dependencies"
    },
    {
        "id": 9,
        "leetcode_id": 2050,
        "difficulty": "Hard",
        "problem": "Parallel Courses III",
        "leetcode": "https://leetcode.com/problems/parallel-courses-iii/",
        "requirements": "Find minimum time to complete all courses with prerequisites and durations"
    },
    {
        "id": 10,
        "leetcode_id": 1136,
        "difficulty": "Medium",
        "problem": "Parallel Courses",
        "leetcode": "https://leetcode.com/problems/parallel-courses/",
        "requirements": "Find minimum semesters to complete all courses with prerequisites"
    },
    {
        "id": 11,
        "leetcode_id": 2192,
        "difficulty": "Medium",
        "problem": "All Ancestors of a Node in a Directed Acyclic Graph",
        "leetcode": "https://leetcode.com/problems/all-ancestors-of-a-node-in-a-directed-acyclic-graph/",
        "requirements": "Find all ancestors of each node in a DAG"
    },
    {
        "id": 12,
        "leetcode_id": 1462,
        "difficulty": "Medium",
        "problem": "Course Schedule IV",
        "leetcode": "https://leetcode.com/problems/course-schedule-iv/",
        "requirements": "Determine if a course is a prerequisite of another course"
    },
    {
        "id": 13,
        "leetcode_id": 1857,
        "difficulty": "Hard",
        "problem": "Largest Color Value in a Directed Graph",
        "leetcode": "https://leetcode.com/problems/largest-color-value-in-a-directed-graph/",
        "requirements": "Find largest color value in any valid path in a directed graph"
    },
    {
        "id": 14,
        "leetcode_id": 1557,
        "difficulty": "Medium",
        "problem": "Minimum Number of Vertices to Reach All Nodes",
        "leetcode": "https://leetcode.com/problems/minimum-number-of-vertices-to-reach-all-nodes/",
        "requirements": "Find minimum vertices to reach all nodes in a DAG"
    },
    {
        "id": 15,
        "leetcode_id": 1059,
        "difficulty": "Medium",
        "problem": "All Paths from Source Lead to Destination",
        "leetcode": "https://leetcode.com/problems/all-paths-from-source-lead-to-destination/",
        "requirements": "Check if all paths from source lead to destination"
    },
    {
        "id": 16,
        "leetcode_id": 2392,
        "difficulty": "Hard",
        "problem": "Build a Matrix With Conditions",
        "leetcode": "https://leetcode.com/problems/build-a-matrix-with-conditions/",
        "requirements": "Build a matrix with row and column conditions"
    }
]
  },
  "Shortest Path": {
    "tip": "Shortest Path Algorithms find the optimal path between nodes in a graph, minimizing the total path cost. Common algorithms include Dijkstra's (for non-negative weights), Bellman-Ford (handles negative weights), Floyd-Warshall (all pairs shortest paths), and A* (with heuristics for faster searching). These are ideal for problems involving route planning, network routing, or any scenario requiring minimum cost traversal between points. Look for problems mentioning 'minimum distance', 'cheapest path', 'fastest route', or those involving weighted graphs where optimization is required. Consider the constraints on edge weights (positive/negative) and whether you need a single source or all pairs shortest paths to choose the right algorithm.",
    "problems": [
    {
        "id": 1,
        "leetcode_id": 743,
        "difficulty": "Medium",
        "problem": "Network Delay Time",
        "leetcode": "https://leetcode.com/problems/network-delay-time/",
        "requirements": "Find time for all nodes to receive a signal using Dijkstra's algorithm"
    },
    {
        "id": 2,
        "leetcode_id": 1631,
        "difficulty": "Medium",
        "problem": "Path With Minimum Effort",
        "leetcode": "https://leetcode.com/problems/path-with-minimum-effort/",
        "requirements": "Find path with minimum maximum absolute difference"
    },
    {
        "id": 3,
        "leetcode_id": 787,
        "difficulty": "Medium",
        "problem": "Cheapest Flights Within K Stops",
        "leetcode": "https://leetcode.com/problems/cheapest-flights-within-k-stops/",
        "requirements": "Find cheapest price from source to destination with at most k stops"
    },
    {
        "id": 4,
        "leetcode_id": 1514,
        "difficulty": "Medium",
        "problem": "Path with Maximum Probability",
        "leetcode": "https://leetcode.com/problems/path-with-maximum-probability/",
        "requirements": "Find path with maximum success probability"
    },
    {
        "id": 5,
        "leetcode_id": 1334,
        "difficulty": "Medium",
        "problem": "Find the City With the Smallest Number of Neighbors at a Threshold Distance",
        "leetcode": "https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/",
        "requirements": "Find city with fewest reachable cities within threshold distance"
    },
    {
        "id": 6,
        "leetcode_id": 1976,
        "difficulty": "Medium",
        "problem": "Number of Ways to Arrive at Destination",
        "leetcode": "https://leetcode.com/problems/number-of-ways-to-arrive-at-destination/",
        "requirements": "Count ways to reach destination in minimum time"
    },
    {
        "id": 7,
        "leetcode_id": 1368,
        "difficulty": "Hard",
        "problem": "Minimum Cost to Make at Least One Valid Path in a Grid",
        "leetcode": "https://leetcode.com/problems/minimum-cost-to-make-at-least-one-valid-path-in-a-grid/",
        "requirements": "Find minimum cost to create valid path from top-left to bottom-right"
    },
    {
        "id": 8,
        "leetcode_id": 399,
        "difficulty": "Medium",
        "problem": "Evaluate Division",
        "leetcode": "https://leetcode.com/problems/evaluate-division/",
        "requirements": "Calculate division results using shortest path on weighted graph"
    },
    {
        "id": 9,
        "leetcode_id": 505,
        "difficulty": "Medium",
        "problem": "The Maze II",
        "leetcode": "https://leetcode.com/problems/the-maze-ii/",
        "requirements": "Find shortest path through maze with rolling ball"
    },
    {
        "id": 10,
        "leetcode_id": 1786,
        "difficulty": "Medium",
        "problem": "Number of Restricted Paths From First to Last Node",
        "leetcode": "https://leetcode.com/problems/number-of-restricted-paths-from-first-to-last-node/",
        "requirements": "Count paths where distances decrease along the path"
    },
    {
        "id": 11,
        "leetcode_id": 1091,
        "difficulty": "Medium",
        "problem": "Shortest Path in Binary Matrix",
        "leetcode": "https://leetcode.com/problems/shortest-path-in-binary-matrix/",
        "requirements": "Find shortest clear path in binary matrix"
    },
    {
        "id": 12,
        "leetcode_id": 2290,
        "difficulty": "Hard",
        "problem": "Minimum Obstacle Removal to Reach Corner",
        "leetcode": "https://leetcode.com/problems/minimum-obstacle-removal-to-reach-corner/",
        "requirements": "Find minimum obstacles to remove to create path"
    },
    {
        "id": 13,
        "leetcode_id": 1928,
        "difficulty": "Hard",
        "problem": "Minimum Cost to Reach Destination in Time",
        "leetcode": "https://leetcode.com/problems/minimum-cost-to-reach-destination-in-time/",
        "requirements": "Find minimum cost path within time constraint"
    },
    {
        "id": 14,
        "leetcode_id": 1293,
        "difficulty": "Hard",
        "problem": "Shortest Path in a Grid with Obstacles Elimination",
        "leetcode": "https://leetcode.com/problems/shortest-path-in-a-grid-with-obstacles-elimination/",
        "requirements": "Find shortest path with ability to remove limited obstacles"
    },
    {
        "id": 15,
        "leetcode_id": 2577,
        "difficulty": "Medium",
        "problem": "Minimum Time to Visit a Cell In a Grid",
        "leetcode": "https://leetcode.com/problems/minimum-time-to-visit-a-cell-in-a-grid/",
        "requirements": "Find minimum time to reach bottom-right cell with time constraint"
    },
    {
        "id": 16,
        "leetcode_id": 1129,
        "difficulty": "Medium",
        "problem": "Shortest Path with Alternating Colors",
        "leetcode": "https://leetcode.com/problems/shortest-path-with-alternating-colors/",
        "requirements": "Find shortest paths with alternating red and blue edges"
    }
]
  },
  "Greedy": {
    "tip": "Greedy Algorithms make locally optimal choices at each step with the hope of finding a global optimum. They're efficient but don't always guarantee the best solution for all problems. Greedy approaches work well when the problem has 'optimal substructure' (optimal solution contains optimal solutions to subproblems) and a 'greedy choice property' (locally optimal choices lead to globally optimal solution). Look for problems involving optimization, scheduling, resource allocation, or minimizing/maximizing values. Key indicators include terms like 'maximum profit', 'minimum cost', 'optimal arrangement', or scenarios where you need to make sequential decisions. Greedy solutions are typically implemented by sorting input based on a heuristic and then processing elements in that order, making the best choice at each step.",
    "problems": [
    {
        "id": 1,
        "leetcode_id": 455,
        "difficulty": "Easy",
        "problem": "Assign Cookies",
        "leetcode": "https://leetcode.com/problems/assign-cookies/",
        "requirements": "Maximize the number of content children by assigning cookies"
    },
    {
        "id": 2,
        "leetcode_id": 55,
        "difficulty": "Medium",
        "problem": "Jump Game",
        "leetcode": "https://leetcode.com/problems/jump-game/",
        "requirements": "Determine if you can reach the last index with given jump ranges"
    },
    {
        "id": 3,
        "leetcode_id": 45,
        "difficulty": "Medium",
        "problem": "Jump Game II",
        "leetcode": "https://leetcode.com/problems/jump-game-ii/",
        "requirements": "Find minimum jumps to reach the last index"
    },
    {
        "id": 4,
        "leetcode_id": 134,
        "difficulty": "Medium",
        "problem": "Gas Station",
        "leetcode": "https://leetcode.com/problems/gas-station/",
        "requirements": "Find starting station to complete circuit with gas constraints"
    },
    {
        "id": 5,
        "leetcode_id": 122,
        "difficulty": "Easy",
        "problem": "Best Time to Buy and Sell Stock II",
        "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/",
        "requirements": "Maximize profit by buying and selling stocks multiple times"
    },
    {
        "id": 6,
        "leetcode_id": 621,
        "difficulty": "Medium",
        "problem": "Task Scheduler",
        "leetcode": "https://leetcode.com/problems/task-scheduler/",
        "requirements": "Find minimum time to execute tasks with cooling periods"
    },
    {
        "id": 7,
        "leetcode_id": 452,
        "difficulty": "Medium",
        "problem": "Minimum Number of Arrows to Burst Balloons",
        "leetcode": "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/",
        "requirements": "Find minimum arrows to burst all balloons"
    },
    {
        "id": 8,
        "leetcode_id": 1029,
        "difficulty": "Medium",
        "problem": "Two City Scheduling",
        "leetcode": "https://leetcode.com/problems/two-city-scheduling/",
        "requirements": "Minimize cost of sending people to two different cities"
    },
    {
        "id": 9,
        "leetcode_id": 763,
        "difficulty": "Medium",
        "problem": "Partition Labels",
        "leetcode": "https://leetcode.com/problems/partition-labels/",
        "requirements": "Partition string into parts where each letter appears in at most one part"
    },
    {
        "id": 10,
        "leetcode_id": 1094,
        "difficulty": "Medium",
        "problem": "Car Pooling",
        "leetcode": "https://leetcode.com/problems/car-pooling/",
        "requirements": "Determine if all passengers can be picked up and dropped off"
    },
    {
        "id": 11,
        "leetcode_id": 1710,
        "difficulty": "Easy",
        "problem": "Maximum Units on a Truck",
        "leetcode": "https://leetcode.com/problems/maximum-units-on-a-truck/",
        "requirements": "Maximize total units loaded on truck with box constraints"
    },
    {
        "id": 12,
        "leetcode_id": 881,
        "difficulty": "Medium",
        "problem": "Boats to Save People",
        "leetcode": "https://leetcode.com/problems/boats-to-save-people/",
        "requirements": "Find minimum number of boats to carry people with weight limit"
    },
    {
        "id": 13,
        "leetcode_id": 1405,
        "difficulty": "Medium",
        "problem": "Longest Happy String",
        "leetcode": "https://leetcode.com/problems/longest-happy-string/",
        "requirements": "Construct longest string without three consecutive same characters"
    },
    {
        "id": 14,
        "leetcode_id": 135,
        "difficulty": "Hard",
        "problem": "Candy",
        "leetcode": "https://leetcode.com/problems/candy/",
        "requirements": "Distribute minimum candies to children with rating constraints"
    },
    {
        "id": 15,
        "leetcode_id": 630,
        "difficulty": "Hard",
        "problem": "Course Schedule III",
        "leetcode": "https://leetcode.com/problems/course-schedule-iii/",
        "requirements": "Maximize number of courses to take with deadlines"
    }
]
  },
  "Memoization": {
    "tip": "Memoization is an optimization technique that speeds up recursive or repetitive computations by storing the results of expensive function calls and returning the cached result when the same inputs occur again. It's particularly useful for problems with overlapping subproblems and optimal substructure (properties also seen in dynamic programming). Look for recursive problems where the same calculations are performed multiple times, or problems that ask for the 'number of ways', 'minimum/maximum cost', or involve computing Fibonacci-like sequences. Implementing memoization typically involves using a hash map or array to cache results, and modifying recursive functions to check the cache before computation. While similar to bottom-up dynamic programming, memoization uses a top-down approach that often preserves the original recursive structure of the solution.",
    "problems": [
    {
        "id": 1,
        "leetcode_id": 70,
        "difficulty": "Easy",
        "problem": "Climbing Stairs",
        "leetcode": "https://leetcode.com/problems/climbing-stairs/",
        "requirements": "Count ways to climb stairs using 1 or 2 steps at a time"
    },
    {
        "id": 2,
        "leetcode_id": 509,
        "difficulty": "Easy",
        "problem": "Fibonacci Number",
        "leetcode": "https://leetcode.com/problems/fibonacci-number/",
        "requirements": "Calculate the nth Fibonacci number efficiently"
    },
    {
        "id": 3,
        "leetcode_id": 139,
        "difficulty": "Medium",
        "problem": "Word Break",
        "leetcode": "https://leetcode.com/problems/word-break/",
        "requirements": "Determine if string can be segmented into dictionary words"
    },
    {
        "id": 4,
        "leetcode_id": 322,
        "difficulty": "Medium",
        "problem": "Coin Change",
        "leetcode": "https://leetcode.com/problems/coin-change/",
        "requirements": "Find fewest coins needed to make a given amount"
    },
    {
        "id": 5,
        "leetcode_id": 198,
        "difficulty": "Medium",
        "problem": "House Robber",
        "leetcode": "https://leetcode.com/problems/house-robber/",
        "requirements": "Find maximum amount you can rob without alerting police"
    },
    {
        "id": 6,
        "leetcode_id": 91,
        "difficulty": "Medium",
        "problem": "Decode Ways",
        "leetcode": "https://leetcode.com/problems/decode-ways/",
        "requirements": "Count ways to decode a string of digits to letters"
    },
    {
        "id": 7,
        "leetcode_id": 62,
        "difficulty": "Medium",
        "problem": "Unique Paths",
        "leetcode": "https://leetcode.com/problems/unique-paths/",
        "requirements": "Count unique paths from top-left to bottom-right in grid"
    },
    {
        "id": 8,
        "leetcode_id": 300,
        "difficulty": "Medium",
        "problem": "Longest Increasing Subsequence",
        "leetcode": "https://leetcode.com/problems/longest-increasing-subsequence/",
        "requirements": "Find length of longest increasing subsequence"
    },
    {
        "id": 9,
        "leetcode_id": 416,
        "difficulty": "Medium",
        "problem": "Partition Equal Subset Sum",
        "leetcode": "https://leetcode.com/problems/partition-equal-subset-sum/",
        "requirements": "Determine if array can be partitioned into two equal sum subsets"
    },
    {
        "id": 10,
        "leetcode_id": 1143,
        "difficulty": "Medium",
        "problem": "Longest Common Subsequence",
        "leetcode": "https://leetcode.com/problems/longest-common-subsequence/",
        "requirements": "Find length of longest common subsequence of two strings"
    },
    {
        "id": 11,
        "leetcode_id": 518,
        "difficulty": "Medium",
        "problem": "Coin Change 2",
        "leetcode": "https://leetcode.com/problems/coin-change-2/",
        "requirements": "Count number of ways to make a given amount with coins"
    },
    {
        "id": 12,
        "leetcode_id": 72,
        "difficulty": "Hard",
        "problem": "Edit Distance",
        "leetcode": "https://leetcode.com/problems/edit-distance/",
        "requirements": "Find minimum operations to convert one string to another"
    },
    {
        "id": 13,
        "leetcode_id": 120,
        "difficulty": "Medium",
        "problem": "Triangle",
        "leetcode": "https://leetcode.com/problems/triangle/",
        "requirements": "Find minimum path sum from top to bottom in triangle"
    },
    {
        "id": 14,
        "leetcode_id": 123,
        "difficulty": "Hard",
        "problem": "Best Time to Buy and Sell Stock III",
        "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/",
        "requirements": "Find maximum profit from at most two stock transactions"
    },
    {
        "id": 15,
        "leetcode_id": 312,
        "difficulty": "Hard",
        "problem": "Burst Balloons",
        "leetcode": "https://leetcode.com/problems/burst-balloons/",
        "requirements": "Find maximum coins by bursting balloons strategically"
    }
]
  },
  "Tabulation": {
    "tip": "Tabulation is the bottom-up approach to dynamic programming where solutions to subproblems are computed iteratively, starting from the smallest subproblems and working towards the complete problem. Unlike memoization (top-down), tabulation fills a table (typically an array or matrix) systematically and doesn't rely on recursion, making it more efficient in terms of stack space. This pattern focuses on the fundamental concept of building a table of solutions to subproblems. Look for problems that can be broken down into smaller overlapping subproblems with optimal substructure. Tabulation requires identifying base cases and a recurrence relation that defines how states evolve, then systematically filling a table to reach the final solution.",
    "problems": [
    {
        "id": 1,
        "leetcode_id": 70,
        "difficulty": "Easy",
        "problem": "Climbing Stairs",
        "leetcode": "https://leetcode.com/problems/climbing-stairs/",
        "requirements": "Count ways to climb stairs using 1 or 2 steps at a time"
    },
    {
        "id": 2,
        "leetcode_id": 746,
        "difficulty": "Easy",
        "problem": "Min Cost Climbing Stairs",
        "leetcode": "https://leetcode.com/problems/min-cost-climbing-stairs/",
        "requirements": "Find minimum cost to climb stairs"
    },
    {
        "id": 3,
        "leetcode_id": 509,
        "difficulty": "Easy",
        "problem": "Fibonacci Number",
        "leetcode": "https://leetcode.com/problems/fibonacci-number/",
        "requirements": "Calculate the nth Fibonacci number efficiently"
    },
    {
        "id": 4,
        "leetcode_id": 198,
        "difficulty": "Medium",
        "problem": "House Robber",
        "leetcode": "https://leetcode.com/problems/house-robber/",
        "requirements": "Find maximum amount you can rob without alerting police"
    },
    {
        "id": 5,
        "leetcode_id": 213,
        "difficulty": "Medium",
        "problem": "House Robber II",
        "leetcode": "https://leetcode.com/problems/house-robber-ii/",
        "requirements": "House robber with circular arrangement"
    },
    {
        "id": 6,
        "leetcode_id": 740,
        "difficulty": "Medium",
        "problem": "Delete and Earn",
        "leetcode": "https://leetcode.com/problems/delete-and-earn/",
        "requirements": "Maximize points with element deletion constraints"
    },
    {
        "id": 7,
        "leetcode_id": 121,
        "difficulty": "Easy",
        "problem": "Best Time to Buy and Sell Stock",
        "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
        "requirements": "Find maximum profit from a single transaction"
    },
    {
        "id": 8,
        "leetcode_id": 122,
        "difficulty": "Medium",
        "problem": "Best Time to Buy and Sell Stock II",
        "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/",
        "requirements": "Find maximum profit from multiple transactions"
    },
    {
        "id": 9,
        "leetcode_id": 413,
        "difficulty": "Medium",
        "problem": "Arithmetic Slices",
        "leetcode": "https://leetcode.com/problems/arithmetic-slices/",
        "requirements": "Count number of arithmetic slices in array"
    },
    {
        "id": 10,
        "leetcode_id": 338,
        "difficulty": "Easy",
        "problem": "Counting Bits",
        "leetcode": "https://leetcode.com/problems/counting-bits/",
        "requirements": "Count set bits for range of numbers"
    },
    {
        "id": 11,
        "leetcode_id": 91,
        "difficulty": "Medium",
        "problem": "Decode Ways",
        "leetcode": "https://leetcode.com/problems/decode-ways/",
        "requirements": "Count ways to decode a string of digits to letters"
    },
    {
        "id": 12,
        "leetcode_id": 139,
        "difficulty": "Medium",
        "problem": "Word Break",
        "leetcode": "https://leetcode.com/problems/word-break/",
        "requirements": "Determine if string can be segmented into dictionary words"
    },
    {
        "id": 13,
        "leetcode_id": 983,
        "difficulty": "Medium",
        "problem": "Minimum Cost For Tickets",
        "leetcode": "https://leetcode.com/problems/minimum-cost-for-tickets/",
        "requirements": "Find minimum cost for travel tickets"
    },
    {
        "id": 14,
        "leetcode_id": 1155,
        "difficulty": "Medium",
        "problem": "Number of Dice Rolls With Target Sum",
        "leetcode": "https://leetcode.com/problems/number-of-dice-rolls-with-target-sum/",
        "requirements": "Count ways to get target sum with given dice rolls"
    },
    {
        "id": 15,
        "leetcode_id": 279,
        "difficulty": "Medium",
        "problem": "Perfect Squares",
        "leetcode": "https://leetcode.com/problems/perfect-squares/",
        "requirements": "Find least number of perfect squares summing to n"
    }
]
  },
  "1D DP": {
    "tip": "1D Dynamic Programming is a specialized form of dynamic programming where the state can be represented using a single dimension (typically an array). It's used when the subproblem solution depends on a single parameter that changes linearly. Look for problems involving sequences, chains, or series where decisions at each step affect future possibilities, and the problem can be broken down based on one changing variable (like position, size, or time). Common patterns include: linear state transitions where dp[i] depends on some previous states like dp[i-1], dp[i-2], etc.; optimization over subarrays or subsequences; and problems requiring consideration of taking or skipping elements. Unlike general tabulation, 1D DP specifically emphasizes the linear relationship between states and often requires more complex state transitions or optimizations.",
    "problems": [
    {
        "id": 1,
        "leetcode_id": 70,
        "difficulty": "Easy",
        "problem": "Climbing Stairs",
        "leetcode": "https://leetcode.com/problems/climbing-stairs/",
        "requirements": "Count ways to climb stairs using 1 or 2 steps at a time"
    },
    {
        "id": 2,
        "leetcode_id": 300,
        "difficulty": "Medium",
        "problem": "Longest Increasing Subsequence",
        "leetcode": "https://leetcode.com/problems/longest-increasing-subsequence/",
        "requirements": "Find length of longest strictly increasing subsequence"
    },
    {
        "id": 3,
        "leetcode_id": 673,
        "difficulty": "Medium",
        "problem": "Number of Longest Increasing Subsequence",
        "leetcode": "https://leetcode.com/problems/number-of-longest-increasing-subsequence/",
        "requirements": "Count the number of longest increasing subsequences"
    },
    {
        "id": 4,
        "leetcode_id": 152,
        "difficulty": "Medium",
        "problem": "Maximum Product Subarray",
        "leetcode": "https://leetcode.com/problems/maximum-product-subarray/",
        "requirements": "Find the contiguous subarray with largest product"
    },
    {
        "id": 5,
        "leetcode_id": 918,
        "difficulty": "Medium",
        "problem": "Maximum Sum Circular Subarray",
        "leetcode": "https://leetcode.com/problems/maximum-sum-circular-subarray/",
        "requirements": "Find maximum sum circular subarray with 1D DP"
    },
    {
        "id": 6,
        "leetcode_id": 746,
        "difficulty": "Easy",
        "problem": "Min Cost Climbing Stairs",
        "leetcode": "https://leetcode.com/problems/min-cost-climbing-stairs/",
        "requirements": "Find minimum cost to climb stairs"
    },
    {
        "id": 7,
        "leetcode_id": 91,
        "difficulty": "Medium",
        "problem": "Decode Ways",
        "leetcode": "https://leetcode.com/problems/decode-ways/",
        "requirements": "Count ways to decode a string of digits to letters"
    },
    {
        "id": 8,
        "leetcode_id": 139,
        "difficulty": "Medium",
        "problem": "Word Break",
        "leetcode": "https://leetcode.com/problems/word-break/",
        "requirements": "Determine if string can be segmented into dictionary words"
    },
    {
        "id": 9,
        "leetcode_id": 309,
        "difficulty": "Medium",
        "problem": "Best Time to Buy and Sell Stock with Cooldown",
        "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/",
        "requirements": "Maximum profit with cooldown using state transitions"
    },
    {
        "id": 10,
        "leetcode_id": 714,
        "difficulty": "Medium",
        "problem": "Best Time to Buy and Sell Stock with Transaction Fee",
        "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/",
        "requirements": "Maximum profit with transaction fee using state transitions"
    },
    {
        "id": 11,
        "leetcode_id": 983,
        "difficulty": "Medium",
        "problem": "Minimum Cost For Tickets",
        "leetcode": "https://leetcode.com/problems/minimum-cost-for-tickets/",
        "requirements": "Find minimum cost for travel tickets"
    },
    {
        "id": 12,
        "leetcode_id": 1155,
        "difficulty": "Medium",
        "problem": "Number of Dice Rolls With Target Sum",
        "leetcode": "https://leetcode.com/problems/number-of-dice-rolls-with-target-sum/",
        "requirements": "Count ways to get target sum with given dice rolls"
    },
    {
        "id": 13,
        "leetcode_id": 279,
        "difficulty": "Medium",
        "problem": "Perfect Squares",
        "leetcode": "https://leetcode.com/problems/perfect-squares/",
        "requirements": "Find least number of perfect squares summing to n"
    },
    {
        "id": 14,
        "leetcode_id": 376,
        "difficulty": "Medium",
        "problem": "Wiggle Subsequence",
        "leetcode": "https://leetcode.com/problems/wiggle-subsequence/",
        "requirements": "Find longest wiggle subsequence with alternating differences"
    },
    {
        "id": 15,
        "leetcode_id": 343,
        "difficulty": "Medium",
        "problem": "Integer Break",
        "leetcode": "https://leetcode.com/problems/integer-break/",
        "requirements": "Break integer into sum of integers with maximum product"
    }
]
  },
  "2D DP": {
    "tip": "2D Dynamic Programming involves creating and filling a two-dimensional table where each cell (i,j) represents the solution to a subproblem defined by two changing parameters. This pattern is essential for problems involving pairs of sequences (like strings or arrays), grid traversal with constraints, or situations where tracking two independent variables is necessary. Look for problems involving string comparisons, matrix paths, matching or alignment, or optimization scenarios with two varying dimensions. The recurrence relation typically depends on previously computed values in the table, often accessing dp[i-1][j], dp[i][j-1], dp[i-1][j-1], or other nearby cells. Visualizing the 2D table and carefully defining the meaning of each cell is crucial for solving these problems successfully.",
    "problems": [
    {
        "id": 1,
        "leetcode_id": 1143,
        "difficulty": "Medium",
        "problem": "Longest Common Subsequence",
        "leetcode": "https://leetcode.com/problems/longest-common-subsequence/",
        "requirements": "Find length of longest common subsequence of two strings"
    },
    {
        "id": 2,
        "leetcode_id": 72,
        "difficulty": "Hard",
        "problem": "Edit Distance",
        "leetcode": "https://leetcode.com/problems/edit-distance/",
        "requirements": "Find minimum operations to convert one string to another"
    },
    {
        "id": 3,
        "leetcode_id": 10,
        "difficulty": "Hard",
        "problem": "Regular Expression Matching",
        "leetcode": "https://leetcode.com/problems/regular-expression-matching/",
        "requirements": "Implement regex pattern matching with . and *"
    },
    {
        "id": 4,
        "leetcode_id": 44,
        "difficulty": "Hard",
        "problem": "Wildcard Matching",
        "leetcode": "https://leetcode.com/problems/wildcard-matching/",
        "requirements": "Implement wildcard pattern matching with ? and *"
    },
    {
        "id": 5,
        "leetcode_id": 115,
        "difficulty": "Hard",
        "problem": "Distinct Subsequences",
        "leetcode": "https://leetcode.com/problems/distinct-subsequences/",
        "requirements": "Count distinct subsequences matching target string"
    },
    {
        "id": 6,
        "leetcode_id": 516,
        "difficulty": "Medium",
        "problem": "Longest Palindromic Subsequence",
        "leetcode": "https://leetcode.com/problems/longest-palindromic-subsequence/",
        "requirements": "Find longest palindromic subsequence using 2D DP"
    },
    {
        "id": 7,
        "leetcode_id": 64,
        "difficulty": "Medium",
        "problem": "Minimum Path Sum",
        "leetcode": "https://leetcode.com/problems/minimum-path-sum/",
        "requirements": "Find path with minimum sum in grid using 2D DP"
    },
    {
        "id": 8,
        "leetcode_id": 62,
        "difficulty": "Medium",
        "problem": "Unique Paths",
        "leetcode": "https://leetcode.com/problems/unique-paths/",
        "requirements": "Count unique paths in grid using 2D DP"
    },
    {
        "id": 9,
        "leetcode_id": 63,
        "difficulty": "Medium",
        "problem": "Unique Paths II",
        "leetcode": "https://leetcode.com/problems/unique-paths-ii/",
        "requirements": "Count unique paths with obstacles using 2D DP"
    },
    {
        "id": 10,
        "leetcode_id": 120,
        "difficulty": "Medium",
        "problem": "Triangle",
        "leetcode": "https://leetcode.com/problems/triangle/",
        "requirements": "Find minimum path sum in triangle using 2D DP"
    },
    {
        "id": 11,
        "leetcode_id": 221,
        "difficulty": "Medium",
        "problem": "Maximal Square",
        "leetcode": "https://leetcode.com/problems/maximal-square/",
        "requirements": "Find largest square of 1's in binary matrix using 2D DP"
    },
    {
        "id": 12,
        "leetcode_id": 85,
        "difficulty": "Hard",
        "problem": "Maximal Rectangle",
        "leetcode": "https://leetcode.com/problems/maximal-rectangle/",
        "requirements": "Find largest rectangle in binary matrix using 2D DP"
    },
    {
        "id": 13,
        "leetcode_id": 174,
        "difficulty": "Hard",
        "problem": "Dungeon Game",
        "leetcode": "https://leetcode.com/problems/dungeon-game/",
        "requirements": "Find minimum initial health to reach bottom-right cell"
    },
    {
        "id": 14,
        "leetcode_id": 741,
        "difficulty": "Hard",
        "problem": "Cherry Pickup",
        "leetcode": "https://leetcode.com/problems/cherry-pickup/",
        "requirements": "Collect maximum cherries with two traversals using 2D DP"
    },
    {
        "id": 15,
        "leetcode_id": 188,
        "difficulty": "Hard",
        "problem": "Best Time to Buy and Sell Stock IV",
        "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/",
        "requirements": "Maximum profit with k transactions using 2D DP"
    }
]
  },
  "Segment Trees": {
    "tip": "Segment Trees are a specialized data structure that allows for efficient range queries and updates on arrays. They enable operations like finding the sum, minimum, maximum, or GCD of elements within any range in O(log n) time, while also supporting modifications to the underlying array also in O(log n) time. Look for problems involving multiple range queries or updates, especially those that would be inefficient with brute force approaches. Key indicators include 'range queries', 'interval operations', or problems requiring repeated computation over dynamic intervals. Segment trees are particularly useful when you need to handle both queries and updates efficiently, unlike prefix sums which only handle queries well but struggle with updates.",
    "problems": [
  {
    "id": 1,
    "leetcode_id": 307,
    "difficulty": "Medium",
    "problem": "Range Sum Query - Mutable",
    "leetcode": "https://leetcode.com/problems/range-sum-query-mutable/",
    "requirements": "Implement data structure for range sum queries with updates"
  },
  {
    "id": 2,
    "leetcode_id": 239,
    "difficulty": "Hard",
    "problem": "Sliding Window Maximum",
    "leetcode": "https://leetcode.com/problems/sliding-window-maximum/",
    "requirements": "Find maximum element in sliding window using range queries"
  },
  {
    "id": 3,
    "leetcode_id": 315,
    "difficulty": "Hard",
    "problem": "Count of Smaller Numbers After Self",
    "leetcode": "https://leetcode.com/problems/count-of-smaller-numbers-after-self/",
    "requirements": "Count smaller elements to the right using segment tree"
  },
  {
    "id": 4,
    "leetcode_id": 732,
    "difficulty": "Hard",
    "problem": "My Calendar III",
    "leetcode": "https://leetcode.com/problems/my-calendar-iii/",
    "requirements": "Track maximum booking overlaps using lazy propagation"
  },
  {
    "id": 5,
    "leetcode_id": 715,
    "difficulty": "Hard",
    "problem": "Range Module",
    "leetcode": "https://leetcode.com/problems/range-module/",
    "requirements": "Implement data structure for tracking ranges"
  },
  {
    "id": 6,
    "leetcode_id": 218,
    "difficulty": "Hard",
    "problem": "The Skyline Problem",
    "leetcode": "https://leetcode.com/problems/the-skyline-problem/",
    "requirements": "Find skyline formed by buildings using segment tree"
  },
  {
    "id": 7,
    "leetcode_id": 493,
    "difficulty": "Hard",
    "problem": "Reverse Pairs",
    "leetcode": "https://leetcode.com/problems/reverse-pairs/",
    "requirements": "Count reverse pairs (i<j, nums[i]>2*nums[j]) using segment tree"
  },
  {
    "id": 8,
    "leetcode_id": 308,
    "difficulty": "Hard",
    "problem": "Range Sum Query 2D - Mutable",
    "leetcode": "https://leetcode.com/problems/range-sum-query-2d-mutable/",
    "requirements": "Implement 2D range sum query with updates"
  },
  {
    "id": 9,
    "leetcode_id": 699,
    "difficulty": "Hard",
    "problem": "Falling Squares",
    "leetcode": "https://leetcode.com/problems/falling-squares/",
    "requirements": "Track maximum height after placing squares using lazy updates"
  },
  {
    "id": 10,
    "leetcode_id": 327,
    "difficulty": "Hard",
    "problem": "Count of Range Sum",
    "leetcode": "https://leetcode.com/problems/count-of-range-sum/",
    "requirements": "Count range sums within specific range using segment tree"
  },
  {
    "id": 11,
    "leetcode_id": 850,
    "difficulty": "Hard",
    "problem": "Rectangle Area II",
    "leetcode": "https://leetcode.com/problems/rectangle-area-ii/",
    "requirements": "Calculate total area covered by rectangles using segment tree"
  },
  {
    "id": 12,
    "leetcode_id": 2407,
    "difficulty": "Hard",
    "problem": "Longest Increasing Subsequence II",
    "leetcode": "https://leetcode.com/problems/longest-increasing-subsequence-ii/",
    "requirements": "Find LIS with difference constraints using segment tree"
  },
  {
    "id": 13,
    "leetcode_id": 1649,
    "difficulty": "Hard",
    "problem": "Create Sorted Array through Instructions",
    "leetcode": "https://leetcode.com/problems/create-sorted-array-through-instructions/",
    "requirements": "Count elements smaller/greater than current using segment tree"
  },
  {
    "id": 14,
    "leetcode_id": 2158,
    "difficulty": "Hard",
    "problem": "Amount of New Area Painted Each Day",
    "leetcode": "https://leetcode.com/problems/amount-of-new-area-painted-each-day/",
    "requirements": "Track painted intervals using lazy segment tree"
  },
  {
    "id": 15,
    "leetcode_id": 1157,
    "difficulty": "Hard",
    "problem": "Online Majority Element In Subarray",
    "leetcode": "https://leetcode.com/problems/online-majority-element-in-subarray/",
    "requirements": "Find majority element in range using segment tree"
  }
]
  },
  "Intervals": {
    "tip": "Interval problems involve ranges defined by start and end points, and typically require analyzing their relationships (overlap, containment, adjacency). The key to solving these problems often lies in sorting the intervals (usually by start or end point) and then processing them in order. Watch for problems involving scheduling, resource allocation, or range-based operations. Look for keywords like 'merge', 'overlap', 'conflicting intervals', or scenarios dealing with time periods, meeting rooms, or coverage. Common operations include merging overlapping intervals, finding gaps between intervals, calculating total covered length, and resolving conflicts. Visualizing intervals on a number line can help clarify the logic needed for these problems.",
    "problems": [
  {
    "id": 1,
    "leetcode_id": 56,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Merge Intervals",
    "leetcode": "https://leetcode.com/problems/merge-intervals/",
    "requirements": "Merge all overlapping intervals into non-overlapping intervals"
  },
  {
    "id": 2,
    "leetcode_id": 57,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Insert Interval",
    "leetcode": "https://leetcode.com/problems/insert-interval/",
    "requirements": "Insert a new interval and merge if necessary"
  },
  {
    "id": 3,
    "leetcode_id": 252,
    "difficulty": "Easy",
    "frequency": "High",
    "problem": "Meeting Rooms",
    "leetcode": "https://leetcode.com/problems/meeting-rooms/",
    "requirements": "Determine if a person can attend all meetings"
  },
  {
    "id": 4,
    "leetcode_id": 253,
    "difficulty": "Medium",
    "frequency": "High",
    "problem": "Meeting Rooms II",
    "leetcode": "https://leetcode.com/problems/meeting-rooms-ii/",
    "requirements": "Find minimum number of conference rooms required"
  },
  {
    "id": 5,
    "leetcode_id": 435,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Non-overlapping Intervals",
    "leetcode": "https://leetcode.com/problems/non-overlapping-intervals/",
    "requirements": "Find minimum intervals to remove to make all non-overlapping"
  },
  {
    "id": 6,
    "leetcode_id": 1288,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Remove Covered Intervals",
    "leetcode": "https://leetcode.com/problems/remove-covered-intervals/",
    "requirements": "Remove intervals that are covered by another interval"
  },
  {
    "id": 7,
    "leetcode_id": 986,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Interval List Intersections",
    "leetcode": "https://leetcode.com/problems/interval-list-intersections/",
    "requirements": "Find intersections of two lists of intervals"
  },
  {
    "id": 8,
    "leetcode_id": 759,
    "difficulty": "Hard",
    "frequency": "Medium",
    "problem": "Employee Free Time",
    "leetcode": "https://leetcode.com/problems/employee-free-time/",
    "requirements": "Find common free time intervals across all employees"
  },
  {
    "id": 9,
    "leetcode_id": 1094,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Car Pooling",
    "leetcode": "https://leetcode.com/problems/car-pooling/",
    "requirements": "Determine if all passengers can be picked up and dropped off"
  },
  {
    "id": 10,
    "leetcode_id": 452,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Minimum Number of Arrows to Burst Balloons",
    "leetcode": "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/",
    "requirements": "Find minimum arrows to burst all balloons with interval representation"
  },
  {
    "id": 11,
    "leetcode_id": 1235,
    "difficulty": "Hard",
    "frequency": "Medium",
    "problem": "Maximum Profit in Job Scheduling",
    "leetcode": "https://leetcode.com/problems/maximum-profit-in-job-scheduling/",
    "requirements": "Find maximum profit from non-overlapping jobs"
  },
  {
    "id": 12,
    "leetcode_id": 218,
    "difficulty": "Hard",
    "frequency": "Medium",
    "problem": "The Skyline Problem",
    "leetcode": "https://leetcode.com/problems/the-skyline-problem/",
    "requirements": "Find skyline formed by buildings represented as intervals"
  },
  {
    "id": 13,
    "leetcode_id": 1229,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Meeting Scheduler",
    "leetcode": "https://leetcode.com/problems/meeting-scheduler/",
    "requirements": "Find earliest time slot of given duration available for both persons"
  },
  {
    "id": 14,
    "leetcode_id": 1024,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Video Stitching",
    "leetcode": "https://leetcode.com/problems/video-stitching/",
    "requirements": "Find minimum clips needed to cover entire time range"
  },
  {
    "id": 15,
    "leetcode_id": 370,
    "difficulty": "Medium",
    "frequency": "Medium",
    "problem": "Range Addition",
    "leetcode": "https://leetcode.com/problems/range-addition/",
    "requirements": "Apply multiple range addition operations efficiently"
  }
]
  },
  "Bit Manipulation": {
    "tip": "Bit Manipulation involves directly manipulating individual bits in a number using bitwise operators like AND (&), OR (|), XOR (^), NOT (~), and bit shifts (<<, >>). This technique is useful for problems involving binary representation, optimization of space usage, or implementing certain algorithms more efficiently. Look for problems involving counting bits, power of two checks, finding unique numbers, or scenarios where using the binary structure of numbers provides elegant solutions. Bit manipulation often leads to solutions that are both time and space efficient, and can simplify complex logic that would otherwise require multiple conditional statements or loops.",
    "problems": [
      {
        "id": 1,
        "leetcode_id": 136,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Single Number",
        "leetcode": "https://leetcode.com/problems/single-number/",
        "requirements": "Find the number that appears only once using XOR"
      },
      {
        "id": 2,
        "leetcode_id": 191,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Number of 1 Bits",
        "leetcode": "https://leetcode.com/problems/number-of-1-bits/",
        "requirements": "Count the number of 1 bits in an integer"
      },
      {
        "id": 3,
        "leetcode_id": 338,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Counting Bits",
        "leetcode": "https://leetcode.com/problems/counting-bits/",
        "requirements": "Count bits in numbers from 0 to n efficiently"
      },
      {
        "id": 4,
        "leetcode_id": 190,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Reverse Bits",
        "leetcode": "https://leetcode.com/problems/reverse-bits/",
        "requirements": "Reverse the bits of a 32-bit unsigned integer"
      },
      {
        "id": 5,
        "leetcode_id": 371,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Sum of Two Integers",
        "leetcode": "https://leetcode.com/problems/sum-of-two-integers/",
        "requirements": "Add two numbers without using + or - operators"
      },
      {
        "id": 6,
        "leetcode_id": 268,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Missing Number",
        "leetcode": "https://leetcode.com/problems/missing-number/",
        "requirements": "Find missing number using bit manipulation"
      },
      {
        "id": 7,
        "leetcode_id": 137,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Single Number II",
        "leetcode": "https://leetcode.com/problems/single-number-ii/",
        "requirements": "Find number that appears once while others appear three times"
      },
      {
        "id": 8,
        "leetcode_id": 260,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Single Number III",
        "leetcode": "https://leetcode.com/problems/single-number-iii/",
        "requirements": "Find two numbers that appear only once"
      },
      {
        "id": 9,
        "leetcode_id": 201,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Bitwise AND of Numbers Range",
        "leetcode": "https://leetcode.com/problems/bitwise-and-of-numbers-range/",
        "requirements": "Find AND of all numbers in a range"
      },
      {
        "id": 10,
        "leetcode_id": 231,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Power of Two",
        "leetcode": "https://leetcode.com/problems/power-of-two/",
        "requirements": "Check if number is power of two using bit manipulation"
      },
      {
        "id": 11,
        "leetcode_id": 1009,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Complement of Base 10 Integer",
        "leetcode": "https://leetcode.com/problems/complement-of-base-10-integer/",
        "requirements": "Find the complement of a number"
      },
      {
        "id": 12,
        "leetcode_id": 78,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Subsets",
        "leetcode": "https://leetcode.com/problems/subsets/",
        "requirements": "Generate all subsets using bit manipulation"
      },
      {
        "id": 13,
        "leetcode_id": 421,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum XOR of Two Numbers in an Array",
        "leetcode": "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/",
        "requirements": "Find maximum XOR of any two numbers in array"
      },
      {
        "id": 14,
        "leetcode_id": 1342,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Number of Steps to Reduce a Number to Zero",
        "leetcode": "https://leetcode.com/problems/number-of-steps-to-reduce-a-number-to-zero/",
        "requirements": "Count steps to reduce number to zero using bit operations"
      },
      {
        "id": 15,
        "leetcode_id": 1720,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Decode XORed Array",
        "leetcode": "https://leetcode.com/problems/decode-xored-array/",
        "requirements": "Decode array encoded with XOR operations"
      }
    ]
  },
  "Math & Geometry": {
    "tip": "Math & Geometry problems leverage mathematical principles, formulas, and geometric concepts to solve computational challenges. These problems often have elegant solutions that rely on mathematical insights rather than complex algorithms. Look for problems involving number theory, combinatorics, probability, coordinate geometry, or pattern recognition. The key to solving these problems is identifying the underlying mathematical principle and applying the appropriate formula or approach. While these problems may seem specialized, they test fundamental problem-solving abilities and often have applications in various domains of computer science and engineering.",
    "problems": [
      {
        "id": 1,
        "leetcode_id": 50,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Pow(x, n)",
        "leetcode": "https://leetcode.com/problems/powx-n/",
        "requirements": "Implement efficient power function using exponentiation by squaring"
      },
      {
        "id": 2,
        "leetcode_id": 69,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Sqrt(x)",
        "leetcode": "https://leetcode.com/problems/sqrtx/",
        "requirements": "Implement square root function without using built-in math functions"
      },
      {
        "id": 3,
        "leetcode_id": 204,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Count Primes",
        "leetcode": "https://leetcode.com/problems/count-primes/",
        "requirements": "Count prime numbers less than n using Sieve of Eratosthenes"
      },
      {
        "id": 4,
        "leetcode_id": 48,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Rotate Image",
        "leetcode": "https://leetcode.com/problems/rotate-image/",
        "requirements": "Rotate a matrix 90 degrees clockwise in-place"
      },
      {
        "id": 5,
        "leetcode_id": 43,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Multiply Strings",
        "leetcode": "https://leetcode.com/problems/multiply-strings/",
        "requirements": "Multiply two numbers represented as strings"
      },
      {
        "id": 6,
        "leetcode_id": 13,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Roman to Integer",
        "leetcode": "https://leetcode.com/problems/roman-to-integer/",
        "requirements": "Convert Roman numeral to integer"
      },
      {
        "id": 7,
        "leetcode_id": 12,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Integer to Roman",
        "leetcode": "https://leetcode.com/problems/integer-to-roman/",
        "requirements": "Convert integer to Roman numeral"
      },
      {
        "id": 8,
        "leetcode_id": 149,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Max Points on a Line",
        "leetcode": "https://leetcode.com/problems/max-points-on-a-line/",
        "requirements": "Find maximum points that lie on the same line"
      },
      {
        "id": 9,
        "leetcode_id": 60,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Permutation Sequence",
        "leetcode": "https://leetcode.com/problems/permutation-sequence/",
        "requirements": "Find the kth permutation sequence using factorial number system"
      },
      {
        "id": 10,
        "leetcode_id": 172,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Factorial Trailing Zeroes",
        "leetcode": "https://leetcode.com/problems/factorial-trailing-zeroes/",
        "requirements": "Count trailing zeroes in factorial of n"
      },
      {
        "id": 11,
        "leetcode_id": 7,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Reverse Integer",
        "leetcode": "https://leetcode.com/problems/reverse-integer/",
        "requirements": "Reverse digits of an integer with overflow handling"
      },
      {
        "id": 12,
        "leetcode_id": 29,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Divide Two Integers",
        "leetcode": "https://leetcode.com/problems/divide-two-integers/",
        "requirements": "Divide two integers without using multiplication, division or mod"
      },
      {
        "id": 13,
        "leetcode_id": 223,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Rectangle Area",
        "leetcode": "https://leetcode.com/problems/rectangle-area/",
        "requirements": "Find total area covered by two overlapping rectangles"
      },
      {
        "id": 14,
        "leetcode_id": 9,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Palindrome Number",
        "leetcode": "https://leetcode.com/problems/palindrome-number/",
        "requirements": "Determine if an integer is a palindrome without converting to string"
      },
      {
        "id": 15,
        "leetcode_id": 166,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Fraction to Recurring Decimal",
        "leetcode": "https://leetcode.com/problems/fraction-to-recurring-decimal/",
        "requirements": "Convert fraction to decimal with handling of recurring decimals"
      }
    ]
  }
}

// Process the new data format into the old format for compatibility
const jsonData = {
  "problems": []
};

// Process the new data format into the old format for compatibility
for (const category in CATEGORIES_DATA) {
  CATEGORIES_DATA[category].problems.forEach(problem => {
    const categories = {};
    categories[category] = problem.requirements;
    
    jsonData.problems.push({
      id: problem.id,
      status: problem.status || false,
      problem: problem.problem,
      difficulty: problem.difficulty,
      leetcode: problem.leetcode,
      leetcode_id: problem.leetcode_id,
      requirements: problem.requirements,
      categories: categories
    });
  });
}

console.log('total', jsonData.problems.length);

/***********************
 * TRANSFORM JSON DATA INTO A MAPPING BY CATEGORY
 ***********************/
const problemDataByCategory = {};
jsonData.problems.forEach(problem => {
  Object.keys(problem.categories).forEach(cat => {
    if (!problemDataByCategory[cat]) {
      problemDataByCategory[cat] = [];
    }
    // Add both a "subcategory" and "category" property
    const newProblem = { 
      ...problem, 
      category: cat 
    };
    problemDataByCategory[cat].push(newProblem);
  });
});

// Create an "all" category that combines every problem (excluding "all" itself)
// Create an "all" category that combines every problem (excluding "all" itself)
problemDataByCategory.all = [];
const seenLeetCodeIds = new Set();

Object.keys(problemDataByCategory).forEach(cat => {
  if (cat !== 'all') {
    problemDataByCategory[cat].forEach(problem => {
      if (!seenLeetCodeIds.has(problem.leetcode_id)) {
        seenLeetCodeIds.add(problem.leetcode_id);
        // Create a copy of the problem to avoid reference issues
        const problemCopy = { ...problem };
        // We'll track which categories this problem belongs to for filtering purposes
        problemCopy.categories_list = [cat];
        problemDataByCategory.all.push(problemCopy);
      } else {
        // If we've seen this problem before, add this category to its categories list
        const existingProblem = problemDataByCategory.all.find(p => p.leetcode_id === problem.leetcode_id);
        if (existingProblem && existingProblem.categories_list && !existingProblem.categories_list.includes(cat)) {
          existingProblem.categories_list.push(cat);
        }
      }
    });
  }
});

/***********************
 * STATE & STATUS MANAGEMENT
 ***********************/
let currentCategory = 'all'; // default category (match the case used in JSON)
let gridApi = null;
let columnApi = null;
let problemStatuses = {};

// Load statuses from localStorage for each category
function loadProblemStatuses() {
  if (!currentUser) {
    // Do nothing or leave in-memory defaults when not logged in.
    return;
  }
  Object.keys(problemDataByCategory).forEach(category => {
    if (category === 'all') return; // Skip "all" category
    
    const stored = localStorage.getItem(`tech-navigator-${category}-progress`);
    const statusObj = stored ? JSON.parse(stored) : {};
    problemStatuses[category] = statusObj;
    
    problemDataByCategory[category].forEach(problem => {
      problem.status = statusObj[problem.leetcode_id] || false;
    });
  });
}

// Now getFilteredProblems uses the updated mapping:
function getFilteredProblems() {
  return problemDataByCategory[currentCategory] || [];
}

// Save a problem's status - updated to use LeetCode ID across all categories
function saveProblemStatus(category, problemId, status) {
  if (!currentUser) {
    // If not logged in, do not store anything.
    return;
  }
  
  // Update status in ALL categories
  Object.keys(problemDataByCategory).forEach(cat => {
    // Find the problem in this category
    const problemsInCategory = problemDataByCategory[cat];
    problemsInCategory.forEach(problem => {
      if (problem.leetcode_id === problemId) {
        // Update the status for this specific problem
        problem.status = status;

        // Ensure category-specific tracking
        if (!problemStatuses[cat]) {
          problemStatuses[cat] = {};
        }
        problemStatuses[cat][problemId] = status;

        // Update localStorage for this category
        localStorage.setItem(`tech-navigator-${cat}-progress`, JSON.stringify(problemStatuses[cat]));
        
        // Update category counter immediately for this category
        updateCategoryCounter(cat);
      }
    });
  });

  // Trigger grid update to reflect changes
  if (gridApi) {
    gridApi.refreshCells();
  }

  // Update overall progress counter
  updateOverallProgress();

  // If signed in, collect all problem statuses and save to Firebase
  if (currentUser) {
    const allProblems = {};
    const processedIds = new Set();
    
    Object.keys(problemStatuses).forEach(cat => {
      if (cat === 'all') return;
      
      Object.keys(problemStatuses[cat] || {}).forEach(probId => {
        if (!processedIds.has(probId)) {
          allProblems[probId] = problemStatuses[cat][probId];
          processedIds.add(probId);
        }
      });
    });
    
    saveProgressToFirebase(allProblems);
  }
}

/***********************
 * HELPER FUNCTIONS
 ***********************/
// Resets all filter controls


// Updates/reinitializes the grid with filtered problems.
function updateGrid() {
  const gridData = getFilteredProblems();
  if (gridApi && gridApi.setRowData) {
    gridApi.setRowData(gridData);
  } else {
    console.log("Updated grid data:", gridData);
  }
}

// Retrieves the current status for all problems in the specified category.
function getStatusForCategory(category) {
  return jsonData.problems
    .filter(problem => Object.keys(problem.categories).includes(category))
    .map(problem => ({ id: problem.leetcode_id, status: problem.status }));
}

// Update the category counter
function updateCategoryCounter(category) {
  if (!problemDataByCategory[category]) return;
  
  const problems = problemDataByCategory[category];
  const total = problems.length;
  const solved = problems.filter(p => p.status).length;
  const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;

  // Find the corresponding nav progress element
  const sanitizedId = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const navProgress = document.getElementById(`${sanitizedId}-nav-progress`);
  
  if (navProgress) {
    navProgress.innerHTML = `
      <div class="progress-mini">
        <div class="progress-mini-bar" style="width:${percentage}%"></div>
      </div>
      ${solved}/${total}
    `;
  }

  // Update main counter if current category
  if (category === currentCategory) {
    document.getElementById('problem-count').textContent = `(${solved}/${total})`;
    const progressCircle = document.querySelector('#category-counter .circle-progress-bar');
    if (progressCircle) {
      const circumference = 2 * Math.PI * 15;
      progressCircle.style.strokeDasharray = circumference;
      progressCircle.style.strokeDashoffset = circumference - (percentage / 100) * circumference;
    }
    document.getElementById('category-percentage').textContent = `${percentage}% Completed`;
    updateDifficultyCounts(category);
  }
}

// Theme toggle handler
function setupThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  const lightIcon = document.getElementById('light-icon');
  const darkIcon = document.getElementById('dark-icon');
  
  // Set dark mode as default
  document.body.classList.add('dark-mode');
  lightIcon.classList.remove('active');
  darkIcon.classList.add('active');
  localStorage.setItem('tech-navigator-theme', 'dark');
  
  themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    lightIcon.classList.toggle('active');
    darkIcon.classList.toggle('active');
    localStorage.setItem('tech-navigator-theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    if (gridApi) {
      gridApi.refreshCells();
    }
  });
}

// Change category, update grid and counters. Fixed parameter name usage.
function changeCategory(category) {
  // Reset UI filters
  
  // Clear grid filter model
  if (gridApi) {
    gridApi.setFilterModel(null);
  }

  // Update current category if changed
  if (currentCategory !== category) {
    currentCategory = category;
  }

  // Update active sidebar link
  document.querySelectorAll('.sidebar-nav-link').forEach(link => {
    link.classList.remove('active');
  });
  const activeLink = document.getElementById(`${category}-link`);
  if (activeLink) activeLink.classList.add('active');

  // Update title and problem count
  document.querySelector('.category-name').textContent = getCategoryTitle(category);
  const totalProblems = problemDataByCategory[category] ? problemDataByCategory[category].length : 0;
  const solvedProblems = problemDataByCategory[category] ? problemDataByCategory[category].filter(p => p.status).length : 0;
  document.getElementById('problem-count').textContent = `(${solvedProblems}/${totalProblems})`;

  // Show category tip if available
  updateCategoryTip(category);
  

  // Initialize grid for the category
  initializeGrid(category);

  // Force refresh of client-side row model
  if (gridApi) {
    gridApi.refreshClientSideRowModel('filter');
  }

  // Update counters
  updateCategoryCounter(category);
}

// Update category tip
function updateCategoryTip(category) {
  const tipElement = document.getElementById('category-tip');
  
  if (category !== 'all' && CATEGORIES_DATA[category] && CATEGORIES_DATA[category].tip) {
    tipElement.innerHTML = `
      <h3>Tips for ${getCategoryTitle(category)}</h3>
      <p>${CATEGORIES_DATA[category].tip}</p>
    `;
    tipElement.style.display = 'block';
  } else {
    tipElement.style.display = 'none';
  }
}

// Map category keys to display titles
function getCategoryTitle(category) {
  if (category === 'all') return 'ALL Problems';
  return category;
}

function initializeGrid(category) {
  console.log(`Initializing grid for category: ${category}`);
  
  if (!problemDataByCategory[category]) {
    console.error(`No data found for category: ${category}`);
    return;
  }
  
  // Status column - only shown for logged in users
  const statusColumn = currentUser
    ? [{
        headerName: 'Status',
        field: 'status',
        width: 80,
        cellRenderer: statusCellRenderer,
        sortable: true,
        filter: 'agSetColumnFilter',
        filterParams: {
          values: [true, false],
          cellRenderer: (params) => (params.value ? 'Completed' : 'Pending')
        },
        suppressSizeToFit: true,
        headerClass: 'ag-center-header'
      }]
    : []; // Omit column if not logged in
  
  // Video column - only shown if video data exists
  const videoColumn = [{
    headerName: '',
    field: 'video_url',
    width: 50,
    cellRenderer: (params) => {
      if (!params.value) return '';
      // Using YouTube icon (play button icon)
      return `<a href="${params.value}" target="_blank" title="Watch Video Solution" class="grid-icon youtube-icon">&#9654;&#65039;</a>`;
    },
    suppressSizeToFit: true,
    headerClass: 'ag-center-header',
    filter: {
      valueGetter: params => !!params.data.video_url,
      filterParams: {
        values: [true, false],
        cellRenderer: params => params.value ? 'Has Video' : 'No Video'
      }
    }
  }];
  
  // Article column - only shown if article data exists
  const articleColumn = [{
    headerName: '',
    field: 'article_url',
    width: 50,
    cellRenderer: (params) => {
      if (!params.value) return '';
      // Using document icon
      return `<a href="${params.value}" target="_blank" title="Read Article Solution" class="grid-icon article-icon">&#128196;</a>`;
    },
    suppressSizeToFit: true,
    headerClass: 'ag-center-header',
    filter: {
      valueGetter: params => !!params.data.article_url,
      filterParams: {
        values: [true, false],
        cellRenderer: params => params.value ? 'Has Article' : 'No Article'
      }
    }
  }];
  
  const columnDefs = [
    ...statusColumn,
    ...videoColumn,
    ...articleColumn,
    {
      headerName: 'Problem',
      field: 'problem',
      flex: 1,
      filter: true,
      sortable: true,
      minWidth: 250,
      cellRenderer: problemCellRenderer
    },
    {
      headerName: 'LeetCode ID',
      field: 'leetcode_id',
      width: 120,
      filter: true,
      sortable: true,
      suppressSizeToFit: true,
      headerClass: 'ag-center-header',
      hide: 'true'
    },
    {
      headerName: 'Difficulty',
      field: 'difficulty',
      width: 120,
      cellRenderer: difficultyCellRenderer,
      filter: true,
      sortable: true,
      suppressSizeToFit: true,
      headerClass: 'ag-center-header',
      sort: 'asc',
      sortingOrder: ['asc', 'desc', null],
      comparator: (valueA, valueB) => {
        const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
        return difficultyOrder[valueA] - difficultyOrder[valueB];
      }
    }
  ];
  
  // For "all" category, add a Category column
  if (category === 'all') {
    // Insert the category column after the problem column
    columnDefs.splice(4, 0, {
      headerName: 'Category',
      field: 'category',
      width: 150,
      filter: true,
      sortable: true,
      valueFormatter: params => getCategoryTitle(params.value)
    });
  }
  
  // Get the row data for the specific category
  const rowData = problemDataByCategory[category] || [];
  
  console.log(`Grid data for ${category}:`, {
    rowCount: rowData.length,
    firstRowSample: rowData[0]
  });
  
  const gridOptions = {
    columnDefs: columnDefs,
    rowData: rowData,
    pagination: true,
    paginationPageSize: 15,
    animateRows: true,
    multiSortKey: 'ctrl', 
    defaultColDef: {
      resizable: true,
      suppressMenu: true,
      sortable: true,
      filter: true
    },
    onGridReady: function(params) {
      gridApi = params.api;
      columnApi = params.columnApi;
      
      // Set initial sorting
      params.columnApi.applyColumnState({
        state: [
          { colId: 'frequency', sort: 'desc', sortIndex: 0 },
          { colId: 'difficulty', sort: 'asc', sortIndex: 1 }
        ],
        applyOrder: false
      });
      
      gridApi.sizeColumnsToFit();
      window.addEventListener('resize', () => setTimeout(() => gridApi.sizeColumnsToFit(), 100));
      
      updateDifficultyCounts(category);
    }
  };
  
  // Destroy existing grid if it exists
  const gridDiv = document.getElementById('problem-grid');
  if (gridDiv) {
    gridDiv.innerHTML = ''; // Clear existing grid
  }
  
  // Create new grid
  new agGrid.Grid(gridDiv, gridOptions);
  
  console.log(`Grid initialized for ${category}`);
}

// Modify changeCategory to ensure grid is updated
function changeCategory(category) {
  console.log(`Changing category to: ${category}`);
  
  // Reset UI filters
  
  // Clear grid filter model
  if (gridApi) {
    gridApi.setFilterModel(null);
  }

  // Update current category
  currentCategory = category;

  // Update active sidebar link
  document.querySelectorAll('.sidebar-nav-link').forEach(link => {
    link.classList.remove('active');
  });
  const activeLink = document.getElementById(`${category}-link`);
  if (activeLink) activeLink.classList.add('active');

  // Update title and problem count
  document.querySelector('.category-name').textContent = getCategoryTitle(category);
  const totalProblems = problemDataByCategory[category] ? problemDataByCategory[category].length : 0;
  const solvedProblems = problemDataByCategory[category] ? problemDataByCategory[category].filter(p => p.status).length : 0;
  document.getElementById('problem-count').textContent = `(${solvedProblems}/${totalProblems})`;

  // Show category tip if available
  updateCategoryTip(category);
  

  // Reinitialize grid for the category
  initializeGrid(category);

  // Update counters
  updateCategoryCounter(category);
  updateDifficultyCounts(category);
}

// Cell renderer for the status column (with checkbox)
function statusCellRenderer(params) {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.justifyContent = 'center';
  wrapper.style.alignItems = 'center';
  wrapper.style.height = '100%';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = params.value;
  checkbox.style.cursor = 'pointer';
  checkbox.style.width = '18px';
  checkbox.style.height = '18px';
  checkbox.style.accentColor = '#f97316';
  
  // In the checkbox event listener (statusCellRenderer)
  checkbox.addEventListener('change', function() {
    const data = params.node.data;
    data.status = this.checked;
    
    // If in "all" category, update the original category
    if (currentCategory === 'all' && data.category) {
      const orig = problemDataByCategory[data.category].find(p => p.leetcode_id === data.leetcode_id);
      if (orig) {
        orig.status = this.checked;
        saveProblemStatus(data.category, data.leetcode_id, this.checked); // Save to original category
      }
    } else {
      saveProblemStatus(currentCategory, data.leetcode_id, this.checked); // Save to current category
    }
    
    updateCategoryCounter(currentCategory);
    updateOverallProgress();
  });
  wrapper.appendChild(checkbox);
  return wrapper;
}

// Cell renderer for the difficulty column (shows a tag)
function difficultyCellRenderer(params) {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.justifyContent = 'center';
  wrapper.style.alignItems = 'center';
  wrapper.style.height = '100%';
  const tag = document.createElement('span');
  tag.className = `difficulty-tag ${params.value.toLowerCase()}`;
  tag.textContent = params.value;
  wrapper.appendChild(tag);
  return wrapper;
}

// Cell renderer for the frequency column (shows a tag)
function frequencyCellRenderer(params) {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.justifyContent = 'center';
  wrapper.style.alignItems = 'center';
  wrapper.style.height = '100%';
  const tag = document.createElement('span');
  const frequencyClass = params.value.toLowerCase();
  tag.className = `frequency-tag ${frequencyClass}`;
  tag.textContent = params.value;
  wrapper.appendChild(tag);
  return wrapper;
}

// Update Problem column cell renderer
function problemCellRenderer(params) {
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.alignItems = 'center';
  wrapper.style.gap = '6px';
  
  // Create tooltip wrapper
  const tooltipDiv = document.createElement('div');
  tooltipDiv.className = 'tooltip';
  
  // LeetCode Link
  const link = document.createElement('a');
  link.href = params.data.leetcode;
  link.textContent = params.value;
  link.target = '_blank';
  link.style.color = 'var(--text-color)';
  link.style.textDecoration = 'none';
  link.style.fontWeight = '500';
  link.style.display = 'flex';
  link.style.alignItems = 'center';
  link.style.gap = '4px';
  
  // Tooltip content
  if (params.data.requirements) {
    const tooltipContent = document.createElement('div');
    tooltipContent.className = 'tooltip-content';
    tooltipContent.innerHTML = `<strong>Requirements:</strong> ${params.data.requirements}`;
    tooltipDiv.appendChild(tooltipContent);
  }

  // External Link Icon
  link.innerHTML += `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" 
         stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
         style="flex-shrink: 0;">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <polyline points="15 3 21 3 21 9"></polyline>
      <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
  `;

  // Hover effects
  link.addEventListener('mouseenter', () => {
    link.style.color = 'var(--professional-orange)';
  });
  link.addEventListener('mouseleave', () => {
    link.style.color = 'var(--text-color)';
  });

  tooltipDiv.appendChild(link);
  wrapper.appendChild(tooltipDiv);
  return wrapper;
}

function applyFilters() {
  if (!gridApi) return;
  
  
  // Apply filters and force immediate refresh
  gridApi.setFilterModel(filterModel);
  gridApi.onFilterChanged();
  gridApi.refreshClientSideRowModel('filter');
  
  updateFilteredDifficultyCounts();
}

// Update difficulty counts based on currently filtered data
function updateFilteredDifficultyCounts() {
  if (!gridApi) return;
  const filteredNodes = [];
  gridApi.forEachNodeAfterFilter(node => filteredNodes.push(node));
  const filteredData = filteredNodes.map(node => node.data);
  const easy = countByDifficultyFiltered(filteredData, 'Easy');
  const medium = countByDifficultyFiltered(filteredData, 'Medium');
  const hard = countByDifficultyFiltered(filteredData, 'Hard');
  document.getElementById('easy-count').textContent = `Easy: ${easy.solved}/${easy.total}`;
  document.getElementById('medium-count').textContent = `Medium: ${medium.solved}/${medium.total}`;
  document.getElementById('hard-count').textContent = `Hard: ${hard.solved}/${hard.total}`;
  const remaining = (Math.max(0, easy.total - easy.solved) * 0.5) +
                    (Math.max(0, medium.total - medium.solved) * 1) +
                    (Math.max(0, hard.total - hard.solved) * 2);
  document.getElementById('completion-time').textContent = `Est. completion time: ${Math.round(remaining)} hrs`;
}

// Helper: count difficulties in filtered data
function countByDifficultyFiltered(problems, difficulty) {
  const total = problems.filter(p => p.difficulty === difficulty).length;
  const solved = problems.filter(p => p.difficulty === difficulty && p.status).length;
  return { total, solved };
}

// Update difficulty counts for the current category (unfiltered)
function updateDifficultyCounts(category) {
  if (!problemDataByCategory[category]) return;
  const problems = problemDataByCategory[category];
  const easy = countByDifficulty(problems, 'Easy');
  const medium = countByDifficulty(problems, 'Medium');
  const hard = countByDifficulty(problems, 'Hard');
  document.getElementById('easy-count').textContent = `Easy: ${easy.solved}/${easy.total}`;
  document.getElementById('medium-count').textContent = `Medium: ${medium.solved}/${medium.total}`;
  document.getElementById('hard-count').textContent = `Hard: ${hard.solved}/${hard.total}`;
  const remaining = (Math.max(0, easy.total - easy.solved) * 0.5) +
                    (Math.max(0, medium.total - medium.solved) * 1) +
                    (Math.max(0, hard.total - hard.solved) * 2);
  document.getElementById('completion-time').textContent = `Est. completion time: ${Math.round(remaining)} hrs`;
}

// Helper: count difficulties in a set of problems
function countByDifficulty(problems, difficulty) {
  const total = problems.filter(p => p.difficulty === difficulty).length;
  const solved = problems.filter(p => p.difficulty === difficulty && p.status).length;
  return { total, solved };
}

// Update overall progress across categories (excluding "all")
function updateOverallProgress() {
  // Since we've already ensured uniqueness in the "all" category,
  // we can simply use that for our counts
  const total = problemDataByCategory.all.length;
  const solved = problemDataByCategory.all.filter(p => p.status).length;
  
  const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;
  const circumference = 2 * Math.PI * 15;
  const offset = circumference - (percentage / 100) * circumference;
  
  const progressCircle = document.getElementById('overall-progress');
  if (progressCircle) {
    progressCircle.style.strokeDasharray = circumference;
    progressCircle.style.strokeDashoffset = offset;
  }
  
  document.getElementById('overall-progress-text').textContent = `${percentage}% Completed`;
  
  // Update the nav progress for "all" category separately
  const allNavProgress = document.getElementById('all-nav-progress');
  if (allNavProgress) {
    allNavProgress.innerHTML = `
      <div class="progress-mini">
        <div class="progress-mini-bar" style="width:${percentage}%"></div>
      </div>
      ${solved}/${total}
    `;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  changeCategory('all');
  // Generate sidebar links dynamically
  const sidebarNav = document.querySelector('.sidebar-nav');
  sidebarNav.innerHTML = ''; // Clear existing static content
  
  // Create 'All Problems' link
  const allLi = createSidebarItem('all');
  sidebarNav.appendChild(allLi);
  
  // Create other categories (sorted)
  const categories = Object.keys(CATEGORIES_DATA);
  categories.forEach(cat => {
    const li = createSidebarItem(cat);
    sidebarNav.appendChild(li);
  });
  
  // Add Google auth event listeners
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  
  if (loginBtn) {
    loginBtn.addEventListener('click', signInWithGoogle);
  }
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', signOut);
  }
  
  // Load statuses and initialize
  loadProblemStatuses();
  
  // Initialize all category counters
  Object.keys(problemDataByCategory).forEach(cat => {
    updateCategoryCounter(cat);
  });
  updateOverallProgress();
  
  
  initializeGrid('all');
  changeCategory('all');
});

// Helper function to create sidebar items
function createSidebarItem(category) {
  const li = document.createElement('li');
  li.className = 'sidebar-nav-item';
  
  const link = document.createElement('a');
  link.href = 'javascript:void(0);';
  link.className = 'sidebar-nav-link';
  link.dataset.category = category;
  
  // Generate sanitized ID
  const sanitizedId = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  link.id = `${sanitizedId}-link`;
  
  link.innerHTML = `
    ${getCategoryTitle(category)}
    <span class="nav-progress" id="${sanitizedId}-nav-progress">
      <div class="progress-mini"><div class="progress-mini-bar" style="width:0%"></div></div>
      0/0
    </span>
  `;
  
  link.addEventListener('click', function(e) {
    changeCategory(e.currentTarget.dataset.category);
  });
  
  li.appendChild(link);
  return li;
}
