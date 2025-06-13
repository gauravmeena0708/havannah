let canvas = document.getElementById("gameCanvas");
let context = canvas.getContext("2d");
let layers;
let currentPlayer = 0; // 0 -> Player 1, 1 -> Player 2
let playerTime = [300, 300]; // 5 minutes for each player in seconds
let gameOver = false;
let board;
let intervalId;
let hexSize;
let aiPlayer2 = null; // AI for Player 2
let isPlayer2AI = false; // To check if Player 2 is AI
let animationFrameId = null; // For managing particle animation frame

document.getElementById("startGameBtn").addEventListener("click", startGame);

function startGame() {
  layers = parseInt(document.getElementById("sizeSelect").value);
  adjustCanvasSize(layers); // Adjust canvas size dynamically based on board size
  board = createInitialBoard(layers);
  currentPlayer = 0;
  gameOver = false;
  playerTime = [300, 300];
  document.getElementById("winner").textContent = "";
  document.getElementById("currentTurn").textContent = "Current Turn: Player 1";

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
    particles = []; // Clear any existing particles
  }

  drawBoardState(board); // Changed from drawBoard
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(updateTimer, 1000); // Update timer every second

  // Determine if Player 2 is AI or human/AI2
  let player2Type = document.getElementById("player2Type").value;
  if (player2Type === "human") {
    aiPlayer2 = null; // Player 2 is human
    isPlayer2AI = false;
  } else if (player2Type === "ai") {
    aiPlayer2 = new AIPlayer(2); // Initialize AI for Player 2
    isPlayer2AI = true;
  } else if (player2Type === "ai2") {
    aiPlayer2 = new AIPlayer2(2); // Initialize AI2 for Player 2
    isPlayer2AI = true;
  }
}

let particles = []; // Array to store sparkles for celebration effect

function adjustCanvasSize(layers) {
  const screenHeight = window.innerHeight; // Get the screen height
  const maxCanvasSize = screenHeight - 100; // Max canvas size should be 200px less than screen height
  const canvasPadding = 10; // Extra padding around the canvas
  hexSize = Math.floor(maxCanvasSize / (3 * layers)); // Dynamically calculate hex size based on layers and max canvas size
  const canvasSize = hexSize * 3 * layers + canvasPadding; // Adjust canvas size dynamically

  canvas.width = canvasSize;
  canvas.height = canvasSize;
}

function createInitialBoard(layers) {
  const board = [];

  // Initialize the board with empty cells (0 represents empty)
  for (let i = 0; i < 2 * layers - 1; i++) {
    const row = [];
    for (let j = 0; j < 2 * layers - 1; j++) {
      row.push(0); // Initialize all tiles to 0 (empty)
    }
    board.push(row);
  }

  // Logic to block tiles on the lower triangular side, similar to the Python code
  for (let i = layers; i < 2 * layers - 1; i++) {
    for (let j = 0; j < i - layers + 1; j++) {
      // Block tiles in the lower triangular region
      board[i][j] = 3;
      board[i][2 * layers - 2 - j] = 3;
    }
  }

  return board;
}

function drawBoardState(board) { // Renamed from drawBoard
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let j = 0; j < 2 * layers - 1; j++) {
    const colSize = j < layers ? layers + j : layers + 2 * layers - 2 - j;
    for (let i = 0; i < colSize; i++) {
      const hexCoords = calculateHexagon(i, j);
      const color =
        board[i][j] === 1 ? "yellow" : board[i][j] === 2 ? "red" : "white";
      drawHexagon(hexCoords, color, i, j);
    }
  }
  // Removed drawParticles() call from here
}

function calculateHexagon(i, j) {
  const sqrt3 = Math.sqrt(3);
  const offsetX = (j * hexSize * 3) / 2;
  const offsetY = ((Math.abs(j - layers + 1) + 2 * i) * hexSize * sqrt3) / 2;
  return [
    { x: hexSize / 2 + offsetX, y: offsetY },
    { x: (hexSize * 3) / 2 + offsetX, y: offsetY },
    { x: hexSize * 2 + offsetX, y: (hexSize * sqrt3) / 2 + offsetY },
    { x: (hexSize * 3) / 2 + offsetX, y: hexSize * sqrt3 + offsetY },
    { x: hexSize / 2 + offsetX, y: hexSize * sqrt3 + offsetY },
    { x: offsetX, y: (hexSize * sqrt3) / 2 + offsetY },
  ];
}

