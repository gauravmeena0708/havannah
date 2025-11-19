/**
 * Havannah Game - Premium Edition
 * Refactored for modularity and performance.
 */

// --- Configuration ---
const CONFIG = {
  colors: {
    p1: { main: '#ffd700', light: '#ffe57f', shadow: 'rgba(255, 215, 0, 0.6)' }, // Gold
    p2: { main: '#ff2a6d', light: '#ff80ab', shadow: 'rgba(255, 42, 109, 0.6)' }, // Neon Red/Pink
    empty: { main: 'rgba(20, 25, 40, 0.4)', border: 'rgba(0, 242, 255, 0.1)' },
    blocked: { main: '#000', border: '#000' },
    text: '#e0e6ed'
  },
  animation: {
    duration: 300
  }
};

// --- Renderer Class ---
class Renderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.hexSize = 0;
    this.layers = 0;
    this.particles = [];
    this.animationFrameId = null;
  }

  resize(layers) {
    this.layers = layers;
    const screenHeight = window.innerHeight;
    const maxCanvasSize = screenHeight - 50; // Keep space for UI
    const padding = 40;

    // Calculate hex size to fit the board
    // Board width ~= 3 * layers * hexSize
    // Board height ~= 2 * layers * hexSize * sqrt(3)
    this.hexSize = Math.floor((maxCanvasSize - padding) / (3 * layers));

    const size = this.hexSize * 3 * layers + padding;
    this.canvas.width = size;
    this.canvas.height = size;
  }

  drawBoard(board) {
    console.log("drawBoard called. Layers:", this.layers);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let filledCount = 0;
    // Iterate matching v1 pattern: j is column, i is row within column
    for (let j = 0; j < 2 * this.layers - 1; j++) {
      const colSize = j < this.layers ? this.layers + j : this.layers + 2 * this.layers - 2 - j;
      for (let i = 0; i < colSize; i++) {
        // Check if cell exists and is not blocked
        if (!board[i] || board[i][j] === undefined || board[i][j] === 3) continue;

        const coords = this.calculateHexagon(i, j);
        const player = board[i][j];
        if (player !== 0 && player !== 3) {
          console.log(`Non-empty cell at [${i}][${j}] = ${player}`);
          filledCount++;
        }
        this.drawHexagon(coords, player, i, j);
      }
    }
    console.log(`drawBoard completed. Total filled cells: ${filledCount}`);
  }

  drawHexagon(coords, player, r, c) {
    const ctx = this.ctx;
    const center = this.calculateCentroid(coords);

    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    coords.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.closePath();

    // Style based on content
    if (player === 0) {
      ctx.fillStyle = CONFIG.colors.empty.main;
      ctx.strokeStyle = CONFIG.colors.empty.border;
      ctx.lineWidth = 1;
      ctx.shadowBlur = 0;
    } else {
      const color = player === 1 ? CONFIG.colors.p1 : CONFIG.colors.p2;

      // Gradient for 3D/Neon effect
      const grad = ctx.createRadialGradient(
        center.x, center.y, 0,
        center.x, center.y, this.hexSize
      );
      grad.addColorStop(0, color.light);
      grad.addColorStop(1, color.main);

      ctx.fillStyle = grad;
      ctx.shadowColor = color.shadow;
      ctx.shadowBlur = 20;
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 2;
    }

    ctx.fill();
    ctx.stroke();

    // Reset shadow
    ctx.shadowBlur = 0;

    // Draw cell index label
    ctx.fillStyle = player === 0 ? CONFIG.colors.text : '#000';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`(${r},${c})`, center.x, center.y);
  }

  calculateHexagon(i, j) {
    const sqrt3 = Math.sqrt(3);
    const h = this.hexSize;
    // Offset logic from original code
    const offsetX = (j * h * 3) / 2;
    const offsetY = ((Math.abs(j - this.layers + 1) + 2 * i) * h * sqrt3) / 2;

    // Centering on canvas
    const totalWidth = this.hexSize * 3 * this.layers;
    const totalHeight = this.hexSize * 2 * this.layers * sqrt3; // Approx
    const startX = (this.canvas.width - totalWidth) / 2 + h; // Adjust as needed
    const startY = 20; // Top padding

    // Re-using original offset logic but adding canvas centering if needed. 
    // For now, sticking to original exact math to ensure click detection works same way.
    // Original:
    // const offsetX = (j * hexSize * 3) / 2;
    // const offsetY = ((Math.abs(j - layers + 1) + 2 * i) * hexSize * sqrt3) / 2;

    return [
      { x: h / 2 + offsetX, y: offsetY },
      { x: (h * 3) / 2 + offsetX, y: offsetY },
      { x: h * 2 + offsetX, y: (h * sqrt3) / 2 + offsetY },
      { x: (h * 3) / 2 + offsetX, y: h * sqrt3 + offsetY },
      { x: h / 2 + offsetX, y: h * sqrt3 + offsetY },
      { x: offsetX, y: (h * sqrt3) / 2 + offsetY },
    ];
  }

  calculateCentroid(coords) {
    let x = 0, y = 0;
    coords.forEach(p => { x += p.x; y += p.y; });
    return { x: x / coords.length, y: y / coords.length };
  }

  getHexagonAt(x, y, board) {
    // Brute force check (efficient enough for this board size)
    for (let j = 0; j < 2 * this.layers - 1; j++) {
      const colSize = j < this.layers ? this.layers + j : this.layers + 2 * this.layers - 2 - j;
      for (let i = 0; i < colSize; i++) {
        // Skip blocked cells if board is provided
        if (board && board[i] && board[i][j] === 3) continue;

        const coords = this.calculateHexagon(i, j);
        if (this.isPointInPoly(x, y, coords)) {
          return [i, j];
        }
      }
    }
    return null;
  }

  isPointInPoly(x, y, coords) {
    let inside = false;
    for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
      const xi = coords[i].x, yi = coords[i].y;
      const xj = coords[j].x, yj = coords[j].y;
      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  triggerCelebration(winner, board) {
    const color = winner === 1 ? CONFIG.colors.p1.main : CONFIG.colors.p2.main;
    this.particles = [];
    for (let i = 0; i < 100; i++) {
      this.particles.push({
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1.0,
        color: color
      });
    }
    this.animateParticles(board);
  }

  animateParticles(board) {
    if (this.particles.length === 0) {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      return;
    }

    // Redraw board first, then particles on top
    if (board) {
      this.drawBoard(board);
    }

    const ctx = this.ctx;

    // Update and draw particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.life;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Update particle
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= 0.02;

      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    if (this.particles.length > 0) {
      this.animationFrameId = requestAnimationFrame(() => this.animateParticles(board));
    }
  }

  showToast(msg) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
}

