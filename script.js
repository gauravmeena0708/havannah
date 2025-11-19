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
    document.getElementById("currentTurn").textContent = `Game Over! Player ${currentPlayer + 1
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
  document.getElementById("player1Time").textContent = `${player1Min}:${player1Sec < 10 ? "0" : ""
    }${player1Sec}`;
  document.getElementById("player2Time").textContent = `${player2Min}:${player2Sec < 10 ? "0" : ""
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
  document.getElementById("currentTurn").textContent = `Current Turn: Player ${currentPlayer + 1
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
  const layers = (dim + 1) / 2;
  const range = Array.from({ length: layers - 2 }, (_, i) => i + 1);

  // Helper to get bottom index of a column
  const getBottomIndex = (col) => {
    if (col < layers) return layers + col - 1;
    return layers + (2 * layers - 2) - col - 1;
  };

  const edges = [
    // Left Edge (Col 0)
    range.map(k => [k, 0]),

    // Top-Left Edge (Top of Cols 1..layers-2)
    range.map(k => [0, k]),

    // Top-Right Edge (Top of Cols layers..dim-2)
    range.map(k => [0, layers - 1 + k]),

    // Right Edge (Col dim-1)
    range.map(k => [k, dim - 1]),

    // Bottom-Right Edge (Bottom of Cols dim-2..layers)
    range.map(k => {
      const col = dim - 1 - k;
      return [getBottomIndex(col), col];
    }),

    // Bottom-Left Edge (Bottom of Cols layers-2..1)
    range.map(k => {
      const col = k; // Cols 1 to layers-2
      return [getBottomIndex(col), col];
    })
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
  const playerNum = board[moveR][moveC];

  // 1. Get all neighbors of `move` that are also the player's stones
  const allNeighbors = getNeighbours(dim, move);
  const playerNeighbors = allNeighbors.filter(([nr, nc]) => {
    return isValid(nr, nc, dim) && board[nr][nc] === playerNum;
  });

  // 2. If `playerNeighbors.length < 2`, return `false`.
  if (playerNeighbors.length < 2) {
    return false;
  }

  // 3. Check for a ring by trying to find a path between any two neighbors
  //    that does NOT use the `move` cell and does NOT use any "short-circuiting" connections.
  for (let i = 0; i < playerNeighbors.length; i++) {
    for (let j = i + 1; j < playerNeighbors.length; j++) {
      const n1 = playerNeighbors[i];
      const n2 = playerNeighbors[j];

      if (findRingPath(board, move, n1, n2, playerNeighbors)) {
        return true;
      }
    }
  }

  return false;
}

function findRingPath(board, move, start, end, allMoveNeighbors) {
  const dim = board.length;
  const [moveR, moveC] = move;
  const [endR, endC] = end;
  const playerNum = board[moveR][moveC];

  // Set of cells to exclude from the BFS to force a "long" way around.
  // 1. The move itself (obviously).
  const excluded = new Set([`${moveR},${moveC}`]);

  // 2. All OTHER neighbors of 'move' (except start and end).
  //    This prevents the path from just hopping through another neighbor of 'move'.
  for (const neighbor of allMoveNeighbors) {
    const nStr = `${neighbor[0]},${neighbor[1]}`;
    if (nStr !== `${start[0]},${start[1]}` && nStr !== `${end[0]},${end[1]}`) {
      excluded.add(nStr);
    }
  }

  // 3. If start and end are neighbors, we must NOT use the direct edge between them.
  //    But BFS finds nodes, not edges. So we can't "ban" an edge easily.
  //    However, if they are neighbors, a path of length 1 exists (start->end).
  //    We want a path that is NOT just that direct step.
  //    Since we are doing BFS on nodes, we can't stop the direct step unless we ban 'end' which is impossible.
  //    Wait, if they are neighbors, they form a triangle with 'move'.
  //    We want to find a path that goes the "long way".
  //    If we just run BFS, it will find the direct neighbor connection immediately.
  //    
  //    Strategy: If start and end are neighbors, we can't use the direct connection.
  //    But we can't tell BFS "don't go from start to end directly".
  //    
  //    Actually, the problem is simpler: We want to see if there is a path from start to end
  //    that does NOT use 'move' and has length >= something?
  //    No, the cycle length condition is `path_len + 2 >= 6` (start->...->end->move->start).
  //    So path_len >= 4.
  //    
  //    If we find *any* path with length >= 4, is that enough?
  //    Not necessarily. BFS finds the shortest path.
  //    If the shortest path is length 1 (direct neighbor), BFS returns that.
  //    We need to know if there exists a path of length >= 4.
  //    
  //    If start and end are neighbors, the shortest path is 1.
  //    We want to know if there is *another* path.
  //    This effectively means: is there a path if we remove the direct edge?
  //    But we can't remove edges in a grid graph easily without modifying the graph structure.
  //    
  //    Alternative:
  //    The "short circuits" are caused by:
  //    a) Direct connection between n1 and n2.
  //    b) Common neighbors of n1 and n2 (forming a rhombus with 'move').
  //    
  //    We can try to exclude common neighbors of start and end from the BFS?
  //    
  //    Let's try this:
  //    If start and end are neighbors, we are looking for a cycle > 3.
  //    If we find a path > 1, we are good?
  //    
  //    Actually, the robust way is:
  //    Run BFS.
  //    If we reach 'end', check the path length.
  //    If path length is long enough, return true.
  //    If path length is too short (e.g. 1 or 2), we need to see if there's a *longer* path.
  //    But BFS doesn't find longer paths.
  //    
  //    However, in the context of a planar hexagonal grid, "short" paths are very constrained.
  //    Short paths are:
  //    1. Direct neighbor (len 1).
  //    2. Common neighbor (len 2).
  //    
  //    If we exclude:
  //    - The direct edge (conceptually).
  //    - Any common neighbors of start and end (that are also neighbors of 'move'? No, just common neighbors).
  //    
  //    Actually, we already excluded other neighbors of 'move'.
  //    So if n1 and n2 share a neighbor n3, and n3 is ALSO a neighbor of 'move', n3 is excluded.
  //    So "rhombus" through a mutual neighbor of 'move' is blocked.
  //    
  //    What if n1 and n2 share a neighbor X that is NOT a neighbor of 'move'?
  //    Then move->n1->X->n2->move is a length 4 cycle. Not a ring (needs 6).
  //    So we must also exclude common neighbors of n1 and n2?
  //    
  //    Yes! A cycle of 4 or 5 is not a ring.
  //    Cycle 4: move-n1-X-n2-move. Path n1-X-n2 is len 2.
  //    Cycle 5: move-n1-X-Y-n2-move. Path n1-X-Y-n2 is len 3.
  //    We need Cycle 6: Path len >= 4.
  //    
  //    So we need to block any path of len 1, 2, or 3.
  //    
  //    We can do this by:
  //    1. If n1, n2 are neighbors, we can't use that edge.
  //       Since we can't cut edges, we can try to run BFS starting from neighbors of n1 (excluding n2).
  //       But that's getting complicated.
  //       
  //    Better approach:
  //    The "Ring" definition in Havannah is a loop around one or more cells.
  //    The "short" cycles (3, 4, 5) do not encircle anything in a hex grid (usually).
  //    (Triangle encircles nothing. Rhombus encircles nothing. Trapeze (5) encircles nothing?)
  //    Actually, a 3-cycle is a triangle.
  //    A 4-cycle is a rhombus.
  //    A 5-cycle is a "trapezoid" shape?
  //    None of these enclose a cell.
  //    The smallest ring enclosing a cell is 6.
  //    
  //    So, if we find a path, and it's "short", it's not a ring.
  //    But the existence of a short path doesn't disprove a long path (Ring).
  //    The problem is BFS finds the short one and stops.
  //    
  //    To force BFS to find the long one, we must block the short ones.
  //    Short paths go through "local" nodes.
  //    
  //    We should exclude:
  //    - n2 itself? No, we need to reach it.
  //    - Any node X such that dist(n1, X) + dist(X, n2) < 4?
  //    
  //    Let's simply exclude all common neighbors of n1 and n2 from the BFS?
  //    If n1 and n2 have a common neighbor X, path n1-X-n2 is len 2.
  //    If we exclude X, we force a longer path.
  //    
  //    What about len 3? n1-A-B-n2.
  //    If we exclude common neighbors, we handle len 2.
  //    
  //    What if n1 and n2 are neighbors (len 1)?
  //    We can't exclude "direct connection".
  //    BUT, if they are neighbors, we can treat them as "not connected" for the purpose of this search.
  //    We can start BFS from n1, but do NOT add n2 to the queue immediately.
  //    We only accept reaching n2 if the path length is >= 4.
  //    
  //    So:
  //    BFS Queue: [ [n1, [n1]] ]
  //    Visited: {n1, move, all_other_neighbors_of_move}
  //    
  //    When expanding curr:
  //      For each neighbor next:
  //        If next == n2:
  //           If path.length >= 4: return true.
  //           Else: Ignore this connection! (Do not return, do not add to queue, just continue).
  //        Else:
  //           Standard BFS.
  //           
  //    This works! If we see n2 via a short path, we just ignore it and keep searching for a longer way to n2.
  //    Wait, standard BFS visited set prevents re-visiting nodes.
  //    If we reach n2 via short path and ignore it, we haven't "visited" n2 in the sense of stopping.
  //    But we need to make sure we don't mark n2 as visited if we ignore it?
  //    Actually, we never add n2 to the queue if we ignore it. So n2 is not visited.
  //    
  //    But what about the nodes on the short path?
  //    If n1-X-n2 exists.
  //    We reach X. We see n2. Path len is 2 (too short). We ignore n2.
  //    We continue expanding X.
  //    Can we reach n2 another way?
  //    Maybe n1-Y-Z-n2.
  //    
  //    So the logic "If next == n2 and path short, ignore" seems correct.
  //    We just don't add n2 to visited or queue.
  //    
  //    One catch: What if the short path "blocks" the long path?
  //    In a planar graph, this can happen?
  //    If we mark X as visited, can X be part of the long ring?
  //    No, X is part of the short cycle.
  //    If X is part of the ring, then the ring is... X... n2 ... X ... ? No, simple cycle.
  //    
  //    So, the proposed algorithm:
  //    BFS from n1.
  //    Target: n2.
  //    Constraint: Path length >= 4.
  //    
  //    When we encounter n2:
  //      If path >= 4, Found!
  //      If path < 4, Ignore (don't add to queue, don't mark visited).
  //      
  //    Also, we must exclude 'move' and other neighbors of 'move' from the search space entirely.
  //    
  //    This seems robust enough for Havannah.

  const queue = [[start, 0]]; // current, distance
  const visited = new Set();

  // Mark excluded nodes as visited so we don't use them
  excluded.forEach(x => visited.add(x));
  visited.add(`${start[0]},${start[1]}`); // Start is visited

  while (queue.length > 0) {
    const [current, dist] = queue.shift();
    const neighbors = getNeighbours(dim, current);

    for (const neighbor of neighbors) {
      const [nr, nc] = neighbor;
      const nStr = `${nr},${nc}`;

      if (!isValid(nr, nc, dim) || board[nr][nc] !== playerNum) {
        continue;
      }

      if (nr === endR && nc === endC) {
        // Found connection to end
        if (dist + 1 >= 4) {
          return true;
        }
        // Else: Too short, ignore this connection.
        continue;
      }

      if (!visited.has(nStr)) {
        visited.add(nStr);
        queue.push([neighbor, dist + 1]);
      }
    }
  }
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

function runForkTest() {
  document.getElementById("sizeSelect").value = "4";
  document.getElementById("player2Type").value = "human";
  startGame();

  const moves = [
    [1, 0], // P1 (Left Edge)
    [3, 3], // P2
    [0, 1], // P1 (Top-Left Edge)
    [3, 2], // P2
    [2, 0], // P1 (Left Edge)
    [4, 2], // P2
    [4, 1], // P1 (Bottom-Left Edge)
    [4, 3], // P2
    [0, 0], // P1 (Corner connecting Left and Top-Left)
    [5, 3], // P2
    [3, 0]  // P1 (Corner connecting Left and Bottom-Left)
  ];

  let i = 0;
  function nextMove() {
    if (i >= moves.length) return;
    const [r, c] = moves[i];
    makeMove(r, c);
    i++;
    setTimeout(nextMove, 500);
  }
  nextMove();
}