function drawHexagon(coords, fillColor, row, col) {
  context.beginPath();
  context.moveTo(coords[0].x, coords[0].y);
  coords.forEach((point) => context.lineTo(point.x, point.y));
  context.closePath();

  const centroid = calculateCentroid(coords); // Calculate centroid for gradients and text

  if (fillColor === "yellow") {
    const gradient = context.createRadialGradient(centroid.x, centroid.y, hexSize * 0.1, centroid.x, centroid.y, hexSize * 0.75);
    gradient.addColorStop(0, '#FFFFE0'); // Light yellow
    gradient.addColorStop(1, 'gold');
    context.fillStyle = gradient;
  } else if (fillColor === "red") {
    const gradient = context.createRadialGradient(centroid.x, centroid.y, hexSize * 0.1, centroid.x, centroid.y, hexSize * 0.75);
    gradient.addColorStop(0, '#FFEEEE'); // Light pink/red
    gradient.addColorStop(1, 'red');
    context.fillStyle = gradient;
  } else {
    context.fillStyle = fillColor || "white";
  }

  context.fill();
  context.stroke();

  context.fillStyle = "black";
  context.font = "12px Arial";
  context.fillText(`(${row},${col})`, centroid.x - 10, centroid.y + 4);
}

function calculateCentroid(coords) {
  let centroidX = 0,
    centroidY = 0;
  coords.forEach((point) => {
    centroidX += point.x;
    centroidY += point.y;
  });
  return { x: centroidX / coords.length, y: centroidY / coords.length };
}

function updateTimer() {
  if (gameOver) return;
  playerTime[currentPlayer]--;
  if (playerTime[currentPlayer] <= 0) {
    gameOver = true;
    document.getElementById("currentTurn").textContent = `Game Over! Player ${
      currentPlayer + 1
    } ran out of time.`;
    clearInterval(intervalId);
    return;
  }
  updatePlayerTime();
}

function updatePlayerTime() {
  const player1Min = Math.floor(playerTime[0] / 60);
  const player1Sec = playerTime[0] % 60;
  const player2Min = Math.floor(playerTime[1] / 60);
  const player2Sec = playerTime[1] % 60;
  document.getElementById("player1Time").textContent = `${player1Min}:${
    player1Sec < 10 ? "0" : ""
  }${player1Sec}`;
  document.getElementById("player2Time").textContent = `${player2Min}:${
    player2Sec < 10 ? "0" : ""
  }${player2Sec}`;
}

canvas.addEventListener("click", (event) => {
  if (gameOver || (currentPlayer === 1 && isPlayer2AI)) return; // Skip human clicks if it's AI's turn

  const x = event.offsetX;
  const y = event.offsetY;

  const [row, col] = getHexagonAtCoords(x, y);
  if (row !== null && col !== null && board[row][col] === 0) {
    makeMove(row, col);
  }
});

function getHexagonAtCoords(x, y) {
  for (let r = 0; r < 2 * layers - 1; r++) {
    for (let c = 0; c < 2 * layers - 1; c++) {
      const hexCoords = calculateHexagon(r, c);
      if (isPointInHexagon(x, y, hexCoords)) {
        return [r, c];
      }
    }
  }
  return [null, null];
}