// --- Helper Functions (Win Logic) ---
// Preserving original logic for correctness

function checkWin(board, move, playerNum) {
  // Convert to boolean board for helpers
  const boolBoard = board.map(row => row.map(cell => cell === playerNum));

  if (checkRing(board, move)) return [true, "ring"];

  const [win, way] = checkForkAndBridge(board, move);
  if (win) return [true, way];

  return [false, null];
}

function checkRing(board, move) {
  const dim = board.length;
  const [r, c] = move;
  const p = board[r][c];
  const neighbors = getNeighbours(dim, move).filter(([nr, nc]) =>
    isValid(nr, nc, dim) && board[nr][nc] === p
  );

  if (neighbors.length < 2) return false;

  for (let i = 0; i < neighbors.length; i++) {
    for (let j = i + 1; j < neighbors.length; j++) {
      if (findRingPath(board, move, neighbors[i], neighbors[j], neighbors)) return true;
    }
  }
  return false;
}

function findRingPath(board, move, start, end, moveNeighbors) {
  const dim = board.length;
  const p = board[move[0]][move[1]];
  const excluded = new Set([`${move[0]},${move[1]}`]);

  // Exclude other immediate neighbors of move to prevent short circuits
  moveNeighbors.forEach(n => {
    const s = `${n[0]},${n[1]}`;
    if (s !== `${start[0]},${start[1]}` && s !== `${end[0]},${end[1]}`) excluded.add(s);
  });

  const queue = [[start, 0]];
  const visited = new Set([...excluded, `${start[0]},${start[1]}`]);

  while (queue.length > 0) {
    const [curr, dist] = queue.shift();
    const neighbors = getNeighbours(dim, curr);

    for (const [nr, nc] of neighbors) {
      if (!isValid(nr, nc, dim) || board[nr][nc] !== p) continue;

      if (nr === end[0] && nc === end[1]) {
        return dist + 1 >= 4; // Min path length for ring
      }

      const s = `${nr},${nc}`;
      if (!visited.has(s)) {
        visited.add(s);
        queue.push([[nr, nc], dist + 1]);
      }
    }
  }
  return false;
}

