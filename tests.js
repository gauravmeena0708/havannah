// Basic assertion functions
function assertEquals(expected, actual, message) {
    if (expected !== actual) {
        console.error(`Assertion Failed: ${message}. Expected: ${expected}, Actual: ${actual}`);
    } else {
        console.log(`Assertion Passed: ${message}.`);
    }
}

function assertDeepEquals(expected, actual, message) {
    if (JSON.stringify(expected) !== JSON.stringify(actual)) {
        console.error(`Assertion Failed: ${message}. Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
    } else {
        console.log(`Assertion Passed: ${message}.`);
    }
}

function assertTrue(value, message) {
    if (!value) {
        console.error(`Assertion Failed: ${message}. Expected true, got false.`);
    } else {
        console.log(`Assertion Passed: ${message}.`);
    }
}

function assertFalse(value, message) {
    if (value) {
        console.error(`Assertion Failed: ${message}. Expected false, got true.`);
    } else {
        console.log(`Assertion Passed: ${message}.`);
    }
}

// Test runner function
function runAllTests() {
    console.log("Starting all tests...");
    testIsValid();
    testCreateInitialBoard();
    testGetNeighbours();
    testCheckFork();
    testCheckBridge();
    testCheckRing();
    console.log("All tests finished.");
}

// --- Test Implementations ---

// Mock global 'layers' for testing 'isValid' and other board functions from script.js
let testLayers = 0;
// The actual 'layers' variable is in script.js. We need to assign to it.
// This is a bit hacky for unit tests. Ideally, functions like isValid
// would take 'layers' as a parameter. For now, we'll manage it globally for tests.

function testIsValid() {
    console.log("--- Running testIsValid ---");

    // --- Setup for layers = 4 (dim = 7) ---
    // This mimics setting the global 'layers' variable from script.js
    // Note: This direct assignment might not work if script.js's layers is not globally accessible
    // or if there are scoping issues. A better approach would be to refactor script.js
    // to allow layers to be passed, or have a setter.
    // For now, we assume 'layers' in script.js is a global 'var' or 'let' in the window scope.

    // Save original global layers if it exists, and set test layers
    let originalLayers = window.layers;
    window.layers = 4; // This is the 'layers' used by isValid in script.js
    const dim = 2 * window.layers - 1; // Should be 7

    assertEquals(4, window.layers, "Global layers variable set for testIsValid (layers=4)");
    assertEquals(7, dim, "Dimension calculated correctly for layers=4");

    // Test cases for layers = 4 (dim = 7)
    // Valid points
    assertTrue(isValid(0, 0, dim), "isValid(0,0) for layers=4 (Top-left corner of col 0)");
    assertTrue(isValid(3, 0, dim), "isValid(3,0) for layers=4 (Bottom-most of col 0)");
    assertTrue(isValid(0, 3, dim), "isValid(0,3) for layers=4 (Top-most of col 3 - center col)");
    assertTrue(isValid(6, 3, dim), "isValid(6,3) for layers=4 (Bottom-most of col 3 - center col)");
    assertTrue(isValid(0, 6, dim), "isValid(0,6) for layers=4 (Top-most of col 6)");
    assertTrue(isValid(3, 6, dim), "isValid(3,6) for layers=4 (Bottom-most of col 6)");
    assertTrue(isValid(1, 1, dim), "isValid(1,1) for layers=4 (Inner point)");
    assertTrue(isValid(layers - 1, 0, dim), "isValid(layers-1, 0) e.g. (3,0) for layers=4"); // Max x for col 0
    assertTrue(isValid(layers + 0 - 1, 0, dim), "isValid(layers+y-1, y) for y=0 => (3,0) for L4");

    // colHeight for y=0 (layers+y) = 4+0 = 4. Valid x: 0,1,2,3
    assertTrue(isValid(0, 0, dim), "isValid(0,0, L4)");
    assertTrue(isValid(1, 0, dim), "isValid(1,0, L4)");
    assertTrue(isValid(2, 0, dim), "isValid(2,0, L4)");
    assertTrue(isValid(3, 0, dim), "isValid(3,0, L4)");
    assertFalse(isValid(4, 0, dim), "isValid(4,0, L4) - x too large for col 0");

    // colHeight for y=1 (layers+y) = 4+1 = 5. Valid x: 0,1,2,3,4
    assertTrue(isValid(4, 1, dim), "isValid(4,1, L4)");
    assertFalse(isValid(5, 1, dim), "isValid(5,1, L4) - x too large for col 1");

    // colHeight for y=3 (center column, layers+y) = 4+3 = 7. Valid x: 0..6
    assertTrue(isValid(6, 3, dim), "isValid(6,3, L4)");
    assertFalse(isValid(7, 3, dim), "isValid(7,3, L4) - x too large for col 3");

    // colHeight for y=4 (layers + (2*layers-2) - y) = 4 + (8-2) - 4 = 4 + 6 - 4 = 6. Valid x: 0..5
    // y=4, currentLayers=4. colHeight = 4 + (2*4-2) - 4 = 4 + 6 - 4 = 6
    assertTrue(isValid(0, 4, dim), "isValid(0,4, L4)");
    assertTrue(isValid(5, 4, dim), "isValid(5,4, L4)");
    assertFalse(isValid(6, 4, dim), "isValid(6,4, L4) - x too large for col 4");

    // colHeight for y=6 (dim-1) = 4 + (2*4-2) - 6 = 4 + 6 - 6 = 4. Valid x: 0..3
    assertTrue(isValid(0, 6, dim), "isValid(0,6, L4)");
    assertTrue(isValid(3, 6, dim), "isValid(3,6, L4)");
    assertFalse(isValid(4, 6, dim), "isValid(4,6, L4) - x too large for col 6");

    // Invalid points: y out of bounds
    assertFalse(isValid(0, -1, dim), "isValid(0,-1, L4) - y too small");
    assertFalse(isValid(0, 7, dim), "isValid(0,7, L4) - y too large (dim is 7, so max y is 6)");
    assertFalse(isValid(0, dim, dim), "isValid(0,dim, L4) - y too large");

    // Invalid points: x out of bounds for a valid y
    assertFalse(isValid(-1, 0, dim), "isValid(-1,0, L4) - x too small");

    // --- Teardown for layers = 4 ---
    window.layers = originalLayers; // Restore original layers
    console.log("--- testIsValid Finished ---");
}

function testCreateInitialBoard() {
    console.log("--- Running testCreateInitialBoard ---");

    // --- Setup for layers = 4 (dim = 7) ---
    let originalLayers = window.layers;
    window.layers = 4;
    const expectedDim = 2 * window.layers - 1; // 7

    const board = createInitialBoard(window.layers); // Call the function from script.js

    // Test board dimensions
    assertEquals(expectedDim, board.length, "Board should have correct number of columns (dim)");
    for (let y = 0; y < board.length; y++) {
        // The isValid function determines the actual number of cells in a column for a given layer setup
        // For the board array itself, each column array will be initialized to the full dim.
        assertEquals(expectedDim, board[y].length, `Column ${y} should have length ${expectedDim}`);
    }

    // Test number of initially blocked cells (value 3)
    // For layers = 4:
    // Iteration i from layers (4) to 2*layers-2 (6)
    // i = 4: j from 0 to i-layers = 0. (j=0). board[4][0]=3, board[4][6]=3. (2 cells)
    // i = 5: j from 0 to i-layers = 1. (j=0,1). board[5][0]=3, board[5][1]=3, board[5][5]=3, board[5][4]=3 (4 cells)
    // i = 6: j from 0 to i-layers = 2. (j=0,1,2). board[6][0]=3, board[6][1]=3, board[6][2]=3, board[6][4]=3, board[6][3]=3, board[6][2] (already counted) (6 cells)
    // Total blocked cells = 2 + 4 + 6 = 12
    let blockedCount = 0;
    for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[r].length; c++) {
            if (board[r][c] === 3) {
                blockedCount++;
            }
        }
    }
    assertEquals(12, blockedCount, "Number of initially blocked cells for layers=4 should be 12.");

    // --- Teardown ---
    window.layers = originalLayers;
    console.log("--- testCreateInitialBoard Finished ---");
}

function testGetNeighbours() {
    console.log("--- Running testGetNeighbours ---");
    let originalLayers = window.layers;
    window.layers = 4; // For dim = 7, siz = 3 (floor(7/2))
    const dim = 7;
    const siz = Math.floor(dim / 2); // Should be 3

    // Helper to sort neighbor arrays for comparison
    // Sorts by row, then by column
    const sortNeighbors = (arr) => arr.sort((a, b) => {
        if (a[0] !== b[0]) return a[0] - b[0];
        return a[1] - b[1];
    });

    // Test case 1: Central cell (3,3) (i=3, j=3). Here j === siz.
    // Expected neighbors for (i,j) where j == siz:
    // (i-1,j), (i+1,j), (i,j-1), (i,j+1), (i-1,j-1), (i-1,j+1)
    // For (3,3): (2,3), (4,3), (3,2), (3,4), (2,2), (2,4)
    let neighbors1 = getNeighbours(dim, [3, 3]);
    let expected1 = [[2, 3], [4, 3], [3, 2], [3, 4], [2, 2], [2, 4]];
    assertDeepEquals(sortNeighbors(expected1), sortNeighbors(neighbors1), "testGetNeighbours: Central cell (3,3) for L4");

    // Test case 2: Corner cell (0,0) (i=0, j=0). Here j < siz.
    // Expected neighbors for (i,j) where j < siz:
    // (i-1,j), (i+1,j), (i,j-1), (i,j+1), (i-1,j-1) (if j>0), (i+1,j+1)
    // For (0,0): (-1,0), (1,0), (0,-1), (0,1), (-1,-1) (j not >0, so this is not added), (1,1)
    // The getNeighbours function itself doesn't check isValid.
    // Horizontal/Vertical: (-1,0), (1,0), (0,-1), (0,1)
    // Diagonal (j < siz): (i-1,j-1) -> (-1,-1) [not added because j is not > 0 for this specific rule in getNeighbours]
    // Diagonal (j < siz): (i+1,j+1) -> (1,1)
    // The actual getNeighbours logic:
    // if (i > 0) neighbours.push([i - 1, j]); -> no
    // if (i < dim - 1) neighbours.push([i + 1, j]); -> (1,0)
    // if (j > 0) neighbours.push([i, j - 1]); -> no
    // if (j < dim - 1) neighbours.push([i, j + 1]); -> (0,1)
    // Diagonal part: j=0, siz=3. So j < siz is true.
    // if (i > 0 && j <= siz && j > 0) neighbours.push([i - 1, j - 1]); -> no (j not > 0)
    // if (i > 0 && j >= siz && j < dim - 1) neighbours.push([i - 1, j + 1]); -> no (j not >= siz)
    // if (i < dim - 1 && j < siz) neighbours.push([i + 1, j + 1]); -> (1,1)
    // if (i < dim - 1 && j > siz) neighbours.push([i + 1, j - 1]); -> no (j not > siz)
    let neighbors2 = getNeighbours(dim, [0, 0]);
    let expected2 = [[1, 0], [0, 1], [1, 1]]; // Based on the actual logic of getNeighbours
    assertDeepEquals(sortNeighbors(expected2), sortNeighbors(neighbors2), "testGetNeighbours: Corner cell (0,0) for L4");

    // Test case 3: Cell (1,2) (i=1, j=2). Here j < siz.
    // H/V: (0,2), (2,2), (1,1), (1,3)
    // Diag (j < siz):
    //   (i > 0 && j <= siz && j > 0) -> (true && true && true) -> neighbours.push([i-1,j-1]) -> (0,1)
    //   (i < dim-1 && j < siz) -> (true && true) -> neighbours.push([i+1,j+1]) -> (2,3)
    let neighbors3 = getNeighbours(dim, [1, 2]);
    let expected3 = [[0, 2], [2, 2], [1, 1], [1, 3], [0, 1], [2, 3]];
    assertDeepEquals(sortNeighbors(expected3), sortNeighbors(neighbors3), "testGetNeighbours: Cell (1,2) for L4 (j < siz)");

    // Test case 4: Cell (1,4) (i=1, j=4). Here j > siz.
    // H/V: (0,4), (2,4), (1,3), (1,5)
    // Diag (j > siz):
    //  (i > 0 && j >= siz && j < dim-1) -> (true && true && true) -> neighbours.push([i-1,j+1]) -> (0,5)
    //  (i < dim-1 && j > siz) -> (true && true) -> neighbours.push([i+1,j-1]) -> (2,3)
    let neighbors4 = getNeighbours(dim, [1, 4]);
    let expected4 = [[0, 4], [2, 4], [1, 3], [1, 5], [0, 5], [2, 3]];
    assertDeepEquals(sortNeighbors(expected4), sortNeighbors(neighbors4), "testGetNeighbours: Cell (1,4) for L4 (j > siz)");

    window.layers = originalLayers;
    console.log("--- testGetNeighbours Finished ---");
}

// Helper function for testCheckFork
function createBooleanBoard(dim, playerCells) {
    const board = Array(dim).fill(null).map(() => Array(dim).fill(false));
    playerCells.forEach(([r, c]) => {
        if (r >= 0 && r < dim && c >= 0 && c < dim) { // Basic bounds check
            board[r][c] = true;
        }
    });
    return board;
}

function testCheckFork() {
    console.log("--- Running testCheckFork ---");
    let originalLayers = window.layers;
    window.layers = 4; // Required for getAllEdges via checkFork -> bfsReachable -> getNeighbours -> isValid
    const dim = 2 * window.layers - 1; // 7

    // Test Case 1: Fork present
    // A piece at (1,1) connecting paths to 3 edges.
    // Edge 0 (y=0, left-ish): (1,0)
    // Edge 1 (x=0, top-ish): (0,1)
    // Edge 2 (diagonal, e.g., x+y=layers-1 like (0,3) for L4, or (3,0) for L4)
    // Let's use edges as defined by getAllEdges(7) (L=4, siz=4)
    // E0: y=0, e.g. (1,0)
    // E1: x=0, e.g. (0,1)
    // E2: x=i, y=i+siz-1. For i=0, (0,3). For i=1, (1,4)
    // Let's try to connect (1,1) to (1,0) [E0], (0,1) [E1], and (0,3) [E2, via (0,2) or (1,2)-(0,3)]
    let playerCellsFork = [
        [1, 1], // lastMove
        // Path to Edge 0 (y=0)
        [1, 0],
        // Path to Edge 1 (x=0)
        [0, 1],
        // Path to Edge 2 (top-right diagonal, e.g. (0,3))
        [1, 2], [0, 2], [0, 3] // (1,1) -> (1,2) -> (0,2) -> (0,3) which is on edge 2
    ];
    let boardFork = createBooleanBoard(dim, playerCellsFork);
    // Note: checkFork internally calls bfsReachable which uses the player number from the *original* board.
    // For testing checkFork in isolation with a boolean board, bfsReachable needs to be adapted or
    // checkFork needs to be called with a board where true means player stone.
    // The current checkWin correctly converts the board to boolean before calling checkFork.
    assertTrue(checkFork(boardFork, [1, 1]), "Fork Test 1: Should detect fork for (1,1)");

    // Test Case 1.2: Another fork, move is on an edge connecting 2, and a path to 3rd.
    // Move (0,0) is on E0 and E1. Path to E5 (bottom-left diagonal)
    playerCellsFork = [
        [0, 0], // lastMove, on Edge 0 (y=0) and Edge 1 (x=0)
        [1, 0], [2, 0], [3, 0], // Part of Edge 0
        [0, 1], [0, 2], [0, 3], // Part of Edge 1
        // Path to a third edge, e.g., E2 (0,3), (1,4), (2,5), (3,6)
        // Let's connect (0,0) to (0,3) (which is on E1 and E2)
        // And connect (0,0) to (3,0) (which is on E0 and E5: (3,0),(4,1),(5,2),(6,3))
        // So (0,0) connects E0, E1. (0,3) connects E1, E2. (3,0) connects E0, E5.
        // If lastMove is (0,0), it's on E0 and E1. Need one more.
        // Path: (0,0) -> (1,1) -> (1,2) -> (0,2) -> (0,3) (on E2)
        // Path: (0,0) -> (1,1) -> (1,2) -> (0,2) -> (0,3) (on E2)
        playerCellsFork = [[0, 0], [1, 1], [1, 2], [0, 2], [0, 3]];
        boardFork = createBooleanBoard(dim, playerCellsFork);
        assertTrue(checkFork(boardFork, [0, 0]), "Fork Test 1.2: Should detect fork for (0,0)");


        // Test Case 2: Fork not present (only 2 edges connected)
        // Piece (1,1) connects to (1,0) [E0] and (0,1) [E1]
        let playerCellsNoFork2Edges = [
            [1, 1], // lastMove
            [1, 0],
            [0, 1]
        ];
        let boardNoFork2Edges = createBooleanBoard(dim, playerCellsNoFork2Edges);
        assertFalse(checkFork(boardNoFork2Edges, [1, 1]), "Fork Test 2: Should not detect fork (2 edges)");

        // Test Case 3: No edges connected by paths from lastMove
        let playerCellsNoForkScatter = [
            [3, 3], // lastMove (center)
            [1, 1], [5, 5] // some other disconnected cells
        ];
        let boardNoForkScatter = createBooleanBoard(dim, playerCellsNoForkScatter);
        assertFalse(checkFork(boardNoForkScatter, [3, 3]), "Fork Test 3: No edges connected from (3,3)");

        // Test Case 4: Single line of stones, only touches 2 edges at ends
        let playerCellsLine = [[0, 0], [1, 0], [2, 0], [3, 0]]; // Line on Edge 0
        let boardLine = createBooleanBoard(dim, playerCellsLine);
        assertFalse(checkFork(boardLine, [1, 0]), "Fork Test 4: Line of stones on one edge, move in middle");
        assertFalse(checkFork(boardLine, [0, 0]), "Fork Test 4.1: Line of stones on one edge, move at end");


        // Test Case 5: A 'V' shape connecting two edges, move at the vertex. This is NOT a fork.
        // (0,0) is on E0, E1.
        let playerCellsVShape = [[1, 0], [0, 0], [0, 1]]; // Move (0,0)
        let boardVShape = createBooleanBoard(dim, playerCellsVShape);
        assertFalse(checkFork(boardVShape, [0, 0]), "Fork Test 5: V-shape connecting 2 edges from corner");

        window.layers = originalLayers;
        console.log("--- testCheckFork Finished ---");
}

function testCheckBridge() {
    console.log("--- Running testCheckBridge ---");
    let originalLayers = window.layers;
    window.layers = 4; // For dim = 7
    const dim = 7;

    // Corners for dim=7 (layers=4) from getAllCorners:
    // [0,0], [0,3], [0,6] (Incorrect, getAllCorners returns string "x,y")
    // Corrected interpretation of getAllCorners output for L4 (dim 7, siz 4):
    // [0,0], [0,3], [3,6], [6,3], [6,0], [3,0] -> These are the 6 corners of the outer hexagon boundary.
    // For checkForkAndBridge, these are stringified "r,c" in the Set.
    // bfsReachable returns Set of "r,c".

    // Test Case 1: Bridge present
    // Connects (0,0) and (3,6)
    // Path: (0,0) -> (1,1) -> (2,2) -> (3,3) -> (3,4) -> (3,5) -> (3,6)
    let playerCellsBridge = [[0, 0], [1, 1], [2, 2], [3, 3], [3, 4], [3, 5], [3, 6]];
    let boardBridge = createBooleanBoard(dim, playerCellsBridge);
    let resultBridge = checkForkAndBridge(boardBridge, [3, 6]); // lastMove completes bridge
    assertDeepEquals([true, "bridge"], resultBridge, "Bridge Test 1: Should detect bridge (0,0) to (3,6)");

    // Test Case 1.2: Bridge present, different corners
    // Connects (0,3) and (6,0)
    // Path: (0,3) -> (1,3) -> (2,3) -> (3,3) -> (4,2) -> (5,1) -> (6,0)
    playerCellsBridge = [[0, 3], [1, 3], [2, 3], [3, 3], [4, 2], [5, 1], [6, 0]];
    boardBridge = createBooleanBoard(dim, playerCellsBridge);
    resultBridge = checkForkAndBridge(boardBridge, [6, 0]);
    assertDeepEquals([true, "bridge"], resultBridge, "Bridge Test 1.2: Should detect bridge (0,3) to (6,0)");

    // Test Case 2: Bridge not present (path to only one corner)
    let playerCellsNoBridge = [[0, 0], [1, 1], [2, 2]]; // Path from (0,0) but not to another corner
    let boardNoBridge = createBooleanBoard(dim, playerCellsNoBridge);
    let resultNoBridge = checkForkAndBridge(boardNoBridge, [2, 2]);
    assertFalse(resultNoBridge[0] && resultNoBridge[1] === "bridge", "Bridge Test 2: Should not detect bridge (one corner)");

    // Test Case 3: Incomplete path between two corners
    playerCellsNoBridge = [[0, 0], [1, 1], [3, 3], [3, 4], [3, 5], [3, 6]]; // Gap at (2,2)
    boardNoBridge = createBooleanBoard(dim, playerCellsNoBridge);
    resultNoBridge = checkForkAndBridge(boardNoBridge, [3, 6]);
    assertFalse(resultNoBridge[0] && resultNoBridge[1] === "bridge", "Bridge Test 3: Incomplete bridge");

    // Test Case 4: Path connects two points on the same edge, not corners
    // Edge 0: (0,0) to (3,0). Path (0,0)-(1,0)-(2,0)
    let playerCellsSameEdge = [[0, 0], [1, 0], [2, 0]];
    let boardSameEdge = createBooleanBoard(dim, playerCellsSameEdge);
    let resultSameEdge = checkForkAndBridge(boardSameEdge, [2, 0]);
    assertFalse(resultSameEdge[0] && resultSameEdge[1] === "bridge", "Bridge Test 4: Path on same edge, not corners");


    window.layers = originalLayers;
    console.log("--- testCheckBridge Finished ---");
}

function testCheckRing() {
    console.log("--- Running testCheckRing ---");
    let originalLayers = window.layers;
    window.layers = 4; // For dim = 7
    const dim = 7;

    // Test Case 1: Valid 6-cell ring
    // Ring: (1,1) -> (0,1) -> (0,2) -> (1,2) -> (2,1) -> (1,0) -> (1,1)
    let playerCellsRing6 = [[1, 1], [0, 1], [0, 2], [1, 2], [2, 1], [1, 0]];
    let boardRing6 = createBooleanBoard(dim, playerCellsRing6);
    assertTrue(checkRing(boardRing6, [1, 1]), "Ring Test 1: Should detect 6-cell ring, move=(1,1)");
    assertTrue(checkRing(boardRing6, [0, 2]), "Ring Test 1.1: Should detect 6-cell ring, move=(0,2) (another cell in ring)");

    // Test Case 2: Valid 7-cell ring
    // Ring: (2,2) -> (1,2) -> (0,2) -> (0,3) -> (1,3) -> (2,3) -> (3,3) -> (2,2)
    let playerCellsRing7 = [[2, 2], [1, 2], [0, 2], [0, 3], [1, 3], [2, 3], [3, 3]];
    let boardRing7 = createBooleanBoard(dim, playerCellsRing7);
    assertTrue(checkRing(boardRing7, [2, 2]), "Ring Test 2: Should detect 7-cell ring");

    // Test Case 3: Incomplete ring (gap in cells)
    // Same as 6-cell ring, but [0,2] is missing
    let playerCellsIncompleteRing = [[1, 1], [0, 1], /*[0,2],*/[1, 2], [2, 1], [1, 0]];
    let boardIncompleteRing = createBooleanBoard(dim, playerCellsIncompleteRing);
    assertFalse(checkRing(boardIncompleteRing, [1, 1]), "Ring Test 3: Incomplete ring (missing one cell)");

    // Test Case 4: Cycle too short (5 cells - theoretically, though hard to form naturally without being a line)
    // (1,1)-(0,1)-(0,2)-(1,2)-(1,0)-(1,1) - this is 5 cells
    // This specific formation might be tricky as checkRing expects the last move to be part of the ring.
    // The checkRing implementation finds a path between two neighbors of 'move', excluding 'move'.
    // If path length is L, total cycle is L+1. We need L+1 >= 6, so L >= 5.
    // A 5-cell cycle means L=4 for the path.
    // (1,1) -> (0,1) -> (0,2) -> (1,2) -> (1,1) - path (0,1)->(0,2)->(1,2) is L=3. Cycle is 4.
    // (1,1) -> (0,1) -> (1,0) -> (2,0) -> (2,1) -> (1,1) is a 5-cycle.
    // lastMove = (1,1). Neighbors (0,1), (2,1). Path (0,1)->(1,0)->(2,0)->(2,1). Path L=4. Cycle L+1=5.
    let playerCellsShortCycle = [[1, 1], [0, 1], [1, 0], [2, 0], [2, 1]];
    let boardShortCycle = createBooleanBoard(dim, playerCellsShortCycle);
    assertFalse(checkRing(boardShortCycle, [1, 1]), "Ring Test 4: Cycle of 5 cells should be false");

    // Test Case 5: A line of 6 cells (should not be a ring)
    let playerCellsLine = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]];
    let boardLine = createBooleanBoard(dim, playerCellsLine);
    assertFalse(checkRing(boardLine, [2, 0]), "Ring Test 5: Line of 6 cells is not a ring");
    assertFalse(checkRing(boardLine, [0, 0]), "Ring Test 5.1: Line of 6 cells, move at end, is not a ring");

    // Test Case 6: Not a ring - simple line
    let playerCellsNotRing = [[1, 1], [1, 2], [1, 3]];
    let boardNotRing = createBooleanBoard(dim, playerCellsNotRing);
    assertFalse(checkRing(boardNotRing, [1, 2]), "Ring Test 6: Simple line is not a ring");

    // Test Case 7: Disconnected components that look like parts of a ring but aren't connected
    let playerCellsDisconnected = [[1, 1], [0, 1], [0, 2], [3, 3], [2, 3], [2, 2]];
    let boardDisconnected = createBooleanBoard(dim, playerCellsDisconnected);
    assertFalse(checkRing(boardDisconnected, [1, 1]), "Ring Test 7: Disconnected components");


    window.layers = originalLayers;
    console.log("--- testCheckRing Finished ---");
}


// To run tests, open the browser console and type: runAllTests()
// Make sure script.js is loaded before tests.js in index.html