function isPointInHexagon(x, y, coords) {
  let inside = false;
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    const xi = coords[i].x,
      yi = coords[i].y;
    const xj = coords[j].x,
      yj = coords[j].y;

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function switchPlayer() {
  currentPlayer = 1 - currentPlayer;
  document.getElementById("currentTurn").textContent = `Current Turn: Player ${
    currentPlayer + 1
  }`;
  if (currentPlayer === 1 && isPlayer2AI && !gameOver) {
    handleAITurn(); // AI makes a move
  }
}

function makeMove(row, col) {
  board[row][col] = currentPlayer + 1; // Player 1 is Yellow, Player 2 is Red
  drawBoardState(board); // Changed from drawBoard

  const [win, structure] = checkWin(board, [row, col], currentPlayer + 1);
  if (win) {
    endGame(currentPlayer + 1, structure);
  } else {
    switchPlayer();
  }
}

function handleAITurn() {
  setTimeout(() => {
    if (aiPlayer2) {
      const aiMove = aiPlayer2.getMove(board); // Use the selected AI for Player 2
      makeMove(aiMove[0], aiMove[1]);
    }
  }, 500); // Slight delay to mimic AI thinking
}

function endGame(winner, structure) {
  gameOver = true;
  const winnerColorString = winner === 1 ? "yellow" : "red";
  canvas.style.border = `5px solid ${winnerColorString}`; // Change canvas border to winning player's color
  document.getElementById(
    "currentTurn"
  ).textContent = `Game Over! Player ${winner} wins by ${structure}!`;

  // Trigger the celebration (sparkle effect)
  triggerCelebration(winnerColorString); // Pass winner color
  alert(`Player ${winner} won!!`); // Alert the winner
}

// Sparkle/celebration effect
function triggerCelebration(winnerColor) { // Accepts winnerColor
  particles = []; // Clear previous particles
  for (let i = 0; i < 100; i++) {
    // Create 100 particles
    particles.push(createParticle(winnerColor)); // Pass winnerColor
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId); // Cancel any existing animation
  }
  animateParticles();
}

function createParticle(baseColor) { // Accepts baseColor
  let hue;
  let lightness = Math.random() * 20 + 50; // 50-70%

  if (baseColor === "yellow") {
    hue = Math.random() * 15 + 45; // Hues 45-60 for yellow/gold
  } else if (baseColor === "red") {
    hue = Math.random() * 15; // Hues 0-15 for red (can also wrap around 345-360)
  } else {
    hue = Math.random() * 360; // Default fallback
  }

  return {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: Math.random() * 4 + 2, // Random radius
    color: `hsl(${hue}, 100%, ${lightness}%)`, // Themed color
    speedX: Math.random() * 5 - 2.5, // Random speed X
    speedY: Math.random() * 5 - 2.5, // Random speed Y
    life: 100, // Lifespan of the particle
  };
}

// New function for updating and drawing particles
function updateAndDrawParticles(ctx) {
  particles.forEach((particle, index) => {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.fill();
    ctx.closePath();

    // Update particle position and reduce life
    particle.x += particle.speedX;
    particle.y += particle.speedY;
    particle.life--;

    // Remove particle if life is over
    if (particle.life <= 0) {
      particles.splice(index, 1);
    }
  });
}

function animateParticles() {
  if (particles.length === 0) {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    return; // Stop animation if no particles left
  }
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawBoardState(board); // Redraw the board state
  updateAndDrawParticles(context); // Update and draw particles
  animationFrameId = requestAnimationFrame(animateParticles); // Continue loop
}

// Helper function to check if coordinates are valid
function isValid(x, y, dim) {
  // dim is 2 * layers - 1 (total rows or columns in the board array)
  // y is the column index, x is the row index within that column

  if (y < 0 || y >= dim) {
    return false; // y is out of bounds for the entire board array
  }

  // Calculate the actual height of the current column y
  // This logic is based on how the hexagonal board is structured
  const colHeight = (y < layers) ? (layers + y) : (layers + (2 * layers - 2) - y);

  // Check if x is within the valid range for this specific column
  return 0 <= x && x < colHeight;
}

// Helper function to get all valid moves
function getValidActions(board) {
  let validMoves = [];
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      // Only consider cells that are empty (0) and not blocked (3)
      if (board[i][j] === 0) {
        validMoves.push([i, j]);
      }
    }
  }
  return validMoves;
}

// Neighbor calculation
function getNeighbours(dim, vertex) {
  let [i, j] = vertex;
  const siz = Math.floor(dim / 2); // Size to differentiate between the two halves
  let neighbours = [];

  // Horizontal and vertical neighbors
  if (i > 0) neighbours.push([i - 1, j]);
  if (i < dim - 1) neighbours.push([i + 1, j]);
  if (j > 0) neighbours.push([i, j - 1]);
  if (j < dim - 1) neighbours.push([i, j + 1]);

  // Diagonal neighbors for hexagonal structure
  if (i > 0 && j <= siz && j > 0) neighbours.push([i - 1, j - 1]);
  if (i > 0 && j >= siz && j < dim - 1) neighbours.push([i - 1, j + 1]);
  if (i < dim - 1 && j < siz) neighbours.push([i + 1, j + 1]);
  if (i < dim - 1 && j > siz) neighbours.push([i + 1, j - 1]);

  return neighbours;
}