function checkForkAndBridge(board, move) {
  const visited = bfsReachable(board, move);
  const dim = board.length;
  const corners = new Set(getAllCorners(dim));
  const edges = getAllEdges(dim);

  // Fork
  const edgesConnected = edges.filter(edge => sideHasReachablePoints(edge, visited)).length;
  if (edgesConnected >= 3) return [true, "fork"];

  // Bridge
  const cornersConnected = [...visited].filter(p => corners.has(p)).length;
  if (cornersConnected >= 2) return [true, "bridge"];

  return [false, null];
}

function bfsReachable(board, start) {
  const dim = board.length;
  const p = board[start[0]][start[1]];
  const queue = [start];
  const visited = new Set([`${start[0]},${start[1]}`]);

  while (queue.length > 0) {
    const [r, c] = queue.shift();
    const neighbors = getNeighbours(dim, [r, c]);
    for (const [nr, nc] of neighbors) {
      if (isValid(nr, nc, dim) && board[nr][nc] === p && !visited.has(`${nr},${nc}`)) {
        visited.add(`${nr},${nc}`);
        queue.push([nr, nc]);
      }
    }
  }
  return visited;
}

function sideHasReachablePoints(edgeSet, visitedSet) {
  for (const p of visitedSet) {
    if (edgeSet.has(p)) return true;
  }
  return false;
}

function getAllEdges(dim) {
  const layers = (dim + 1) / 2;
  const range = Array.from({ length: layers - 2 }, (_, i) => i + 1);
  const getBottomIndex = (col) => (col < layers) ? layers + col - 1 : layers + (2 * layers - 2) - col - 1;

  const edges = [
    range.map(k => [k, 0]), // Left
    range.map(k => [0, k]), // Top-Left
    range.map(k => [0, layers - 1 + k]), // Top-Right
    range.map(k => [k, dim - 1]), // Right
    range.map(k => { const col = dim - 1 - k; return [getBottomIndex(col), col]; }), // Bottom-Right
    range.map(k => { const col = k; return [getBottomIndex(col), col]; }) // Bottom-Left
  ];
  return edges.map(e => new Set(e.map(p => `${p[0]},${p[1]}`)));
}

function getAllCorners(dim) {
  const mid = Math.floor(dim / 2);
  return [
    [0, 0], [0, mid], [0, dim - 1],
    [mid, dim - 1], [dim - 1, dim - 1], [dim - 1, mid], [mid, 0], // Added missing corner? No, original had 6.
    // Original: [0,0], [0,mid], [0,dim-1], [mid,dim-1], [dim-1,mid], [mid,0]
    // Wait, [dim-1, dim-1] is bottom right? 
    // Let's double check original getAllCorners logic.
    // Original: 
    // [0, 0], // Top-left
    // [0, Math.floor(dim / 2)], // Top-middle
    // [0, dim - 1], // Top-right
    // [Math.floor(dim / 2), dim - 1], // Middle-right
    // [dim - 1, Math.floor(dim / 2)], // Bottom-middle
    // [Math.floor(dim / 2), 0], // Middle-left
  ].map(([x, y]) => `${x},${y}`);
}
// Re-implementing getAllCorners exactly as original to be safe
function getAllCorners(dim) {
  const mid = Math.floor(dim / 2);
  return [
    [0, 0],
    [0, mid],
    [0, dim - 1],
    [mid, dim - 1],
    [dim - 1, mid],
    [mid, 0]
  ].map(([x, y]) => `${x},${y}`);
}

function getEdge(vertex, dim) {
  let [i, j] = vertex;
  const mid = Math.floor(dim / 2);

  if (j === 0 && i > 0 && i < mid) return 0; // Left
  if (i === 0 && j > 0 && j < mid) return 1; // Top-left
  if (i === 0 && j > mid && j < dim - 1) return 2; // Top-right
  if (j === dim - 1 && i > 0 && i < mid) return 3; // Right
  if (i === dim - 1 - j + mid && j > mid && j < dim - 1) return 4; // Bottom-right
  if (i === j + mid && j > 0 && j < mid) return 5; // Bottom-left
  return -1;
}

