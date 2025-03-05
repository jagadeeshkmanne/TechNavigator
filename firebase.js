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
    loadProgressFromFirebase();
  } else {
    // User signed out
    currentUser = null;
    document.getElementById('auth-container').classList.remove('signed-in');
    // Fallback to localStorage when logged out
    loadProblemStatuses();
    changeCategory(currentCategory);
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
  if (!currentUser) return;
  
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
  } catch (error) {
    console.error("Error loading progress from Firebase:", error);
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
  "Arrays": {
    "tip": "Arrays are the most fundamental data structure. Focus on understanding basic operations like traversal, insertion, deletion, and in-place manipulation. Look for problems involving direct array access, traversal, and simple transformations without specialized algorithms.",
    "problems": [
      {
        "id": 1,
        "leetcode_id": 1920,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Build Array from Permutation",
        "leetcode": "https://leetcode.com/problems/build-array-from-permutation/",
        "requirements": "Basic array construction and indexing"
      },
      {
        "id": 2,
        "leetcode_id": 1929,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Concatenation of Array",
        "leetcode": "https://leetcode.com/problems/concatenation-of-array/",
        "requirements": "Basic array creation"
      },
      {
        "id": 3,
        "leetcode_id": 1480,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Running Sum of 1d Array",
        "leetcode": "https://leetcode.com/problems/running-sum-of-1d-array/",
        "requirements": "Simple array traversal and accumulation"
      },
      {
        "id": 4,
        "leetcode_id": 485,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Max Consecutive Ones",
        "leetcode": "https://leetcode.com/problems/max-consecutive-ones/",
        "requirements": "Basic array traversal and counting"
      },
      {
        "id": 5,
        "leetcode_id": 1431,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Kids With the Greatest Number of Candies",
        "leetcode": "https://leetcode.com/problems/kids-with-the-greatest-number-of-candies/",
        "requirements": "Simple array comparison and boolean array creation"
      },
      {
        "id": 6,
        "leetcode_id": 1295,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Find Numbers with Even Number of Digits",
        "leetcode": "https://leetcode.com/problems/find-numbers-with-even-number-of-digits/",
        "requirements": "Basic array traversal and element processing"
      },
      {
        "id": 7,
        "leetcode_id": 1089,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Duplicate Zeros",
        "leetcode": "https://leetcode.com/problems/duplicate-zeros/",
        "requirements": "In-place array modification"
      },
      {
        "id": 8,
        "leetcode_id": 66,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Plus One",
        "leetcode": "https://leetcode.com/problems/plus-one/",
        "requirements": "Array representation of numbers"
      },
      {
        "id": 9,
        "leetcode_id": 27,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Remove Element",
        "leetcode": "https://leetcode.com/problems/remove-element/",
        "requirements": "Basic in-place array element removal"
      },
      {
        "id": 10,
        "leetcode_id": 121,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Best Time to Buy and Sell Stock",
        "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
        "requirements": "Array traversal and tracking maximum difference"
      },
      {
        "id": 11,
        "leetcode_id": 1299,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Replace Elements with Greatest Element on Right Side",
        "leetcode": "https://leetcode.com/problems/replace-elements-with-greatest-element-on-right-side/",
        "requirements": "Array traversal and element replacement"
      },
      {
        "id": 12,
        "leetcode_id": 1346,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Check If N and Its Double Exist",
        "leetcode": "https://leetcode.com/problems/check-if-n-and-its-double-exist/",
        "requirements": "Array element checking"
      },
      {
        "id": 13,
        "leetcode_id": 941,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Valid Mountain Array",
        "leetcode": "https://leetcode.com/problems/valid-mountain-array/",
        "requirements": "Array traversal and pattern checking"
      },
      {
        "id": 14,
        "leetcode_id": 1470,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Shuffle the Array",
        "leetcode": "https://leetcode.com/problems/shuffle-the-array/",
        "requirements": "Array reorganization with specific pattern"
      },
      {
        "id": 15,
        "leetcode_id": 977,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Squares of a Sorted Array",
        "leetcode": "https://leetcode.com/problems/squares-of-a-sorted-array/",
        "requirements": "Basic array transformation"
      },
      {
        "id": 16,
        "leetcode_id": 414,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Third Maximum Number",
        "leetcode": "https://leetcode.com/problems/third-maximum-number/",
        "requirements": "Finding elements in array"
      },
      {
        "id": 17,
        "leetcode_id": 448,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Find All Numbers Disappeared in an Array",
        "leetcode": "https://leetcode.com/problems/find-all-numbers-disappeared-in-an-array/",
        "requirements": "Basic array traversal and element marking"
      },
      {
        "id": 18,
        "leetcode_id": 169,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Majority Element",
        "leetcode": "https://leetcode.com/problems/majority-element/",
        "requirements": "Basic array traversal and counting"
      },
      {
        "id": 19,
        "leetcode_id": 867,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Transpose Matrix",
        "leetcode": "https://leetcode.com/problems/transpose-matrix/",
        "requirements": "Basic 2D array manipulation"
      },
      {
        "id": 20,
        "leetcode_id": 1572,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Matrix Diagonal Sum",
        "leetcode": "https://leetcode.com/problems/matrix-diagonal-sum/",
        "requirements": "Simple 2D array traversal"
      },
      {
        "id": 21,
        "leetcode_id": 566,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Reshape the Matrix",
        "leetcode": "https://leetcode.com/problems/reshape-the-matrix/",
        "requirements": "2D array construction and manipulation"
      },
      {
        "id": 22,
        "leetcode_id": 766,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Toeplitz Matrix",
        "leetcode": "https://leetcode.com/problems/toeplitz-matrix/",
        "requirements": "2D array traversal and pattern checking"
      },
      {
        "id": 23,
        "leetcode_id": 832,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Flipping an Image",
        "leetcode": "https://leetcode.com/problems/flipping-an-image/",
        "requirements": "Basic 2D array manipulation"
      },
      {
        "id": 24,
        "leetcode_id": 1886,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Determine Whether Matrix Can Be Obtained By Rotation",
        "leetcode": "https://leetcode.com/problems/determine-whether-matrix-can-be-obtained-by-rotation/",
        "requirements": "2D array rotation and comparison"
      },
      {
        "id": 25,
        "leetcode_id": 1672,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Richest Customer Wealth",
        "leetcode": "https://leetcode.com/problems/richest-customer-wealth/",
        "requirements": "Simple 2D array traversal and computation"
      },
      {
        "id": 26,
        "leetcode_id": 36,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Valid Sudoku",
        "leetcode": "https://leetcode.com/problems/valid-sudoku/",
        "requirements": "2D array validation"
      },
      {
        "id": 27,
        "leetcode_id": 73,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Set Matrix Zeroes",
        "leetcode": "https://leetcode.com/problems/set-matrix-zeroes/",
        "requirements": "2D array in-place modification"
      },
      {
        "id": 28,
        "leetcode_id": 54,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Spiral Matrix",
        "leetcode": "https://leetcode.com/problems/spiral-matrix/",
        "requirements": "2D array traversal pattern"
      },
      {
        "id": 29,
        "leetcode_id": 48,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Rotate Image",
        "leetcode": "https://leetcode.com/problems/rotate-image/",
        "requirements": "2D array in-place rotation"
      },
      {
        "id": 30,
        "leetcode_id": 1275,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Find Winner on a Tic Tac Toe Game",
        "leetcode": "https://leetcode.com/problems/find-winner-on-a-tic-tac-toe-game/",
        "requirements": "2D array pattern checking"
      }
    ]
  },
  "Prefix Sum": {
    "tip": "Prefix sum is a technique where you precompute cumulative sums of array elements to enable O(1) range queries. It's ideal for problems involving subarray sums or finding ranges with specific properties. Look for problems asking about 'sum of subarray', 'range sum', or situations where you need to repeatedly calculate sums over different portions of an array.",
    "problems": [
      {
        "id": 31,
        "leetcode_id": 303,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Range Sum Query - Immutable",
        "leetcode": "https://leetcode.com/problems/range-sum-query-immutable/",
        "requirements": "Pure prefix sum for range queries"
      },
      {
        "id": 32,
        "leetcode_id": 1480,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Running Sum of 1d Array",
        "leetcode": "https://leetcode.com/problems/running-sum-of-1d-array/",
        "requirements": "Basic prefix sum calculation"
      },
      {
        "id": 33,
        "leetcode_id": 724,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Find Pivot Index",
        "leetcode": "https://leetcode.com/problems/find-pivot-index/",
        "requirements": "Prefix sum to find a balance point"
      },
      {
        "id": 34,
        "leetcode_id": 238,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Product of Array Except Self",
        "leetcode": "https://leetcode.com/problems/product-of-array-except-self/",
        "requirements": "Prefix and suffix products (multiplicative variant)"
      },
      {
        "id": 35,
        "leetcode_id": 1413,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Minimum Value to Get Positive Step by Step Sum",
        "leetcode": "https://leetcode.com/problems/minimum-value-to-get-positive-step-by-step-sum/",
        "requirements": "Prefix sum to find minimum starting value"
      },
      {
        "id": 36,
        "leetcode_id": 1732,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Find the Highest Altitude",
        "leetcode": "https://leetcode.com/problems/find-the-highest-altitude/",
        "requirements": "Simple prefix sum with maximum tracking"
      },
      {
        "id": 37,
        "leetcode_id": 2574,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Left and Right Sum Differences",
        "leetcode": "https://leetcode.com/problems/left-and-right-sum-differences/",
        "requirements": "Prefix and suffix sums for comparison"
      },
      {
        "id": 38,
        "leetcode_id": 2270,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Number of Ways to Split Array",
        "leetcode": "https://leetcode.com/problems/number-of-ways-to-split-array/",
        "requirements": "Prefix sum to find split points"
      },
      {
        "id": 39,
        "leetcode_id": 1588,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Sum of All Odd Length Subarrays",
        "leetcode": "https://leetcode.com/problems/sum-of-all-odd-length-subarrays/",
        "requirements": "Prefix sum for efficient subarray calculations"
      },
      {
        "id": 40,
        "leetcode_id": 304,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Range Sum Query 2D - Immutable",
        "leetcode": "https://leetcode.com/problems/range-sum-query-2d-immutable/",
        "requirements": "2D prefix sum for rectangle queries"
      },
      {
        "id": 41,
        "leetcode_id": 1314,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Matrix Block Sum",
        "leetcode": "https://leetcode.com/problems/matrix-block-sum/",
        "requirements": "2D prefix sum for block summation"
      },
      {
        "id": 42,
        "leetcode_id": 2132,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Stamping the Grid",
        "leetcode": "https://leetcode.com/problems/stamping-the-grid/",
        "requirements": "2D prefix sum for rectangular regions"
      },
      {
        "id": 43,
        "leetcode_id": 1894,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Find the Student that Will Replace the Chalk",
        "leetcode": "https://leetcode.com/problems/find-the-student-that-will-replace-the-chalk/",
        "requirements": "Prefix sum with modulo operation"
      },
      {
        "id": 44,
        "leetcode_id": 1423,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Points You Can Obtain from Cards",
        "leetcode": "https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/",
        "requirements": "Prefix sum from both ends"
      },
      {
        "id": 45,
        "leetcode_id": 2100,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Find Good Days to Rob the Bank",
        "leetcode": "https://leetcode.com/problems/find-good-days-to-rob-the-bank/",
        "requirements": "Prefix count of non-increasing and non-decreasing days"
      },
      {
        "id": 46,
        "leetcode_id": 1685,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Sum of Absolute Differences in a Sorted Array",
        "leetcode": "https://leetcode.com/problems/sum-of-absolute-differences-in-a-sorted-array/",
        "requirements": "Prefix sum for calculating absolute differences"
      },
      {
        "id": 47,
        "leetcode_id": 2256,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Minimum Average Difference",
        "leetcode": "https://leetcode.com/problems/minimum-average-difference/",
        "requirements": "Prefix sum to calculate averages efficiently"
      },
      {
        "id": 48,
        "leetcode_id": 848,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Shifting Letters",
        "leetcode": "https://leetcode.com/problems/shifting-letters/",
        "requirements": "Suffix sum for character shifting"
      },
      {
        "id": 49,
        "leetcode_id": 370,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Range Addition",
        "leetcode": "https://leetcode.com/problems/range-addition/",
        "requirements": "Prefix sum with difference array technique"
      },
      {
        "id": 50,
        "leetcode_id": 2017,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Grid Game",
        "leetcode": "https://leetcode.com/problems/grid-game/",
        "requirements": "Prefix sum on 2D grid to find optimal path"
      },
      {
        "id": 51,
        "leetcode_id": 1139,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Largest 1-Bordered Square",
        "leetcode": "https://leetcode.com/problems/largest-1-bordered-square/",
        "requirements": "2D prefix sum for border checking"
      },
      {
        "id": 52,
        "leetcode_id": 2281,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Sum of Total Strength of Wizards",
        "leetcode": "https://leetcode.com/problems/sum-of-total-strength-of-wizards/",
        "requirements": "Prefix sum of prefix sums"
      },
      {
        "id": 53,
        "leetcode_id": 1191,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "K-Concatenation Maximum Sum",
        "leetcode": "https://leetcode.com/problems/k-concatenation-maximum-sum/",
        "requirements": "Prefix sum with pattern recognition"
      },
      {
        "id": 54,
        "leetcode_id": 2381,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Shifting Letters II",
        "leetcode": "https://leetcode.com/problems/shifting-letters-ii/",
        "requirements": "Prefix sum with difference array technique"
      },
      {
        "id": 55,
        "leetcode_id": 1352,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Product of the Last K Numbers",
        "leetcode": "https://leetcode.com/problems/product-of-the-last-k-numbers/",
        "requirements": "Running product (multiplicative prefix sum)"
      },
      {
        "id": 56,
        "leetcode_id": 2559,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Count Vowel Strings in Ranges",
        "leetcode": "https://leetcode.com/problems/count-vowel-strings-in-ranges/",
        "requirements": "Prefix sum for range counting"
      },
      {
        "id": 57,
        "leetcode_id": 2485,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Find the Pivot Integer",
        "leetcode": "https://leetcode.com/problems/find-the-pivot-integer/",
        "requirements": "Prefix sum for finding pivot point"
      },
      {
        "id": 58,
        "leetcode_id": 528,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Random Pick with Weight",
        "leetcode": "https://leetcode.com/problems/random-pick-with-weight/",
        "requirements": "Prefix sum for weighted random selection"
      },
      {
        "id": 59,
        "leetcode_id": 2640,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Find the Score of All Prefixes of an Array",
        "leetcode": "https://leetcode.com/problems/find-the-score-of-all-prefixes-of-an-array/",
        "requirements": "Prefix sum of transformed elements"
      },
      {
        "id": 60,
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
    "problems": [
      {
        "id": 61,
        "leetcode_id": 1,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Two Sum",
        "leetcode": "https://leetcode.com/problems/two-sum/",
        "requirements": "Using hashmap to find complement elements"
      },
      {
        "id": 62,
        "leetcode_id": 217,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Contains Duplicate",
        "leetcode": "https://leetcode.com/problems/contains-duplicate/",
        "requirements": "Using hashset to track seen elements"
      },
      {
        "id": 63,
        "leetcode_id": 219,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Contains Duplicate II",
        "leetcode": "https://leetcode.com/problems/contains-duplicate-ii/",
        "requirements": "Hashmap with positional information"
      },
      {
        "id": 64,
        "leetcode_id": 242,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Valid Anagram",
        "leetcode": "https://leetcode.com/problems/valid-anagram/",
        "requirements": "Character frequency counting with hashmap"
      },
      {
        "id": 65,
        "leetcode_id": 387,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "First Unique Character in a String",
        "leetcode": "https://leetcode.com/problems/first-unique-character-in-a-string/",
        "requirements": "Character frequency counting with hashmap"
      },
      {
        "id": 66,
        "leetcode_id": 350,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Intersection of Two Arrays II",
        "leetcode": "https://leetcode.com/problems/intersection-of-two-arrays-ii/",
        "requirements": "Using hashmap to count elements in first array"
      },
      {
        "id": 67,
        "leetcode_id": 349,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Intersection of Two Arrays",
        "leetcode": "https://leetcode.com/problems/intersection-of-two-arrays/",
        "requirements": "Using hashset to find common elements"
      },
      {
        "id": 68,
        "leetcode_id": 560,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Subarray Sum Equals K",
        "leetcode": "https://leetcode.com/problems/subarray-sum-equals-k/",
        "requirements": "Using hashmap to track cumulative sums"
      },
      {
        "id": 69,
        "leetcode_id": 202,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Happy Number",
        "leetcode": "https://leetcode.com/problems/happy-number/",
        "requirements": "Using hashset to detect cycles"
      },
      {
        "id": 70,
        "leetcode_id": 454,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "4Sum II",
        "leetcode": "https://leetcode.com/problems/4sum-ii/",
        "requirements": "Using hashmap to store sum frequencies"
      },
      {
        "id": 71,
        "leetcode_id": 383,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Ransom Note",
        "leetcode": "https://leetcode.com/problems/ransom-note/",
        "requirements": "Character frequency counting with hashmap"
      },
      {
        "id": 72,
        "leetcode_id": 347,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Top K Frequent Elements",
        "leetcode": "https://leetcode.com/problems/top-k-frequent-elements/",
        "requirements": "Using hashmap for frequency counting"
      },
      {
        "id": 73,
        "leetcode_id": 13,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Roman to Integer",
        "leetcode": "https://leetcode.com/problems/roman-to-integer/",
        "requirements": "Using hashmap for value lookups"
      },
      {
        "id": 74,
        "leetcode_id": 205,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Isomorphic Strings",
        "leetcode": "https://leetcode.com/problems/isomorphic-strings/",
        "requirements": "Using hashmaps to track character mappings"
      },
      {
        "id": 75,
        "leetcode_id": 290,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Word Pattern",
        "leetcode": "https://leetcode.com/problems/word-pattern/",
        "requirements": "Using hashmaps for bijection mapping"
      },
      {
        "id": 76,
        "leetcode_id": 1160,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Find Words That Can Be Formed by Characters",
        "leetcode": "https://leetcode.com/problems/find-words-that-can-be-formed-by-characters/",
        "requirements": "Character frequency counting with hashmap"
      },
      {
        "id": 77,
        "leetcode_id": 359,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Logger Rate Limiter",
        "leetcode": "https://leetcode.com/problems/logger-rate-limiter/",
        "requirements": "Using hashmap to track timestamps"
      },
      {
        "id": 78,
        "leetcode_id": 299,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Bulls and Cows",
        "leetcode": "https://leetcode.com/problems/bulls-and-cows/",
        "requirements": "Using hashmap for frequency counting"
      },
      {
        "id": 79,
        "leetcode_id": 288,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Unique Word Abbreviation",
        "leetcode": "https://leetcode.com/problems/unique-word-abbreviation/",
        "requirements": "Using hashmap for abbreviation tracking"
      },
      {
        "id": 80,
        "leetcode_id": 677,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Map Sum Pairs",
        "leetcode": "https://leetcode.com/problems/map-sum-pairs/",
        "requirements": "Using hashmap for prefix tracking"
      },
      {
        "id": 81,
        "leetcode_id": 36,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Valid Sudoku",
        "leetcode": "https://leetcode.com/problems/valid-sudoku/",
        "requirements": "Using hashsets to validate uniqueness"
      },
      {
        "id": 82,
        "leetcode_id": 49,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Group Anagrams",
        "leetcode": "https://leetcode.com/problems/group-anagrams/",
        "requirements": "Using hashmap with custom key"
      },
      {
        "id": 83,
        "leetcode_id": 380,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Insert Delete GetRandom O(1)",
        "leetcode": "https://leetcode.com/problems/insert-delete-getrandom-o1/",
        "requirements": "Using hashmap with array for O(1) operations"
      },
      {
        "id": 84,
        "leetcode_id": 274,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "H-Index",
        "leetcode": "https://leetcode.com/problems/h-index/",
        "requirements": "Using hashmap for citation counting"
      },
      {
        "id": 85,
        "leetcode_id": 438,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Find All Anagrams in a String",
        "leetcode": "https://leetcode.com/problems/find-all-anagrams-in-a-string/",
        "requirements": "Character frequency counting with hashmap"
      },
      {
        "id": 86,
        "leetcode_id": 525,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Contiguous Array",
        "leetcode": "https://leetcode.com/problems/contiguous-array/",
        "requirements": "Using hashmap to track sum-to-index mapping"
      },
      {
        "id": 87,
        "leetcode_id": 1010,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Pairs of Songs With Total Durations Divisible by 60",
        "leetcode": "https://leetcode.com/problems/pairs-of-songs-with-total-durations-divisible-by-60/",
        "requirements": "Using hashmap to count remainders"
      },
      {
        "id": 88,
        "leetcode_id": 953,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Verifying an Alien Dictionary",
        "leetcode": "https://leetcode.com/problems/verifying-an-alien-dictionary/",
        "requirements": "Using hashmap for custom ordering"
      },
      {
        "id": 89,
        "leetcode_id": 811,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Subdomain Visit Count",
        "leetcode": "https://leetcode.com/problems/subdomain-visit-count/",
        "requirements": "Using hashmap for domain counting"
      },
      {
        "id": 90,
        "leetcode_id": 705,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Design HashSet",
        "leetcode": "https://leetcode.com/problems/design-hashset/",
        "requirements": "Implementing a HashSet from scratch"
      }
    ]
  },
  "Two Pointers": {
    "tip": "The two pointers technique involves using two pointers to iterate through a data structure (typically an array). This approach is useful for finding pairs, subarrays, or elements that satisfy specific conditions with optimal time complexity. Look for problems involving searching for pairs, subsequences, or where you need to process arrays from both ends or at different speeds.",
    "problems": [
      {
        "id": 91,
        "leetcode_id": 26,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Remove Duplicates from Sorted Array",
        "leetcode": "https://leetcode.com/problems/remove-duplicates-from-sorted-array/",
        "requirements": "Two pointers for in-place array modification"
      },
      {
        "id": 92,
        "leetcode_id": 283,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Move Zeroes",
        "leetcode": "https://leetcode.com/problems/move-zeroes/",
        "requirements": "Two pointers for in-place array reordering"
      },
      {
        "id": 93,
        "leetcode_id": 344,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Reverse String",
        "leetcode": "https://leetcode.com/problems/reverse-string/",
        "requirements": "Two pointers from opposite ends"
      },
      {
        "id": 94,
        "leetcode_id": 27,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Remove Element",
        "leetcode": "https://leetcode.com/problems/remove-element/",
        "requirements": "Two pointers for in-place element removal"
      },
      {
        "id": 95,
        "leetcode_id": 977,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Squares of a Sorted Array",
        "leetcode": "https://leetcode.com/problems/squares-of-a-sorted-array/",
        "requirements": "Two pointers from opposite ends"
      },
      {
        "id": 96,
        "leetcode_id": 125,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Valid Palindrome",
        "leetcode": "https://leetcode.com/problems/valid-palindrome/",
        "requirements": "Two pointers from opposite ends"
      },
      {
        "id": 97,
        "leetcode_id": 167,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Two Sum II - Input Array Is Sorted",
        "leetcode": "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/",
        "requirements": "Two pointers from opposite ends"
      },
      {
        "id": 98,
        "leetcode_id": 88,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Merge Sorted Array",
        "leetcode": "https://leetcode.com/problems/merge-sorted-array/",
        "requirements": "Two pointers from the end"
      },
      {
        "id": 99,
        "leetcode_id": 15,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "3Sum",
        "leetcode": "https://leetcode.com/problems/3sum/",
        "requirements": "Two pointers with sorting"
      },
      {
        "id": 100,
        "leetcode_id": 11,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Container With Most Water",
        "leetcode": "https://leetcode.com/problems/container-with-most-water/",
        "requirements": "Two pointers from opposite ends"
      },
      {
        "id": 101,
        "leetcode_id": 942,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "DI String Match",
        "leetcode": "https://leetcode.com/problems/di-string-match/",
        "requirements": "Two pointers from opposite ends"
      },
      {
        "id": 102,
        "leetcode_id": 680,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Valid Palindrome II",
        "leetcode": "https://leetcode.com/problems/valid-palindrome-ii/",
        "requirements": "Two pointers with one-character deletion"
      },
      {
        "id": 103,
        "leetcode_id": 905,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Sort Array By Parity",
        "leetcode": "https://leetcode.com/problems/sort-array-by-parity/",
        "requirements": "Two pointers for in-place reordering"
      },
      {
        "id": 104,
        "leetcode_id": 844,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Backspace String Compare",
        "leetcode": "https://leetcode.com/problems/backspace-string-compare/",
        "requirements": "Two pointers from the end"
      },
      {
        "id": 105,
        "leetcode_id": 16,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "3Sum Closest",
        "leetcode": "https://leetcode.com/problems/3sum-closest/",
        "requirements": "Two pointers with sorting"
      },
      {
        "id": 106,
        "leetcode_id": 80,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Remove Duplicates from Sorted Array II",
        "leetcode": "https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/",
        "requirements": "Two pointers with counter"
      },
      {
        "id": 107,
        "leetcode_id": 18,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "4Sum",
        "leetcode": "https://leetcode.com/problems/4sum/",
        "requirements": "Two pointers with sorting"
      },
      {
        "id": 108,
        "leetcode_id": 75,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Sort Colors",
        "leetcode": "https://leetcode.com/problems/sort-colors/",
        "requirements": "Three pointers (Dutch national flag algorithm)"
      },
      {
        "id": 109,
        "leetcode_id": 821,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Shortest Distance to a Character",
        "leetcode": "https://leetcode.com/problems/shortest-distance-to-a-character/",
        "requirements": "Two passes with directional pointers"
      },
      {
        "id": 110,
        "leetcode_id": 581,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Shortest Unsorted Continuous Subarray",
        "leetcode": "https://leetcode.com/problems/shortest-unsorted-continuous-subarray/",
        "requirements": "Two pointers from opposite ends"
      },
      {
        "id": 111,
        "leetcode_id": 1099,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Two Sum Less Than K",
        "leetcode": "https://leetcode.com/problems/two-sum-less-than-k/",
        "requirements": "Two pointers with sorting"
      },
      {
        "id": 112,
        "leetcode_id": 443,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "String Compression",
        "leetcode": "https://leetcode.com/problems/string-compression/",
        "requirements": "Two pointers for in-place compression"
      },
      {
        "id": 113,
        "leetcode_id": 933,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Number of Recent Calls",
        "leetcode": "https://leetcode.com/problems/number-of-recent-calls/",
        "requirements": "Two pointers for sliding window tracking"
      },
      {
        "id": 114,
        "leetcode_id": 42,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "Trapping Rain Water",
        "leetcode": "https://leetcode.com/problems/trapping-rain-water/",
        "requirements": "Two pointers from opposite ends"
      },
      {
        "id": 115,
        "leetcode_id": 392,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Is Subsequence",
        "leetcode": "https://leetcode.com/problems/is-subsequence/",
        "requirements": "Two pointers for sequence matching"
      },
      {
        "id": 116,
        "leetcode_id": 1868,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Product of Two Run-Length Encoded Arrays",
        "leetcode": "https://leetcode.com/problems/product-of-two-run-length-encoded-arrays/",
        "requirements": "Two pointers for parallel traversal"
      },
      {
        "id": 117,
        "leetcode_id": 1750,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Minimum Length of String After Deleting Similar Ends",
        "leetcode": "https://leetcode.com/problems/minimum-length-of-string-after-deleting-similar-ends/",
        "requirements": "Two pointers from opposite ends"
      },
      {
        "id": 118,
        "leetcode_id": 723,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Candy Crush",
        "leetcode": "https://leetcode.com/problems/candy-crush/",
        "requirements": "Two pointers for vertical crush"
      },
      {
        "id": 119,
        "leetcode_id": 345,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Reverse Vowels of a String",
        "leetcode": "https://leetcode.com/problems/reverse-vowels-of-a-string/",
        "requirements": "Two pointers from opposite ends with condition"
      },
      {
        "id": 120,
        "leetcode_id": 349,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Intersection of Two Arrays",
        "leetcode": "https://leetcode.com/problems/intersection-of-two-arrays/",
        "requirements": "Two pointers with sorting (alternative to hashset approach)"
      }
    ]
  },
  "Sliding Window": {
    "tip": "The sliding window technique is used to perform operations on a dynamic contiguous sequence of elements, typically an array or string. It's ideal for problems involving subarrays or substrings of variable or fixed length, and often reduces time complexity from O(n²) to O(n). Look for problems asking about 'consecutive elements', 'subarray/substring with condition', or problems where you need to find the longest/shortest/optimal segment that satisfies certain criteria.",
    "problems": [
      {
        "id": 121,
        "leetcode_id": 643,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Maximum Average Subarray I",
        "leetcode": "https://leetcode.com/problems/maximum-average-subarray-i/",
        "requirements": "Fixed-size sliding window"
      },
      {
        "id": 122,
        "leetcode_id": 1343,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Number of Sub-arrays of Size K and Average Greater than or Equal to Threshold",
        "leetcode": "https://leetcode.com/problems/number-of-sub-arrays-of-size-k-and-average-greater-than-or-equal-to-threshold/",
        "requirements": "Fixed-size sliding window with threshold"
      },
      {
        "id": 123,
        "leetcode_id": 3,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Longest Substring Without Repeating Characters",
        "leetcode": "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
        "requirements": "Variable-size sliding window with hashset"
      },
      {
        "id": 124,
        "leetcode_id": 209,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Minimum Size Subarray Sum",
        "leetcode": "https://leetcode.com/problems/minimum-size-subarray-sum/",
        "requirements": "Variable-size sliding window with sum tracking"
      },
      {
        "id": 125,
        "leetcode_id": 1763,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Longest Nice Substring",
        "leetcode": "https://leetcode.com/problems/longest-nice-substring/",
        "requirements": "Sliding window with character tracking"
      },
      {
        "id": 126,
        "leetcode_id": 1984,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Minimum Difference Between Highest and Lowest of K Scores",
        "leetcode": "https://leetcode.com/problems/minimum-difference-between-highest-and-lowest-of-k-scores/",
        "requirements": "Fixed-size sliding window with sorting"
      },
      {
        "id": 127,
        "leetcode_id": 1876,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Substrings of Size Three with Distinct Characters",
        "leetcode": "https://leetcode.com/problems/substrings-of-size-three-with-distinct-characters/",
        "requirements": "Fixed-size sliding window with character tracking"
      },
      {
        "id": 128,
        "leetcode_id": 1456,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Number of Vowels in a Substring of Given Length",
        "leetcode": "https://leetcode.com/problems/maximum-number-of-vowels-in-a-substring-of-given-length/",
        "requirements": "Fixed-size sliding window with vowel counting"
      },
      {
        "id": 129,
        "leetcode_id": 567,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Permutation in String",
        "leetcode": "https://leetcode.com/problems/permutation-in-string/",
        "requirements": "Fixed-size sliding window with character frequency"
      },
      {
        "id": 130,
        "leetcode_id": 1438,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit",
        "leetcode": "https://leetcode.com/problems/longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit/",
        "requirements": "Variable-size sliding window with min/max tracking"
      },
      {
        "id": 131,
        "leetcode_id": 438,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Find All Anagrams in a String",
        "leetcode": "https://leetcode.com/problems/find-all-anagrams-in-a-string/",
        "requirements": "Fixed-size sliding window with character frequency"
      },
      {
        "id": 132,
        "leetcode_id": 76,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "Minimum Window Substring",
        "leetcode": "https://leetcode.com/problems/minimum-window-substring/",
        "requirements": "Variable-size sliding window with character frequency"
      },
      {
        "id": 133,
        "leetcode_id": 1004,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Max Consecutive Ones III",
        "leetcode": "https://leetcode.com/problems/max-consecutive-ones-iii/",
        "requirements": "Variable-size sliding window with flip counting"
      },
      {
        "id": 134,
        "leetcode_id": 1423,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Points You Can Obtain from Cards",
        "leetcode": "https://leetcode.com/problems/maximum-points-you-can-obtain-from-cards/",
        "requirements": "Sliding window from both ends"
      },
      {
        "id": 135,
        "leetcode_id": 424,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Longest Repeating Character Replacement",
        "leetcode": "https://leetcode.com/problems/longest-repeating-character-replacement/",
        "requirements": "Variable-size sliding window with character replacement"
      },
      {
        "id": 136,
        "leetcode_id": 1208,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Get Equal Substrings Within Budget",
        "leetcode": "https://leetcode.com/problems/get-equal-substrings-within-budget/",
        "requirements": "Variable-size sliding window with cost budget"
      },
      {
        "id": 137,
        "leetcode_id": 1695,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Erasure Value",
        "leetcode": "https://leetcode.com/problems/maximum-erasure-value/",
        "requirements": "Variable-size sliding window with unique elements"
      },
      {
        "id": 138,
        "leetcode_id": 1100,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Find K-Length Substrings With No Repeated Characters",
        "leetcode": "https://leetcode.com/problems/find-k-length-substrings-with-no-repeated-characters/",
        "requirements": "Fixed-size sliding window with character tracking"
      },
      {
        "id": 139,
        "leetcode_id": 1493,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Longest Subarray of 1's After Deleting One Element",
        "leetcode": "https://leetcode.com/problems/longest-subarray-of-1s-after-deleting-one-element/",
        "requirements": "Variable-size sliding window with one deletion"
      },
      {
        "id": 140,
        "leetcode_id": 1052,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Grumpy Bookstore Owner",
        "leetcode": "https://leetcode.com/problems/grumpy-bookstore-owner/",
        "requirements": "Fixed-size sliding window with technique application"
      },
      {
        "id": 141,
        "leetcode_id": 1234,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Replace the Substring for Balanced String",
        "leetcode": "https://leetcode.com/problems/replace-the-substring-for-balanced-string/",
        "requirements": "Variable-size sliding window for balanced characters"
      },
      {
        "id": 142,
        "leetcode_id": 2024,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximize the Confusion of an Exam",
        "leetcode": "https://leetcode.com/problems/maximize-the-confusion-of-an-exam/",
        "requirements": "Variable-size sliding window with character flipping"
      },
      {
        "id": 143,
        "leetcode_id": 1297,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Number of Occurrences of a Substring",
        "leetcode": "https://leetcode.com/problems/maximum-number-of-occurrences-of-a-substring/",
        "requirements": "Variable-size sliding window with frequency counting"
      },
      {
        "id": 144,
        "leetcode_id": 1838,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Frequency of the Most Frequent Element",
        "leetcode": "https://leetcode.com/problems/frequency-of-the-most-frequent-element/",
        "requirements": "Variable-size sliding window with sorting"
      },
      {
        "id": 145,
        "leetcode_id": 159,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Longest Substring with At Most Two Distinct Characters",
        "leetcode": "https://leetcode.com/problems/longest-substring-with-at-most-two-distinct-characters/",
        "requirements": "Variable-size sliding window with character count limit"
      },
      {
        "id": 146,
        "leetcode_id": 340,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Longest Substring with At Most K Distinct Characters",
        "leetcode": "https://leetcode.com/problems/longest-substring-with-at-most-k-distinct-characters/",
        "requirements": "Variable-size sliding window with character count limit"
      },
      {
        "id": 147,
        "leetcode_id": 30,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Substring with Concatenation of All Words",
        "leetcode": "https://leetcode.com/problems/substring-with-concatenation-of-all-words/",
        "requirements": "Fixed-size sliding window with word frequency"
      },
      {
        "id": 148,
        "leetcode_id": 1658,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Minimum Operations to Reduce X to Zero",
        "leetcode": "https://leetcode.com/problems/minimum-operations-to-reduce-x-to-zero/",
        "requirements": "Sliding window to find maximum subarray with target sum"
      },
      {
        "id": 149,
        "leetcode_id": 1248,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Count Number of Nice Subarrays",
        "leetcode": "https://leetcode.com/problems/count-number-of-nice-subarrays/",
        "requirements": "Sliding window to count subarrays with exact K odd numbers"
      },
      {
        "id": 150,
        "leetcode_id": 992,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Subarrays with K Different Integers",
        "leetcode": "https://leetcode.com/problems/subarrays-with-k-different-integers/",
        "requirements": "Sliding window with exact K distinct integers"
      }
    ]
  },
  "Binary Search": {
    "tip": "Binary search is an efficient algorithm for finding a target value in a sorted array, reducing time complexity from O(n) to O(log n). It's also applicable to problems involving monotonic functions, finding minimum/maximum values with certain properties, or determining exact/approximate positions. Look for problems with sorted arrays, monotonic conditions, or where you can establish a clear search space with left and right boundaries.",
    "problems": [
      {
        "id": 151,
        "leetcode_id": 704,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Binary Search",
        "leetcode": "https://leetcode.com/problems/binary-search/",
        "requirements": "Classic binary search in a sorted array"
      },
      {
        "id": 152,
        "leetcode_id": 35,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Search Insert Position",
        "leetcode": "https://leetcode.com/problems/search-insert-position/",
        "requirements": "Binary search to find insertion point"
      },
      {
        "id": 153,
        "leetcode_id": 744,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Find Smallest Letter Greater Than Target",
        "leetcode": "https://leetcode.com/problems/find-smallest-letter-greater-than-target/",
        "requirements": "Binary search with wrap-around condition"
      },
      {
        "id": 154,
        "leetcode_id": 374,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Guess Number Higher or Lower",
        "leetcode": "https://leetcode.com/problems/guess-number-higher-or-lower/",
        "requirements": "Binary search with API calls"
      },
      {
        "id": 155,
        "leetcode_id": 278,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "First Bad Version",
        "leetcode": "https://leetcode.com/problems/first-bad-version/",
        "requirements": "Binary search to find first occurrence"
      },
      {
        "id": 156,
        "leetcode_id": 69,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Sqrt(x)",
        "leetcode": "https://leetcode.com/problems/sqrtx/",
        "requirements": "Binary search for numerical computation"
      },
      {
        "id": 157,
        "leetcode_id": 441,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Arranging Coins",
        "leetcode": "https://leetcode.com/problems/arranging-coins/",
        "requirements": "Binary search with mathematical function"
      },
      {
        "id": 158,
        "leetcode_id": 33,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Search in Rotated Sorted Array",
        "leetcode": "https://leetcode.com/problems/search-in-rotated-sorted-array/",
        "requirements": "Binary search in rotated sorted array"
      },
      {
        "id": 159,
        "leetcode_id": 34,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Find First and Last Position of Element in Sorted Array",
        "leetcode": "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/",
        "requirements": "Binary search for range bounds"
      },
      {
        "id": 160,
        "leetcode_id": 74,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Search a 2D Matrix",
        "leetcode": "https://leetcode.com/problems/search-a-2d-matrix/",
        "requirements": "Binary search on 2D matrix"
      },
      {
        "id": 161,
        "leetcode_id": 162,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Find Peak Element",
        "leetcode": "https://leetcode.com/problems/find-peak-element/",
        "requirements": "Binary search in unsorted array with condition"
      },
      {
        "id": 162,
        "leetcode_id": 153,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Find Minimum in Rotated Sorted Array",
        "leetcode": "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/",
        "requirements": "Binary search in rotated sorted array"
      },
      {
        "id": 163,
        "leetcode_id": 540,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Single Element in a Sorted Array",
        "leetcode": "https://leetcode.com/problems/single-element-in-a-sorted-array/",
        "requirements": "Binary search with parity check"
      },
      {
        "id": 164,
        "leetcode_id": 875,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Koko Eating Bananas",
        "leetcode": "https://leetcode.com/problems/koko-eating-bananas/",
        "requirements": "Binary search on answer space"
      },
      {
        "id": 165,
        "leetcode_id": 1011,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Capacity To Ship Packages Within D Days",
        "leetcode": "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/",
        "requirements": "Binary search on answer space"
      },
      {
        "id": 166,
        "leetcode_id": 1283,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Find the Smallest Divisor Given a Threshold",
        "leetcode": "https://leetcode.com/problems/find-the-smallest-divisor-given-a-threshold/",
        "requirements": "Binary search with divisibility check"
      },
      {
        "id": 167,
        "leetcode_id": 1482,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Minimum Number of Days to Make m Bouquets",
        "leetcode": "https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/",
        "requirements": "Binary search with feasibility check"
      },
      {
        "id": 168,
        "leetcode_id": 81,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Search in Rotated Sorted Array II",
        "leetcode": "https://leetcode.com/problems/search-in-rotated-sorted-array-ii/",
        "requirements": "Binary search in rotated sorted array with duplicates"
      },
      {
        "id": 169,
        "leetcode_id": 528,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Random Pick with Weight",
        "leetcode": "https://leetcode.com/problems/random-pick-with-weight/",
        "requirements": "Binary search on prefix sum for weighted random"
      },
      {
        "id": 170,
        "leetcode_id": 1300,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Sum of Mutated Array Closest to Target",
        "leetcode": "https://leetcode.com/problems/sum-of-mutated-array-closest-to-target/",
        "requirements": "Binary search with array sum calculation"
      },
      {
        "id": 171,
        "leetcode_id": 436,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Find Right Interval",
        "leetcode": "https://leetcode.com/problems/find-right-interval/",
        "requirements": "Binary search after sorting intervals"
      },
      {
        "id": 172,
        "leetcode_id": 911,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Online Election",
        "leetcode": "https://leetcode.com/problems/online-election/",
        "requirements": "Binary search on timestamped votes"
      },
      {
        "id": 173,
        "leetcode_id": 1102,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Path With Maximum Minimum Value",
        "leetcode": "https://leetcode.com/problems/path-with-maximum-minimum-value/",
        "requirements": "Binary search with graph traversal"
      },
      {
        "id": 174,
        "leetcode_id": 1631,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Path With Minimum Effort",
        "leetcode": "https://leetcode.com/problems/path-with-minimum-effort/",
        "requirements": "Binary search with BFS/DFS for path finding"
      },
      {
        "id": 175,
        "leetcode_id": 240,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Search a 2D Matrix II",
        "leetcode": "https://leetcode.com/problems/search-a-2d-matrix-ii/",
        "requirements": "Binary search in partially sorted 2D matrix"
      },
      {
        "id": 176,
        "leetcode_id": 378,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Kth Smallest Element in a Sorted Matrix",
        "leetcode": "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/",
        "requirements": "Binary search with counting elements"
      },
      {
        "id": 177,
        "leetcode_id": 4,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "Median of Two Sorted Arrays",
        "leetcode": "https://leetcode.com/problems/median-of-two-sorted-arrays/",
        "requirements": "Binary search on smaller array to find partition point"
      },
      {
        "id": 178,
        "leetcode_id": 1044,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Longest Duplicate Substring",
        "leetcode": "https://leetcode.com/problems/longest-duplicate-substring/",
        "requirements": "Binary search with Rabin-Karp string matching"
      },
      {
        "id": 179,
        "leetcode_id": 668,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Kth Smallest Number in Multiplication Table",
        "leetcode": "https://leetcode.com/problems/kth-smallest-number-in-multiplication-table/",
        "requirements": "Binary search with counting elements"
      },
      {
        "id": 180,
        "leetcode_id": 1898,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Number of Removable Characters",
        "leetcode": "https://leetcode.com/problems/maximum-number-of-removable-characters/",
        "requirements": "Binary search with string operations"
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
        "id": 191,
        "leetcode_id": 867,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Transpose Matrix",
        "leetcode": "https://leetcode.com/problems/transpose-matrix/",
        "requirements": "Basic matrix transformation"
      },
      {
        "id": 192,
        "leetcode_id": 832,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Flipping an Image",
        "leetcode": "https://leetcode.com/problems/flipping-an-image/",
        "requirements": "Matrix manipulation row by row"
      },
      {
        "id": 193,
        "leetcode_id": 1572,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Matrix Diagonal Sum",
        "leetcode": "https://leetcode.com/problems/matrix-diagonal-sum/",
        "requirements": "Diagonal traversal pattern"
      },
      {
        "id": 194,
        "leetcode_id": 566,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Reshape the Matrix",
        "leetcode": "https://leetcode.com/problems/reshape-the-matrix/",
        "requirements": "Sequential traversal and reshaping"
      },
      {
        "id": 195,
        "leetcode_id": 463,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Island Perimeter",
        "leetcode": "https://leetcode.com/problems/island-perimeter/",
        "requirements": "Grid traversal with adjacent cell checking"
      },
      {
        "id": 196,
        "leetcode_id": 1886,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Determine Whether Matrix Can Be Obtained By Rotation",
        "leetcode": "https://leetcode.com/problems/determine-whether-matrix-can-be-obtained-by-rotation/",
        "requirements": "Matrix rotation and comparison"
      },
      {
        "id": 197,
        "leetcode_id": 48,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Rotate Image",
        "leetcode": "https://leetcode.com/problems/rotate-image/",
        "requirements": "In-place matrix rotation"
      },
      {
        "id": 198,
        "leetcode_id": 54,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Spiral Matrix",
        "leetcode": "https://leetcode.com/problems/spiral-matrix/",
        "requirements": "Spiral traversal pattern"
      },
      {
        "id": 199,
        "leetcode_id": 59,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Spiral Matrix II",
        "leetcode": "https://leetcode.com/problems/spiral-matrix-ii/",
        "requirements": "Spiral filling pattern"
      },
      {
        "id": 200,
        "leetcode_id": 73,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Set Matrix Zeroes",
        "leetcode": "https://leetcode.com/problems/set-matrix-zeroes/",
        "requirements": "Matrix modification with constraints"
      },
      {
        "id": 201,
        "leetcode_id": 36,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Valid Sudoku",
        "leetcode": "https://leetcode.com/problems/valid-sudoku/",
        "requirements": "Grid validation with hash sets"
      },
      {
        "id": 202,
        "leetcode_id": 2022,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Convert 1D Array Into 2D Array",
        "leetcode": "https://leetcode.com/problems/convert-1d-array-into-2d-array/",
        "requirements": "Array to matrix conversion"
      },
      {
        "id": 203,
        "leetcode_id": 240,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Search a 2D Matrix II",
        "leetcode": "https://leetcode.com/problems/search-a-2d-matrix-ii/",
        "requirements": "Efficient matrix searching"
      },
      {
        "id": 204,
        "leetcode_id": 74,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Search a 2D Matrix",
        "leetcode": "https://leetcode.com/problems/search-a-2d-matrix/",
        "requirements": "Binary search in matrix"
      },
      {
        "id": 205,
        "leetcode_id": 311,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Sparse Matrix Multiplication",
        "leetcode": "https://leetcode.com/problems/sparse-matrix-multiplication/",
        "requirements": "Efficient matrix operations"
      },
      {
        "id": 206,
        "leetcode_id": 531,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Lonely Pixel I",
        "leetcode": "https://leetcode.com/problems/lonely-pixel-i/",
        "requirements": "Matrix element counting"
      },
      {
        "id": 207,
        "leetcode_id": 289,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Game of Life",
        "leetcode": "https://leetcode.com/problems/game-of-life/",
        "requirements": "In-place cell state updates"
      },
      {
        "id": 208,
        "leetcode_id": 378,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Kth Smallest Element in a Sorted Matrix",
        "leetcode": "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/",
        "requirements": "Matrix element selection"
      },
      {
        "id": 209,
        "leetcode_id": 766,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Toeplitz Matrix",
        "leetcode": "https://leetcode.com/problems/toeplitz-matrix/",
        "requirements": "Diagonal pattern verification"
      },
      {
        "id": 210,
        "leetcode_id": 661,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Image Smoother",
        "leetcode": "https://leetcode.com/problems/image-smoother/",
        "requirements": "Matrix traversal with neighbor averaging"
      },
      {
        "id": 211,
        "leetcode_id": 2545,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Sort the Students by Their Kth Score",
        "leetcode": "https://leetcode.com/problems/sort-the-students-by-their-kth-score/",
        "requirements": "Matrix sorting by column values"
      },
      {
        "id": 212,
        "leetcode_id": 1672,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Richest Customer Wealth",
        "leetcode": "https://leetcode.com/problems/richest-customer-wealth/",
        "requirements": "Row-wise sum calculation"
      },
      {
        "id": 213,
        "leetcode_id": 1275,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Find Winner on a Tic Tac Toe Game",
        "leetcode": "https://leetcode.com/problems/find-winner-on-a-tic-tac-toe-game/",
        "requirements": "Grid pattern checking"
      },
      {
        "id": 214,
        "leetcode_id": 2373,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Largest Local Values in a Matrix",
        "leetcode": "https://leetcode.com/problems/largest-local-values-in-a-matrix/",
        "requirements": "Window traversal in matrix"
      },
      {
        "id": 215,
        "leetcode_id": 1329,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Sort the Matrix Diagonally",
        "leetcode": "https://leetcode.com/problems/sort-the-matrix-diagonally/",
        "requirements": "Diagonal traversal and sorting"
      },
      {
        "id": 216,
        "leetcode_id": 2482,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Difference Between Ones and Zeros in Row and Column",
        "leetcode": "https://leetcode.com/problems/difference-between-ones-and-zeros-in-row-and-column/",
        "requirements": "Row and column counting"
      },
      {
        "id": 217,
        "leetcode_id": 1292,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Side Length of a Square with Sum Less than or Equal to Threshold",
        "leetcode": "https://leetcode.com/problems/maximum-side-length-of-a-square-with-sum-less-than-or-equal-to-threshold/",
        "requirements": "Matrix prefix sum with binary search"
      },
      {
        "id": 218,
        "leetcode_id": 1138,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Alphabet Board Path",
        "leetcode": "https://leetcode.com/problems/alphabet-board-path/",
        "requirements": "Grid navigation with boundaries"
      },
      {
        "id": 219,
        "leetcode_id": 1351,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Count Negative Numbers in a Sorted Matrix",
        "leetcode": "https://leetcode.com/problems/count-negative-numbers-in-a-sorted-matrix/",
        "requirements": "Efficient matrix traversal"
      },
      {
        "id": 220,
        "leetcode_id": 1337,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "The K Weakest Rows in a Matrix",
        "leetcode": "https://leetcode.com/problems/the-k-weakest-rows-in-a-matrix/",
        "requirements": "Row-wise traversal with counting"
      }
    ]
  },
  "Stacks & Queues": {
    "tip": "Stacks (LIFO - Last In, First Out) and Queues (FIFO - First In, First Out) are fundamental data structures for solving problems involving order-sensitive operations. Stacks excel at problems involving matched pairs, recursion simulation, and reversal. Queues are ideal for breadth-first search, level order traversal, and maintaining processing order. Look for problems involving parentheses matching, expression evaluation, or where the most recent or oldest element needs special handling.",
    "problems": [
      {
        "id": 221,
        "leetcode_id": 20,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Valid Parentheses",
        "leetcode": "https://leetcode.com/problems/valid-parentheses/",
        "requirements": "Check valid nested parentheses using stack"
      },
      {
        "id": 222,
        "leetcode_id": 155,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Min Stack",
        "leetcode": "https://leetcode.com/problems/min-stack/",
        "requirements": "Stack with constant time minimum element retrieval"
      },
      {
        "id": 223,
        "leetcode_id": 232,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Implement Queue using Stacks",
        "leetcode": "https://leetcode.com/problems/implement-queue-using-stacks/",
        "requirements": "Queue implementation using only stacks"
      },
      {
        "id": 224,
        "leetcode_id": 225,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Implement Stack using Queues",
        "leetcode": "https://leetcode.com/problems/implement-stack-using-queues/",
        "requirements": "Stack implementation using only queues"
      },
      {
        "id": 225,
        "leetcode_id": 394,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Decode String",
        "leetcode": "https://leetcode.com/problems/decode-string/",
        "requirements": "Decoding nested encoded strings using stack"
      },
      {
        "id": 226,
        "leetcode_id": 150,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Evaluate Reverse Polish Notation",
        "leetcode": "https://leetcode.com/problems/evaluate-reverse-polish-notation/",
        "requirements": "Evaluate postfix expression using stack"
      },
      {
        "id": 227,
        "leetcode_id": 71,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Simplify Path",
        "leetcode": "https://leetcode.com/problems/simplify-path/",
        "requirements": "Simplify Unix-style file path using stack"
      },
      {
        "id": 228,
        "leetcode_id": 739,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Daily Temperatures",
        "leetcode": "https://leetcode.com/problems/daily-temperatures/",
        "requirements": "Find next warmer temperature using stack"
      },
      {
        "id": 229,
        "leetcode_id": 496,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Next Greater Element I",
        "leetcode": "https://leetcode.com/problems/next-greater-element-i/",
        "requirements": "Find next greater element using stack"
      },
      {
        "id": 230,
        "leetcode_id": 503,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Next Greater Element II",
        "leetcode": "https://leetcode.com/problems/next-greater-element-ii/",
        "requirements": "Find next greater element in circular array using stack"
      },
      {
        "id": 231,
        "leetcode_id": 1047,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Remove All Adjacent Duplicates In String",
        "leetcode": "https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/",
        "requirements": "Remove adjacent duplicate characters using stack"
      },
      {
        "id": 232,
        "leetcode_id": 946,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Validate Stack Sequences",
        "leetcode": "https://leetcode.com/problems/validate-stack-sequences/",
        "requirements": "Validate push and pop sequences of a stack"
      },
      {
        "id": 233,
        "leetcode_id": 682,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Baseball Game",
        "leetcode": "https://leetcode.com/problems/baseball-game/",
        "requirements": "Calculate baseball scores using stack"
      },
      {
        "id": 234,
        "leetcode_id": 844,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Backspace String Compare",
        "leetcode": "https://leetcode.com/problems/backspace-string-compare/",
        "requirements": "Compare strings with backspace characters using stack"
      },
      {
        "id": 235,
        "leetcode_id": 227,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Basic Calculator II",
        "leetcode": "https://leetcode.com/problems/basic-calculator-ii/",
        "requirements": "Calculate expression with +,-,*,/ using stack"
      },
      {
        "id": 236,
        "leetcode_id": 84,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "Largest Rectangle in Histogram",
        "leetcode": "https://leetcode.com/problems/largest-rectangle-in-histogram/",
        "requirements": "Find largest rectangle area using stack"
      },
      {
        "id": 237,
        "leetcode_id": 42,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "Trapping Rain Water",
        "leetcode": "https://leetcode.com/problems/trapping-rain-water/",
        "requirements": "Calculate trapped water using stack approach"
      },
      {
        "id": 238,
        "leetcode_id": 85,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Maximal Rectangle",
        "leetcode": "https://leetcode.com/problems/maximal-rectangle/",
        "requirements": "Find largest rectangle using histogram approach"
      },
      {
        "id": 239,
        "leetcode_id": 239,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "Sliding Window Maximum",
        "leetcode": "https://leetcode.com/problems/sliding-window-maximum/",
        "requirements": "Find maximum in sliding window using deque"
      },
      {
        "id": 240,
        "leetcode_id": 622,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Design Circular Queue",
        "leetcode": "https://leetcode.com/problems/design-circular-queue/",
        "requirements": "Implement circular queue data structure"
      },
      {
        "id": 241,
        "leetcode_id": 1249,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Minimum Remove to Make Valid Parentheses",
        "leetcode": "https://leetcode.com/problems/minimum-remove-to-make-valid-parentheses/",
        "requirements": "Remove minimum parentheses to make string valid using stack"
      },
      {
        "id": 242,
        "leetcode_id": 853,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Car Fleet",
        "leetcode": "https://leetcode.com/problems/car-fleet/",
        "requirements": "Determine car fleets using stack"
      },
      {
        "id": 243,
        "leetcode_id": 901,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Online Stock Span",
        "leetcode": "https://leetcode.com/problems/online-stock-span/",
        "requirements": "Calculate stock price spans using monotonic stack"
      },
      {
        "id": 244,
        "leetcode_id": 341,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Flatten Nested List Iterator",
        "leetcode": "https://leetcode.com/problems/flatten-nested-list-iterator/",
        "requirements": "Flatten nested list using stack-based iterator"
      },
      {
        "id": 245,
        "leetcode_id": 32,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Longest Valid Parentheses",
        "leetcode": "https://leetcode.com/problems/longest-valid-parentheses/",
        "requirements": "Find longest valid parentheses substring using stack"
      },
      {
        "id": 246,
        "leetcode_id": 716,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Max Stack",
        "leetcode": "https://leetcode.com/problems/max-stack/",
        "requirements": "Design stack with push, pop, top, peekMax, popMax operations"
      },
      {
        "id": 247,
        "leetcode_id": 402,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Remove K Digits",
        "leetcode": "https://leetcode.com/problems/remove-k-digits/",
        "requirements": "Remove k digits to form smallest number using stack"
      },
      {
        "id": 248,
        "leetcode_id": 316,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Remove Duplicate Letters",
        "leetcode": "https://leetcode.com/problems/remove-duplicate-letters/",
        "requirements": "Remove duplicates and maintain lexicographical order using stack"
      },
      {
        "id": 249,
        "leetcode_id": 456,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "132 Pattern",
        "leetcode": "https://leetcode.com/problems/132-pattern/",
        "requirements": "Find specific pattern using monotonic stack"
      },
      {
        "id": 250,
        "leetcode_id": 735,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Asteroid Collision",
        "leetcode": "https://leetcode.com/problems/asteroid-collision/",
        "requirements": "Simulate asteroid collisions using stack"
      }
    ]
  },
  "Monotonic Stack/Queue": {
    "tip": "A monotonic stack or queue maintains elements in a strictly increasing or decreasing order by popping elements that violate this property. They're exceptionally useful for solving 'next greater/smaller element' problems, finding spans, and handling scenarios where you need to efficiently track the nearest element that's larger or smaller. Look for problems involving finding the next/previous greater/smaller element, maximum areas, or temperature/stock price patterns.",
    "problems": [
      {
        "id": 251,
        "leetcode_id": 739,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Daily Temperatures",
        "leetcode": "https://leetcode.com/problems/daily-temperatures/",
        "requirements": "Find next warmer day using monotonic decreasing stack"
      },
      {
        "id": 252,
        "leetcode_id": 496,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Next Greater Element I",
        "leetcode": "https://leetcode.com/problems/next-greater-element-i/",
        "requirements": "Find next greater element using monotonic decreasing stack"
      },
      {
        "id": 253,
        "leetcode_id": 503,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Next Greater Element II",
        "leetcode": "https://leetcode.com/problems/next-greater-element-ii/",
        "requirements": "Find next greater element in circular array using monotonic stack"
      },
      {
        "id": 254,
        "leetcode_id": 84,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "Largest Rectangle in Histogram",
        "leetcode": "https://leetcode.com/problems/largest-rectangle-in-histogram/",
        "requirements": "Find largest rectangle area using monotonic increasing stack"
      },
      {
        "id": 255,
        "leetcode_id": 85,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Maximal Rectangle",
        "leetcode": "https://leetcode.com/problems/maximal-rectangle/",
        "requirements": "Find largest rectangle in binary matrix using monotonic stack"
      },
      {
        "id": 256,
        "leetcode_id": 42,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "Trapping Rain Water",
        "leetcode": "https://leetcode.com/problems/trapping-rain-water/",
        "requirements": "Calculate trapped water using monotonic stack"
      },
      {
        "id": 257,
        "leetcode_id": 901,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Online Stock Span",
        "leetcode": "https://leetcode.com/problems/online-stock-span/",
        "requirements": "Calculate consecutive smaller/equal elements using monotonic stack"
      },
      {
        "id": 258,
        "leetcode_id": 402,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Remove K Digits",
        "leetcode": "https://leetcode.com/problems/remove-k-digits/",
        "requirements": "Create smallest number by removing digits using monotonic increasing stack"
      },
      {
        "id": 259,
        "leetcode_id": 316,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Remove Duplicate Letters",
        "leetcode": "https://leetcode.com/problems/remove-duplicate-letters/",
        "requirements": "Lexicographically smallest string using monotonic stack"
      },
      {
        "id": 260,
        "leetcode_id": 1081,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Smallest Subsequence of Distinct Characters",
        "leetcode": "https://leetcode.com/problems/smallest-subsequence-of-distinct-characters/",
        "requirements": "Smallest lexicographical subsequence using monotonic stack"
      },
      {
        "id": 261,
        "leetcode_id": 456,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "132 Pattern",
        "leetcode": "https://leetcode.com/problems/132-pattern/",
        "requirements": "Find 132 pattern using monotonic stack"
      },
      {
        "id": 262,
        "leetcode_id": 907,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Sum of Subarray Minimums",
        "leetcode": "https://leetcode.com/problems/sum-of-subarray-minimums/",
        "requirements": "Find sum of all subarray minimums using monotonic stack"
      },
      {
        "id": 263,
        "leetcode_id": 239,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "Sliding Window Maximum",
        "leetcode": "https://leetcode.com/problems/sliding-window-maximum/",
        "requirements": "Find maximum in sliding window using monotonic decreasing queue"
      },
      {
        "id": 264,
        "leetcode_id": 1019,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Next Greater Node In Linked List",
        "leetcode": "https://leetcode.com/problems/next-greater-node-in-linked-list/",
        "requirements": "Find next greater node in linked list using monotonic stack"
      },
      {
        "id": 265,
        "leetcode_id": 1856,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Subarray Min-Product",
        "leetcode": "https://leetcode.com/problems/maximum-subarray-min-product/",
        "requirements": "Find maximum min-product subarray using monotonic stack"
      },
      {
        "id": 266,
        "leetcode_id": 2104,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Sum of Subarray Ranges",
        "leetcode": "https://leetcode.com/problems/sum-of-subarray-ranges/",
        "requirements": "Find sum of (max-min) for all subarrays using monotonic stacks"
      },
      {
        "id": 267,
        "leetcode_id": 2281,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Sum of Total Strength of Wizards",
        "leetcode": "https://leetcode.com/problems/sum-of-total-strength-of-wizards/",
        "requirements": "Find sum of all subarray strengths using monotonic stack"
      },
      {
        "id": 268,
        "leetcode_id": 1944,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Number of Visible People in a Queue",
        "leetcode": "https://leetcode.com/problems/number-of-visible-people-in-a-queue/",
        "requirements": "Count visible people using monotonic stack"
      },
      {
        "id": 269,
        "leetcode_id": 1673,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Find the Most Competitive Subsequence",
        "leetcode": "https://leetcode.com/problems/find-the-most-competitive-subsequence/",
        "requirements": "Find most competitive subsequence using monotonic stack"
      },
      {
        "id": 270,
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
        "id": 271,
        "leetcode_id": 206,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Reverse Linked List",
        "leetcode": "https://leetcode.com/problems/reverse-linked-list/",
        "requirements": "Basic linked list reversal"
      },
      {
        "id": 272,
        "leetcode_id": 21,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Merge Two Sorted Lists",
        "leetcode": "https://leetcode.com/problems/merge-two-sorted-lists/",
        "requirements": "Merge sorted linked lists"
      },
      {
        "id": 273,
        "leetcode_id": 141,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Linked List Cycle",
        "leetcode": "https://leetcode.com/problems/linked-list-cycle/",
        "requirements": "Detect cycle using fast/slow pointers"
      },
      {
        "id": 274,
        "leetcode_id": 19,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Remove Nth Node From End of List",
        "leetcode": "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
        "requirements": "Remove node with single pass using two pointers"
      },
      {
        "id": 275,
        "leetcode_id": 2,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Add Two Numbers",
        "leetcode": "https://leetcode.com/problems/add-two-numbers/",
        "requirements": "Add numbers represented by linked lists"
      },
      {
        "id": 276,
        "leetcode_id": 160,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Intersection of Two Linked Lists",
        "leetcode": "https://leetcode.com/problems/intersection-of-two-linked-lists/",
        "requirements": "Find intersection point of two lists"
      },
      {
        "id": 277,
        "leetcode_id": 203,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Remove Linked List Elements",
        "leetcode": "https://leetcode.com/problems/remove-linked-list-elements/",
        "requirements": "Remove nodes with specific value"
      },
      {
        "id": 278,
        "leetcode_id": 234,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Palindrome Linked List",
        "leetcode": "https://leetcode.com/problems/palindrome-linked-list/",
        "requirements": "Check if linked list is palindrome"
      },
      {
        "id": 279,
        "leetcode_id": 83,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Remove Duplicates from Sorted List",
        "leetcode": "https://leetcode.com/problems/remove-duplicates-from-sorted-list/",
        "requirements": "Remove duplicates in sorted linked list"
      },
      {
        "id": 280,
        "leetcode_id": 237,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Delete Node in a Linked List",
        "leetcode": "https://leetcode.com/problems/delete-node-in-a-linked-list/",
        "requirements": "Delete node with only access to that node"
      },
      {
        "id": 281,
        "leetcode_id": 92,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Reverse Linked List II",
        "leetcode": "https://leetcode.com/problems/reverse-linked-list-ii/",
        "requirements": "Reverse linked list between positions"
      },
      {
        "id": 282,
        "leetcode_id": 142,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Linked List Cycle II",
        "leetcode": "https://leetcode.com/problems/linked-list-cycle-ii/",
        "requirements": "Find cycle start using fast/slow pointers"
      },
      {
        "id": 283,
        "leetcode_id": 328,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Odd Even Linked List",
        "leetcode": "https://leetcode.com/problems/odd-even-linked-list/",
        "requirements": "Group odd and even indexed nodes"
      },
      {
        "id": 284,
        "leetcode_id": 24,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Swap Nodes in Pairs",
        "leetcode": "https://leetcode.com/problems/swap-nodes-in-pairs/",
        "requirements": "Swap adjacent linked list nodes"
      },
      {
        "id": 285,
        "leetcode_id": 61,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Rotate List",
        "leetcode": "https://leetcode.com/problems/rotate-list/",
        "requirements": "Rotate linked list to the right"
      },
      {
        "id": 286,
        "leetcode_id": 82,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Remove Duplicates from Sorted List II",
        "leetcode": "https://leetcode.com/problems/remove-duplicates-from-sorted-list-ii/",
        "requirements": "Remove all nodes with duplicates"
      },
      {
        "id": 287,
        "leetcode_id": 86,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Partition List",
        "leetcode": "https://leetcode.com/problems/partition-list/",
        "requirements": "Partition list around value x"
      },
      {
        "id": 288,
        "leetcode_id": 138,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Copy List with Random Pointer",
        "leetcode": "https://leetcode.com/problems/copy-list-with-random-pointer/",
        "requirements": "Deep copy list with additional pointer"
      },
      {
        "id": 289,
        "leetcode_id": 143,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Reorder List",
        "leetcode": "https://leetcode.com/problems/reorder-list/",
        "requirements": "Reorder list by combining first and last"
      },
      {
        "id": 290,
        "leetcode_id": 148,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Sort List",
        "leetcode": "https://leetcode.com/problems/sort-list/",
        "requirements": "Sort linked list in O(n log n) time"
      },
      {
        "id": 291,
        "leetcode_id": 445,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Add Two Numbers II",
        "leetcode": "https://leetcode.com/problems/add-two-numbers-ii/",
        "requirements": "Add numbers in forward order linked lists"
      },
      {
        "id": 292,
        "leetcode_id": 707,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Design Linked List",
        "leetcode": "https://leetcode.com/problems/design-linked-list/",
        "requirements": "Implement singly linked list"
      },
      {
        "id": 293,
        "leetcode_id": 430,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Flatten a Multilevel Doubly Linked List",
        "leetcode": "https://leetcode.com/problems/flatten-a-multilevel-doubly-linked-list/",
        "requirements": "Flatten linked list with child pointers"
      },
      {
        "id": 294,
        "leetcode_id": 23,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "Merge k Sorted Lists",
        "leetcode": "https://leetcode.com/problems/merge-k-sorted-lists/",
        "requirements": "Merge k sorted linked lists"
      },
      {
        "id": 295,
        "leetcode_id": 25,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Reverse Nodes in k-Group",
        "leetcode": "https://leetcode.com/problems/reverse-nodes-in-k-group/",
        "requirements": "Reverse nodes in groups of k"
      },
      {
        "id": 296,
        "leetcode_id": 109,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Convert Sorted List to Binary Search Tree",
        "leetcode": "https://leetcode.com/problems/convert-sorted-list-to-binary-search-tree/",
        "requirements": "Convert linked list to balanced BST"
      },
      {
        "id": 297,
        "leetcode_id": 146,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "LRU Cache",
        "leetcode": "https://leetcode.com/problems/lru-cache/",
        "requirements": "Implement LRU cache using hashmap and linked list"
      },
      {
        "id": 298,
        "leetcode_id": 369,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Plus One Linked List",
        "leetcode": "https://leetcode.com/problems/plus-one-linked-list/",
        "requirements": "Add one to number represented by linked list"
      },
      {
        "id": 299,
        "leetcode_id": 876,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Middle of the Linked List",
        "leetcode": "https://leetcode.com/problems/middle-of-the-linked-list/",
        "requirements": "Find middle node using fast/slow pointers"
      },
      {
        "id": 300,
        "leetcode_id": 1290,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Convert Binary Number in a Linked List to Integer",
        "leetcode": "https://leetcode.com/problems/convert-binary-number-in-a-linked-list-to-integer/",
        "requirements": "Convert binary linked list to decimal"
      }
    ]
  },
  "Fast & Slow Pointers": {
    "tip": "Fast & Slow Pointers (also known as the Hare & Tortoise algorithm) is a technique where two pointers move through a sequence at different speeds. This approach is particularly useful for cycle detection, finding middle elements, or identifying pattern lengths in linked lists and arrays. Look for problems where one pointer moves faster than another to detect cycles or find midpoints in a single pass.",
    "problems": [
      {
        "id": 301,
        "leetcode_id": 141,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Linked List Cycle",
        "leetcode": "https://leetcode.com/problems/linked-list-cycle/",
        "requirements": "Detect if linked list has a cycle"
      },
      {
        "id": 302,
        "leetcode_id": 142,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Linked List Cycle II",
        "leetcode": "https://leetcode.com/problems/linked-list-cycle-ii/",
        "requirements": "Find the node where cycle begins"
      },
      {
        "id": 303,
        "leetcode_id": 876,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Middle of the Linked List",
        "leetcode": "https://leetcode.com/problems/middle-of-the-linked-list/",
        "requirements": "Find middle node of linked list"
      },
      {
        "id": 304,
        "leetcode_id": 234,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Palindrome Linked List",
        "leetcode": "https://leetcode.com/problems/palindrome-linked-list/",
        "requirements": "Check if linked list is palindrome using middle finding"
      },
      {
        "id": 305,
        "leetcode_id": 287,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Find the Duplicate Number",
        "leetcode": "https://leetcode.com/problems/find-the-duplicate-number/",
        "requirements": "Find duplicate in array using cycle detection"
      },
      {
        "id": 306,
        "leetcode_id": 143,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Reorder List",
        "leetcode": "https://leetcode.com/problems/reorder-list/",
        "requirements": "Reorder list using middle finding and reversal"
      },
      {
        "id": 307,
        "leetcode_id": 202,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Happy Number",
        "leetcode": "https://leetcode.com/problems/happy-number/",
        "requirements": "Detect cycle in number sequence"
      },
      {
        "id": 308,
        "leetcode_id": 457,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Circular Array Loop",
        "leetcode": "https://leetcode.com/problems/circular-array-loop/",
        "requirements": "Detect cycle in circular array"
      },
      {
        "id": 309,
        "leetcode_id": 19,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Remove Nth Node From End of List",
        "leetcode": "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
        "requirements": "Remove nth node from end using offset pointers"
      },
      {
        "id": 310,
        "leetcode_id": 148,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Sort List",
        "leetcode": "https://leetcode.com/problems/sort-list/",
        "requirements": "Sort linked list using merge sort with middle finding"
      },
      {
        "id": 311,
        "leetcode_id": 160,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Intersection of Two Linked Lists",
        "leetcode": "https://leetcode.com/problems/intersection-of-two-linked-lists/",
        "requirements": "Find intersection point of two linked lists"
      },
      {
        "id": 312,
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
        "id": 313,
        "leetcode_id": 206,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Reverse Linked List",
        "leetcode": "https://leetcode.com/problems/reverse-linked-list/",
        "requirements": "Reverse entire linked list (iterative and recursive)"
      },
      {
        "id": 314,
        "leetcode_id": 92,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Reverse Linked List II",
        "leetcode": "https://leetcode.com/problems/reverse-linked-list-ii/",
        "requirements": "Reverse linked list from position m to n"
      },
      {
        "id": 315,
        "leetcode_id": 25,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Reverse Nodes in k-Group",
        "leetcode": "https://leetcode.com/problems/reverse-nodes-in-k-group/",
        "requirements": "Reverse nodes in groups of k"
      },
      {
        "id": 316,
        "leetcode_id": 24,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Swap Nodes in Pairs",
        "leetcode": "https://leetcode.com/problems/swap-nodes-in-pairs/",
        "requirements": "Reverse nodes in groups of 2"
      },
      {
        "id": 317,
        "leetcode_id": 234,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Palindrome Linked List",
        "leetcode": "https://leetcode.com/problems/palindrome-linked-list/",
        "requirements": "Check if list is palindrome by reversing second half"
      },
      {
        "id": 318,
        "leetcode_id": 143,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Reorder List",
        "leetcode": "https://leetcode.com/problems/reorder-list/",
        "requirements": "Reorder list by reversing second half and merging"
      },
      {
        "id": 319,
        "leetcode_id": 61,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Rotate List",
        "leetcode": "https://leetcode.com/problems/rotate-list/",
        "requirements": "Rotate linked list to the right (involves list manipulation)"
      },
      {
        "id": 320,
        "leetcode_id": 2074,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Reverse Nodes in Even Length Groups",
        "leetcode": "https://leetcode.com/problems/reverse-nodes-in-even-length-groups/",
        "requirements": "Reverse nodes in groups with even length"
      },
      {
        "id": 321,
        "leetcode_id": 1721,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Swapping Nodes in a Linked List",
        "leetcode": "https://leetcode.com/problems/swapping-nodes-in-a-linked-list/",
        "requirements": "Swap values of kth node from beginning and end"
      },
      {
        "id": 322,
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
        "id": 323,
        "leetcode_id": 206,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Reverse Linked List",
        "leetcode": "https://leetcode.com/problems/reverse-linked-list/",
        "requirements": "Reverse linked list using recursion"
      },
      {
        "id": 324,
        "leetcode_id": 21,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Merge Two Sorted Lists",
        "leetcode": "https://leetcode.com/problems/merge-two-sorted-lists/",
        "requirements": "Merge two sorted linked lists using recursion"
      },
      {
        "id": 325,
        "leetcode_id": 509,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Fibonacci Number",
        "leetcode": "https://leetcode.com/problems/fibonacci-number/",
        "requirements": "Calculate Fibonacci numbers using recursion"
      },
      {
        "id": 326,
        "leetcode_id": 70,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Climbing Stairs",
        "leetcode": "https://leetcode.com/problems/climbing-stairs/",
        "requirements": "Count ways to climb stairs using recursion"
      },
      {
        "id": 327,
        "leetcode_id": 344,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Reverse String",
        "leetcode": "https://leetcode.com/problems/reverse-string/",
        "requirements": "Reverse string in-place using recursion"
      },
      {
        "id": 328,
        "leetcode_id": 24,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Swap Nodes in Pairs",
        "leetcode": "https://leetcode.com/problems/swap-nodes-in-pairs/",
        "requirements": "Swap adjacent nodes in linked list using recursion"
      },
      {
        "id": 329,
        "leetcode_id": 203,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Remove Linked List Elements",
        "leetcode": "https://leetcode.com/problems/remove-linked-list-elements/",
        "requirements": "Remove nodes with specific value using recursion"
      },
      {
        "id": 330,
        "leetcode_id": 234,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Palindrome Linked List",
        "leetcode": "https://leetcode.com/problems/palindrome-linked-list/",
        "requirements": "Check if linked list is palindrome using recursion"
      },
      {
        "id": 331,
        "leetcode_id": 83,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Remove Duplicates from Sorted List",
        "leetcode": "https://leetcode.com/problems/remove-duplicates-from-sorted-list/",
        "requirements": "Remove duplicates in sorted linked list using recursion"
      },
      {
        "id": 332,
        "leetcode_id": 50,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Pow(x, n)",
        "leetcode": "https://leetcode.com/problems/powx-n/",
        "requirements": "Implement power function using recursion"
      },
      {
        "id": 333,
        "leetcode_id": 779,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "K-th Symbol in Grammar",
        "leetcode": "https://leetcode.com/problems/k-th-symbol-in-grammar/",
        "requirements": "Find kth symbol using recursive pattern recognition"
      },
      {
        "id": 334,
        "leetcode_id": 1823,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Find the Winner of the Circular Game",
        "leetcode": "https://leetcode.com/problems/find-the-winner-of-the-circular-game/",
        "requirements": "Solve Josephus problem using recursion"
      },
      {
        "id": 335,
        "leetcode_id": 342,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Power of Four",
        "leetcode": "https://leetcode.com/problems/power-of-four/",
        "requirements": "Check if number is power of four using recursion"
      },
      {
        "id": 336,
        "leetcode_id": 326,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Power of Three",
        "leetcode": "https://leetcode.com/problems/power-of-three/",
        "requirements": "Check if number is power of three using recursion"
      },
      {
        "id": 337,
        "leetcode_id": 231,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Power of Two",
        "leetcode": "https://leetcode.com/problems/power-of-two/",
        "requirements": "Check if number is power of two using recursion"
      },
      {
        "id": 338,
        "leetcode_id": 1823,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Find the Winner of the Circular Game",
        "leetcode": "https://leetcode.com/problems/find-the-winner-of-the-circular-game/",
        "requirements": "Josephus problem - solved with recursion"
      },
      {
        "id": 339,
        "leetcode_id": 394,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Decode String",
        "leetcode": "https://leetcode.com/problems/decode-string/",
        "requirements": "Decode nested encoded string using recursion"
      },
      {
        "id": 340,
        "leetcode_id": 25,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Reverse Nodes in k-Group",
        "leetcode": "https://leetcode.com/problems/reverse-nodes-in-k-group/",
        "requirements": "Reverse nodes in groups of k using recursion"
      },
      {
        "id": 341,
        "leetcode_id": 1290,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Convert Binary Number in a Linked List to Integer",
        "leetcode": "https://leetcode.com/problems/convert-binary-number-in-a-linked-list-to-integer/",
        "requirements": "Convert binary representation to decimal using recursion"
      },
      {
        "id": 342,
        "leetcode_id": 1137,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "N-th Tribonacci Number",
        "leetcode": "https://leetcode.com/problems/n-th-tribonacci-number/",
        "requirements": "Calculate Tribonacci numbers using recursion"
      },
      {
        "id": 343,
        "leetcode_id": 160,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Intersection of Two Linked Lists",
        "leetcode": "https://leetcode.com/problems/intersection-of-two-linked-lists/",
        "requirements": "Find intersection point using recursive comparison"
      },
      {
        "id": 344,
        "leetcode_id": 92,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Reverse Linked List II",
        "leetcode": "https://leetcode.com/problems/reverse-linked-list-ii/",
        "requirements": "Reverse linked list from position m to n using recursion"
      },
      {
        "id": 345,
        "leetcode_id": 2,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Add Two Numbers",
        "leetcode": "https://leetcode.com/problems/add-two-numbers/",
        "requirements": "Add numbers represented by linked lists using recursion"
      },
      {
        "id": 346,
        "leetcode_id": 876,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Middle of the Linked List",
        "leetcode": "https://leetcode.com/problems/middle-of-the-linked-list/",
        "requirements": "Find middle node (can be solved recursively)"
      },
      {
        "id": 347,
        "leetcode_id": 19,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Remove Nth Node From End of List",
        "leetcode": "https://leetcode.com/problems/remove-nth-node-from-end-of-list/",
        "requirements": "Remove nth node from end using recursion"
      },
      {
        "id": 348,
        "leetcode_id": 143,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Reorder List",
        "leetcode": "https://leetcode.com/problems/reorder-list/",
        "requirements": "Reorder linked list using recursion"
      },
      {
        "id": 349,
        "leetcode_id": 445,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Add Two Numbers II",
        "leetcode": "https://leetcode.com/problems/add-two-numbers-ii/",
        "requirements": "Add numbers in forward order linked lists using recursion"
      },
      {
        "id": 350,
        "leetcode_id": 707,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Design Linked List",
        "leetcode": "https://leetcode.com/problems/design-linked-list/",
        "requirements": "Implement linked list operations recursively"
      },
      {
        "id": 351,
        "leetcode_id": 369,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Plus One Linked List",
        "leetcode": "https://leetcode.com/problems/plus-one-linked-list/",
        "requirements": "Add one to number represented by linked list using recursion"
      },
      {
        "id": 352,
        "leetcode_id": 725,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Split Linked List in Parts",
        "leetcode": "https://leetcode.com/problems/split-linked-list-in-parts/",
        "requirements": "Split linked list into k parts using recursion"
      }
    ]
  },
  "Trees": {
    "tip": "Trees are hierarchical data structures with a root node and child nodes. Key operations include traversal, searching, insertion, and deletion. The problems here focus on binary trees and binary search trees (BST), covering basic tree operations, checking tree properties, and simple transformations. Look for problems involving tree structure verification, path finding, or node value relationships.",
    "problems": [
      {
        "id": 353,
        "leetcode_id": 226,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Invert Binary Tree",
        "leetcode": "https://leetcode.com/problems/invert-binary-tree/",
        "requirements": "Swap left and right children for all nodes"
      },
      {
        "id": 354,
        "leetcode_id": 104,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Maximum Depth of Binary Tree",
        "leetcode": "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
        "requirements": "Find the maximum depth of the tree"
      },
      {
        "id": 355,
        "leetcode_id": 100,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Same Tree",
        "leetcode": "https://leetcode.com/problems/same-tree/",
        "requirements": "Check if two trees are identical"
      },
      {
        "id": 356,
        "leetcode_id": 101,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Symmetric Tree",
        "leetcode": "https://leetcode.com/problems/symmetric-tree/",
        "requirements": "Check if tree is a mirror of itself"
      },
      {
        "id": 357,
        "leetcode_id": 700,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Search in a Binary Search Tree",
        "leetcode": "https://leetcode.com/problems/search-in-a-binary-search-tree/",
        "requirements": "Find node with given value in BST"
      },
      {
        "id": 358,
        "leetcode_id": 94,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Binary Tree Inorder Traversal",
        "leetcode": "https://leetcode.com/problems/binary-tree-inorder-traversal/",
        "requirements": "Perform inorder traversal (iterative approach)"
      },
      {
        "id": 359,
        "leetcode_id": 144,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Binary Tree Preorder Traversal",
        "leetcode": "https://leetcode.com/problems/binary-tree-preorder-traversal/",
        "requirements": "Perform preorder traversal (iterative approach)"
      },
      {
        "id": 360,
        "leetcode_id": 145,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Binary Tree Postorder Traversal",
        "leetcode": "https://leetcode.com/problems/binary-tree-postorder-traversal/",
        "requirements": "Perform postorder traversal (iterative approach)"
      },
      {
        "id": 361,
        "leetcode_id": 257,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Binary Tree Paths",
        "leetcode": "https://leetcode.com/problems/binary-tree-paths/",
        "requirements": "Find all root-to-leaf paths"
      },
      {
        "id": 362,
        "leetcode_id": 543,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Diameter of Binary Tree",
        "leetcode": "https://leetcode.com/problems/diameter-of-binary-tree/",
        "requirements": "Find longest path between any two nodes"
      },
      {
        "id": 363,
        "leetcode_id": 110,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Balanced Binary Tree",
        "leetcode": "https://leetcode.com/problems/balanced-binary-tree/",
        "requirements": "Check if tree is height-balanced"
      },
      {
        "id": 364,
        "leetcode_id": 112,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Path Sum",
        "leetcode": "https://leetcode.com/problems/path-sum/",
        "requirements": "Check if root-to-leaf path with given sum exists"
      },
      {
        "id": 365,
        "leetcode_id": 530,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Minimum Absolute Difference in BST",
        "leetcode": "https://leetcode.com/problems/minimum-absolute-difference-in-bst/",
        "requirements": "Find minimum difference between any two nodes"
      },
      {
        "id": 366,
        "leetcode_id": 617,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Merge Two Binary Trees",
        "leetcode": "https://leetcode.com/problems/merge-two-binary-trees/",
        "requirements": "Merge trees by adding corresponding nodes"
      },
      {
        "id": 367,
        "leetcode_id": 965,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Univalued Binary Tree",
        "leetcode": "https://leetcode.com/problems/univalued-binary-tree/",
        "requirements": "Check if all nodes have same value"
      },
      {
        "id": 368,
        "leetcode_id": 98,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Validate Binary Search Tree",
        "leetcode": "https://leetcode.com/problems/validate-binary-search-tree/",
        "requirements": "Check if tree is a valid BST"
      },
      {
        "id": 369,
        "leetcode_id": 235,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Lowest Common Ancestor of a Binary Search Tree",
        "leetcode": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/",
        "requirements": "Find LCA in a BST"
      },
      {
        "id": 370,
        "leetcode_id": 236,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Lowest Common Ancestor of a Binary Tree",
        "leetcode": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
        "requirements": "Find LCA in a binary tree"
      },
      {
        "id": 371,
        "leetcode_id": 1302,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Deepest Leaves Sum",
        "leetcode": "https://leetcode.com/problems/deepest-leaves-sum/",
        "requirements": "Find sum of values at deepest level using recursion"
      },
      {
        "id": 372,
        "leetcode_id": 783,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Minimum Distance Between BST Nodes",
        "leetcode": "https://leetcode.com/problems/minimum-distance-between-bst-nodes/",
        "requirements": "Find minimum difference using inorder traversal"
      },
      {
        "id": 373,
        "leetcode_id": 701,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Insert into a Binary Search Tree",
        "leetcode": "https://leetcode.com/problems/insert-into-a-binary-search-tree/",
        "requirements": "Insert node into BST"
      },
      {
        "id": 374,
        "leetcode_id": 450,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Delete Node in a BST",
        "leetcode": "https://leetcode.com/problems/delete-node-in-a-bst/",
        "requirements": "Remove node from BST"
      },
      {
        "id": 375,
        "leetcode_id": 230,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Kth Smallest Element in a BST",
        "leetcode": "https://leetcode.com/problems/kth-smallest-element-in-a-bst/",
        "requirements": "Find kth smallest value in BST"
      },
      {
        "id": 376,
        "leetcode_id": 108,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Convert Sorted Array to Binary Search Tree",
        "leetcode": "https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/",
        "requirements": "Create height-balanced BST from sorted array"
      },
      {
        "id": 377,
        "leetcode_id": 538,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Convert BST to Greater Tree",
        "leetcode": "https://leetcode.com/problems/convert-bst-to-greater-tree/",
        "requirements": "Transform BST so each key has sum of all greater keys"
      },
      {
        "id": 378,
        "leetcode_id": 572,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Subtree of Another Tree",
        "leetcode": "https://leetcode.com/problems/subtree-of-another-tree/",
        "requirements": "Check if tree is subtree of another tree"
      },
      {
        "id": 379,
        "leetcode_id": 993,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Cousins in Binary Tree",
        "leetcode": "https://leetcode.com/problems/cousins-in-binary-tree/",
        "requirements": "Check if two nodes are cousins (same depth, different parents)"
      },
      {
        "id": 380,
        "leetcode_id": 563,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Binary Tree Tilt",
        "leetcode": "https://leetcode.com/problems/binary-tree-tilt/",
        "requirements": "Calculate sum of absolute differences between subtrees"
      },
      {
        "id": 381,
        "leetcode_id": 513,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Find Bottom Left Tree Value",
        "leetcode": "https://leetcode.com/problems/find-bottom-left-tree-value/",
        "requirements": "Find leftmost value in last row using recursion"
      },
      {
        "id": 382,
        "leetcode_id": 404,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Sum of Left Leaves",
        "leetcode": "https://leetcode.com/problems/sum-of-left-leaves/",
        "requirements": "Sum all left leaves using simple recursion"
      }
    ]
  },
  "Tree DFS": {
    "tip": "Tree DFS (Depth-First Search) involves exploring a tree as far as possible along each branch before backtracking. The three main DFS traversals are preorder (root, left, right), inorder (left, root, right), and postorder (left, right, root). This pattern is excellent for problems involving path finding, tree structure validation, and node relationship analysis. Look for problems where you need to exhaust all paths, find specific paths, or make decisions based on parent-child relationships.",
    "problems": [
      {
        "id": 383,
        "leetcode_id": 94,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Binary Tree Inorder Traversal",
        "leetcode": "https://leetcode.com/problems/binary-tree-inorder-traversal/",
        "requirements": "Implement inorder traversal (left, root, right)"
      },
      {
        "id": 384,
        "leetcode_id": 144,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Binary Tree Preorder Traversal",
        "leetcode": "https://leetcode.com/problems/binary-tree-preorder-traversal/",
        "requirements": "Implement preorder traversal (root, left, right)"
      },
      {
        "id": 385,
        "leetcode_id": 145,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Binary Tree Postorder Traversal",
        "leetcode": "https://leetcode.com/problems/binary-tree-postorder-traversal/",
        "requirements": "Implement postorder traversal (left, right, root)"
      },
      {
        "id": 386,
        "leetcode_id": 98,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Validate Binary Search Tree",
        "leetcode": "https://leetcode.com/problems/validate-binary-search-tree/",
        "requirements": "Check if tree is a valid BST using DFS with constraints"
      },
      {
        "id": 387,
        "leetcode_id": 112,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Path Sum",
        "leetcode": "https://leetcode.com/problems/path-sum/",
        "requirements": "Check if root-to-leaf path with given sum exists"
      },
      {
        "id": 388,
        "leetcode_id": 113,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Path Sum II",
        "leetcode": "https://leetcode.com/problems/path-sum-ii/",
        "requirements": "Find all root-to-leaf paths with given sum"
      },
      {
        "id": 389,
        "leetcode_id": 257,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Binary Tree Paths",
        "leetcode": "https://leetcode.com/problems/binary-tree-paths/",
        "requirements": "Find all root-to-leaf paths"
      },
      {
        "id": 390,
        "leetcode_id": 129,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Sum Root to Leaf Numbers",
        "leetcode": "https://leetcode.com/problems/sum-root-to-leaf-numbers/",
        "requirements": "Sum all numbers formed by root-to-leaf paths"
      },
      {
        "id": 391,
        "leetcode_id": 236,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Lowest Common Ancestor of a Binary Tree",
        "leetcode": "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/",
        "requirements": "Find lowest common ancestor using DFS"
      },
      {
        "id": 392,
        "leetcode_id": 124,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "Binary Tree Maximum Path Sum",
        "leetcode": "https://leetcode.com/problems/binary-tree-maximum-path-sum/",
        "requirements": "Find path with maximum sum using DFS"
      },
      {
        "id": 393,
        "leetcode_id": 543,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Diameter of Binary Tree",
        "leetcode": "https://leetcode.com/problems/diameter-of-binary-tree/",
        "requirements": "Find longest path between any two nodes"
      },
      {
        "id": 394,
        "leetcode_id": 437,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Path Sum III",
        "leetcode": "https://leetcode.com/problems/path-sum-iii/",
        "requirements": "Count paths with given sum (not necessarily root-to-leaf)"
      },
      {
        "id": 395,
        "leetcode_id": 110,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Balanced Binary Tree",
        "leetcode": "https://leetcode.com/problems/balanced-binary-tree/",
        "requirements": "Check if tree is height-balanced using DFS"
      },
      {
        "id": 396,
        "leetcode_id": 114,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Flatten Binary Tree to Linked List",
        "leetcode": "https://leetcode.com/problems/flatten-binary-tree-to-linked-list/",
        "requirements": "Flatten tree to linked list using DFS"
      },
      {
        "id": 397,
        "leetcode_id": 199,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Binary Tree Right Side View",
        "leetcode": "https://leetcode.com/problems/binary-tree-right-side-view/",
        "requirements": "View tree from right side using DFS"
      },
      {
        "id": 398,
        "leetcode_id": 1448,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Count Good Nodes in Binary Tree",
        "leetcode": "https://leetcode.com/problems/count-good-nodes-in-binary-tree/",
        "requirements": "Count nodes where path has no greater value"
      },
      {
        "id": 399,
        "leetcode_id": 105,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Construct Binary Tree from Preorder and Inorder Traversal",
        "leetcode": "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/",
        "requirements": "Build tree from traversal sequences using recursion"
      },
      {
        "id": 400,
        "leetcode_id": 106,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Construct Binary Tree from Inorder and Postorder Traversal",
        "leetcode": "https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/",
        "requirements": "Build tree from traversal sequences using recursion"
      },
      {
        "id": 401,
        "leetcode_id": 951,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Flip Equivalent Binary Trees",
        "leetcode": "https://leetcode.com/problems/flip-equivalent-binary-trees/",
        "requirements": "Check if trees are equivalent after flips"
      },
      {
        "id": 402,
        "leetcode_id": 863,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "All Nodes Distance K in Binary Tree",
        "leetcode": "https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree/",
        "requirements": "Find all nodes at distance K using DFS"
      },
      {
        "id": 403,
        "leetcode_id": 1026,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Difference Between Node and Ancestor",
        "leetcode": "https://leetcode.com/problems/maximum-difference-between-node-and-ancestor/",
        "requirements": "Find max difference between ancestor and descendant"
      },
      {
        "id": 404,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Pseudo-Palindromic Paths in a Binary Tree",
        "leetcode": "https://leetcode.com/problems/pseudo-palindromic-paths-in-a-binary-tree/",
        "leetcode_id": 1457,
        "requirements": "Count paths where digit frequencies form palindrome"
      },
      {
        "id": 405,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Binary Tree Pruning",
        "leetcode": "https://leetcode.com/problems/binary-tree-pruning/",
        "leetcode_id": 814,
        "requirements": "Remove subtrees with only zeros"
      },
      {
        "id": 406,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Binary Tree Cameras",
        "leetcode": "https://leetcode.com/problems/binary-tree-cameras/",
        "leetcode_id": 968,
        "requirements": "Place minimum cameras to monitor tree using DFS"
      },
      {
        "id": 407,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Delete Nodes And Return Forest",
        "leetcode": "https://leetcode.com/problems/delete-nodes-and-return-forest/",
        "leetcode_id": 1110,
        "requirements": "Delete nodes and return resulting forest"
      },
      {
        "id": 408,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Find Duplicate Subtrees",
        "leetcode": "https://leetcode.com/problems/find-duplicate-subtrees/",
        "leetcode_id": 652,
        "requirements": "Find all duplicate subtrees using DFS serialization"
      },
      {
        "id": 409,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Serialize and Deserialize Binary Tree",
        "leetcode": "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/",
        "leetcode_id": 297,
        "requirements": "Convert tree to string and back"
      },
      {
        "id": 410,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Most Frequent Subtree Sum",
        "leetcode": "https://leetcode.com/problems/most-frequent-subtree-sum/",
        "leetcode_id": 508,
        "requirements": "Find most frequent subtree sum using DFS"
      },
      {
        "id": 411,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Recover Binary Search Tree",
        "leetcode": "https://leetcode.com/problems/recover-binary-search-tree/",
        "leetcode_id": 99,
        "requirements": "Fix BST with two swapped nodes using inorder traversal"
      },
      {
        "id": 412,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Sum of Distances in Tree",
        "leetcode": "https://leetcode.com/problems/sum-of-distances-in-tree/",
        "leetcode_id": 834,
        "requirements": "Calculate sum of distances for each node"
      }
    ]
  },
  "Tree BFS": {
    "tip": "Tree BFS (Breadth-First Search) involves exploring a tree level by level using a queue. This pattern is excellent for problems that require level-order traversal, finding the shortest path, or working with the tree in a level-by-level manner. Look for problems involving level ordering, nearest neighbors, or when you need to process nodes based on their distance from the root.",
    "problems": [
      {
        "id": 413,
        "leetcode_id": 102,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Binary Tree Level Order Traversal",
        "leetcode": "https://leetcode.com/problems/binary-tree-level-order-traversal/",
        "requirements": "Return nodes level by level from top to bottom"
      },
      {
        "id": 414,
        "leetcode_id": 107,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Binary Tree Level Order Traversal II",
        "leetcode": "https://leetcode.com/problems/binary-tree-level-order-traversal-ii/",
        "requirements": "Return nodes level by level from bottom to top"
      },
      {
        "id": 415,
        "leetcode_id": 103,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Binary Tree Zigzag Level Order Traversal",
        "leetcode": "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/",
        "requirements": "Zigzag level order traversal (alternating directions)"
      },
      {
        "id": 416,
        "leetcode_id": 199,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Binary Tree Right Side View",
        "leetcode": "https://leetcode.com/problems/binary-tree-right-side-view/",
        "requirements": "Return rightmost node at each level"
      },
      {
        "id": 417,
        "leetcode_id": 515,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Find Largest Value in Each Tree Row",
        "leetcode": "https://leetcode.com/problems/find-largest-value-in-each-tree-row/",
        "requirements": "Find maximum value in each level"
      },
      {
        "id": 418,
        "leetcode_id": 111,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Minimum Depth of Binary Tree",
        "leetcode": "https://leetcode.com/problems/minimum-depth-of-binary-tree/",
        "requirements": "Find shortest path from root to leaf"
      },
      {
        "id": 419,
        "leetcode_id": 104,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Maximum Depth of Binary Tree",
        "leetcode": "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
        "requirements": "Find depth of tree using BFS"
      },
      {
        "id": 420,
        "leetcode_id": 662,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Width of Binary Tree",
        "leetcode": "https://leetcode.com/problems/maximum-width-of-binary-tree/",
        "requirements": "Find maximum width using level-order traversal"
      },
      {
        "id": 421,
        "leetcode_id": 637,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Average of Levels in Binary Tree",
        "leetcode": "https://leetcode.com/problems/average-of-levels-in-binary-tree/",
        "requirements": "Calculate average of each level"
      },
      {
        "id": 422,
        "leetcode_id": 429,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "N-ary Tree Level Order Traversal",
        "leetcode": "https://leetcode.com/problems/n-ary-tree-level-order-traversal/",
        "requirements": "Level order traversal for N-ary tree"
      },
      {
        "id": 423,
        "leetcode_id": 116,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Populating Next Right Pointers in Each Node",
        "leetcode": "https://leetcode.com/problems/populating-next-right-pointers-in-each-node/",
        "requirements": "Connect nodes at same level (perfect binary tree)"
      },
      {
        "id": 424,
        "leetcode_id": 117,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Populating Next Right Pointers in Each Node II",
        "leetcode": "https://leetcode.com/problems/populating-next-right-pointers-in-each-node-ii/",
        "requirements": "Connect nodes at same level (any binary tree)"
      },
      {
        "id": 425,
        "leetcode_id": 513,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Find Bottom Left Tree Value",
        "leetcode": "https://leetcode.com/problems/find-bottom-left-tree-value/",
        "requirements": "Find leftmost value in bottom level"
      },
      {
        "id": 426,
        "leetcode_id": 958,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Check Completeness of a Binary Tree",
        "leetcode": "https://leetcode.com/problems/check-completeness-of-a-binary-tree/",
        "requirements": "Check if tree is complete using BFS"
      },
      {
        "id": 427,
        "leetcode_id": 987,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Vertical Order Traversal of a Binary Tree",
        "leetcode": "https://leetcode.com/problems/vertical-order-traversal-of-a-binary-tree/",
        "requirements": "Traversal by vertical order with coordinates"
      },
      {
        "id": 428,
        "leetcode_id": 314,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Binary Tree Vertical Order Traversal",
        "leetcode": "https://leetcode.com/problems/binary-tree-vertical-order-traversal/",
        "requirements": "Vertical order traversal with level priority"
      },
      {
        "id": 429,
        "leetcode_id": 993,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Cousins in Binary Tree",
        "leetcode": "https://leetcode.com/problems/cousins-in-binary-tree/",
        "requirements": "Check if nodes are at same level but different parents"
      },
      {
        "id": 430,
        "leetcode_id": 1161,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Level Sum of a Binary Tree",
        "leetcode": "https://leetcode.com/problems/maximum-level-sum-of-a-binary-tree/",
        "requirements": "Find level with maximum sum"
      },
      {
        "id": 431,
        "leetcode_id": 965,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Univalued Binary Tree",
        "leetcode": "https://leetcode.com/problems/univalued-binary-tree/",
        "requirements": "Check if all nodes have same value using BFS"
      },
      {
        "id": 432,
        "leetcode_id": 662,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Width of Binary Tree - Alternative",
        "leetcode": "https://leetcode.com/problems/maximum-width-of-binary-tree/",
        "requirements": "Different approach to calculate maximum width using BFS with indexing"
      },
      {
        "id": 433,
        "leetcode_id": 107,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Binary Tree Level Order Traversal II - Alternative",
        "leetcode": "https://leetcode.com/problems/binary-tree-level-order-traversal-ii/",
        "requirements": "Level order from bottom up with queue-based approach"
      },
      {
        "id": 434,
        "leetcode_id": 559,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Maximum Depth of N-ary Tree",
        "leetcode": "https://leetcode.com/problems/maximum-depth-of-n-ary-tree/",
        "requirements": "Find maximum depth of n-ary tree using BFS"
      },
      {
        "id": 435,
        "leetcode_id": 919,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Complete Binary Tree Inserter",
        "leetcode": "https://leetcode.com/problems/complete-binary-tree-inserter/",
        "requirements": "Design data structure for complete binary tree"
      },
      {
        "id": 436,
        "leetcode_id": 783,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Minimum Distance Between BST Nodes",
        "leetcode": "https://leetcode.com/problems/minimum-distance-between-bst-nodes/",
        "requirements": "Find minimum difference (can use BFS approach)"
      },
      {
        "id": 437,
        "leetcode_id": 671,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Second Minimum Node In a Binary Tree",
        "leetcode": "https://leetcode.com/problems/second-minimum-node-in-a-binary-tree/",
        "requirements": "Find second smallest value"
      },
      {
        "id": 438,
        "leetcode_id": 1609,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Even Odd Tree",
        "leetcode": "https://leetcode.com/problems/even-odd-tree/",
        "requirements": "Check level-based even/odd conditions"
      },
      {
        "id": 439,
        "leetcode_id": 2641,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Cousins in Binary Tree II",
        "leetcode": "https://leetcode.com/problems/cousins-in-binary-tree-ii/",
        "requirements": "Replace each node with sum of cousins"
      },
      {
        "id": 440,
        "leetcode_id": 1161,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Level Sum of a Binary Tree - Alternative",
        "leetcode": "https://leetcode.com/problems/maximum-level-sum-of-a-binary-tree/",
        "requirements": "Different implementation for finding level with maximum sum"
      },
      {
        "id": 441,
        "leetcode_id": 1602,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Find Nearest Right Node in Binary Tree",
        "leetcode": "https://leetcode.com/problems/find-nearest-right-node-in-binary-tree/",
        "requirements": "Find node at same level to the right"
      },
      {
        "id": 442,
        "leetcode_id": 1469,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Find All The Lonely Nodes",
        "leetcode": "https://leetcode.com/problems/find-all-the-lonely-nodes/",
        "requirements": "Find nodes that are only children"
      }
    ]
  },
  "Divide and Conquer": {
    "tip": "Divide and Conquer is an algorithmic paradigm where a problem is broken into smaller subproblems, solved independently, and then combined to form the solution to the original problem. This approach is most effective for problems that can be naturally split into similar subproblems, such as searching, sorting, and computational geometry. Look for problems where dividing the input and solving smaller parts independently leads to an efficient solution.",
    "problems": [
      {
        "id": 443,
        "leetcode_id": 169,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Majority Element",
        "leetcode": "https://leetcode.com/problems/majority-element/",
        "requirements": "Find element appearing more than n/2 times"
      },
      {
        "id": 444,
        "leetcode_id": 53,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Maximum Subarray",
        "leetcode": "https://leetcode.com/problems/maximum-subarray/",
        "requirements": "Find contiguous subarray with largest sum"
      },
      {
        "id": 445,
        "leetcode_id": 215,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Kth Largest Element in an Array",
        "leetcode": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
        "requirements": "Find kth largest element using quickselect"
      },
      {
        "id": 446,
        "leetcode_id": 912,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Sort an Array",
        "leetcode": "https://leetcode.com/problems/sort-an-array/",
        "requirements": "Implement sorting algorithm like merge sort"
      },
      {
        "id": 447,
        "leetcode_id": 4,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "Median of Two Sorted Arrays",
        "leetcode": "https://leetcode.com/problems/median-of-two-sorted-arrays/",
        "requirements": "Find median efficiently without merging"
      },
      {
        "id": 448,
        "leetcode_id": 33,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Search in Rotated Sorted Array",
        "leetcode": "https://leetcode.com/problems/search-in-rotated-sorted-array/",
        "requirements": "Find target in rotated array using modified binary search"
      },
      {
        "id": 449,
        "leetcode_id": 148,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Sort List",
        "leetcode": "https://leetcode.com/problems/sort-list/",
        "requirements": "Sort linked list using merge sort"
      },
      {
        "id": 450,
        "leetcode_id": 23,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "Merge k Sorted Lists",
        "leetcode": "https://leetcode.com/problems/merge-k-sorted-lists/",
        "requirements": "Merge k sorted linked lists efficiently"
      },
      {
        "id": 451,
        "leetcode_id": 315,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Count of Smaller Numbers After Self",
        "leetcode": "https://leetcode.com/problems/count-of-smaller-numbers-after-self/",
        "requirements": "Count smaller elements to the right"
      },
      {
        "id": 452,
        "leetcode_id": 493,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Reverse Pairs",
        "leetcode": "https://leetcode.com/problems/reverse-pairs/",
        "requirements": "Count pairs where i < j and nums[i] > 2*nums[j]"
      },
      {
        "id": 453,
        "leetcode_id": 50,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Pow(x, n)",
        "leetcode": "https://leetcode.com/problems/powx-n/",
        "requirements": "Implement power function efficiently"
      },
      {
        "id": 454,
        "leetcode_id": 241,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Different Ways to Add Parentheses",
        "leetcode": "https://leetcode.com/problems/different-ways-to-add-parentheses/",
        "requirements": "Compute all possible results from different parenthesizations"
      },
      {
        "id": 455,
        "leetcode_id": 973,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "K Closest Points to Origin",
        "leetcode": "https://leetcode.com/problems/k-closest-points-to-origin/",
        "requirements": "Find k closest points using quickselect"
      },
      {
        "id": 456,
        "leetcode_id": 395,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Longest Substring with At Least K Repeating Characters",
        "leetcode": "https://leetcode.com/problems/longest-substring-with-at-least-k-repeating-characters/",
        "requirements": "Find longest substring where each char appears at least k times"
      },
      {
        "id": 457,
        "leetcode_id": 105,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Construct Binary Tree from Preorder and Inorder Traversal",
        "leetcode": "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/",
        "requirements": "Build tree from traversal sequences"
      },
      {
        "id": 458,
        "leetcode_id": 106,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Construct Binary Tree from Inorder and Postorder Traversal",
        "leetcode": "https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/",
        "requirements": "Build tree from traversal sequences"
      },
      {
        "id": 459,
        "leetcode_id": 95,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Unique Binary Search Trees II",
        "leetcode": "https://leetcode.com/problems/unique-binary-search-trees-ii/",
        "requirements": "Generate all structurally unique BSTs"
      },
      {
        "id": 460,
        "leetcode_id": 109,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Convert Sorted List to Binary Search Tree",
        "leetcode": "https://leetcode.com/problems/convert-sorted-list-to-binary-search-tree/",
        "requirements": "Convert sorted linked list to height-balanced BST"
      },
      {
        "id": 461,
        "leetcode_id": 108,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Convert Sorted Array to Binary Search Tree",
        "leetcode": "https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/",
        "requirements": "Convert sorted array to height-balanced BST"
      },
      {
        "id": 462,
        "leetcode_id": 932,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Beautiful Array",
        "leetcode": "https://leetcode.com/problems/beautiful-array/",
        "requirements": "Construct beautiful array using divide and conquer"
      },
      {
        "id": 463,
        "leetcode_id": 654,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Binary Tree",
        "leetcode": "https://leetcode.com/problems/maximum-binary-tree/",
        "requirements": "Build tree by recursively finding maximum"
      },
      {
        "id": 464,
        "leetcode_id": 998,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Binary Tree II",
        "leetcode": "https://leetcode.com/problems/maximum-binary-tree-ii/",
        "requirements": "Insert value into existing maximum binary tree"
      },
      {
        "id": 465,
        "leetcode_id": 218,
        "difficulty": "Hard",
        "frequency": "Hard",
        "problem": "The Skyline Problem",
        "leetcode": "https://leetcode.com/problems/the-skyline-problem/",
        "requirements": "Find skyline formed by buildings"
      },
      {
        "id": 466,
        "leetcode_id": 327,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Count of Range Sum",
        "leetcode": "https://leetcode.com/problems/count-of-range-sum/",
        "requirements": "Count range sums in specific range"
      },
      {
        "id": 467,
        "leetcode_id": 427,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Construct Quad Tree",
        "leetcode": "https://leetcode.com/problems/construct-quad-tree/",
        "requirements": "Build quad tree by recursively dividing grid"
      },
      {
        "id": 468,
        "leetcode_id": 312,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Burst Balloons",
        "leetcode": "https://leetcode.com/problems/burst-balloons/",
        "requirements": "Find maximum coins by bursting balloons"
      },
      {
        "id": 469,
        "leetcode_id": 215,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Kth Largest Element - Alternative Approach",
        "leetcode": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
        "requirements": "Find kth largest using divide and conquer selection algorithm"
      },
      {
        "id": 470,
        "leetcode_id": 53,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Maximum Subarray - Alternative Solution",
        "leetcode": "https://leetcode.com/problems/maximum-subarray/",
        "requirements": "Find maximum subarray using pure divide and conquer"
      },
      {
        "id": 471,
        "leetcode_id": 889,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Construct Binary Tree from Preorder and Postorder Traversal",
        "leetcode": "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-postorder-traversal/",
        "requirements": "Build tree from preorder and postorder traversals"
      },
      {
        "id": 472,
        "leetcode_id": 514,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Freedom Trail",
        "leetcode": "https://leetcode.com/problems/freedom-trail/",
        "requirements": "Find minimum steps to spell word using divide and conquer"
      }
    ]
  },
  "Backtracking": {
    "tip": "Backtracking is an algorithmic technique for solving problems recursively by trying to build a solution incrementally, abandoning a solution ('backtracking') as soon as it determines that the candidate cannot possibly be completed to a valid solution. This pattern is particularly useful for problems involving permutations, combinations, partitioning, and constraint satisfaction. Look for problems where you need to explore all possible configurations and can eliminate invalid candidates early.",
    "problems": [
      {
        "id": 473,
        "leetcode_id": 46,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Permutations",
        "leetcode": "https://leetcode.com/problems/permutations/",
        "requirements": "Generate all possible permutations of an array"
      },
      {
        "id": 474,
        "leetcode_id": 78,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Subsets",
        "leetcode": "https://leetcode.com/problems/subsets/",
        "requirements": "Generate all possible subsets of an array"
      },
      {
        "id": 475,
        "leetcode_id": 39,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Combination Sum",
        "leetcode": "https://leetcode.com/problems/combination-sum/",
        "requirements": "Find all unique combinations that sum to target"
      },
      {
        "id": 476,
        "leetcode_id": 17,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Letter Combinations of a Phone Number",
        "leetcode": "https://leetcode.com/problems/letter-combinations-of-a-phone-number/",
        "requirements": "Generate all letter combinations from phone digits"
      },
      {
        "id": 477,
        "leetcode_id": 22,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Generate Parentheses",
        "leetcode": "https://leetcode.com/problems/generate-parentheses/",
        "requirements": "Generate all valid parentheses combinations"
      },
      {
        "id": 478,
        "leetcode_id": 40,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Combination Sum II",
        "leetcode": "https://leetcode.com/problems/combination-sum-ii/",
        "requirements": "Find combinations that sum to target with no repeated elements"
      },
      {
        "id": 479,
        "leetcode_id": 90,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Subsets II",
        "leetcode": "https://leetcode.com/problems/subsets-ii/",
        "requirements": "Generate all subsets of array with duplicates"
      },
      {
        "id": 480,
        "leetcode_id": 47,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Permutations II",
        "leetcode": "https://leetcode.com/problems/permutations-ii/",
        "requirements": "Generate all permutations with duplicates"
      },
      {
        "id": 481,
        "leetcode_id": 79,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Word Search",
        "leetcode": "https://leetcode.com/problems/word-search/",
        "requirements": "Search for word in 2D board of characters"
      },
      {
        "id": 482,
        "leetcode_id": 77,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Combinations",
        "leetcode": "https://leetcode.com/problems/combinations/",
        "requirements": "Return all possible combinations of k numbers from 1 to n"
      },
      {
        "id": 483,
        "leetcode_id": 51,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "N-Queens",
        "leetcode": "https://leetcode.com/problems/n-queens/",
        "requirements": "Place N queens on NxN chessboard without attacking"
      },
      {
        "id": 484,
        "leetcode_id": 37,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Sudoku Solver",
        "leetcode": "https://leetcode.com/problems/sudoku-solver/",
        "requirements": "Solve 9x9 Sudoku puzzle"
      },
      {
        "id": 485,
        "leetcode_id": 131,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Palindrome Partitioning",
        "leetcode": "https://leetcode.com/problems/palindrome-partitioning/",
        "requirements": "Partition string into palindrome substrings"
      },
      {
        "id": 486,
        "leetcode_id": 93,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Restore IP Addresses",
        "leetcode": "https://leetcode.com/problems/restore-ip-addresses/",
        "requirements": "Restore all valid IP addresses from string"
      },
      {
        "id": 487,
        "leetcode_id": 784,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Letter Case Permutation",
        "leetcode": "https://leetcode.com/problems/letter-case-permutation/",
        "requirements": "Generate all possible case variations"
      },
      {
        "id": 488,
        "leetcode_id": 980,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Unique Paths III",
        "leetcode": "https://leetcode.com/problems/unique-paths-iii/",
        "requirements": "Find paths visiting all empty cells exactly once"
      },
      {
        "id": 489,
        "leetcode_id": 212,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Word Search II",
        "leetcode": "https://leetcode.com/problems/word-search-ii/",
        "requirements": "Find all words from dictionary in board"
      },
      {
        "id": 490,
        "leetcode_id": 52,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "N-Queens II",
        "leetcode": "https://leetcode.com/problems/n-queens-ii/",
        "requirements": "Count solutions to N-Queens problem"
      },
      {
        "id": 491,
        "leetcode_id": 10,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Regular Expression Matching",
        "leetcode": "https://leetcode.com/problems/regular-expression-matching/",
        "requirements": "Implement regex pattern matching"
      },
      {
        "id": 492,
        "leetcode_id": 140,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Word Break II",
        "leetcode": "https://leetcode.com/problems/word-break-ii/",
        "requirements": "Find all possible word break results"
      },
      {
        "id": 493,
        "leetcode_id": 44,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Wildcard Matching",
        "leetcode": "https://leetcode.com/problems/wildcard-matching/",
        "requirements": "Implement wildcard pattern matching"
      },
      {
        "id": 494,
        "leetcode_id": 301,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Remove Invalid Parentheses",
        "leetcode": "https://leetcode.com/problems/remove-invalid-parentheses/",
        "requirements": "Remove minimum number of parentheses for validity"
      },
      {
        "id": 495,
        "leetcode_id": 60,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Permutation Sequence",
        "leetcode": "https://leetcode.com/problems/permutation-sequence/",
        "requirements": "Find kth permutation"
      },
      {
        "id": 496,
        "leetcode_id": 216,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Combination Sum III",
        "leetcode": "https://leetcode.com/problems/combination-sum-iii/",
        "requirements": "Find k numbers that add up to n"
      },
      {
        "id": 497,
        "leetcode_id": 842,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Split Array into Fibonacci Sequence",
        "leetcode": "https://leetcode.com/problems/split-array-into-fibonacci-sequence/",
        "requirements": "Split string into Fibonacci sequence"
      },
      {
        "id": 498,
        "leetcode_id": 1219,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Path with Maximum Gold",
        "leetcode": "https://leetcode.com/problems/path-with-maximum-gold/",
        "requirements": "Collect maximum gold with path constraints"
      },
      {
        "id": 499,
        "leetcode_id": 306,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Additive Number",
        "leetcode": "https://leetcode.com/problems/additive-number/",
        "requirements": "Check if string can form additive sequence"
      },
      {
        "id": 500,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Beautiful Arrangement",
        "leetcode": "https://leetcode.com/problems/beautiful-arrangement/",
        "leetcode_id": 526,
        "requirements": "Count ways to arrange numbers with constraints"
      },
      {
        "id": 501,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Matchsticks to Square",
        "leetcode": "https://leetcode.com/problems/matchsticks-to-square/",
        "leetcode_id": 473,
        "requirements": "Form square with matchsticks"
      },
      {
        "id": 502,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Partition to K Equal Sum Subsets",
        "leetcode": "https://leetcode.com/problems/partition-to-k-equal-sum-subsets/",
        "leetcode_id": 698,
        "requirements": "Partition array into k equal sum subsets"
      }
    ]
  },
  "Heap/Priority Queue": {
    "tip": "Heaps and priority queues are data structures that provide efficient access to the minimum or maximum element. They excel at problems involving finding the kth smallest/largest element, merging sorted lists, or scheduling tasks by priority. Look for problems involving 'top k elements', dynamic ordering, or where you need to repeatedly find and remove the minimum/maximum element.",
    "problems": [
      {
        "id": 503,
        "leetcode_id": 215,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Kth Largest Element in an Array",
        "leetcode": "https://leetcode.com/problems/kth-largest-element-in-an-array/",
        "requirements": "Find kth largest element using min heap"
      },
      {
        "id": 504,
        "leetcode_id": 347,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Top K Frequent Elements",
        "leetcode": "https://leetcode.com/problems/top-k-frequent-elements/",
        "requirements": "Find k most frequent elements using heap"
      },
      {
        "id": 505,
        "leetcode_id": 23,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "Merge k Sorted Lists",
        "leetcode": "https://leetcode.com/problems/merge-k-sorted-lists/",
        "requirements": "Merge k sorted linked lists using priority queue"
      },
      {
        "id": 506,
        "leetcode_id": 295,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "Find Median from Data Stream",
        "leetcode": "https://leetcode.com/problems/find-median-from-data-stream/",
        "requirements": "Design data structure for median with heaps"
      },
      {
        "id": 507,
        "leetcode_id": 973,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "K Closest Points to Origin",
        "leetcode": "https://leetcode.com/problems/k-closest-points-to-origin/",
        "requirements": "Find k closest points using max heap"
      },
      {
        "id": 508,
        "leetcode_id": 703,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Kth Largest Element in a Stream",
        "leetcode": "https://leetcode.com/problems/kth-largest-element-in-a-stream/",
        "requirements": "Design class to find kth largest element"
      },
      {
        "id": 509,
        "leetcode_id": 451,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Sort Characters By Frequency",
        "leetcode": "https://leetcode.com/problems/sort-characters-by-frequency/",
        "requirements": "Sort characters by decreasing frequency"
      },
      {
        "id": 510,
        "leetcode_id": 253,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Meeting Rooms II",
        "leetcode": "https://leetcode.com/problems/meeting-rooms-ii/",
        "requirements": "Find minimum meeting rooms required"
      },
      {
        "id": 511,
        "leetcode_id": 355,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Design Twitter",
        "leetcode": "https://leetcode.com/problems/design-twitter/",
        "requirements": "Design Twitter with news feed functionality"
      },
      {
        "id": 512,
        "leetcode_id": 373,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Find K Pairs with Smallest Sums",
        "leetcode": "https://leetcode.com/problems/find-k-pairs-with-smallest-sums/",
        "requirements": "Find k pairs with smallest sums"
      },
      {
        "id": 513,
        "leetcode_id": 378,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Kth Smallest Element in a Sorted Matrix",
        "leetcode": "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/",
        "requirements": "Find kth smallest element in matrix"
      },
      {
        "id": 514,
        "leetcode_id": 264,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Ugly Number II",
        "leetcode": "https://leetcode.com/problems/ugly-number-ii/",
        "requirements": "Find nth ugly number using priority queue"
      },
      {
        "id": 515,
        "leetcode_id": 218,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "The Skyline Problem",
        "leetcode": "https://leetcode.com/problems/the-skyline-problem/",
        "requirements": "Find skyline formed by buildings"
      },
      {
        "id": 516,
        "leetcode_id": 621,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Task Scheduler",
        "leetcode": "https://leetcode.com/problems/task-scheduler/",
        "requirements": "Schedule tasks with cooling periods"
      },
      {
        "id": 517,
        "leetcode_id": 767,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Reorganize String",
        "leetcode": "https://leetcode.com/problems/reorganize-string/",
        "requirements": "Reorganize string so no adjacent chars are same"
      },
      {
        "id": 518,
        "leetcode_id": 692,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Top K Frequent Words",
        "leetcode": "https://leetcode.com/problems/top-k-frequent-words/",
        "requirements": "Find k most frequent words"
      },
      {
        "id": 519,
        "leetcode_id": 1046,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Last Stone Weight",
        "leetcode": "https://leetcode.com/problems/last-stone-weight/",
        "requirements": "Simulate stone smashing with max heap"
      },
      {
        "id": 520,
        "leetcode_id": 1642,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Furthest Building You Can Reach",
        "leetcode": "https://leetcode.com/problems/furthest-building-you-can-reach/",
        "requirements": "Maximize distance with ladders and bricks"
      },
      {
        "id": 521,
        "leetcode_id": 1675,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Minimize Deviation in Array",
        "leetcode": "https://leetcode.com/problems/minimize-deviation-in-array/",
        "requirements": "Minimize max-min difference with operations"
      },
      {
        "id": 522,
        "leetcode_id": 1753,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Score From Removing Stones",
        "leetcode": "https://leetcode.com/problems/maximum-score-from-removing-stones/",
        "requirements": "Maximize score by removing pairs of stones"
      },
      {
        "id": 523,
        "leetcode_id": 407,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Trapping Rain Water II",
        "leetcode": "https://leetcode.com/problems/trapping-rain-water-ii/",
        "requirements": "Find water trapped in 3D elevation map"
      },
      {
        "id": 524,
        "leetcode_id": 630,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Course Schedule III",
        "leetcode": "https://leetcode.com/problems/course-schedule-iii/",
        "requirements": "Maximum courses to take with deadlines"
      },
      {
        "id": 525,
        "leetcode_id": 857,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Minimum Cost to Hire K Workers",
        "leetcode": "https://leetcode.com/problems/minimum-cost-to-hire-k-workers/",
        "requirements": "Minimize cost while hiring k workers"
      },
      {
        "id": 526,
        "leetcode_id": 239,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "Sliding Window Maximum",
        "leetcode": "https://leetcode.com/problems/sliding-window-maximum/",
        "requirements": "Find maximum in sliding window"
      },
      {
        "id": 527,
        "leetcode_id": 1792,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Average Pass Ratio",
        "leetcode": "https://leetcode.com/problems/maximum-average-pass-ratio/",
        "requirements": "Maximize average pass ratio by assigning students"
      },
      {
        "id": 528,
        "leetcode_id": 1705,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Number of Eaten Apples",
        "leetcode": "https://leetcode.com/problems/maximum-number-of-eaten-apples/",
        "requirements": "Maximize apples eaten with expiration dates"
      },
      {
        "id": 529,
        "leetcode_id": 659,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Split Array into Consecutive Subsequences",
        "leetcode": "https://leetcode.com/problems/split-array-into-consecutive-subsequences/",
        "requirements": "Split array into consecutive subsequences of length >= 3"
      },
      {
        "id": 530,
        "leetcode_id": 871,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Minimum Number of Refueling Stops",
        "leetcode": "https://leetcode.com/problems/minimum-number-of-refueling-stops/",
        "requirements": "Minimize stops to reach destination"
      },
      {
        "id": 531,
        "leetcode_id": 1054,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Distant Barcodes",
        "leetcode": "https://leetcode.com/problems/distant-barcodes/",
        "requirements": "Rearrange barcodes so no two adjacent are same"
      },
      {
        "id": 532,
        "leetcode_id": 1882,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Process Tasks Using Servers",
        "leetcode": "https://leetcode.com/problems/process-tasks-using-servers/",
        "requirements": "Assign tasks to servers with priorities"
      }
    ]
  },
  "Tries": {
    "tip": "Tries (prefix trees) are specialized tree structures optimized for retrieval operations on a dynamic set of strings. They excel at problems involving prefix matching, auto-completion, spell checking, and word dictionaries. Look for problems involving string searches, prefix operations, or when you need to efficiently store and query a large set of strings.",
    "problems": [
      {
        "id": 533,
        "leetcode_id": 208,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Implement Trie (Prefix Tree)",
        "leetcode": "https://leetcode.com/problems/implement-trie-prefix-tree/",
        "requirements": "Implement a basic trie with insert, search, and startsWith operations"
      },
      {
        "id": 534,
        "leetcode_id": 211,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Design Add and Search Words Data Structure",
        "leetcode": "https://leetcode.com/problems/design-add-and-search-words-data-structure/",
        "requirements": "Design trie supporting wildcard search"
      },
      {
        "id": 535,
        "leetcode_id": 212,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "Word Search II",
        "leetcode": "https://leetcode.com/problems/word-search-ii/",
        "requirements": "Find words from dictionary in a board using trie"
      },
      {
        "id": 536,
        "leetcode_id": 1023,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Camelcase Matching",
        "leetcode": "https://leetcode.com/problems/camelcase-matching/",
        "requirements": "Check if query matches pattern with additional lowercase letters"
      },
      {
        "id": 537,
        "leetcode_id": 648,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Replace Words",
        "leetcode": "https://leetcode.com/problems/replace-words/",
        "requirements": "Replace words with their root in a sentence"
      },
      {
        "id": 538,
        "leetcode_id": 677,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Map Sum Pairs",
        "leetcode": "https://leetcode.com/problems/map-sum-pairs/",
        "requirements": "Get sum of values with given prefix"
      },
      {
        "id": 539,
        "leetcode_id": 720,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Longest Word in Dictionary",
        "leetcode": "https://leetcode.com/problems/longest-word-in-dictionary/",
        "requirements": "Find longest word built one character at a time"
      },
      {
        "id": 540,
        "leetcode_id": 1268,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Search Suggestions System",
        "leetcode": "https://leetcode.com/problems/search-suggestions-system/",
        "requirements": "Implement search autocomplete system"
      },
      {
        "id": 541,
        "leetcode_id": 745,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Prefix and Suffix Search",
        "leetcode": "https://leetcode.com/problems/prefix-and-suffix-search/",
        "requirements": "Design structure for prefix and suffix search"
      },
      {
        "id": 542,
        "leetcode_id": 676,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Implement Magic Dictionary",
        "leetcode": "https://leetcode.com/problems/implement-magic-dictionary/",
        "requirements": "Search words with exactly one character replaced"
      },
      {
        "id": 543,
        "leetcode_id": 1032,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Stream of Characters",
        "leetcode": "https://leetcode.com/problems/stream-of-characters/",
        "requirements": "Query if stream suffix is in word list"
      },
      {
        "id": 544,
        "leetcode_id": 692,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Top K Frequent Words",
        "leetcode": "https://leetcode.com/problems/top-k-frequent-words/",
        "requirements": "Find k most frequent words using trie and heap"
      },
      {
        "id": 545,
        "leetcode_id": 1065,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Index Pairs of a String",
        "leetcode": "https://leetcode.com/problems/index-pairs-of-a-string/",
        "requirements": "Find start/end indices of all words from dictionary in text"
      },
      {
        "id": 546,
        "leetcode_id": 642,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Design Search Autocomplete System",
        "leetcode": "https://leetcode.com/problems/design-search-autocomplete-system/",
        "requirements": "Design system showing top searches as you type"
      },
      {
        "id": 547,
        "leetcode_id": 588,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Design In-Memory File System",
        "leetcode": "https://leetcode.com/problems/design-in-memory-file-system/",
        "requirements": "Design file system with directories and files"
      },
      {
        "id": 548,
        "leetcode_id": 425,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Word Squares",
        "leetcode": "https://leetcode.com/problems/word-squares/",
        "requirements": "Form word squares from given words"
      },
      {
        "id": 549,
        "leetcode_id": 472,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Concatenated Words",
        "leetcode": "https://leetcode.com/problems/concatenated-words/",
        "requirements": "Find words that can be formed by concatenating other words"
      },
      {
        "id": 550,
        "leetcode_id": 820,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Short Encoding of Words",
        "leetcode": "https://leetcode.com/problems/short-encoding-of-words/",
        "requirements": "Find shortest string that can encode all words"
      },
      {
        "id": 551,
        "leetcode_id": 336,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Palindrome Pairs",
        "leetcode": "https://leetcode.com/problems/palindrome-pairs/",
        "requirements": "Find pairs of words that form palindromes"
      },
      {
        "id": 552,
        "leetcode_id": 1233,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Remove Sub-Folders from the Filesystem",
        "leetcode": "https://leetcode.com/problems/remove-sub-folders-from-the-filesystem/",
        "requirements": "Remove all sub-folders from file system"
      },
      {
        "id": 553,
        "leetcode_id": 1166,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Design File System",
        "leetcode": "https://leetcode.com/problems/design-file-system/",
        "requirements": "Create new paths and retrieve file values"
      },
      {
        "id": 554,
        "leetcode_id": 1804,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Implement Trie II (Prefix Tree)",
        "leetcode": "https://leetcode.com/problems/implement-trie-ii-prefix-tree/",
        "requirements": "Implement trie with count operations"
      },
      {
        "id": 555,
        "leetcode_id": 1948,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Delete Duplicate Folders in System",
        "leetcode": "https://leetcode.com/problems/delete-duplicate-folders-in-system/",
        "requirements": "Delete folders with identical structures"
      },
      {
        "id": 556,
        "leetcode_id": 2135,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Count Words Obtained After Adding a Letter",
        "leetcode": "https://leetcode.com/problems/count-words-obtained-after-adding-a-letter/",
        "requirements": "Count target words formable by adding one letter to starter words"
      },
      {
        "id": 557,
        "leetcode_id": 527,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Word Abbreviation",
        "leetcode": "https://leetcode.com/problems/word-abbreviation/",
        "requirements": "Generate unique abbreviations for words"
      },
      {
        "id": 558,
        "leetcode_id": 1938,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Maximum Genetic Difference Query",
        "leetcode": "https://leetcode.com/problems/maximum-genetic-difference-query/",
        "requirements": "Find maximum XOR difference for each query using bit trie"
      },
      {
        "id": 559,
        "leetcode_id": 440,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "K-th Smallest in Lexicographical Order",
        "leetcode": "https://leetcode.com/problems/k-th-smallest-in-lexicographical-order/",
        "requirements": "Find kth number in lexicographical order"
      },
      {
        "id": 560,
        "leetcode_id": 1707,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Maximum XOR With an Element From Array",
        "leetcode": "https://leetcode.com/problems/maximum-xor-with-an-element-from-array/",
        "requirements": "Find maximum XOR for queries with constraints"
      },
      {
        "id": 561,
        "leetcode_id": 2416,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Sum of Prefix Scores of Strings",
        "leetcode": "https://leetcode.com/problems/sum-of-prefix-scores-of-strings/",
        "requirements": "Calculate sum of counts of prefixes"
      },
      {
        "id": 562,
        "leetcode_id": 1803,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Count Pairs With XOR in a Range",
        "leetcode": "https://leetcode.com/problems/count-pairs-with-xor-in-a-range/",
        "requirements": "Count pairs with XOR in given range using bit trie"
      }
    ]
  },
  "Graphs": {
    "tip": "Graphs represent connections between objects and are used to model networks, relationships, and systems. This section focuses on basic graph traversal (DFS/BFS) and fundamental operations on graph structures. Look for problems involving connected components, simple path finding, and basic graph properties.",
    "problems": [
      {
        "id": 563,
        "leetcode_id": 200,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Number of Islands",
        "leetcode": "https://leetcode.com/problems/number-of-islands/",
        "requirements": "Count connected land cells in grid using DFS/BFS"
      },
      {
        "id": 564,
        "leetcode_id": 133,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Clone Graph",
        "leetcode": "https://leetcode.com/problems/clone-graph/",
        "requirements": "Create deep copy of graph using DFS/BFS"
      },
      {
        "id": 565,
        "leetcode_id": 695,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Max Area of Island",
        "leetcode": "https://leetcode.com/problems/max-area-of-island/",
        "requirements": "Find largest connected component in grid"
      },
      {
        "id": 566,
        "leetcode_id": 733,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Flood Fill",
        "leetcode": "https://leetcode.com/problems/flood-fill/",
        "requirements": "Fill connected component with new color"
      },
      {
        "id": 567,
        "leetcode_id": 797,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "All Paths From Source to Target",
        "leetcode": "https://leetcode.com/problems/all-paths-from-source-to-target/",
        "requirements": "Find all paths from node 0 to node n-1 in DAG"
      },
      {
        "id": 568,
        "leetcode_id": 841,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Keys and Rooms",
        "leetcode": "https://leetcode.com/problems/keys-and-rooms/",
        "requirements": "Check if all rooms can be visited"
      },
      {
        "id": 569,
        "leetcode_id": 997,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Find the Town Judge",
        "leetcode": "https://leetcode.com/problems/find-the-town-judge/",
        "requirements": "Find node with in-degree n-1 and out-degree 0"
      },
      {
        "id": 570,
        "leetcode_id": 1059,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "All Paths from Source Lead to Destination",
        "leetcode": "https://leetcode.com/problems/all-paths-from-source-lead-to-destination/",
        "requirements": "Check if all paths lead to destination"
      },
      {
        "id": 571,
        "leetcode_id": 1971,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Find if Path Exists in Graph",
        "leetcode": "https://leetcode.com/problems/find-if-path-exists-in-graph/",
        "requirements": "Check if path exists between two nodes"
      },
      {
        "id": 572,
        "leetcode_id": 1466,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Reorder Routes to Make All Paths Lead to the City Zero",
        "leetcode": "https://leetcode.com/problems/reorder-routes-to-make-all-paths-lead-to-the-city-zero/",
        "requirements": "Count edges to reorient in a tree"
      },
      {
        "id": 573,
        "leetcode_id": 1791,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Find Center of Star Graph",
        "leetcode": "https://leetcode.com/problems/find-center-of-star-graph/",
        "requirements": "Find node connected to all others"
      },
      {
        "id": 574,
        "leetcode_id": 1306,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Jump Game III",
        "leetcode": "https://leetcode.com/problems/jump-game-iii/",
        "requirements": "Check if zero can be reached by jumping"
      },
      {
        "id": 575,
        "leetcode_id": 690,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Employee Importance",
        "leetcode": "https://leetcode.com/problems/employee-importance/",
        "requirements": "Calculate total importance of employees"
      },
      {
        "id": 576,
        "leetcode_id": 1267,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Count Servers that Communicate",
        "leetcode": "https://leetcode.com/problems/count-servers-that-communicate/",
        "requirements": "Count servers that connect to others"
      },
      {
        "id": 577,
        "leetcode_id": 1557,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Minimum Number of Vertices to Reach All Nodes",
        "leetcode": "https://leetcode.com/problems/minimum-number-of-vertices-to-reach-all-nodes/",
        "requirements": "Find nodes with zero in-degree in DAG"
      },
      {
        "id": 578,
        "leetcode_id": 2192,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "All Ancestors of a Node in a Directed Acyclic Graph",
        "leetcode": "https://leetcode.com/problems/all-ancestors-of-a-node-in-a-directed-acyclic-graph/",
        "requirements": "Find all ancestors of each node in DAG"
      },
      {
        "id": 579,
        "leetcode_id": 1436,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Destination City",
        "leetcode": "https://leetcode.com/problems/destination-city/",
        "requirements": "Find city with no outgoing path"
      },
      {
        "id": 580,
        "leetcode_id": 1391,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Check if There is a Valid Path in a Grid",
        "leetcode": "https://leetcode.com/problems/check-if-there-is-a-valid-path-in-a-grid/",
        "requirements": "Check if there is a path from top-left to bottom-right following street directions"
      },
      {
        "id": 581,
        "leetcode_id": 2115,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Find All Possible Recipes from Given Supplies",
        "leetcode": "https://leetcode.com/problems/find-all-possible-recipes-from-given-supplies/",
        "requirements": "Find feasible recipes based on ingredients"
      },
      {
        "id": 582,
        "leetcode_id": 1202,
        "difficulty": "Medium",
        "frequency": "Medium",
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
        "id": 583,
        "leetcode_id": 200,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Number of Islands",
        "leetcode": "https://leetcode.com/problems/number-of-islands/",
        "requirements": "Count connected land cells in grid using DFS"
      },
      {
        "id": 584,
        "leetcode_id": 133,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Clone Graph",
        "leetcode": "https://leetcode.com/problems/clone-graph/",
        "requirements": "Create deep copy of graph using DFS"
      },
      {
        "id": 585,
        "leetcode_id": 695,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Max Area of Island",
        "leetcode": "https://leetcode.com/problems/max-area-of-island/",
        "requirements": "Find largest connected component in grid using DFS"
      },
      {
        "id": 586,
        "leetcode_id": 733,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Flood Fill",
        "leetcode": "https://leetcode.com/problems/flood-fill/",
        "requirements": "Fill connected component with new color using DFS"
      },
      {
        "id": 587,
        "leetcode_id": 797,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "All Paths From Source to Target",
        "leetcode": "https://leetcode.com/problems/all-paths-from-source-to-target/",
        "requirements": "Find all paths from node 0 to node n-1 in DAG using DFS"
      },
      {
        "id": 588,
        "leetcode_id": 841,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Keys and Rooms",
        "leetcode": "https://leetcode.com/problems/keys-and-rooms/",
        "requirements": "Check if all rooms can be visited using DFS"
      },
      {
        "id": 589,
        "leetcode_id": 1254,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Number of Closed Islands",
        "leetcode": "https://leetcode.com/problems/number-of-closed-islands/",
        "requirements": "Count islands not touching boundary using DFS"
      },
      {
        "id": 590,
        "leetcode_id": 1020,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Number of Enclaves",
        "leetcode": "https://leetcode.com/problems/number-of-enclaves/",
        "requirements": "Count land cells not connected to boundary using DFS"
      },
      {
        "id": 591,
        "leetcode_id": 79,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Word Search",
        "leetcode": "https://leetcode.com/problems/word-search/",
        "requirements": "Search for word in grid using DFS"
      },
      {
        "id": 592,
        "leetcode_id": 130,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Surrounded Regions",
        "leetcode": "https://leetcode.com/problems/surrounded-regions/",
        "requirements": "Capture regions surrounded by X using DFS"
      },
      {
        "id": 593,
        "leetcode_id": 417,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Pacific Atlantic Water Flow",
        "leetcode": "https://leetcode.com/problems/pacific-atlantic-water-flow/",
        "requirements": "Find cells with paths to both oceans using DFS"
      },
      {
        "id": 594,
        "leetcode_id": 1559,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Detect Cycles in 2D Grid",
        "leetcode": "https://leetcode.com/problems/detect-cycles-in-2d-grid/",
        "requirements": "Check if grid contains cycle using DFS"
      },
      {
        "id": 595,
        "leetcode_id": 547,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Number of Provinces",
        "leetcode": "https://leetcode.com/problems/number-of-provinces/",
        "requirements": "Count connected components in graph using DFS"
      },
      {
        "id": 596,
        "leetcode_id": 1992,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Find All Groups of Farmland",
        "leetcode": "https://leetcode.com/problems/find-all-groups-of-farmland/",
        "requirements": "Find all rectangular farmlands using DFS"
      },
      {
        "id": 597,
        "leetcode_id": 1376,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Time Needed to Inform All Employees",
        "leetcode": "https://leetcode.com/problems/time-needed-to-inform-all-employees/",
        "requirements": "Find maximum time to inform all employees using DFS"
      },
      {
        "id": 598,
        "leetcode_id": 1391,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Check if There is a Valid Path in a Grid",
        "leetcode": "https://leetcode.com/problems/check-if-there-is-a-valid-path-in-a-grid/",
        "requirements": "Check if there is a path from top-left to bottom-right using DFS"
      },
      {
        "id": 599,
        "leetcode_id": 529,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Minesweeper",
        "leetcode": "https://leetcode.com/problems/minesweeper/",
        "requirements": "Implement Minesweeper game using DFS"
      },
      {
        "id": 600,
        "leetcode_id": 1034,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Coloring A Border",
        "leetcode": "https://leetcode.com/problems/coloring-a-border/",
        "requirements": "Color border of connected component using DFS"
      },
      {
        "id": 601,
        "leetcode_id": 1466,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Reorder Routes to Make All Paths Lead to the City Zero",
        "leetcode": "https://leetcode.com/problems/reorder-routes-to-make-all-paths-lead-to-the-city-zero/",
        "requirements": "Count edges to reorient in a tree using DFS"
      },
      {
        "id": 602,
        "leetcode_id": 1905,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Count Sub Islands",
        "leetcode": "https://leetcode.com/problems/count-sub-islands/",
        "requirements": "Count islands that are subsets of another grid using DFS"
      },
      {
        "id": 603,
        "leetcode_id": 1239,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Length of a Concatenated String with Unique Characters",
        "leetcode": "https://leetcode.com/problems/maximum-length-of-a-concatenated-string-with-unique-characters/",
        "requirements": "Find maximum length string with unique characters using DFS"
      },
      {
        "id": 604,
        "leetcode_id": 721,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Accounts Merge",
        "leetcode": "https://leetcode.com/problems/accounts-merge/",
        "requirements": "Merge accounts with common emails using DFS"
      },
      {
        "id": 605,
        "leetcode_id": 1306,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Jump Game III",
        "leetcode": "https://leetcode.com/problems/jump-game-iii/",
        "requirements": "Check if zero can be reached using DFS"
      },
      {
        "id": 606,
        "leetcode_id": 694,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Number of Distinct Islands",
        "leetcode": "https://leetcode.com/problems/number-of-distinct-islands/",
        "requirements": "Count distinct island shapes using DFS and hashing"
      },
      {
        "id": 607,
        "leetcode_id": 1102,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Path With Maximum Minimum Value",
        "leetcode": "https://leetcode.com/problems/path-with-maximum-minimum-value/",
        "requirements": "Find path with maximum minimum value using DFS and binary search"
      },
      {
        "id": 608,
        "leetcode_id": 339,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Nested List Weight Sum",
        "leetcode": "https://leetcode.com/problems/nested-list-weight-sum/",
        "requirements": "Calculate weighted sum of nested integers using DFS"
      },
      {
        "id": 609,
        "leetcode_id": 1315,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Sum of Nodes with Even-Valued Grandparent",
        "leetcode": "https://leetcode.com/problems/sum-of-nodes-with-even-valued-grandparent/",
        "requirements": "Sum nodes with even-valued grandparents using DFS"
      },
      {
        "id": 610,
        "leetcode_id": 1319,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Number of Operations to Make Network Connected",
        "leetcode": "https://leetcode.com/problems/number-of-operations-to-make-network-connected/",
        "requirements": "Find minimum edges to connect all components using DFS"
      },
      {
        "id": 611,
        "leetcode_id": 1706,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Where Will the Ball Fall",
        "leetcode": "https://leetcode.com/problems/where-will-the-ball-fall/",
        "requirements": "Determine where balls will fall in a grid using DFS"
      },
      {
        "id": 612,
        "leetcode_id": 690,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Employee Importance",
        "leetcode": "https://leetcode.com/problems/employee-importance/",
        "requirements": "Calculate total importance of employees using DFS"
      }
    ]
  },     
  "Graph BFS": {
    "tip": "Graph BFS (Breadth-First Search) explores a graph level by level, visiting all neighbors of a node before moving to the next level. It's ideal for finding the shortest path in unweighted graphs and solving problems where distance or levels from a source are important. Look for problems requiring the minimum number of steps or level-by-level processing.",
    "problems": [
      {
        "id": 613,
        "leetcode_id": 200,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Number of Islands",
        "leetcode": "https://leetcode.com/problems/number-of-islands/",
        "requirements": "Count connected land cells in grid using BFS"
      },
      {
        "id": 614,
        "leetcode_id": 133,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Clone Graph",
        "leetcode": "https://leetcode.com/problems/clone-graph/",
        "requirements": "Create deep copy of graph using BFS"
      },
      {
        "id": 615,
        "leetcode_id": 994,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Rotting Oranges",
        "leetcode": "https://leetcode.com/problems/rotting-oranges/",
        "requirements": "Find minimum time for all oranges to rot using BFS"
      },
      {
        "id": 616,
        "leetcode_id": 733,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Flood Fill",
        "leetcode": "https://leetcode.com/problems/flood-fill/",
        "requirements": "Fill connected component with new color using BFS"
      },
      {
        "id": 617,
        "leetcode_id": 1091,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Shortest Path in Binary Matrix",
        "leetcode": "https://leetcode.com/problems/shortest-path-in-binary-matrix/",
        "requirements": "Find shortest path from top-left to bottom-right using BFS"
      },
      {
        "id": 618,
        "leetcode_id": 934,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Shortest Bridge",
        "leetcode": "https://leetcode.com/problems/shortest-bridge/",
        "requirements": "Find shortest bridge connecting two islands using BFS"
      },
      {
        "id": 619,
        "leetcode_id": 127,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "Word Ladder",
        "leetcode": "https://leetcode.com/problems/word-ladder/",
        "requirements": "Find shortest transformation sequence using BFS"
      },
      {
        "id": 620,
        "leetcode_id": 752,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Open the Lock",
        "leetcode": "https://leetcode.com/problems/open-the-lock/",
        "requirements": "Find minimum rotations to unlock using BFS"
      },
      {
        "id": 621,
        "leetcode_id": 542,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "01 Matrix",
        "leetcode": "https://leetcode.com/problems/01-matrix/",
        "requirements": "Find distance of each cell to nearest 0 using BFS"
      },
      {
        "id": 622,
        "leetcode_id": 1162,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "As Far from Land as Possible",
        "leetcode": "https://leetcode.com/problems/as-far-from-land-as-possible/",
        "requirements": "Find maximum distance from land using BFS"
      },
      {
        "id": 623,
        "leetcode_id": 909,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Snakes and Ladders",
        "leetcode": "https://leetcode.com/problems/snakes-and-ladders/",
        "requirements": "Find minimum moves to reach end using BFS"
      },
      {
        "id": 624,
        "leetcode_id": 1926,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Nearest Exit from Entrance in Maze",
        "leetcode": "https://leetcode.com/problems/nearest-exit-from-entrance-in-maze/",
        "requirements": "Find nearest exit from maze using BFS"
      },
      {
        "id": 625,
        "leetcode_id": 286,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Walls and Gates",
        "leetcode": "https://leetcode.com/problems/walls-and-gates/",
        "requirements": "Fill rooms with distance to nearest gate using BFS"
      },
      {
        "id": 626,
        "leetcode_id": 1306,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Jump Game III",
        "leetcode": "https://leetcode.com/problems/jump-game-iii/",
        "requirements": "Check if zero can be reached using BFS"
      },
      {
        "id": 627,
        "leetcode_id": 1730,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Shortest Path to Get Food",
        "leetcode": "https://leetcode.com/problems/shortest-path-to-get-food/",
        "requirements": "Find shortest path to food using BFS"
      },
      {
        "id": 628,
        "leetcode_id": 841,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Keys and Rooms",
        "leetcode": "https://leetcode.com/problems/keys-and-rooms/",
        "requirements": "Check if all rooms can be visited using BFS"
      },
      {
        "id": 629,
        "leetcode_id": 1992,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Find All Groups of Farmland",
        "leetcode": "https://leetcode.com/problems/find-all-groups-of-farmland/",
        "requirements": "Find all rectangular farmlands using BFS"
      },
      {
        "id": 630,
        "leetcode_id": 433,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Minimum Genetic Mutation",
        "leetcode": "https://leetcode.com/problems/minimum-genetic-mutation/",
        "requirements": "Find minimum mutations to reach target gene using BFS"
      },
      {
        "id": 631,
        "leetcode_id": 1654,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Minimum Jumps to Reach Home",
        "leetcode": "https://leetcode.com/problems/minimum-jumps-to-reach-home/",
        "requirements": "Find minimum jumps to reach target position using BFS"
      },
      {
        "id": 632,
        "leetcode_id": 1740,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Find Distance in a Binary Tree",
        "leetcode": "https://leetcode.com/problems/find-distance-in-a-binary-tree/",
        "requirements": "Find distance between two nodes in binary tree using BFS"
      }
    ]
  },
  "Union Find": {
    "tip": "Union Find (also known as Disjoint Set) is a data structure for efficiently tracking a partition of elements into disjoint subsets. It's ideal for problems involving grouping elements, finding connected components, detecting cycles in undirected graphs, or dynamically tracking element relationships. Look for problems that involve merging elements into sets, determining if two elements belong to the same group, or situations where relationships between elements can be represented as an equivalence relation (reflexive, symmetric, transitive).",
    "problems": [
      {
        "id": 582,
        "leetcode_id": 547,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Number of Provinces",
        "leetcode": "https://leetcode.com/problems/number-of-provinces/",
        "requirements": "Finding connected components in a graph using Union Find"
      },
      {
        "id": 583,
        "leetcode_id": 200,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Number of Islands",
        "leetcode": "https://leetcode.com/problems/number-of-islands/",
        "requirements": "Finding connected land cells in grid using Union Find"
      },
      {
        "id": 584,
        "leetcode_id": 684,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Redundant Connection",
        "leetcode": "https://leetcode.com/problems/redundant-connection/",
        "requirements": "Finding edges that form cycles in undirected graph"
      },
      {
        "id": 585,
        "leetcode_id": 323,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Number of Connected Components in an Undirected Graph",
        "leetcode": "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/",
        "requirements": "Counting distinct connected components in a graph"
      },
      {
        "id": 586,
        "leetcode_id": 128,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Longest Consecutive Sequence",
        "leetcode": "https://leetcode.com/problems/longest-consecutive-sequence/",
        "requirements": "Finding longest consecutive elements sequence with Union Find"
      },
      {
        "id": 587,
        "leetcode_id": 721,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Accounts Merge",
        "leetcode": "https://leetcode.com/problems/accounts-merge/",
        "requirements": "Merging accounts based on common emails using Union Find"
      },
      {
        "id": 588,
        "leetcode_id": 1319,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Number of Operations to Make Network Connected",
        "leetcode": "https://leetcode.com/problems/number-of-operations-to-make-network-connected/",
        "requirements": "Finding minimum connections needed to connect all components"
      },
      {
        "id": 589,
        "leetcode_id": 990,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Satisfiability of Equality Equations",
        "leetcode": "https://leetcode.com/problems/satisfiability-of-equality-equations/",
        "requirements": "Checking if equality and inequality equations can be satisfied"
      },
      {
        "id": 590,
        "leetcode_id": 305,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Number of Islands II",
        "leetcode": "https://leetcode.com/problems/number-of-islands-ii/",
        "requirements": "Tracking connected components as new land appears"
      },
      {
        "id": 591,
        "leetcode_id": 839,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Similar String Groups",
        "leetcode": "https://leetcode.com/problems/similar-string-groups/",
        "requirements": "Grouping strings based on similarity rules"
      },
      {
        "id": 592,
        "leetcode_id": 695,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Max Area of Island",
        "leetcode": "https://leetcode.com/problems/max-area-of-island/",
        "requirements": "Finding largest connected component in grid using Union Find"
      },
      {
        "id": 593,
        "leetcode_id": 1202,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Smallest String With Swaps",
        "leetcode": "https://leetcode.com/problems/smallest-string-with-swaps/",
        "requirements": "Finding lexicographically smallest string after swaps using Union Find"
      },
      {
        "id": 594,
        "leetcode_id": 399,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Evaluate Division",
        "leetcode": "https://leetcode.com/problems/evaluate-division/",
        "requirements": "Computing division results based on equation paths"
      },
      {
        "id": 595,
        "leetcode_id": 685,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Redundant Connection II",
        "leetcode": "https://leetcode.com/problems/redundant-connection-ii/",
        "requirements": "Finding redundant edges in directed graphs"
      },
      {
        "id": 596,
        "leetcode_id": 1168,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Optimize Water Distribution in a Village",
        "leetcode": "https://leetcode.com/problems/optimize-water-distribution-in-a-village/",
        "requirements": "Minimum Spanning Tree with well-building option"
      },
      {
        "id": 597,
        "leetcode_id": 959,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Regions Cut By Slashes",
        "leetcode": "https://leetcode.com/problems/regions-cut-by-slashes/",
        "requirements": "Counting regions formed by slash characters"
      },
      {
        "id": 598,
        "leetcode_id": 952,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Largest Component Size by Common Factor",
        "leetcode": "https://leetcode.com/problems/largest-component-size-by-common-factor/",
        "requirements": "Grouping numbers by their prime factors using Union Find"
      },
      {
        "id": 599,
        "leetcode_id": 1579,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Remove Max Number of Edges to Keep Graph Fully Traversable",
        "leetcode": "https://leetcode.com/problems/remove-max-number-of-edges-to-keep-graph-fully-traversable/",
        "requirements": "Maintaining connectivity with two types of edges"
      },
      {
        "id": 600,
        "leetcode_id": 765,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Couples Holding Hands",
        "leetcode": "https://leetcode.com/problems/couples-holding-hands/",
        "requirements": "Minimum swaps to reunite couples using Union Find"
      },
      {
        "id": 601,
        "leetcode_id": 803,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Bricks Falling When Hit",
        "leetcode": "https://leetcode.com/problems/bricks-falling-when-hit/",
        "requirements": "Tracking connected components in reverse time"
      },
      {
        "id": 602,
        "leetcode_id": 1101,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "The Earliest Moment When Everyone Become Friends",
        "leetcode": "https://leetcode.com/problems/the-earliest-moment-when-everyone-become-friends/",
        "requirements": "Finding when all nodes become connected in a time series"
      },
      {
        "id": 603,
        "leetcode_id": 1632,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Rank Transform of a Matrix",
        "leetcode": "https://leetcode.com/problems/rank-transform-of-a-matrix/",
        "requirements": "Ranking elements while preserving order in rows/columns"
      },
      {
        "id": 604,
        "leetcode_id": 924,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Minimize Malware Spread",
        "leetcode": "https://leetcode.com/problems/minimize-malware-spread/",
        "requirements": "Finding node that minimizes infection spread"
      },
      {
        "id": 605,
        "leetcode_id": 928,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Minimize Malware Spread II",
        "leetcode": "https://leetcode.com/problems/minimize-malware-spread-ii/",
        "requirements": "Finding optimal node to remove to minimize infections"
      },
      {
        "id": 606,
        "leetcode_id": 1697,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Checking Existence of Edge Length Limited Paths",
        "leetcode": "https://leetcode.com/problems/checking-existence-of-edge-length-limited-paths/",
        "requirements": "Checking path existence with weight constraints"
      },
      {
        "id": 607,
        "leetcode_id": 1722,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Minimize Hamming Distance After Swap Operations",
        "leetcode": "https://leetcode.com/problems/minimize-hamming-distance-after-swap-operations/",
        "requirements": "Minimizing difference between arrays using allowed swaps"
      },
      {
        "id": 608,
        "leetcode_id": 1627,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Graph Connectivity With Threshold",
        "leetcode": "https://leetcode.com/problems/graph-connectivity-with-threshold/",
        "requirements": "Connecting cities with divisibility relationships"
      },
      {
        "id": 609,
        "leetcode_id": 261,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Graph Valid Tree",
        "leetcode": "https://leetcode.com/problems/graph-valid-tree/",
        "requirements": "Checking if a graph forms a valid tree"
      },
      {
        "id": 610,
        "leetcode_id": 886,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Possible Bipartition",
        "leetcode": "https://leetcode.com/problems/possible-bipartition/",
        "requirements": "Dividing people into two groups without dislikes using Union Find"
      },
      {
        "id": 611,
        "leetcode_id": 1135,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Connecting Cities With Minimum Cost",
        "leetcode": "https://leetcode.com/problems/connecting-cities-with-minimum-cost/",
        "requirements": "Finding minimum spanning tree cost using Kruskal's algorithm"
      }
    ]
  },
  "Topological Sort": {
    "tip": "Topological Sort is an algorithm for ordering the vertices of a directed acyclic graph (DAG) such that for every directed edge (u, v), vertex u comes before vertex v in the ordering. It's ideal for problems involving dependencies, scheduling, or any situation where tasks need to be completed in a specific order. Look for problems mentioning 'prerequisites', 'dependencies', 'build order', or 'scheduling'. Topological Sort is only applicable to DAGs - if the graph contains a cycle, no valid topological ordering exists.",
    "problems": [
      {
        "id": 612,
        "leetcode_id": 207,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Course Schedule",
        "leetcode": "https://leetcode.com/problems/course-schedule/",
        "requirements": "Determine if it's possible to finish all courses given prerequisites"
      },
      {
        "id": 613,
        "leetcode_id": 210,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Course Schedule II",
        "leetcode": "https://leetcode.com/problems/course-schedule-ii/",
        "requirements": "Return the ordering of courses to take to finish all courses"
      },
      {
        "id": 614,
        "leetcode_id": 269,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "Alien Dictionary",
        "leetcode": "https://leetcode.com/problems/alien-dictionary/",
        "requirements": "Determine the order of characters in an alien language"
      },
      {
        "id": 615,
        "leetcode_id": 329,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "Longest Increasing Path in a Matrix",
        "leetcode": "https://leetcode.com/problems/longest-increasing-path-in-a-matrix/",
        "requirements": "Find the length of the longest increasing path in a matrix"
      },
      {
        "id": 616,
        "leetcode_id": 444,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Sequence Reconstruction",
        "leetcode": "https://leetcode.com/problems/sequence-reconstruction/",
        "requirements": "Check if a sequence can be uniquely reconstructed from subsequences"
      },
      {
        "id": 617,
        "leetcode_id": 310,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Minimum Height Trees",
        "leetcode": "https://leetcode.com/problems/minimum-height-trees/",
        "requirements": "Find the roots that give minimum height trees with topological pruning"
      },
      {
        "id": 618,
        "leetcode_id": 802,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Find Eventual Safe States",
        "leetcode": "https://leetcode.com/problems/find-eventual-safe-states/",
        "requirements": "Find all nodes that eventually lead to terminal nodes"
      },
      {
        "id": 619,
        "leetcode_id": 1203,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Sort Items by Groups Respecting Dependencies",
        "leetcode": "https://leetcode.com/problems/sort-items-by-groups-respecting-dependencies/",
        "requirements": "Sort items respecting both group and item dependencies"
      },
      {
        "id": 620,
        "leetcode_id": 2115,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Find All Possible Recipes from Given Supplies",
        "leetcode": "https://leetcode.com/problems/find-all-possible-recipes-from-given-supplies/",
        "requirements": "Find all possible recipes that can be created from supplies"
      },
      {
        "id": 621,
        "leetcode_id": 2050,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Parallel Courses III",
        "leetcode": "https://leetcode.com/problems/parallel-courses-iii/",
        "requirements": "Find minimum time to complete all courses with prerequisites and durations"
      },
      {
        "id": 622,
        "leetcode_id": 1136,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Parallel Courses",
        "leetcode": "https://leetcode.com/problems/parallel-courses/",
        "requirements": "Find minimum semesters to complete all courses with prerequisites"
      },
      {
        "id": 623,
        "leetcode_id": 2192,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "All Ancestors of a Node in a Directed Acyclic Graph",
        "leetcode": "https://leetcode.com/problems/all-ancestors-of-a-node-in-a-directed-acyclic-graph/",
        "requirements": "Find all ancestors of each node in a DAG"
      },
      {
        "id": 624,
        "leetcode_id": 1462,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Course Schedule IV",
        "leetcode": "https://leetcode.com/problems/course-schedule-iv/",
        "requirements": "Determine if a course is a prerequisite of another course"
      },
      {
        "id": 625,
        "leetcode_id": 2127,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Maximum Employees to Be Invited to a Meeting",
        "leetcode": "https://leetcode.com/problems/maximum-employees-to-be-invited-to-a-meeting/",
        "requirements": "Find maximum employees in circular or paired arrangements"
      },
      {
        "id": 626,
        "leetcode_id": 1857,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Largest Color Value in a Directed Graph",
        "leetcode": "https://leetcode.com/problems/largest-color-value-in-a-directed-graph/",
        "requirements": "Find largest color value in any valid path in a directed graph"
      },
      {
        "id": 627,
        "leetcode_id": 1059,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "All Paths from Source Lead to Destination",
        "leetcode": "https://leetcode.com/problems/all-paths-from-source-lead-to-destination/",
        "requirements": "Check if all paths from source lead to destination"
      },
      {
        "id": 628,
        "leetcode_id": 2360,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Longest Cycle in a Graph",
        "leetcode": "https://leetcode.com/problems/longest-cycle-in-a-graph/",
        "requirements": "Find the longest cycle in a directed graph"
      },
      {
        "id": 629,
        "leetcode_id": 851,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Loud and Rich",
        "leetcode": "https://leetcode.com/problems/loud-and-rich/",
        "requirements": "Find the least quiet person among richer people"
      },
      {
        "id": 630,
        "leetcode_id": 2603,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Collect Coins in a Tree",
        "leetcode": "https://leetcode.com/problems/collect-coins-in-a-tree/",
        "requirements": "Find minimum number of moves to collect all coins"
      },
      {
        "id": 631,
        "leetcode_id": 2392,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Build a Matrix With Conditions",
        "leetcode": "https://leetcode.com/problems/build-a-matrix-with-conditions/",
        "requirements": "Build a matrix with row and column conditions"
      },
      {
        "id": 632,
        "leetcode_id": 2371,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Minimize Maximum Value in a Grid",
        "leetcode": "https://leetcode.com/problems/minimize-maximum-value-in-a-grid/",
        "requirements": "Assign values respecting row and column constraints"
      },
      {
        "id": 633,
        "leetcode_id": 2204,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Distance to a Cycle in Undirected Graph",
        "leetcode": "https://leetcode.com/problems/distance-to-a-cycle-in-undirected-graph/",
        "requirements": "Find shortest distance from each node to a cycle"
      },
      {
        "id": 634,
        "leetcode_id": 1591,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Strange Printer II",
        "leetcode": "https://leetcode.com/problems/strange-printer-ii/",
        "requirements": "Determine if grid was printed with rectangles of unique colors"
      },
      {
        "id": 635,
        "leetcode_id": 1557,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Minimum Number of Vertices to Reach All Nodes",
        "leetcode": "https://leetcode.com/problems/minimum-number-of-vertices-to-reach-all-nodes/",
        "requirements": "Find minimum vertices to reach all nodes in a DAG"
      },
      {
        "id": 636,
        "leetcode_id": 2642,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Design Graph With Shortest Path Calculator",
        "leetcode": "https://leetcode.com/problems/design-graph-with-shortest-path-calculator/",
        "requirements": "Design a graph class with shortest path calculation"
      },
      {
        "id": 637,
        "leetcode_id": 1719,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Number Of Ways To Reconstruct A Tree",
        "leetcode": "https://leetcode.com/problems/number-of-ways-to-reconstruct-a-tree/",
        "requirements": "Count ways to build a tree from ancestor pairs"
      },
      {
        "id": 638,
        "leetcode_id": 2440,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Create Components With Same Value",
        "leetcode": "https://leetcode.com/problems/create-components-with-same-value/",
        "requirements": "Find minimum edge removals to create equal-sum components"
      },
      {
        "id": 639,
        "leetcode_id": 2246,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Longest Path With Different Adjacent Characters",
        "leetcode": "https://leetcode.com/problems/longest-path-with-different-adjacent-characters/",
        "requirements": "Find longest path where adjacent nodes have different characters"
      },
      {
        "id": 640,
        "leetcode_id": 2328,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Number of Increasing Paths in a Grid",
        "leetcode": "https://leetcode.com/problems/number-of-increasing-paths-in-a-grid/",
        "requirements": "Count strictly increasing paths in a grid"
      },
      {
        "id": 641,
        "leetcode_id": 2653,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Sliding Subarray Beauty",
        "leetcode": "https://leetcode.com/problems/sliding-subarray-beauty/",
        "requirements": "Find the xth smallest number in each sliding window"
      }
    ]
  },
  "Shortest Path": {
    "tip": "Shortest Path Algorithms find the optimal path between nodes in a graph, minimizing the total path cost. Common algorithms include Dijkstra's (for non-negative weights), Bellman-Ford (handles negative weights), Floyd-Warshall (all pairs shortest paths), and A* (with heuristics for faster searching). These are ideal for problems involving route planning, network routing, or any scenario requiring minimum cost traversal between points. Look for problems mentioning 'minimum distance', 'cheapest path', 'fastest route', or those involving weighted graphs where optimization is required. Consider the constraints on edge weights (positive/negative) and whether you need a single source or all pairs shortest paths to choose the right algorithm.",
    "problems": [
      {
        "id": 642,
        "leetcode_id": 743,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Network Delay Time",
        "leetcode": "https://leetcode.com/problems/network-delay-time/",
        "requirements": "Find time for all nodes to receive a signal using Dijkstra's algorithm"
      },
      {
        "id": 643,
        "leetcode_id": 1631,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Path With Minimum Effort",
        "leetcode": "https://leetcode.com/problems/path-with-minimum-effort/",
        "requirements": "Find path with minimum maximum absolute difference"
      },
      {
        "id": 644,
        "leetcode_id": 787,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Cheapest Flights Within K Stops",
        "leetcode": "https://leetcode.com/problems/cheapest-flights-within-k-stops/",
        "requirements": "Find cheapest price from source to destination with at most k stops"
      },
      {
        "id": 645,
        "leetcode_id": 1514,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Path with Maximum Probability",
        "leetcode": "https://leetcode.com/problems/path-with-maximum-probability/",
        "requirements": "Find path with maximum success probability"
      },
      {
        "id": 646,
        "leetcode_id": 1334,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Find the City With the Smallest Number of Neighbors at a Threshold Distance",
        "leetcode": "https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/",
        "requirements": "Find city with fewest reachable cities within threshold distance"
      },
      {
        "id": 647,
        "leetcode_id": 1976,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Number of Ways to Arrive at Destination",
        "leetcode": "https://leetcode.com/problems/number-of-ways-to-arrive-at-destination/",
        "requirements": "Count ways to reach destination in minimum time"
      },
      {
        "id": 648,
        "leetcode_id": 1368,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Minimum Cost to Make at Least One Valid Path in a Grid",
        "leetcode": "https://leetcode.com/problems/minimum-cost-to-make-at-least-one-valid-path-in-a-grid/",
        "requirements": "Find minimum cost to create valid path from top-left to bottom-right"
      },
      {
        "id": 649,
        "leetcode_id": 399,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Evaluate Division",
        "leetcode": "https://leetcode.com/problems/evaluate-division/",
        "requirements": "Calculate division results using shortest path on weighted graph"
      },
      {
        "id": 650,
        "leetcode_id": 505,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "The Maze II",
        "leetcode": "https://leetcode.com/problems/the-maze-ii/",
        "requirements": "Find shortest path through maze with rolling ball"
      },
      {
        "id": 651,
        "leetcode_id": 1786,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Number of Restricted Paths From First to Last Node",
        "leetcode": "https://leetcode.com/problems/number-of-restricted-paths-from-first-to-last-node/",
        "requirements": "Count paths where distances decrease along the path"
      },
      {
        "id": 652,
        "leetcode_id": 1091,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Shortest Path in Binary Matrix",
        "leetcode": "https://leetcode.com/problems/shortest-path-in-binary-matrix/",
        "requirements": "Find shortest clear path in binary matrix"
      },
      {
        "id": 653,
        "leetcode_id": 2290,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Minimum Obstacle Removal to Reach Corner",
        "leetcode": "https://leetcode.com/problems/minimum-obstacle-removal-to-reach-corner/",
        "requirements": "Find minimum obstacles to remove to create path"
      },
      {
        "id": 654,
        "leetcode_id": 2473,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Minimum Cost to Buy Apples",
        "leetcode": "https://leetcode.com/problems/minimum-cost-to-buy-apples/",
        "requirements": "Find minimum cost to buy specific number of apples"
      },
      {
        "id": 655,
        "leetcode_id": 1928,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Minimum Cost to Reach Destination in Time",
        "leetcode": "https://leetcode.com/problems/minimum-cost-to-reach-destination-in-time/",
        "requirements": "Find minimum cost path within time constraint"
      },
      {
        "id": 656,
        "leetcode_id": 2577,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Minimum Time to Visit a Cell In a Grid",
        "leetcode": "https://leetcode.com/problems/minimum-time-to-visit-a-cell-in-a-grid/",
        "requirements": "Find minimum time to reach bottom-right cell with time constraint"
      },
      {
        "id": 657,
        "leetcode_id": 1293,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Shortest Path in a Grid with Obstacles Elimination",
        "leetcode": "https://leetcode.com/problems/shortest-path-in-a-grid-with-obstacles-elimination/",
        "requirements": "Find shortest path with ability to remove limited obstacles"
      },
      {
        "id": 658,
        "leetcode_id": 1102,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Path With Maximum Minimum Value",
        "leetcode": "https://leetcode.com/problems/path-with-maximum-minimum-value/",
        "requirements": "Find path maximizing the minimum value along the path"
      },
      {
        "id": 659,
        "leetcode_id": 778,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Swim in Rising Water",
        "leetcode": "https://leetcode.com/problems/swim-in-rising-water/",
        "requirements": "Find minimum time to swim from top-left to bottom-right"
      },
      {
        "id": 660,
        "leetcode_id": 499,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "The Maze III",
        "leetcode": "https://leetcode.com/problems/the-maze-iii/",
        "requirements": "Find shortest path with lexicographically smallest string"
      },
      {
        "id": 661,
        "leetcode_id": 1129,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Shortest Path with Alternating Colors",
        "leetcode": "https://leetcode.com/problems/shortest-path-with-alternating-colors/",
        "requirements": "Find shortest paths with alternating red and blue edges"
      },
      {
        "id": 662,
        "leetcode_id": 2045,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Second Minimum Time to Reach Destination",
        "leetcode": "https://leetcode.com/problems/second-minimum-time-to-reach-destination/",
        "requirements": "Find second shortest time to reach destination"
      },
      {
        "id": 663,
        "leetcode_id": 2093,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Minimum Cost to Reach City With Discounts",
        "leetcode": "https://leetcode.com/problems/minimum-cost-to-reach-city-with-discounts/",
        "requirements": "Find minimum cost path with limited toll discounts"
      },
      {
        "id": 664,
        "leetcode_id": 1066,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Campus Bikes II",
        "leetcode": "https://leetcode.com/problems/campus-bikes-ii/",
        "requirements": "Assign bikes to workers minimizing total Manhattan distance"
      },
      {
        "id": 665,
        "leetcode_id": 882,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Reachable Nodes In Subdivided Graph",
        "leetcode": "https://leetcode.com/problems/reachable-nodes-in-subdivided-graph/",
        "requirements": "Maximize nodes reached within limited moves"
      },
      {
        "id": 666,
        "leetcode_id": 1462,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Course Schedule IV",
        "leetcode": "https://leetcode.com/problems/course-schedule-iv/",
        "requirements": "Determine if courses are prerequisites using Floyd-Warshall"
      },
      {
        "id": 667,
        "leetcode_id": 2714,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Find Shortest Path with K Hops",
        "leetcode": "https://leetcode.com/problems/find-shortest-path-with-k-hops/",
        "requirements": "Find shortest path from source to destination with exactly k hops"
      },
      {
        "id": 668,
        "leetcode_id": 2812,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Find the Safest Path in a Grid",
        "leetcode": "https://leetcode.com/problems/find-the-safest-path-in-a-grid/",
        "requirements": "Find path maximizing minimum distance from thieves"
      },
      {
        "id": 669,
        "leetcode_id": 2642,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Design Graph With Shortest Path Calculator",
        "leetcode": "https://leetcode.com/problems/design-graph-with-shortest-path-calculator/",
        "requirements": "Implement data structure supporting shortest path queries"
      },
      {
        "id": 670,
        "leetcode_id": 2699,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Modify Graph Edge Weights",
        "leetcode": "https://leetcode.com/problems/modify-graph-edge-weights/",
        "requirements": "Modify edge weights to make specific shortest path value"
      },
      {
        "id": 671,
        "leetcode_id": 2662,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Minimum Cost of a Path With Special Roads",
        "leetcode": "https://leetcode.com/problems/minimum-cost-of-a-path-with-special-roads/",
        "requirements": "Find minimum cost path using direct moves or special roads"
      }
    ]
  },
  "Greedy": {
    "tip": "Greedy Algorithms make locally optimal choices at each step with the hope of finding a global optimum. They're efficient but don't always guarantee the best solution for all problems. Greedy approaches work well when the problem has 'optimal substructure' (optimal solution contains optimal solutions to subproblems) and a 'greedy choice property' (locally optimal choices lead to globally optimal solution). Look for problems involving optimization, scheduling, resource allocation, or minimizing/maximizing values. Key indicators include terms like 'maximum profit', 'minimum cost', 'optimal arrangement', or scenarios where you need to make sequential decisions. Greedy solutions are typically implemented by sorting input based on a heuristic and then processing elements in that order, making the best choice at each step.",
    "problems": [
      {
        "id": 672,
        "leetcode_id": 455,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Assign Cookies",
        "leetcode": "https://leetcode.com/problems/assign-cookies/",
        "requirements": "Maximize the number of content children by assigning cookies"
      },
      {
        "id": 673,
        "leetcode_id": 55,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Jump Game",
        "leetcode": "https://leetcode.com/problems/jump-game/",
        "requirements": "Determine if you can reach the last index with given jump ranges"
      },
      {
        "id": 674,
        "leetcode_id": 45,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Jump Game II",
        "leetcode": "https://leetcode.com/problems/jump-game-ii/",
        "requirements": "Find minimum jumps to reach the last index"
      },
      {
        "id": 675,
        "leetcode_id": 134,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Gas Station",
        "leetcode": "https://leetcode.com/problems/gas-station/",
        "requirements": "Find starting station to complete circuit with gas constraints"
      },
      {
        "id": 676,
        "leetcode_id": 1005,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Maximize Sum Of Array After K Negations",
        "leetcode": "https://leetcode.com/problems/maximize-sum-of-array-after-k-negations/",
        "requirements": "Maximize array sum after negating elements K times"
      },
      {
        "id": 677,
        "leetcode_id": 860,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Lemonade Change",
        "leetcode": "https://leetcode.com/problems/lemonade-change/",
        "requirements": "Determine if you can provide change for all customer bills"
      },
      {
        "id": 678,
        "leetcode_id": 122,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Best Time to Buy and Sell Stock II",
        "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/",
        "requirements": "Maximize profit by buying and selling stocks multiple times"
      },
      {
        "id": 679,
        "leetcode_id": 1846,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Element After Decreasing and Rearranging",
        "leetcode": "https://leetcode.com/problems/maximum-element-after-decreasing-and-rearranging/",
        "requirements": "Find maximum value after applying given operations"
      },
      {
        "id": 680,
        "leetcode_id": 406,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Queue Reconstruction by Height",
        "leetcode": "https://leetcode.com/problems/queue-reconstruction-by-height/",
        "requirements": "Reconstruct queue based on height and position conditions"
      },
      {
        "id": 681,
        "leetcode_id": 621,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Task Scheduler",
        "leetcode": "https://leetcode.com/problems/task-scheduler/",
        "requirements": "Find minimum time to execute tasks with cooling periods"
      },
      {
        "id": 682,
        "leetcode_id": 452,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Minimum Number of Arrows to Burst Balloons",
        "leetcode": "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/",
        "requirements": "Find minimum arrows to burst all balloons"
      },
      {
        "id": 683,
        "leetcode_id": 1029,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Two City Scheduling",
        "leetcode": "https://leetcode.com/problems/two-city-scheduling/",
        "requirements": "Minimize cost of sending people to two different cities"
      },
      {
        "id": 684,
        "leetcode_id": 763,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Partition Labels",
        "leetcode": "https://leetcode.com/problems/partition-labels/",
        "requirements": "Partition string into parts where each letter appears in at most one part"
      },
      {
        "id": 685,
        "leetcode_id": 1663,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Smallest String With A Given Numeric Value",
        "leetcode": "https://leetcode.com/problems/smallest-string-with-a-given-numeric-value/",
        "requirements": "Create lexicographically smallest string with specific value"
      },
      {
        "id": 686,
        "leetcode_id": 1094,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Car Pooling",
        "leetcode": "https://leetcode.com/problems/car-pooling/",
        "requirements": "Determine if all passengers can be picked up and dropped off"
      },
      {
        "id": 687,
        "leetcode_id": 1710,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Maximum Units on a Truck",
        "leetcode": "https://leetcode.com/problems/maximum-units-on-a-truck/",
        "requirements": "Maximize total units loaded on truck with box constraints"
      },
      {
        "id": 688,
        "leetcode_id": 665,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Non-decreasing Array",
        "leetcode": "https://leetcode.com/problems/non-decreasing-array/",
        "requirements": "Check if array can be made non-decreasing by modifying at most one element"
      },
      {
        "id": 689,
        "leetcode_id": 1818,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Minimum Absolute Sum Difference",
        "leetcode": "https://leetcode.com/problems/minimum-absolute-sum-difference/",
        "requirements": "Minimize sum of absolute differences by replacing one element"
      },
      {
        "id": 690,
        "leetcode_id": 881,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Boats to Save People",
        "leetcode": "https://leetcode.com/problems/boats-to-save-people/",
        "requirements": "Find minimum number of boats to carry people with weight limit"
      },
      {
        "id": 691,
        "leetcode_id": 1648,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Sell Diminishing-Valued Colored Balls",
        "leetcode": "https://leetcode.com/problems/sell-diminishing-valued-colored-balls/",
        "requirements": "Maximize profit from selling colored balls with decreasing values"
      },
      {
        "id": 692,
        "leetcode_id": 1536,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Minimum Swaps to Arrange a Binary Grid",
        "leetcode": "https://leetcode.com/problems/minimum-swaps-to-arrange-a-binary-grid/",
        "requirements": "Find minimum swaps to satisfy grid condition"
      },
      {
        "id": 693,
        "leetcode_id": 1007,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Minimum Domino Rotations For Equal Row",
        "leetcode": "https://leetcode.com/problems/minimum-domino-rotations-for-equal-row/",
        "requirements": "Find minimum rotations to make all values in one row the same"
      },
      {
        "id": 694,
        "leetcode_id": 1953,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Number of Weeks for Which You Can Work",
        "leetcode": "https://leetcode.com/problems/maximum-number-of-weeks-for-which-you-can-work/",
        "requirements": "Find maximum number of weeks to complete projects without consecutive weeks on same project"
      },
      {
        "id": 695,
        "leetcode_id": 1057,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Campus Bikes",
        "leetcode": "https://leetcode.com/problems/campus-bikes/",
        "requirements": "Assign bikes to workers minimizing total Manhattan distance"
      },
      {
        "id": 696,
        "leetcode_id": 1405,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Longest Happy String",
        "leetcode": "https://leetcode.com/problems/longest-happy-string/",
        "requirements": "Construct longest string without three consecutive same characters"
      },
      {
        "id": 697,
        "leetcode_id": 995,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Minimum Number of K Consecutive Bit Flips",
        "leetcode": "https://leetcode.com/problems/minimum-number-of-k-consecutive-bit-flips/",
        "requirements": "Find minimum number of K-length bit flips to make all bits 1"
      },
      {
        "id": 698,
        "leetcode_id": 135,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Candy",
        "leetcode": "https://leetcode.com/problems/candy/",
        "requirements": "Distribute minimum candies to children with rating constraints"
      },
      {
        "id": 699,
        "leetcode_id": 2136,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Earliest Possible Day of Full Bloom",
        "leetcode": "https://leetcode.com/problems/earliest-possible-day-of-full-bloom/",
        "requirements": "Find earliest day to see all plants bloom"
      },
      {
        "id": 700,
        "leetcode_id": 1520,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Maximum Number of Non-Overlapping Substrings",
        "leetcode": "https://leetcode.com/problems/maximum-number-of-non-overlapping-substrings/",
        "requirements": "Find maximum non-overlapping valid substrings"
      },
      {
        "id": 701,
        "leetcode_id": 630,
        "difficulty": "Hard",
        "frequency": "Medium",
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
        "id": 732,
        "leetcode_id": 70,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Climbing Stairs",
        "leetcode": "https://leetcode.com/problems/climbing-stairs/",
        "requirements": "Count ways to climb stairs using 1 or 2 steps at a time"
      },
      {
        "id": 733,
        "leetcode_id": 509,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Fibonacci Number",
        "leetcode": "https://leetcode.com/problems/fibonacci-number/",
        "requirements": "Calculate the nth Fibonacci number efficiently"
      },
      {
        "id": 734,
        "leetcode_id": 139,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Word Break",
        "leetcode": "https://leetcode.com/problems/word-break/",
        "requirements": "Determine if string can be segmented into dictionary words"
      },
      {
        "id": 735,
        "leetcode_id": 322,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Coin Change",
        "leetcode": "https://leetcode.com/problems/coin-change/",
        "requirements": "Find fewest coins needed to make a given amount"
      },
      {
        "id": 736,
        "leetcode_id": 518,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Coin Change 2",
        "leetcode": "https://leetcode.com/problems/coin-change-2/",
        "requirements": "Count number of ways to make a given amount with coins"
      },
      {
        "id": 737,
        "leetcode_id": 198,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "House Robber",
        "leetcode": "https://leetcode.com/problems/house-robber/",
        "requirements": "Find maximum amount you can rob without alerting police"
      },
      {
        "id": 738,
        "leetcode_id": 213,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "House Robber II",
        "leetcode": "https://leetcode.com/problems/house-robber-ii/",
        "requirements": "House robber problem with houses in a circle"
      },
      {
        "id": 739,
        "leetcode_id": 91,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Decode Ways",
        "leetcode": "https://leetcode.com/problems/decode-ways/",
        "requirements": "Count ways to decode a string of digits to letters"
      },
      {
        "id": 740,
        "leetcode_id": 62,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Unique Paths",
        "leetcode": "https://leetcode.com/problems/unique-paths/",
        "requirements": "Count unique paths from top-left to bottom-right in grid"
      },
      {
        "id": 741,
        "leetcode_id": 63,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Unique Paths II",
        "leetcode": "https://leetcode.com/problems/unique-paths-ii/",
        "requirements": "Count unique paths with obstacles in grid"
      },
      {
        "id": 742,
        "leetcode_id": 1137,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "N-th Tribonacci Number",
        "leetcode": "https://leetcode.com/problems/n-th-tribonacci-number/",
        "requirements": "Calculate the nth Tribonacci number efficiently"
      },
      {
        "id": 743,
        "leetcode_id": 300,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Longest Increasing Subsequence",
        "leetcode": "https://leetcode.com/problems/longest-increasing-subsequence/",
        "requirements": "Find length of longest increasing subsequence"
      },
      {
        "id": 744,
        "leetcode_id": 494,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Target Sum",
        "leetcode": "https://leetcode.com/problems/target-sum/",
        "requirements": "Count ways to assign signs to make sum equal target"
      },
      {
        "id": 745,
        "leetcode_id": 416,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Partition Equal Subset Sum",
        "leetcode": "https://leetcode.com/problems/partition-equal-subset-sum/",
        "requirements": "Determine if array can be partitioned into two equal sum subsets"
      },
      {
        "id": 746,
        "leetcode_id": 1143,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Longest Common Subsequence",
        "leetcode": "https://leetcode.com/problems/longest-common-subsequence/",
        "requirements": "Find length of longest common subsequence of two strings"
      },
      {
        "id": 747,
        "leetcode_id": 10,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "Regular Expression Matching",
        "leetcode": "https://leetcode.com/problems/regular-expression-matching/",
        "requirements": "Implement regex pattern matching with . and *"
      },
      {
        "id": 748,
        "leetcode_id": 44,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Wildcard Matching",
        "leetcode": "https://leetcode.com/problems/wildcard-matching/",
        "requirements": "Implement wildcard pattern matching with ? and *"
      },
      {
        "id": 749,
        "leetcode_id": 329,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Longest Increasing Path in a Matrix",
        "leetcode": "https://leetcode.com/problems/longest-increasing-path-in-a-matrix/",
        "requirements": "Find length of longest increasing path in matrix"
      },
      {
        "id": 750,
        "leetcode_id": 72,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "Edit Distance",
        "leetcode": "https://leetcode.com/problems/edit-distance/",
        "requirements": "Find minimum operations to convert one string to another"
      },
      {
        "id": 751,
        "leetcode_id": 115,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Distinct Subsequences",
        "leetcode": "https://leetcode.com/problems/distinct-subsequences/",
        "requirements": "Count distinct subsequences matching target string"
      },
      {
        "id": 752,
        "leetcode_id": 97,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Interleaving String",
        "leetcode": "https://leetcode.com/problems/interleaving-string/",
        "requirements": "Check if third string is interleaving of two input strings"
      },
      {
        "id": 753,
        "leetcode_id": 121,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Best Time to Buy and Sell Stock",
        "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
        "requirements": "Find maximum profit from single stock transaction"
      },
      {
        "id": 754,
        "leetcode_id": 122,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Best Time to Buy and Sell Stock II",
        "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/",
        "requirements": "Find maximum profit from multiple stock transactions"
      },
      {
        "id": 755,
        "leetcode_id": 123,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Best Time to Buy and Sell Stock III",
        "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/",
        "requirements": "Find maximum profit from at most two stock transactions"
      },
      {
        "id": 756,
        "leetcode_id": 120,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Triangle",
        "leetcode": "https://leetcode.com/problems/triangle/",
        "requirements": "Find minimum path sum from top to bottom in triangle"
      },
      {
        "id": 757,
        "leetcode_id": 140,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Word Break II",
        "leetcode": "https://leetcode.com/problems/word-break-ii/",
        "requirements": "Find all possible ways to segment string into dictionary words"
      },
      {
        "id": 758,
        "leetcode_id": 472,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Concatenated Words",
        "leetcode": "https://leetcode.com/problems/concatenated-words/",
        "requirements": "Find words that can be formed by concatenating other words"
      },
      {
        "id": 759,
        "leetcode_id": 312,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Burst Balloons",
        "leetcode": "https://leetcode.com/problems/burst-balloons/",
        "requirements": "Find maximum coins by bursting balloons strategically"
      },
      {
        "id": 760,
        "leetcode_id": 377,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Combination Sum IV",
        "leetcode": "https://leetcode.com/problems/combination-sum-iv/",
        "requirements": "Count number of combinations that sum to target"
      },
      {
        "id": 761,
        "leetcode_id": 403,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Frog Jump",
        "leetcode": "https://leetcode.com/problems/frog-jump/",
        "requirements": "Determine if frog can cross river with constrained jumps"
      }
    ]
  },
  "Tabulation": {
    "tip": "Tabulation is the bottom-up approach to dynamic programming where solutions to subproblems are computed iteratively, starting from the smallest subproblems and working towards the complete problem. Unlike memoization (top-down), tabulation fills a table (typically an array or matrix) systematically and doesn't rely on recursion, making it more efficient in terms of stack space. This pattern focuses on the fundamental concept of building a table of solutions to subproblems. Look for problems that can be broken down into smaller overlapping subproblems with optimal substructure. Tabulation requires identifying base cases and a recurrence relation that defines how states evolve, then systematically filling a table to reach the final solution.",
    "problems": [
      {
        "id": 762,
        "leetcode_id": 70,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Climbing Stairs",
        "leetcode": "https://leetcode.com/problems/climbing-stairs/",
        "requirements": "Count ways to climb stairs using bottom-up approach"
      },
      {
        "id": 763,
        "leetcode_id": 746,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Min Cost Climbing Stairs",
        "leetcode": "https://leetcode.com/problems/min-cost-climbing-stairs/",
        "requirements": "Find minimum cost to climb stairs with tabulation"
      },
      {
        "id": 764,
        "leetcode_id": 1137,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "N-th Tribonacci Number",
        "leetcode": "https://leetcode.com/problems/n-th-tribonacci-number/",
        "requirements": "Calculate Tribonacci numbers using tabulation"
      },
      {
        "id": 765,
        "leetcode_id": 509,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Fibonacci Number",
        "leetcode": "https://leetcode.com/problems/fibonacci-number/",
        "requirements": "Calculate Fibonacci numbers using tabulation"
      },
      {
        "id": 766,
        "leetcode_id": 198,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "House Robber",
        "leetcode": "https://leetcode.com/problems/house-robber/",
        "requirements": "Maximum money that can be robbed using tabulation"
      },
      {
        "id": 767,
        "leetcode_id": 213,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "House Robber II",
        "leetcode": "https://leetcode.com/problems/house-robber-ii/",
        "requirements": "House robber with circular arrangement using tabulation"
      },
      {
        "id": 768,
        "leetcode_id": 740,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Delete and Earn",
        "leetcode": "https://leetcode.com/problems/delete-and-earn/",
        "requirements": "Maximize points with element deletion constraints"
      },
      {
        "id": 769,
        "leetcode_id": 121,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Best Time to Buy and Sell Stock",
        "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
        "requirements": "Find maximum profit from a single transaction"
      },
      {
        "id": 770,
        "leetcode_id": 122,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Best Time to Buy and Sell Stock II",
        "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/",
        "requirements": "Find maximum profit from multiple transactions"
      },
      {
        "id": 771,
        "leetcode_id": 1911,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Alternating Subsequence Sum",
        "leetcode": "https://leetcode.com/problems/maximum-alternating-subsequence-sum/",
        "requirements": "Find maximum alternating subsequence sum using tabulation"
      },
      {
        "id": 772,
        "leetcode_id": 413,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Arithmetic Slices",
        "leetcode": "https://leetcode.com/problems/arithmetic-slices/",
        "requirements": "Count number of arithmetic slices in array using tabulation"
      },
      {
        "id": 773,
        "leetcode_id": 1025,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Divisor Game",
        "leetcode": "https://leetcode.com/problems/divisor-game/",
        "requirements": "Determine winner of number game using tabulation"
      },
      {
        "id": 774,
        "leetcode_id": 338,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Counting Bits",
        "leetcode": "https://leetcode.com/problems/counting-bits/",
        "requirements": "Count set bits for range of numbers using tabulation"
      },
      {
        "id": 775,
        "leetcode_id": 2707,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Extra Characters in a String",
        "leetcode": "https://leetcode.com/problems/extra-characters-in-a-string/",
        "requirements": "Minimize extra characters after forming dictionary words"
      },
      {
        "id": 776,
        "leetcode_id": 2466,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Count Ways To Build Good Strings",
        "leetcode": "https://leetcode.com/problems/count-ways-to-build-good-strings/",
        "requirements": "Count ways to build strings with specific characters"
      },
      {
        "id": 777,
        "leetcode_id": 276,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Paint Fence",
        "leetcode": "https://leetcode.com/problems/paint-fence/",
        "requirements": "Count ways to paint fence with no more than two adjacent posts of same color"
      },
      {
        "id": 778,
        "leetcode_id": 983,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Minimum Cost For Tickets",
        "leetcode": "https://leetcode.com/problems/minimum-cost-for-tickets/",
        "requirements": "Find minimum cost for travel tickets using tabulation"
      },
      {
        "id": 779,
        "leetcode_id": 650,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "2 Keys Keyboard",
        "leetcode": "https://leetcode.com/problems/2-keys-keyboard/",
        "requirements": "Find minimum operations to get n 'A' characters"
      },
      {
        "id": 780,
        "leetcode_id": 935,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Knight Dialer",
        "leetcode": "https://leetcode.com/problems/knight-dialer/",
        "requirements": "Count phone numbers using chess knight moves"
      },
      {
        "id": 781,
        "leetcode_id": 91,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Decode Ways",
        "leetcode": "https://leetcode.com/problems/decode-ways/",
        "requirements": "Count ways to decode string using tabulation"
      },
      {
        "id": 782,
        "leetcode_id": 1155,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Number of Dice Rolls With Target Sum",
        "leetcode": "https://leetcode.com/problems/number-of-dice-rolls-with-target-sum/",
        "requirements": "Count ways to get target sum with given dice rolls"
      },
      {
        "id": 783,
        "leetcode_id": 139,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Word Break",
        "leetcode": "https://leetcode.com/problems/word-break/",
        "requirements": "Determine if string can be segmented using tabulation"
      },
      {
        "id": 784,
        "leetcode_id": 926,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Flip String to Monotone Increasing",
        "leetcode": "https://leetcode.com/problems/flip-string-to-monotone-increasing/",
        "requirements": "Minimum flips to make string monotone increasing"
      },
      {
        "id": 785,
        "leetcode_id": 1130,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Minimum Cost Tree From Leaf Values",
        "leetcode": "https://leetcode.com/problems/minimum-cost-tree-from-leaf-values/",
        "requirements": "Construct binary tree with minimum sum of non-leaf nodes"
      },
      {
        "id": 786,
        "leetcode_id": 1218,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Longest Arithmetic Subsequence of Given Difference",
        "leetcode": "https://leetcode.com/problems/longest-arithmetic-subsequence-of-given-difference/",
        "requirements": "Find longest arithmetic subsequence with fixed difference"
      },
      {
        "id": 787,
        "leetcode_id": 799,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Champagne Tower",
        "leetcode": "https://leetcode.com/problems/champagne-tower/",
        "requirements": "Calculate champagne flow using tabulation"
      },
      {
        "id": 788,
        "leetcode_id": 123,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Best Time to Buy and Sell Stock III",
        "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/",
        "requirements": "Find maximum profit with at most two transactions"
      },
      {
        "id": 789,
        "leetcode_id": 2222,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Number of Ways to Select Buildings",
        "leetcode": "https://leetcode.com/problems/number-of-ways-to-select-buildings/",
        "requirements": "Count ways to select buildings with alternating types"
      },
      {
        "id": 790,
        "leetcode_id": 2320,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Count Number of Ways to Place Houses",
        "leetcode": "https://leetcode.com/problems/count-number-of-ways-to-place-houses/",
        "requirements": "Count ways to place houses on both sides of street"
      },
      {
        "id": 791,
        "leetcode_id": 279,
        "difficulty": "Medium",
        "frequency": "Medium",
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
        "id": 792,
        "leetcode_id": 300,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Longest Increasing Subsequence",
        "leetcode": "https://leetcode.com/problems/longest-increasing-subsequence/",
        "requirements": "Find length of longest strictly increasing subsequence"
      },
      {
        "id": 793,
        "leetcode_id": 673,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Number of Longest Increasing Subsequence",
        "leetcode": "https://leetcode.com/problems/number-of-longest-increasing-subsequence/",
        "requirements": "Count the number of longest increasing subsequences"
      },
      {
        "id": 794,
        "leetcode_id": 334,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Increasing Triplet Subsequence",
        "leetcode": "https://leetcode.com/problems/increasing-triplet-subsequence/",
        "requirements": "Determine if increasing subsequence of length 3 exists"
      },
      {
        "id": 795,
        "leetcode_id": 674,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Longest Continuous Increasing Subsequence",
        "leetcode": "https://leetcode.com/problems/longest-continuous-increasing-subsequence/",
        "requirements": "Find length of longest continuous increasing subsequence"
      },
      {
        "id": 796,
        "leetcode_id": 152,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Maximum Product Subarray",
        "leetcode": "https://leetcode.com/problems/maximum-product-subarray/",
        "requirements": "Find the contiguous subarray with largest product"
      },
      {
        "id": 797,
        "leetcode_id": 53,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Maximum Subarray",
        "leetcode": "https://leetcode.com/problems/maximum-subarray/",
        "requirements": "Find contiguous subarray with largest sum using Kadane's algorithm"
      },
      {
        "id": 798,
        "leetcode_id": 918,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Sum Circular Subarray",
        "leetcode": "https://leetcode.com/problems/maximum-sum-circular-subarray/",
        "requirements": "Find maximum sum circular subarray with 1D DP"
      },
      {
        "id": 799,
        "leetcode_id": 1567,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Length of Subarray With Positive Product",
        "leetcode": "https://leetcode.com/problems/maximum-length-of-subarray-with-positive-product/",
        "requirements": "Find longest subarray with positive product"
      },
      {
        "id": 800,
        "leetcode_id": 1746,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Subarray Sum After One Operation",
        "leetcode": "https://leetcode.com/problems/maximum-subarray-sum-after-one-operation/",
        "requirements": "Find maximum subarray sum after replacing one element"
      },
      {
        "id": 801,
        "leetcode_id": 1186,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Subarray Sum with One Deletion",
        "leetcode": "https://leetcode.com/problems/maximum-subarray-sum-with-one-deletion/",
        "requirements": "Maximum subarray sum allowing one element deletion"
      },
      {
        "id": 802,
        "leetcode_id": 1262,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Greatest Sum Divisible by Three",
        "leetcode": "https://leetcode.com/problems/greatest-sum-divisible-by-three/",
        "requirements": "Find maximum sum of elements divisible by three"
      },
      {
        "id": 803,
        "leetcode_id": 1524,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Number of Sub-arrays With Odd Sum",
        "leetcode": "https://leetcode.com/problems/number-of-sub-arrays-with-odd-sum/",
        "requirements": "Count subarrays with odd sum using 1D DP"
      },
      {
        "id": 804,
        "leetcode_id": 1493,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Longest Subarray of 1's After Deleting One Element",
        "leetcode": "https://leetcode.com/problems/longest-subarray-of-1s-after-deleting-one-element/",
        "requirements": "Find longest subarray of 1's after deleting one element"
      },
      {
        "id": 805,
        "leetcode_id": 487,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Max Consecutive Ones II",
        "leetcode": "https://leetcode.com/problems/max-consecutive-ones-ii/",
        "requirements": "Find longest subarray of 1's allowing one 0 flip"
      },
      {
        "id": 806,
        "leetcode_id": 416,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Partition Equal Subset Sum",
        "leetcode": "https://leetcode.com/problems/partition-equal-subset-sum/",
        "requirements": "Determine if array can be partitioned into two equal sum subsets"
      },
      {
        "id": 807,
        "leetcode_id": 494,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Target Sum",
        "leetcode": "https://leetcode.com/problems/target-sum/",
        "requirements": "Find ways to assign + and - to reach target sum"
      },
      {
        "id": 808,
        "leetcode_id": 1049,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Last Stone Weight II",
        "leetcode": "https://leetcode.com/problems/last-stone-weight-ii/",
        "requirements": "Minimize remaining stone weight after smashing pairs"
      },
      {
        "id": 809,
        "leetcode_id": 322,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Coin Change",
        "leetcode": "https://leetcode.com/problems/coin-change/",
        "requirements": "Find fewest coins needed to make a given amount"
      },
      {
        "id": 810,
        "leetcode_id": 518,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Coin Change 2",
        "leetcode": "https://leetcode.com/problems/coin-change-2/",
        "requirements": "Count number of ways to make amount with given coins"
      },
      {
        "id": 811,
        "leetcode_id": 377,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Combination Sum IV",
        "leetcode": "https://leetcode.com/problems/combination-sum-iv/",
        "requirements": "Count combinations that sum to target (with repetition)"
      },
      {
        "id": 812,
        "leetcode_id": 343,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Integer Break",
        "leetcode": "https://leetcode.com/problems/integer-break/",
        "requirements": "Break integer into sum of integers with maximum product"
      },
      {
        "id": 813,
        "leetcode_id": 1105,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Filling Bookcase Shelves",
        "leetcode": "https://leetcode.com/problems/filling-bookcase-shelves/",
        "requirements": "Organize books on shelves to minimize height"
      },
      {
        "id": 814,
        "leetcode_id": 1416,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Restore The Array",
        "leetcode": "https://leetcode.com/problems/restore-the-array/",
        "requirements": "Count ways to restore array from string with bounds"
      },
      {
        "id": 815,
        "leetcode_id": 309,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Best Time to Buy and Sell Stock with Cooldown",
        "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/",
        "requirements": "Maximum profit with cooldown using state transitions"
      },
      {
        "id": 816,
        "leetcode_id": 714,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Best Time to Buy and Sell Stock with Transaction Fee",
        "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/",
        "requirements": "Maximum profit with transaction fee using state transitions"
      },
      {
        "id": 817,
        "leetcode_id": 376,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Wiggle Subsequence",
        "leetcode": "https://leetcode.com/problems/wiggle-subsequence/",
        "requirements": "Find longest wiggle subsequence with alternating differences"
      },
      {
        "id": 818,
        "leetcode_id": 2110,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Number of Smooth Descent Periods of a Stock",
        "leetcode": "https://leetcode.com/problems/number-of-smooth-descent-periods-of-a-stock/",
        "requirements": "Count periods of strictly decreasing stock prices"
      },
      {
        "id": 819,
        "leetcode_id": 256,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Paint House",
        "leetcode": "https://leetcode.com/problems/paint-house/",
        "requirements": "Minimize cost of painting houses with different colors"
      },
      {
        "id": 820,
        "leetcode_id": 1340,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Jump Game V",
        "leetcode": "https://leetcode.com/problems/jump-game-v/",
        "requirements": "Maximum buildings visited with height constraints on jumps"
      },
      {
        "id": 821,
        "leetcode_id": 1575,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Count All Possible Routes",
        "leetcode": "https://leetcode.com/problems/count-all-possible-routes/",
        "requirements": "Count routes between cities with fuel constraints"
      }
    ]
  },
  "2D DP": {
    "tip": "2D Dynamic Programming involves creating and filling a two-dimensional table where each cell (i,j) represents the solution to a subproblem defined by two changing parameters. This pattern is essential for problems involving pairs of sequences (like strings or arrays), grid traversal with constraints, or situations where tracking two independent variables is necessary. Look for problems involving string comparisons, matrix paths, matching or alignment, or optimization scenarios with two varying dimensions. The recurrence relation typically depends on previously computed values in the table, often accessing dp[i-1][j], dp[i][j-1], dp[i-1][j-1], or other nearby cells. Visualizing the 2D table and carefully defining the meaning of each cell is crucial for solving these problems successfully.",
    "problems": [
      {
        "id": 822,
        "leetcode_id": 1143,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Longest Common Subsequence",
        "leetcode": "https://leetcode.com/problems/longest-common-subsequence/",
        "requirements": "Find length of longest common subsequence of two strings"
      },
      {
        "id": 823,
        "leetcode_id": 72,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "Edit Distance",
        "leetcode": "https://leetcode.com/problems/edit-distance/",
        "requirements": "Find minimum operations to convert one string to another"
      },
      {
        "id": 824,
        "leetcode_id": 10,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "Regular Expression Matching",
        "leetcode": "https://leetcode.com/problems/regular-expression-matching/",
        "requirements": "Implement regex pattern matching with . and *"
      },
      {
        "id": 825,
        "leetcode_id": 44,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "Wildcard Matching",
        "leetcode": "https://leetcode.com/problems/wildcard-matching/",
        "requirements": "Implement wildcard pattern matching with ? and *"
      },
      {
        "id": 826,
        "leetcode_id": 97,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Interleaving String",
        "leetcode": "https://leetcode.com/problems/interleaving-string/",
        "requirements": "Check if third string is interleaving of two input strings"
      },
      {
        "id": 827,
        "leetcode_id": 115,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Distinct Subsequences",
        "leetcode": "https://leetcode.com/problems/distinct-subsequences/",
        "requirements": "Count distinct subsequences matching target string"
      },
      {
        "id": 828,
        "leetcode_id": 516,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Longest Palindromic Subsequence",
        "leetcode": "https://leetcode.com/problems/longest-palindromic-subsequence/",
        "requirements": "Find longest palindromic subsequence using 2D DP"
      },
      {
        "id": 829,
        "leetcode_id": 712,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Minimum ASCII Delete Sum for Two Strings",
        "leetcode": "https://leetcode.com/problems/minimum-ascii-delete-sum-for-two-strings/",
        "requirements": "Find minimum ASCII sum of deleted characters to make strings equal"
      },
      {
        "id": 830,
        "leetcode_id": 1092,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Shortest Common Supersequence",
        "leetcode": "https://leetcode.com/problems/shortest-common-supersequence/",
        "requirements": "Find shortest string that has both strings as subsequences"
      },
      {
        "id": 831,
        "leetcode_id": 1312,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Minimum Insertion Steps to Make a String Palindrome",
        "leetcode": "https://leetcode.com/problems/minimum-insertion-steps-to-make-a-string-palindrome/",
        "requirements": "Find minimum insertions to make string a palindrome"
      },
      {
        "id": 832,
        "leetcode_id": 64,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Minimum Path Sum",
        "leetcode": "https://leetcode.com/problems/minimum-path-sum/",
        "requirements": "Find path with minimum sum in grid using 2D DP"
      },
      {
        "id": 833,
        "leetcode_id": 62,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Unique Paths",
        "leetcode": "https://leetcode.com/problems/unique-paths/",
        "requirements": "Count unique paths in grid using 2D DP"
      },
      {
        "id": 834,
        "leetcode_id": 63,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Unique Paths II",
        "leetcode": "https://leetcode.com/problems/unique-paths-ii/",
        "requirements": "Count unique paths with obstacles using 2D DP"
      },
      {
        "id": 835,
        "leetcode_id": 120,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Triangle",
        "leetcode": "https://leetcode.com/problems/triangle/",
        "requirements": "Find minimum path sum in triangle using 2D DP"
      },
      {
        "id": 836,
        "leetcode_id": 931,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Minimum Falling Path Sum",
        "leetcode": "https://leetcode.com/problems/minimum-falling-path-sum/",
        "requirements": "Find minimum sum of falling path through matrix"
      },
      {
        "id": 837,
        "leetcode_id": 221,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Maximal Square",
        "leetcode": "https://leetcode.com/problems/maximal-square/",
        "requirements": "Find largest square of 1's in binary matrix using 2D DP"
      },
      {
        "id": 838,
        "leetcode_id": 85,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "Maximal Rectangle",
        "leetcode": "https://leetcode.com/problems/maximal-rectangle/",
        "requirements": "Find largest rectangle in binary matrix using 2D DP"
      },
      {
        "id": 839,
        "leetcode_id": 1277,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Count Square Submatrices with All Ones",
        "leetcode": "https://leetcode.com/problems/count-square-submatrices-with-all-ones/",
        "requirements": "Count square submatrices with all 1's using 2D DP"
      },
      {
        "id": 840,
        "leetcode_id": 174,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Dungeon Game",
        "leetcode": "https://leetcode.com/problems/dungeon-game/",
        "requirements": "Find minimum initial health to reach bottom-right cell"
      },
      {
        "id": 841,
        "leetcode_id": 741,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Cherry Pickup",
        "leetcode": "https://leetcode.com/problems/cherry-pickup/",
        "requirements": "Collect maximum cherries with two traversals using 2D DP"
      },
      {
        "id": 842,
        "leetcode_id": 1463,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Cherry Pickup II",
        "leetcode": "https://leetcode.com/problems/cherry-pickup-ii/",
        "requirements": "Two robots collecting cherries using 2D DP"
      },
      {
        "id": 843,
        "leetcode_id": 123,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Best Time to Buy and Sell Stock III",
        "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/",
        "requirements": "Maximum profit with 2 transactions using 2D state representation"
      },
      {
        "id": 844,
        "leetcode_id": 188,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Best Time to Buy and Sell Stock IV",
        "leetcode": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/",
        "requirements": "Maximum profit with k transactions using 2D DP"
      },
      {
        "id": 845,
        "leetcode_id": 688,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Knight Probability in Chessboard",
        "leetcode": "https://leetcode.com/problems/knight-probability-in-chessboard/",
        "requirements": "Probability of knight staying on board after k moves"
      },
      {
        "id": 846,
        "leetcode_id": 1140,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Stone Game II",
        "leetcode": "https://leetcode.com/problems/stone-game-ii/",
        "requirements": "Game theory maximum score using 2D DP"
      },
      {
        "id": 847,
        "leetcode_id": 494,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Target Sum",
        "leetcode": "https://leetcode.com/problems/target-sum/",
        "requirements": "Count ways to assign + and - using 2D DP approach"
      },
      {
        "id": 848,
        "leetcode_id": 1499,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Max Value of Equation",
        "leetcode": "https://leetcode.com/problems/max-value-of-equation/",
        "requirements": "Maximum value of yi + yj + |xi - xj| with 2D constraints"
      },
      {
        "id": 849,
        "leetcode_id": 1444,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Number of Ways of Cutting a Pizza",
        "leetcode": "https://leetcode.com/problems/number-of-ways-of-cutting-a-pizza/",
        "requirements": "Count ways to cut pizza k times with apples using 2D DP"
      },
      {
        "id": 850,
        "leetcode_id": 1691,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Maximum Height by Stacking Cuboids",
        "leetcode": "https://leetcode.com/problems/maximum-height-by-stacking-cuboids/",
        "requirements": "Maximum height by stacking cuboids with 2D state tracking"
      },
      {
        "id": 851,
        "leetcode_id": 1937,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Number of Points with Cost",
        "leetcode": "https://leetcode.com/problems/maximum-number-of-points-with-cost/",
        "requirements": "Maximum points with position cost using 2D DP"
      }
    ]
  },
  "Segment Trees": {
    "tip": "Segment Trees are a specialized data structure that allows for efficient range queries and updates on arrays. They enable operations like finding the sum, minimum, maximum, or GCD of elements within any range in O(log n) time, while also supporting modifications to the underlying array also in O(log n) time. Look for problems involving multiple range queries or updates, especially those that would be inefficient with brute force approaches. Key indicators include 'range queries', 'interval operations', or problems requiring repeated computation over dynamic intervals. Segment trees are particularly useful when you need to handle both queries and updates efficiently, unlike prefix sums which only handle queries well but struggle with updates.",
    "problems": [
      {
        "id": 852,
        "leetcode_id": 307,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Range Sum Query - Mutable",
        "leetcode": "https://leetcode.com/problems/range-sum-query-mutable/",
        "requirements": "Support range sum queries with array modifications"
      },
      {
        "id": 853,
        "leetcode_id": 308,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Range Sum Query 2D - Mutable",
        "leetcode": "https://leetcode.com/problems/range-sum-query-2d-mutable/",
        "requirements": "Support 2D range sum queries with matrix modifications"
      },
      {
        "id": 854,
        "leetcode_id": 315,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Count of Smaller Numbers After Self",
        "leetcode": "https://leetcode.com/problems/count-of-smaller-numbers-after-self/",
        "requirements": "Count smaller elements to the right of each element"
      },
      {
        "id": 855,
        "leetcode_id": 493,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Reverse Pairs",
        "leetcode": "https://leetcode.com/problems/reverse-pairs/",
        "requirements": "Count pairs i < j where nums[i] > 2*nums[j]"
      },
      {
        "id": 856,
        "leetcode_id": 327,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Count of Range Sum",
        "leetcode": "https://leetcode.com/problems/count-of-range-sum/",
        "requirements": "Count range sums within a specific range"
      },
      {
        "id": 857,
        "leetcode_id": 218,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "The Skyline Problem",
        "leetcode": "https://leetcode.com/problems/the-skyline-problem/",
        "requirements": "Find skyline formed by buildings using segment tree"
      },
      {
        "id": 858,
        "leetcode_id": 732,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "My Calendar III",
        "leetcode": "https://leetcode.com/problems/my-calendar-iii/",
        "requirements": "Find maximum booking overlaps using segment tree"
      },
      {
        "id": 859,
        "leetcode_id": 699,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Falling Squares",
        "leetcode": "https://leetcode.com/problems/falling-squares/",
        "requirements": "Track heights as squares fall using segment tree"
      },
      {
        "id": 860,
        "leetcode_id": 1157,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Online Majority Element In Subarray",
        "leetcode": "https://leetcode.com/problems/online-majority-element-in-subarray/",
        "requirements": "Find majority element in given range"
      },
      {
        "id": 861,
        "leetcode_id": 715,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Range Module",
        "leetcode": "https://leetcode.com/problems/range-module/",
        "requirements": "Track ranges with add, remove, and query operations"
      },
      {
        "id": 862,
        "leetcode_id": 1649,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Create Sorted Array through Instructions",
        "leetcode": "https://leetcode.com/problems/create-sorted-array-through-instructions/",
        "requirements": "Count elements less than and greater than current"
      },
      {
        "id": 863,
        "leetcode_id": 1622,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Fancy Sequence",
        "leetcode": "https://leetcode.com/problems/fancy-sequence/",
        "requirements": "Support sequence operations with lazy propagation"
      },
      {
        "id": 864,
        "leetcode_id": 850,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Rectangle Area II",
        "leetcode": "https://leetcode.com/problems/rectangle-area-ii/",
        "requirements": "Calculate area covered by rectangles using segment tree"
      },
      {
        "id": 865,
        "leetcode_id": 239,
        "difficulty": "Hard",
        "frequency": "High",
        "problem": "Sliding Window Maximum",
        "leetcode": "https://leetcode.com/problems/sliding-window-maximum/",
        "requirements": "Find maximum in sliding window using segment tree"
      },
      {
        "id": 866,
        "leetcode_id": 2407,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Longest Increasing Subsequence II",
        "leetcode": "https://leetcode.com/problems/longest-increasing-subsequence-ii/",
        "requirements": "Find LIS with difference constraint using segment tree"
      },
      {
        "id": 867,
        "leetcode_id": 2179,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Count Good Triplets in an Array",
        "leetcode": "https://leetcode.com/problems/count-good-triplets-in-an-array/",
        "requirements": "Count triplets maintaining relative positions"
      },
      {
        "id": 868,
        "leetcode_id": 2213,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Longest Substring of One Repeating Character",
        "leetcode": "https://leetcode.com/problems/longest-substring-of-one-repeating-character/",
        "requirements": "Find longest repeating character after replacements"
      },
      {
        "id": 869,
        "leetcode_id": 2940,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Find Building Where Alice and Bob Can Meet",
        "leetcode": "https://leetcode.com/problems/find-building-where-alice-and-bob-can-meet/",
        "requirements": "Find meeting points with height constraints"
      },
      {
        "id": 870,
        "leetcode_id": 2286,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Booking Concert Tickets in Groups",
        "leetcode": "https://leetcode.com/problems/booking-concert-tickets-in-groups/",
        "requirements": "Book seats with max and sum queries"
      },
      {
        "id": 871,
        "leetcode_id": 2276,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Count Integers in Intervals",
        "leetcode": "https://leetcode.com/problems/count-integers-in-intervals/",
        "requirements": "Count integers covered by intervals with updates"
      },
      {
        "id": 872,
        "leetcode_id": 1224,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Maximum Equal Frequency",
        "leetcode": "https://leetcode.com/problems/maximum-equal-frequency/",
        "requirements": "Find longest prefix where frequency condition holds"
      },
      {
        "id": 873,
        "leetcode_id": 1851,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Minimum Interval to Include Each Query",
        "leetcode": "https://leetcode.com/problems/minimum-interval-to-include-each-query/",
        "requirements": "Find smallest interval containing each query point"
      },
      {
        "id": 874,
        "leetcode_id": 2158,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Amount of New Area Painted Each Day",
        "leetcode": "https://leetcode.com/problems/amount-of-new-area-painted-each-day/",
        "requirements": "Track newly painted sections using segment tree"
      },
      {
        "id": 875,
        "leetcode_id": 2916,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Subarrays Distinct Element Sum of Squares II",
        "leetcode": "https://leetcode.com/problems/subarrays-distinct-element-sum-of-squares-ii/",
        "requirements": "Calculate sum of squares of distinct counts"
      },
      {
        "id": 876,
        "leetcode_id": 1637,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Widest Vertical Area Between Two Points Containing No Points",
        "leetcode": "https://leetcode.com/problems/widest-vertical-area-between-two-points-containing-no-points/",
        "requirements": "Find maximum gap between sorted x-coordinates"
      },
      {
        "id": 877,
        "leetcode_id": 2569,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Handling Sum Queries After Update",
        "leetcode": "https://leetcode.com/problems/handling-sum-queries-after-update/",
        "requirements": "Process queries with bit flipping and sum operations"
      },
      {
        "id": 878,
        "leetcode_id": 683,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "K Empty Slots",
        "leetcode": "https://leetcode.com/problems/k-empty-slots/",
        "requirements": "Find day when exactly k empty slots between blooming flowers"
      },
      {
        "id": 879,
        "leetcode_id": 768,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Max Chunks To Make Sorted II",
        "leetcode": "https://leetcode.com/problems/max-chunks-to-make-sorted-ii/",
        "requirements": "Maximize number of chunks that sort to original array"
      },
      {
        "id": 880,
        "leetcode_id": 2426,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Number of Pairs Satisfying Inequality",
        "leetcode": "https://leetcode.com/problems/number-of-pairs-satisfying-inequality/",
        "requirements": "Count pairs with nums1[i] - nums1[j] <= nums2[i] - nums2[j] + diff"
      },
      {
        "id": 881,
        "leetcode_id": 370,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Range Addition",
        "leetcode": "https://leetcode.com/problems/range-addition/",
        "requirements": "Process range update operations efficiently"
      }
    ]
  },
  "Intervals": {
    "tip": "Interval problems involve ranges defined by start and end points, and typically require analyzing their relationships (overlap, containment, adjacency). The key to solving these problems often lies in sorting the intervals (usually by start or end point) and then processing them in order. Watch for problems involving scheduling, resource allocation, or range-based operations. Look for keywords like 'merge', 'overlap', 'conflicting intervals', or scenarios dealing with time periods, meeting rooms, or coverage. Common operations include merging overlapping intervals, finding gaps between intervals, calculating total covered length, and resolving conflicts. Visualizing intervals on a number line can help clarify the logic needed for these problems.",
    "problems": [
      {
        "id": 702,
        "leetcode_id": 56,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Merge Intervals",
        "leetcode": "https://leetcode.com/problems/merge-intervals/",
        "requirements": "Merge all overlapping intervals into non-overlapping intervals"
      },
      {
        "id": 703,
        "leetcode_id": 57,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Insert Interval",
        "leetcode": "https://leetcode.com/problems/insert-interval/",
        "requirements": "Insert a new interval and merge if necessary"
      },
      {
        "id": 704,
        "leetcode_id": 252,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Meeting Rooms",
        "leetcode": "https://leetcode.com/problems/meeting-rooms/",
        "requirements": "Determine if a person can attend all meetings"
      },
      {
        "id": 705,
        "leetcode_id": 253,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Meeting Rooms II",
        "leetcode": "https://leetcode.com/problems/meeting-rooms-ii/",
        "requirements": "Find minimum number of conference rooms required"
      },
      {
        "id": 706,
        "leetcode_id": 435,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Non-overlapping Intervals",
        "leetcode": "https://leetcode.com/problems/non-overlapping-intervals/",
        "requirements": "Find minimum intervals to remove to make all non-overlapping"
      },
      {
        "id": 707,
        "leetcode_id": 1288,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Remove Covered Intervals",
        "leetcode": "https://leetcode.com/problems/remove-covered-intervals/",
        "requirements": "Remove intervals that are covered by another interval"
      },
      {
        "id": 708,
        "leetcode_id": 986,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Interval List Intersections",
        "leetcode": "https://leetcode.com/problems/interval-list-intersections/",
        "requirements": "Find intersections of two lists of intervals"
      },
      {
        "id": 709,
        "leetcode_id": 759,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Employee Free Time",
        "leetcode": "https://leetcode.com/problems/employee-free-time/",
        "requirements": "Find common free time intervals across all employees"
      },
      {
        "id": 710,
        "leetcode_id": 1094,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Car Pooling",
        "leetcode": "https://leetcode.com/problems/car-pooling/",
        "requirements": "Determine if all passengers can be picked up and dropped off"
      },
      {
        "id": 711,
        "leetcode_id": 452,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Minimum Number of Arrows to Burst Balloons",
        "leetcode": "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/",
        "requirements": "Find minimum arrows to burst all balloons with interval representation"
      },
      {
        "id": 712,
        "leetcode_id": 1235,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Maximum Profit in Job Scheduling",
        "leetcode": "https://leetcode.com/problems/maximum-profit-in-job-scheduling/",
        "requirements": "Find maximum profit from non-overlapping jobs"
      },
      {
        "id": 713,
        "leetcode_id": 218,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "The Skyline Problem",
        "leetcode": "https://leetcode.com/problems/the-skyline-problem/",
        "requirements": "Find skyline formed by buildings represented as intervals"
      },
      {
        "id": 714,
        "leetcode_id": 1272,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Remove Interval",
        "leetcode": "https://leetcode.com/problems/remove-interval/",
        "requirements": "Remove portions of intervals that overlap with given interval"
      },
      {
        "id": 715,
        "leetcode_id": 352,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Data Stream as Disjoint Intervals",
        "leetcode": "https://leetcode.com/problems/data-stream-as-disjoint-intervals/",
        "requirements": "Design data structure for disjoint intervals from stream of integers"
      },
      {
        "id": 716,
        "leetcode_id": 1851,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Minimum Interval to Include Each Query",
        "leetcode": "https://leetcode.com/problems/minimum-interval-to-include-each-query/",
        "requirements": "Find minimum size interval containing each query point"
      },
      {
        "id": 717,
        "leetcode_id": 1229,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Meeting Scheduler",
        "leetcode": "https://leetcode.com/problems/meeting-scheduler/",
        "requirements": "Find earliest time slot of given duration available for both persons"
      },
      {
        "id": 718,
        "leetcode_id": 1024,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Video Stitching",
        "leetcode": "https://leetcode.com/problems/video-stitching/",
        "requirements": "Find minimum clips needed to cover entire time range"
      },
      {
        "id": 719,
        "leetcode_id": 1589,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum Sum Obtained of Any Permutation",
        "leetcode": "https://leetcode.com/problems/maximum-sum-obtained-of-any-permutation/",
        "requirements": "Maximize sum of elements covered by requests intervals"
      },
      {
        "id": 720,
        "leetcode_id": 1893,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Check if All the Integers in a Range Are Covered",
        "leetcode": "https://leetcode.com/problems/check-if-all-the-integers-in-a-range-are-covered/",
        "requirements": "Check if range is completely covered by intervals"
      },
      {
        "id": 721,
        "leetcode_id": 2276,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Count Integers in Intervals",
        "leetcode": "https://leetcode.com/problems/count-integers-in-intervals/",
        "requirements": "Count integers covered after adding intervals dynamically"
      },
      {
        "id": 722,
        "leetcode_id": 699,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Falling Squares",
        "leetcode": "https://leetcode.com/problems/falling-squares/",
        "requirements": "Compute height profile as squares fall on 1D line"
      },
      {
        "id": 723,
        "leetcode_id": 1674,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Minimum Moves to Make Array Complementary",
        "leetcode": "https://leetcode.com/problems/minimum-moves-to-make-array-complementary/",
        "requirements": "Find minimum moves to make all pairs sum to same value"
      },
      {
        "id": 724,
        "leetcode_id": 2158,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Amount of New Area Painted Each Day",
        "leetcode": "https://leetcode.com/problems/amount-of-new-area-painted-each-day/",
        "requirements": "Calculate newly painted area each day with overlapping intervals"
      },
      {
        "id": 725,
        "leetcode_id": 850,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Rectangle Area II",
        "leetcode": "https://leetcode.com/problems/rectangle-area-ii/",
        "requirements": "Find total area covered by rectangles"
      },
      {
        "id": 726,
        "leetcode_id": 732,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "My Calendar III",
        "leetcode": "https://leetcode.com/problems/my-calendar-iii/",
        "requirements": "Find maximum number of overlapping calendar events"
      },
      {
        "id": 727,
        "leetcode_id": 731,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "My Calendar II",
        "leetcode": "https://leetcode.com/problems/my-calendar-ii/",
        "requirements": "Implement calendar that detects triple booking"
      },
      {
        "id": 728,
        "leetcode_id": 729,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "My Calendar I",
        "leetcode": "https://leetcode.com/problems/my-calendar-i/",
        "requirements": "Implement calendar that rejects overlapping events"
      },
      {
        "id": 729,
        "leetcode_id": 2406,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Divide Intervals Into Minimum Number of Groups",
        "leetcode": "https://leetcode.com/problems/divide-intervals-into-minimum-number-of-groups/",
        "requirements": "Divide intervals into minimum number of conflict-free groups"
      },
      {
        "id": 730,
        "leetcode_id": 495,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Teemo Attacking",
        "leetcode": "https://leetcode.com/problems/teemo-attacking/",
        "requirements": "Calculate total duration of poisoning from overlapping attacks"
      },
      {
        "id": 731,
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
        "id": 882,
        "leetcode_id": 136,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Single Number",
        "leetcode": "https://leetcode.com/problems/single-number/",
        "requirements": "Find the number that appears only once using XOR"
      },
      {
        "id": 883,
        "leetcode_id": 191,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Number of 1 Bits",
        "leetcode": "https://leetcode.com/problems/number-of-1-bits/",
        "requirements": "Count the number of 1 bits in an integer"
      },
      {
        "id": 884,
        "leetcode_id": 338,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Counting Bits",
        "leetcode": "https://leetcode.com/problems/counting-bits/",
        "requirements": "Count bits in numbers from 0 to n efficiently"
      },
      {
        "id": 885,
        "leetcode_id": 190,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Reverse Bits",
        "leetcode": "https://leetcode.com/problems/reverse-bits/",
        "requirements": "Reverse the bits of a 32-bit unsigned integer"
      },
      {
        "id": 886,
        "leetcode_id": 371,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Sum of Two Integers",
        "leetcode": "https://leetcode.com/problems/sum-of-two-integers/",
        "requirements": "Add two numbers without using + or - operators"
      },
      {
        "id": 887,
        "leetcode_id": 268,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Missing Number",
        "leetcode": "https://leetcode.com/problems/missing-number/",
        "requirements": "Find missing number using bit manipulation"
      },
      {
        "id": 888,
        "leetcode_id": 137,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Single Number II",
        "leetcode": "https://leetcode.com/problems/single-number-ii/",
        "requirements": "Find number that appears once while others appear three times"
      },
      {
        "id": 889,
        "leetcode_id": 260,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Single Number III",
        "leetcode": "https://leetcode.com/problems/single-number-iii/",
        "requirements": "Find two numbers that appear only once"
      },
      {
        "id": 890,
        "leetcode_id": 201,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Bitwise AND of Numbers Range",
        "leetcode": "https://leetcode.com/problems/bitwise-and-of-numbers-range/",
        "requirements": "Find AND of all numbers in a range"
      },
      {
        "id": 891,
        "leetcode_id": 231,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Power of Two",
        "leetcode": "https://leetcode.com/problems/power-of-two/",
        "requirements": "Check if number is power of two using bit manipulation"
      },
      {
        "id": 892,
        "leetcode_id": 1009,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Complement of Base 10 Integer",
        "leetcode": "https://leetcode.com/problems/complement-of-base-10-integer/",
        "requirements": "Find the complement of a number"
      },
      {
        "id": 893,
        "leetcode_id": 78,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Subsets",
        "leetcode": "https://leetcode.com/problems/subsets/",
        "requirements": "Generate all subsets using bit manipulation"
      },
      {
        "id": 894,
        "leetcode_id": 421,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Maximum XOR of Two Numbers in an Array",
        "leetcode": "https://leetcode.com/problems/maximum-xor-of-two-numbers-in-an-array/",
        "requirements": "Find maximum XOR of any two numbers in array"
      },
      {
        "id": 895,
        "leetcode_id": 1342,
        "difficulty": "Easy",
        "frequency": "Medium",
        "problem": "Number of Steps to Reduce a Number to Zero",
        "leetcode": "https://leetcode.com/problems/number-of-steps-to-reduce-a-number-to-zero/",
        "requirements": "Count steps to reduce number to zero using bit operations"
      },
      {
        "id": 896,
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
        "id": 897,
        "leetcode_id": 50,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Pow(x, n)",
        "leetcode": "https://leetcode.com/problems/powx-n/",
        "requirements": "Implement efficient power function using exponentiation by squaring"
      },
      {
        "id": 898,
        "leetcode_id": 69,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Sqrt(x)",
        "leetcode": "https://leetcode.com/problems/sqrtx/",
        "requirements": "Implement square root function without using built-in math functions"
      },
      {
        "id": 899,
        "leetcode_id": 204,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Count Primes",
        "leetcode": "https://leetcode.com/problems/count-primes/",
        "requirements": "Count prime numbers less than n using Sieve of Eratosthenes"
      },
      {
        "id": 900,
        "leetcode_id": 48,
        "difficulty": "Medium",
        "frequency": "High",
        "problem": "Rotate Image",
        "leetcode": "https://leetcode.com/problems/rotate-image/",
        "requirements": "Rotate a matrix 90 degrees clockwise in-place"
      },
      {
        "id": 901,
        "leetcode_id": 43,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Multiply Strings",
        "leetcode": "https://leetcode.com/problems/multiply-strings/",
        "requirements": "Multiply two numbers represented as strings"
      },
      {
        "id": 902,
        "leetcode_id": 13,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Roman to Integer",
        "leetcode": "https://leetcode.com/problems/roman-to-integer/",
        "requirements": "Convert Roman numeral to integer"
      },
      {
        "id": 903,
        "leetcode_id": 12,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Integer to Roman",
        "leetcode": "https://leetcode.com/problems/integer-to-roman/",
        "requirements": "Convert integer to Roman numeral"
      },
      {
        "id": 904,
        "leetcode_id": 149,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Max Points on a Line",
        "leetcode": "https://leetcode.com/problems/max-points-on-a-line/",
        "requirements": "Find maximum points that lie on the same line"
      },
      {
        "id": 905,
        "leetcode_id": 60,
        "difficulty": "Hard",
        "frequency": "Medium",
        "problem": "Permutation Sequence",
        "leetcode": "https://leetcode.com/problems/permutation-sequence/",
        "requirements": "Find the kth permutation sequence using factorial number system"
      },
      {
        "id": 906,
        "leetcode_id": 172,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Factorial Trailing Zeroes",
        "leetcode": "https://leetcode.com/problems/factorial-trailing-zeroes/",
        "requirements": "Count trailing zeroes in factorial of n"
      },
      {
        "id": 907,
        "leetcode_id": 7,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Reverse Integer",
        "leetcode": "https://leetcode.com/problems/reverse-integer/",
        "requirements": "Reverse digits of an integer with overflow handling"
      },
      {
        "id": 908,
        "leetcode_id": 29,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Divide Two Integers",
        "leetcode": "https://leetcode.com/problems/divide-two-integers/",
        "requirements": "Divide two integers without using multiplication, division or mod"
      },
      {
        "id": 909,
        "leetcode_id": 223,
        "difficulty": "Medium",
        "frequency": "Medium",
        "problem": "Rectangle Area",
        "leetcode": "https://leetcode.com/problems/rectangle-area/",
        "requirements": "Find total area covered by two overlapping rectangles"
      },
      {
        "id": 910,
        "leetcode_id": 9,
        "difficulty": "Easy",
        "frequency": "High",
        "problem": "Palindrome Number",
        "leetcode": "https://leetcode.com/problems/palindrome-number/",
        "requirements": "Determine if an integer is a palindrome without converting to string"
      },
      {
        "id": 911,
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
      frequency: problem.frequency,
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
problemDataByCategory.all = [];
Object.keys(problemDataByCategory).forEach(cat => {
  if (cat !== 'all') {
    problemDataByCategory.all = problemDataByCategory.all.concat(problemDataByCategory[cat]);
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
  // Update status in the current category
  if (!problemStatuses[category]) {
    problemStatuses[category] = {};
  }
  problemStatuses[category][problemId] = status;
  
  // Save to localStorage for this category as before
  localStorage.setItem(`tech-navigator-${category}-progress`, JSON.stringify(problemStatuses[category]));
  
  // Important: Update the same LeetCode ID in ALL categories
  Object.keys(problemDataByCategory).forEach(cat => {
    if (cat !== 'all' && cat !== category) {
      problemDataByCategory[cat].forEach(problem => {
        if (problem.leetcode_id === problemId) {
          problem.status = status;
          
          // Also update in tracking object
          if (!problemStatuses[cat]) {
            problemStatuses[cat] = {};
          }
          problemStatuses[cat][problemId] = status;
          
          // Update localStorage for this category too
          localStorage.setItem(`tech-navigator-${cat}-progress`, JSON.stringify(problemStatuses[cat]));
        }
      });
    }
  });
  
  // Update the "all" category too
  problemDataByCategory['all'].forEach(problem => {
    if (problem.leetcode_id === problemId) {
      problem.status = status;
    }
  });
  
  // If signed in, collect all problem statuses and save to Firebase
  if (currentUser) {
    const allProblems = {};
    const processedIds = new Set();
    
    Object.keys(problemDataByCategory).forEach(cat => {
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
function resetFilters() {
  const filterElements = document.querySelectorAll('.filter-select');
  filterElements.forEach(filter => {
    filter.value = 'all'; // Assumes 'all' is the default value
  });
}

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
  
  const total = problemDataByCategory[category].length;
  const solved = problemDataByCategory[category].filter(p => p.status).length;
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
  resetFilters();
  
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
  
  // Reset filters explicitly
  document.getElementById('status-filter').value = 'all';
  document.getElementById('difficulty-filter').value = 'all';
  document.getElementById('frequency-filter').value = 'all';

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

// Initialize the ag-Grid with column definitions and row data
function initializeGrid(category) {
  if (!problemDataByCategory[category]) return;
  const columnDefs = [
    {
      headerName: 'Status',
      field: 'status',
      width: 80,
      cellRenderer: statusCellRenderer,
      sortable: true,
      filter: true,
      suppressSizeToFit: true,
      headerClass: 'ag-center-header'
    },
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
      sort: 'asc', // Secondary sort
     sortingOrder: ['asc', 'desc', null],
     comparator: (valueA, valueB) => {
      const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
      return difficultyOrder[valueA] - difficultyOrder[valueB];
     }
    },
    {
      headerName: 'Frequency',
      field: 'frequency',
      width: 120,
      cellRenderer: frequencyCellRenderer,
      filter: true,
      sortable: true,
      suppressSizeToFit: true,
      headerClass: 'ag-center-header',
     sort: 'desc', // Initial sort direction
     sortingOrder: ['desc', 'asc', null], // Allowed sorting orders
     comparator: (valueA, valueB) => {
      const frequencyOrder = { High: 1, Medium: 2, Low: 3 };
      return frequencyOrder[valueB] - frequencyOrder[valueA];
     }
    }
  ];
  
  // For "all" category, add a Category column
  if (category === 'all') {
    columnDefs.splice(2, 0, {
      headerName: 'Category',
      field: 'category',
      width: 150,
      filter: true,
      sortable: true,
      valueFormatter: params => getCategoryTitle(params.value)
    });
  }
  
  const gridOptions = {
    columnDefs: columnDefs,
    rowData: problemDataByCategory[category],
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
    },
      
  };
  
  if (gridApi) {
    gridApi.setColumnDefs(columnDefs);
    gridApi.setRowData(problemDataByCategory[category]);
  } else {
    new agGrid.Grid(document.getElementById('problem-grid'), gridOptions);
  }
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
  
  // Get filter values
  const status = document.getElementById('status-filter').value;
  const difficulty = document.getElementById('difficulty-filter').value;
  const frequency = document.getElementById('frequency-filter').value;
  
  // Build filter model
  const filterModel = {};
  if (status !== 'all') {
    filterModel.status = { type: 'equals', filter: status === 'completed' };
  }
  if (difficulty !== 'all') {
    filterModel.difficulty = { type: 'equals', filter: difficulty };
  }
  if (frequency !== 'all') {
    filterModel.frequency = { type: 'equals', filter: frequency };
  }

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
  let total = 0, solved = 0;
  Object.keys(problemDataByCategory).forEach(cat => {
    if (cat !== 'all') {
      total += problemDataByCategory[cat].length;
      solved += problemDataByCategory[cat].filter(p => p.status).length;
    }
  });
  const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;
  const circumference = 2 * Math.PI * 15;
  const offset = circumference - (percentage / 100) * circumference;
  const progressCircle = document.getElementById('overall-progress');
  if (progressCircle) {
    progressCircle.style.strokeDasharray = circumference;
    progressCircle.style.strokeDashoffset = offset;
  }
  document.getElementById('overall-progress-text').textContent = `${percentage}% Completed`;
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
  setupThemeToggle();
  
  // Initialize all category counters
  Object.keys(problemDataByCategory).forEach(cat => {
    updateCategoryCounter(cat);
  });
  updateOverallProgress();
  
  // Set up filters
  document.getElementById('status-filter').addEventListener('change', applyFilters);
  document.getElementById('difficulty-filter').addEventListener('change', applyFilters);
  document.getElementById('frequency-filter').addEventListener('change', applyFilters);
  
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