// BFS to find all reachable points for the current player
function bfsReachable(board, start) {
  const dim = board.length;
  const playerNum = board[start[0]][start[1]]; // Capture the current player's number
  const queue = [start];
  const visited = new Set([`${start[0]},${start[1]}`]);

  while (queue.length > 0) {
    const [x, y] = queue.shift();
    const neighbors = getNeighbours(dim, [x, y]);

    for (const [nx, ny] of neighbors) {
      if (
        isValid(nx, ny, dim) &&
        !visited.has(`${nx},${ny}`) &&
        board[nx][ny] !== 3 && // Exclude blocked tiles
        board[nx][ny] === playerNum // Same player tiles
      ) {
        queue.push([nx, ny]);
        visited.add(`${nx},${ny}`);
      }
    }
  }

  return visited;
}

// Fixing edges identification
function getAllEdges(dim) {
  const siz = Math.floor((dim + 1) / 2);
  const edges = [
    Array.from({ length: siz }, (_, i) => [i, 0]), // Left edge
    Array.from({ length: siz }, (_, i) => [0, i]), // Top-left edge
    Array.from({ length: siz }, (_, i) => [i, i + siz - 1]), // Top-right edge
    Array.from({ length: siz }, (_, i) => [i + siz - 1, dim - 1]), // Right edge
    Array.from({ length: siz }, (_, i) => [dim - 1, i + siz - 1]), // E4
    Array.from({ length: siz }, (_, i) => [i + siz - 1, i]), // E5
  ];
  return edges.map((edge) => new Set(edge.map((e) => `${e[0]},${e[1]}`)));
}

// Helper function to check if a side has reachable points
function sideHasReachablePoints(side, visited) {
  for (const point of visited) {
    if (side.has(point)) return true; // Check if any point in the visited set belongs to this edge
  }
  return false;
}

// Updated checkFork function to ensure only edges are considered
function checkFork(board, move) {
  const visited = bfsReachable(board, move); // Get all reachable points from the current move
  const edges = getAllEdges(board.length); // Only consider valid edges

  // Count how many distinct edges are reachable
  const reachableEdges = edges.filter((edge) =>
    sideHasReachablePoints(edge, visited)
  );

  // A fork is detected if 3 or more edges are connected
  return reachableEdges.length >= 3;
}

// Function to check both fork and bridge in a single move
function checkForkAndBridge(board, move) {
  const visited = bfsReachable(board, move);
  const corners = new Set(getAllCorners(board.length));
  const edges = getAllEdges(board.length);

  // Check for fork
  const reachableEdges = edges.map((side) =>
    sideHasReachablePoints(side, visited)
  );
  if (reachableEdges.filter(Boolean).length >= 3) {
    return [true, "fork"];
  }

  // Check for bridge
  const reachableCorners = [...visited].filter((point) =>
    corners.has(point)
  ).length;
  if (reachableCorners >= 2) {
    return [true, "bridge"];
  }

  return [false, null];
}

// Function to check if the player has won by either fork or bridge
function checkWin(board, move, playerNum) {
  // Convert the board to a boolean array where the player's positions are `true`
  board = board.map((row) => row.map((cell) => cell === playerNum));

  // Check if a ring is formed
  if (checkRing(board, move)) {
    return [true, "ring"];
  }

  // Check for fork or bridge
  const [win, way] = checkForkAndBridge(board, move);
  if (win) {
    return [true, way];
  }

  return [false, null];
}