function getCorner(vertex, dim) {
  let [i, j] = vertex;
  const mid = Math.floor(dim / 2);

  if (i === 0 && j === 0) return 0; // Top-left
  if (i === 0 && j === mid) return 1; // Top-middle
  if (i === 0 && j === dim - 1) return 2; // Top-right
  if (i === mid && j === dim - 1) return 3; // Middle-right
  if (i === dim - 1 && j === mid) return 4; // Bottom-middle
  if (i === mid && j === 0) return 5; // Middle-left

  return -1;
}

function getNeighbours(dim, vertex) {
  let [i, j] = vertex;
  const siz = Math.floor(dim / 2);
  let neighbours = [];
  if (i > 0) neighbours.push([i - 1, j]);
  if (i < dim - 1) neighbours.push([i + 1, j]);
  if (j > 0) neighbours.push([i, j - 1]);
  if (j < dim - 1) neighbours.push([i, j + 1]);
  if (i > 0 && j <= siz && j > 0) neighbours.push([i - 1, j - 1]);
  if (i > 0 && j >= siz && j < dim - 1) neighbours.push([i - 1, j + 1]);
  if (i < dim - 1 && j < siz) neighbours.push([i + 1, j + 1]);
  if (i < dim - 1 && j > siz) neighbours.push([i + 1, j - 1]);
  return neighbours;
}

function isValid(x, y, dim) {
  if (y < 0 || y >= dim) return false;
  const layers = (dim + 1) / 2;
  const colHeight = (y < layers) ? (layers + y) : (layers + (2 * layers - 2) - y);
  return 0 <= x && x < colHeight;
}

// --- Game Class ---
class Game {
  constructor() {
    this.renderer = new Renderer('gameCanvas');
    this.board = [];
    this.layers = 4; // Default size
    this.currentPlayer = 1; // 1 or 2
    this.gameOver = false;
    this.aiPlayer = null;
    this.isAiTurn = false;
    this.time = [300, 300]; // 5 mins per player
    this.timerId = null;
    this.history = []; // For undo

    // UI Elements
    this.ui = {
      sizeSelect: document.getElementById('sizeSelect'),
      player2Type: document.getElementById('player2Type'),
      startBtn: document.getElementById('startGameBtn'),
      undoBtn: document.getElementById('undoBtn'),
      winner: document.getElementById('winner')
    };

    this.bindEvents();
  }