function checkRing(board, move) {
  const dim = board.length;
  const [moveR, moveC] = move;

  // 1. Get all neighbors of `move` that are also the player's stones
  const allNeighbors = getNeighbours(dim, move);
  const playerNeighbors = allNeighbors.filter(([nr, nc]) => {
    return isValid(nr, nc, dim) && board[nr][nc];
  });

  // 2. If `playerNeighbors.length < 2`, return `false`.
  if (playerNeighbors.length < 2) {
    return false;
  }

  // 3. For each distinct pair of `playerNeighbors` (n1, n2):
  for (let i = 0; i < playerNeighbors.length; i++) {
    for (let j = i + 1; j < playerNeighbors.length; j++) {
      const n1 = playerNeighbors[i];
      const n2 = playerNeighbors[j];
      const [n1r, n1c] = n1;
      const [n2r, n2c] = n2;

      // a. Perform a BFS starting from `n1` to find a path to `n2`.
      const queue = [ [n1, [n1]] ]; // Store [currentCell, path_to_currentCell]
      const visitedInBFS = new Set();
      visitedInBFS.add(`${moveR},${moveC}`); // c. BFS must NOT go through the original `move` cell.
      visitedInBFS.add(`${n1r},${n1c}`);

      while (queue.length > 0) {
        const [currentCell, currentPath] = queue.shift();
        const [cr, cc] = currentCell;

        if (cr === n2r && cc === n2c) { // Path to n2 found
          // d. cycle: move -> n1 -> ...path... -> n2 -> move
          // e. length of this cycle is currentPath.length + 1 (n1 is in currentPath, +1 for original move)
          // The problem statement says "path.length + 1 >= 6" where path is p1...pk (n1 to n2).
          // So, currentPath.length is the number of nodes from n1 to n2 inclusive.
                          // The cycle is move -> n1(=p1) -> p2 ... -> pk(=n2) -> move
                          // The number of nodes in cycle is currentPath.length (nodes from n1 to n2) + 1 (the initial 'move' node)
          if (currentPath.length + 1 >= 6) {
            // f. If cycle length >= 6, return true.
            return true;
          }
          // Found a path, but it's too short for a ring. Break from this BFS.
          break;
        }

        const neighborsOfCurrent = getNeighbours(dim, currentCell);
        for (const neighbor of neighborsOfCurrent) {
          const [nr, nc] = neighbor;
          const neighborStr = `${nr},${nc}`;

          if (
            isValid(nr, nc, dim) &&       // Valid cell
            board[nr][nc] &&              // Is player's stone
            !visitedInBFS.has(neighborStr) // Not visited in THIS BFS path search and not the original 'move'
          ) {
            visitedInBFS.add(neighborStr);
            const newPath = [...currentPath, neighbor];
            queue.push([neighbor, newPath]);
          }
        }
      }
    }
  }

  // 4. If no such cycle is found after checking all pairs, return `false`.
  return false;
}

function getAllCorners(dim) {
  /*
        Returns the coordinates of the corner vertices on the hexagonal board.
    
        Parameters:
        - dim (int): The dimension of the board
    
        Returns:
        - Array: List of corner coordinates as strings in the format "x,y"
      */

  return [
    [0, 0], // Top-left corner
    [0, Math.floor(dim / 2)], // Top-middle corner
    [0, dim - 1], // Top-right corner
    [Math.floor(dim / 2), dim - 1], // Middle-right corner
    [dim - 1, Math.floor(dim / 2)], // Bottom-middle corner
    [Math.floor(dim / 2), 0], // Middle-left corner
  ].map(([x, y]) => `${x},${y}`);
}

function getEdge(vertex, dim) {
    let [i, j] = vertex;
    const mid = Math.floor(dim / 2);

    if (j === 0 && i > 0 && i < mid) return 0; // Left
    if (i === 0 && j > 0 && j < mid) return 1; // Top-left
    if (i > 0 && i < mid && i === j) return 2; // Top-right
    if (j === dim - 1 && i > mid && i < dim - 1) return 3; // Right
    if (i === dim - 1 && j > mid && j < dim - 1) return 4; // Bottom-right
    if (i > mid && i < dim - 1 && i - j === mid) return 5; // Bottom-left
    return -1;
}

function getCorner(vertex, dim) {
  let [i, j] = vertex;
  const mid = Math.floor(dim / 2);

  if (i === 0 && j === 0) return 0; // Top-left
  if (i === 0 && j === mid) return 1; // Top-middle
  if (i === mid && j === dim - 1) return 2; // Top-right
  if (i === dim - 1 && j === dim - 1) return 3; // Bottom-right
  if (i === dim - 1 && j === mid) return 4; // Bottom-middle
  if (i === mid && j === 0) return 5; // Bottom-left

  return -1;
}

function moveCoordinates(direction, half) {
  /*
        Returns the coordinates of the move in the given direction.
    
        Parameters:
        - direction (string): The direction to which the move is to be made (e.g., 'up', 'down', 'top-left', 'top-right', etc.)
        - half (int): The half of the board (0 for middle, -1 for left half, 1 for right half)
    
        Returns:
        - Array: The x and y deltas for the direction
      */

  if (direction === "up") {
    return [-1, 0];
  } else if (direction === "down") {
    return [1, 0];
  } else if (direction === "top-left") {
    return half === 0 || half < 0 ? [-1, -1] : [0, -1];
  } else if (direction === "top-right") {
    return half === 0 || half > 0 ? [-1, 1] : [0, 1];
  } else if (direction === "bottom-left") {
    return half === 0 || half < 0 ? [0, -1] : [1, -1];
  } else if (direction === "bottom-right") {
    return half === 0 || half > 0 ? [0, 1] : [1, 1];
  }

  return [0, 0]; // Default case: No movement
}

function threeForwardMoves(direction) {
  /**
   * Returns the 3 forward moves from the current direction.
   * @param {string} direction - The direction of the last move.
   * @returns {Array} - List of 3 forward moves from the current direction.
   */
  if (direction === "up") {
    return ["top-left", "up", "top-right"];
  } else if (direction === "down") {
    return ["bottom-left", "down", "bottom-right"];
  } else if (direction === "top-left") {
    return ["bottom-left", "top-left", "up"];
  } else if (direction === "top-right") {
    return ["top-right", "up", "bottom-right"];
  } else if (direction === "bottom-left") {
    return ["bottom-left", "down", "top-left"];
  } else if (direction === "bottom-right") {
    return ["bottom-right", "down", "top-right"];
  }
  return [];
}

// Update the startGame function to render the initial board
function startGame() {
  layers = parseInt(document.getElementById("sizeSelect").value);
  adjustCanvasSize(layers); // Adjust canvas size dynamically based on board size
  board = createInitialBoard(layers);
  currentPlayer = 0;
  gameOver = false;
  playerTime = [300, 300];
  document.getElementById("winner").textContent = "";
  document.getElementById("currentTurn").textContent = "Current Turn: Player 1";
  //drawBoard(board); // Note: This ideally should be drawBoardState
  drawBoardState(board);
  // renderGameTable(board); // Render the initial board in the table - REMOVED
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(updateTimer, 1000); // Update timer every second

  // Determine if Player 2 is AI or human/AI2
  let player2Type = document.getElementById("player2Type").value;
  if (player2Type === "human") {
    aiPlayer2 = null; // Player 2 is human
    isPlayer2AI = false;
  } else if (player2Type === "ai") {
    aiPlayer2 = new AIPlayer(2); // Initialize AI for Player 2
    isPlayer2AI = true;
  } else if (player2Type === "ai2") {
    aiPlayer2 = new AIPlayer2(2); // Initialize AI2 for Player 2
    isPlayer2AI = true;
  }
}

// Update the makeMove function to also render the table after each move
function makeMove(row, col) {
  board[row][col] = currentPlayer + 1; // Player 1 is Yellow, Player 2 is Red
  //drawBoard(board); // Note: This ideally should be drawBoardState
  drawBoardState(board);
  // renderGameTable(board); // Update the table after each move - REMOVED

  const [win, structure] = checkWin(board, [row, col], currentPlayer + 1);
  if (win) {
    endGame(currentPlayer + 1, structure);
  } else {
    switchPlayer();
  }
}

// Add this function to check if there are any valid moves left for any player
function checkForTie(board) {
  const validMoves = getValidActions(board);
  return validMoves.length === 0; // Return true if no valid moves are left
}

// Update the makeMove function to check for a tie after each move
function makeMove(row, col) {
  board[row][col] = currentPlayer + 1; // Player 1 is Yellow, Player 2 is Red
  //drawBoard(board); // Note: This ideally should be drawBoardState
  drawBoardState(board);
  // renderGameTable(board); // Update the table after each move - REMOVED

  // Check if the current move results in a win
  const [win, structure] = checkWin(board, [row, col], currentPlayer + 1);
  if (win) {
    endGame(currentPlayer + 1, structure);
  } else {
    // Check if there are no valid moves left for either player
    if (checkForTie(board)) {
      endGame(null, "tie");
    } else {
      switchPlayer();
    }
  }
}