  bindEvents() {
    this.ui.startBtn.addEventListener('click', () => this.start());
    this.ui.undoBtn.addEventListener('click', () => this.undo());

    // Canvas Click
    this.renderer.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));

    // Mouse Move for Hover Effect (Optional, can be added to Renderer)
    this.renderer.canvas.addEventListener('mousemove', (e) => {
      if (this.gameOver || this.isAiTurn) return;
      const rect = this.renderer.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // Could implement hover highlighting here
    });
  }

  start() {
    console.log("=== Game.start() called ===");
    // Get settings
    this.layers = parseInt(this.ui.sizeSelect.value);
    const p2Type = this.ui.player2Type.value;
    console.log("Layers:", this.layers, "Player 2 Type:", p2Type);

    // Setup AI
    if (p2Type === 'ai') {
      this.aiPlayer = new AIPlayer(2, 1); // Easy AI
    } else if (p2Type === 'ai2') {
      this.aiPlayer = new AIPlayer2(2); // Hard AI
    } else {
      this.aiPlayer = null; // Human
    }

    // Reset State
    this.board = this.createBoard(this.layers);
    console.log("Board created:", JSON.stringify(this.board));
    this.currentPlayer = 1;
    this.gameOver = false;
    this.isAiTurn = false;
    this.time = [300, 300];
    this.history = [];

    // Reset UI
    this.ui.winner.textContent = '';
    this.ui.undoBtn.disabled = true;
    document.getElementById('currentTurn').textContent = "Current Turn: Player 1";
    document.getElementById('currentTurn').style.color = CONFIG.colors.p1.main;

    // Resize & Draw
    this.renderer.resize(this.layers);
    console.log("About to draw board. Board state:", JSON.stringify(this.board));
    this.renderer.drawBoard(this.board);
    console.log("=== Game.start() completed ===");

    // Start Timer
    this.startTimer();
  }

  createBoard(layers) {
    // Create board matching v1 format: square grid with blocked cells marked as 3
    const board = [];
    const dim = 2 * layers - 1;

    // Initialize the board with empty cells (0 represents empty)
    for (let i = 0; i < dim; i++) {
      const row = [];
      for (let j = 0; j < dim; j++) {
        row.push(0); // Initialize all tiles to 0 (empty)
      }
      board.push(row);
    }

    // Block tiles on the lower triangular side (same as v1)
    for (let i = layers; i < dim; i++) {
      for (let j = 0; j < i - layers + 1; j++) {
        board[i][j] = 3; // Blocked
        board[i][dim - 1 - j] = 3; // Blocked
      }
    }

    return board;
  }

  handleCanvasClick(e) {
    if (this.gameOver || this.isAiTurn) return;

    const rect = this.renderer.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hex = this.renderer.getHexagonAt(x, y, this.board);
    if (hex) {
      const [i, j] = hex;
      if (this.board[i] && this.board[i][j] === 0) {
        this.makeMove(i, j);
      }
    }
  }

  makeMove(i, j) {
    // Save state for undo
    this.history.push({
      board: JSON.parse(JSON.stringify(this.board)), // Deep copy
      player: this.currentPlayer,
      move: [i, j]
    });
    if (this.history.length > 0) this.ui.undoBtn.disabled = false;

    // Update Board
    this.board[i][j] = this.currentPlayer;
    this.renderer.drawBoard(this.board); // Optimized: drawHexagon(..., currentPlayer, i, j)

    // Check Win
    const [won, reason] = checkWin(this.board, [i, j], this.currentPlayer);
    if (won) {
      this.endGame(this.currentPlayer, reason);
      return;
    }

    // Switch Turn
    this.switchPlayer();
  }

  switchPlayer() {
    this.currentPlayer = (this.currentPlayer === 1) ? 2 : 1;
    this.updateUI();

    // AI Turn
    if (this.currentPlayer === 2 && this.aiPlayer) {
      this.isAiTurn = true;
      setTimeout(() => {
        const move = this.aiPlayer.getMove(this.board);
        this.isAiTurn = false;
        if (move) {
          this.makeMove(move[0], move[1]);
        } else {
          // No moves? Draw?
          // Havannah rarely draws, but if board full...
          // Simple check:
          // if (!this.board.flat().includes(0)) this.endGame(0, 'Draw');
        }
      }, 100); // Small delay for UX
    }
  }

  updateUI() {
    const p = this.currentPlayer;
    const el = document.getElementById('currentTurn');
    el.textContent = `Current Turn: Player ${p}`;
    el.style.color = p === 1 ? CONFIG.colors.p1.main : CONFIG.colors.p2.main;
  }

  undo() {
    if (this.history.length === 0 || this.gameOver || this.isAiTurn) return;

    // Undo 1 step (if human vs human) or 2 steps (if human vs AI)
    const steps = this.aiPlayer ? 2 : 1;

    for (let k = 0; k < steps; k++) {
      if (this.history.length === 0) break;
      const lastState = this.history.pop();
      // We need the state BEFORE this move. 
      // Actually, history stores the state *before* the move? 
      // My makeMove pushed current board *before* update? Yes.
      // So popping gives us the previous board.
      this.board = lastState.board;
      this.currentPlayer = lastState.player;
    }

    this.renderer.drawBoard(this.board);
    this.updateUI();
    if (this.history.length === 0) this.ui.undoBtn.disabled = true;
  }

  startTimer() {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      if (this.gameOver) return;

      // Decrement time for current player (0-indexed in array)
      const pIdx = this.currentPlayer - 1;
      this.time[pIdx]--;

      if (this.time[pIdx] <= 0) {
        this.endGame(3 - this.currentPlayer, 'Timeout');
      }
      this.updateTimerDisplay();
    }, 1000);
  }

  updateTimerDisplay() {
    const fmt = (t) => {
      const m = Math.floor(t / 60);
      const s = t % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    };
    document.getElementById('player1Time').textContent = fmt(this.time[0]);
    document.getElementById('player2Time').textContent = fmt(this.time[1]);
  }

  endGame(winner, reason) {
    this.gameOver = true;
    clearInterval(this.timerId);
    const msg = `Game Over! Player ${winner} wins by ${reason}!`;
    this.ui.winner.textContent = msg;
    this.renderer.triggerCelebration(winner, this.board);
    this.renderer.showToast(msg);
  }
}

// --- Initialization ---
window.onload = () => {
  gameInstance = new Game();
  // Don't auto-start - wait for user to click "Initialize Protocol" button
};