// Update the endGame function to handle tie cases
function endGame(winner, structure) {
  gameOver = true;
  clearInterval(intervalId); // Stop the timer

  if (winner) {
    const winnerColor = winner === 1 ? "yellow" : "red";
    canvas.style.border = `5px solid ${winnerColor}`; // Change canvas border to winning player's color
    document.getElementById(
      "currentTurn"
    ).textContent = `Game Over! Player ${winner} wins by ${structure}!`;
    gtag("send", "event", "Game", `Win player ${winner}`);
    alert(`Player ${winner} won!!`); // Alert the winner
    if (typeof gtag === "function") {
      gtag("send", "event", "Win", {
        event_category: "Game",
        event_label: `Level 1 ${winner}`,
        value: `Player ${winner} won`,
      });
      gtag("event", "Win", {
        event_category: "Game",
        event_label: `Level 1 ${winner}`,
        value: `Player ${winner} won`,
      });

      gtag("event", "Game Outcome", {
        Game_Name: "Havannah",
        Winner: winner,
        "Won BY": structure,
      });
    } else {
      console.warn("Google Analytics (gtag) is not defined.");
    }
  } else if (structure === "tie") {
    document.getElementById(
      "currentTurn"
    ).textContent = `Game Over! It's a tie!`;
    alert("It's a tie! No valid moves left.");
  }

  // Trigger the celebration (sparkle effect) if there's a winner
  if (winner) {
    triggerCelebration();
  }
}

function saveGameState() {
    if (typeof board === 'undefined' || board === null) {
        alert("Game has not started or board is not initialized. Nothing to save.");
        return;
    }
    // Attempt to get player2Type value, default to "human" if element isn't found or game hasn't started
    let player2TypeValue = "human";
    const player2TypeElement = document.getElementById("player2Type");
    if (player2TypeElement) {
        player2TypeValue = player2TypeElement.value;
    } else if (typeof isPlayer2AI !== 'undefined' && isPlayer2AI === false) { // If game started and P2 is human
        player2TypeValue = "human";
    } else if (typeof aiPlayer2 !== 'undefined' && aiPlayer2 instanceof AIPlayer) { // Check type of AI
        player2TypeValue = "ai";
    } else if (typeof aiPlayer2 !== 'undefined' && aiPlayer2 instanceof AIPlayer2) {
        player2TypeValue = "ai2";
    }


    const gameState = {
        board: board,
        currentPlayer: currentPlayer,
        playerTime: playerTime,
        layers: layers,
        gameOver: gameOver,
        isPlayer2AI: isPlayer2AI, // Save this to know if AI needs re-initialization
        player2Type: player2TypeValue // Save the selection like "human", "ai", "ai2"
    };

    const jsonString = JSON.stringify(gameState, null, 2); // null, 2 for pretty printing
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "havannah_save.json";
    document.body.appendChild(a); // Required for Firefox
    a.click();
    document.body.removeChild(a); // Clean up
    URL.revokeObjectURL(url);

    console.log("Game state saved.");
}

// Add event listener for the Save Game button
// Ensure this runs after the button is in the DOM. script.js is loaded at the end of body in index.html.
const saveGameButton = document.getElementById("saveGameBtn");
if (saveGameButton) {
    saveGameButton.addEventListener("click", saveGameState);
} else {
    // Fallback if script somehow runs before DOM is fully ready for this element
    document.addEventListener('DOMContentLoaded', () => {
        const btn = document.getElementById("saveGameBtn");
        if (btn) {
            btn.addEventListener("click", saveGameState);
        } else {
            console.error("Save Game button not found even after DOMContentLoaded.");
        }
    });
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) {
        return; // No file selected
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        let gameState;
        try {
            gameState = JSON.parse(e.target.result);
        } catch (error) {
            alert("Failed to load game: Invalid save file format. Please select a valid .json save file.");
            console.error("Error parsing save file:", error);
            return;
        }

        // Basic validation of gameState structure
        if (!gameState || typeof gameState.layers === 'undefined' || !gameState.board || typeof gameState.currentPlayer === 'undefined' || !gameState.playerTime || typeof gameState.gameOver === 'undefined' || typeof gameState.isPlayer2AI === 'undefined' || typeof gameState.player2Type === 'undefined') {
            alert("Failed to load game: Save file is missing required data.");
            return;
        }

        // Stop current game processes & clear UI elements from previous game
        if (intervalId) clearInterval(intervalId);
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
            particles = []; // Clear particles
        }
        canvas.style.border = "2px solid black"; // Reset canvas border to default
        const winnerEl = document.getElementById("winner");
        if (winnerEl) winnerEl.textContent = ""; // Clear winner display


        // Update global game variables from loaded state
        layers = gameState.layers; // Set layers first
        board = gameState.board;
        currentPlayer = gameState.currentPlayer;
        playerTime = gameState.playerTime;
        gameOver = gameState.gameOver;
        isPlayer2AI = gameState.isPlayer2AI;
        // aiPlayer2 will be re-instantiated below

        // Update UI elements based on loaded state
        const sizeSelectEl = document.getElementById("sizeSelect");
        if (sizeSelectEl) sizeSelectEl.value = layers;

        const player2TypeEl = document.getElementById("player2Type");
        if (player2TypeEl) player2TypeEl.value = gameState.player2Type;

        adjustCanvasSize(layers); // Adjust canvas size for new layer count
        drawBoardState(board);    // Draw the loaded board state

        // Update player turn display and other UI text
        const currentTurnEl = document.getElementById("currentTurn");
        if (currentTurnEl) {
            if (gameOver) {
                // If game was over, reflect that. Might need more detailed info from save in future.
                currentTurnEl.textContent = "Game Over (Loaded State)";
                // If winner info was part of gameState, display it here.
                // e.g. if (gameState.winnerPlayer) { winnerEl.textContent = `Player ${gameState.winnerPlayer} won!`; }
            } else {
                currentTurnEl.textContent = `Current Turn: Player ${currentPlayer + 1}`;
            }
        }

        updatePlayerTime(); // Update timer displays

        // Re-initialize AI Player object based on loaded player2Type
        const loadedPlayer2Type = gameState.player2Type;
        aiPlayer2 = null; // Reset AI player first
        // isPlayer2AI is already set from gameState.isPlayer2AI, use it directly
        if (isPlayer2AI) {
            if (loadedPlayer2Type === "ai") {
                aiPlayer2 = new AIPlayer(2); // AI is player 2 (index 1, but constructor might take 1 or 2)
            } else if (loadedPlayer2Type === "ai2") {
                aiPlayer2 = new AIPlayer2(2); // AI2 is player 2
            } else {
                // Should not happen if isPlayer2AI is true and player2Type is human, but good to be safe
                isPlayer2AI = false;
            }
        }


        // Restart timer if game is not over
        if (!gameOver) {
            intervalId = setInterval(updateTimer, 1000);
        }

        console.log("Game state loaded successfully.");

        // If it's AI's turn in the loaded game and the game is not over, trigger AI move
        if (currentPlayer === 1 && isPlayer2AI && !gameOver) {
            handleAITurn();
        }
    };

    reader.onerror = function() {
        alert("Failed to read file. An error occurred.");
        console.error("FileReader error:", reader.error);
    };

    reader.readAsText(file);
    event.target.value = null; // Reset file input so 'change' fires for same file
}

// Add event listeners for Load Game button and file input
const loadGameButton = document.getElementById("loadGameBtn");
const loadGameInput = document.getElementById("loadGameInput");

if (loadGameButton && loadGameInput) {
    loadGameButton.addEventListener("click", () => {
        loadGameInput.click(); // Programmatically click the hidden file input
    });
    loadGameInput.addEventListener("change", handleFileSelect);
} else {
    // Fallback to ensure listeners are attached even if script runs very early
    document.addEventListener('DOMContentLoaded', () => {
        const lgb = document.getElementById("loadGameBtn");
        const lgi = document.getElementById("loadGameInput");
        if (lgb && lgi) {
            lgb.addEventListener("click", () => lgi.click());
            lgi.addEventListener("change", handleFileSelect);
        } else {
            console.error("Load Game button or input not found even after DOMContentLoaded.");
        }
    });
}
