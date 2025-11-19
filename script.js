/**
 * Havannah Game - Premium Edition
 * Refactored for modularity and performance.
 */

// --- Configuration ---
const CONFIG = {
  colors: {
    p1: { main: '#ffd700', light: '#ffeb3b', shadow: 'rgba(255, 215, 0, 0.5)' }, // Gold
    p2: { main: '#ff4444', light: '#ff8a80', shadow: 'rgba(255, 68, 68, 0.5)' }, // Red
    empty: { main: '#1a1a24', border: '#333' },
    blocked: { main: '#000', border: '#000' },
    text: '#666'
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
    const maxCanvasSize = screenHeight - 100; // Keep space for UI
    const padding = 20;

    // Calculate hex size to fit the board
    // Board width ~= 3 * layers * hexSize
    // Board height ~= 2 * layers * hexSize * sqrt(3)
    this.hexSize = Math.floor((maxCanvasSize - padding) / (3 * layers));

    const size = this.hexSize * 3 * layers + padding;
    this.canvas.width = size;
    this.canvas.height = size;
  }

  drawBoard(board) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let j = 0; j < 2 * this.layers - 1; j++) {
      const colSize = j < this.layers ? this.layers + j : this.layers + 2 * this.layers - 2 - j;
      for (let i = 0; i < colSize; i++) {
        if (board[i][j] === 3) continue; // Skip blocked

        const coords = this.calculateHexagon(i, j);
        const player = board[i][j];
        this.drawHexagon(coords, player, i, j);
      }
    }
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
    } else {
      const color = player === 1 ? CONFIG.colors.p1 : CONFIG.colors.p2;

      // Gradient for 3D effect
      const grad = ctx.createRadialGradient(
        center.x - this.hexSize / 3, center.y - this.hexSize / 3, this.hexSize / 10,
        center.x, center.y, this.hexSize
      );
      grad.addColorStop(0, color.light);
      grad.addColorStop(1, color.main);

      ctx.fillStyle = grad;
      ctx.shadowColor = color.shadow;
      ctx.shadowBlur = 15;
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 2;
    }

    ctx.fill();
    ctx.stroke();

    // Reset shadow
    ctx.shadowBlur = 0;

    // Debug coordinates (optional, can be toggled)
    // ctx.fillStyle = CONFIG.colors.text;
    // ctx.font = '10px Arial';
    // ctx.textAlign = 'center';
    // ctx.textBaseline = 'middle';
    // ctx.fillText(`${r},${c}`, center.x, center.y);
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

  getHexagonAt(x, y) {
    // Brute force check (efficient enough for this board size)
    for (let j = 0; j < 2 * this.layers - 1; j++) {
      const colSize = j < this.layers ? this.layers + j : this.layers + 2 * this.layers - 2 - j;
      for (let i = 0; i < colSize; i++) {
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

  triggerCelebration(winner) {
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
    this.animateParticles();
  }

  animateParticles() {
    if (this.particles.length === 0) return;

    // We need to redraw board + particles. 
    // Ideally Game loop handles this, but for now we do it here.
    // NOTE: This requires access to board state. 
    // For simplicity, we'll just draw particles on top without clearing if possible, 
    // OR we need to ask Game to redraw.
    // Let's just animate particles on top of existing canvas for now (might leave trails).
    // Better: Request Game to redraw.

    // ... Implementation deferred to keep simple. 
    // We will implement a basic loop in Game class instead.
    // If AI is thinking, prevent undo?
    if (this.isAiTurn) return;

    const steps = this.aiPlayer ? 2 : 1;

    for (let i = 0; i < steps; i++) {
      if (this.history.length === 0) break;
      const last = this.history.pop();
      this.board = last.prevBoard;
      this.currentPlayer = last.player; // Restore player
    }

    this.renderer.drawBoard(this.board);
    this.updateUI();
    if (this.history.length === 0) document.getElementById('undoBtn').disabled = true;
  }

  switchPlayer() {
    this.currentPlayer = 1 - this.currentPlayer;
    this.updateUI();

    if (this.currentPlayer === 1 && this.aiPlayer) {
      this.isAiTurn = true;
      setTimeout(() => {
        const move = this.aiPlayer.getMove(this.board);
        this.isAiTurn = false;
        if (move) this.makeMove(move[0], move[1]);
      }, 500);
    }
  }

  updateUI() {
    const p = this.currentPlayer + 1;
    const el = document.getElementById('currentTurn');
    el.textContent = `Current Turn: Player ${p}`;
    el.style.color = p === 1 ? CONFIG.colors.p1.main : CONFIG.colors.p2.main;
  }

  startTimer() {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = setInterval(() => {
      if (this.gameOver) return;
      this.time[this.currentPlayer]--;
      if (this.time[this.currentPlayer] <= 0) {
        this.endGame(3 - (this.currentPlayer + 1), 'timeout'); // Opponent wins
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
    document.getElementById('winner').textContent = msg;
    this.renderer.triggerCelebration(winner);

    // Show Toast
    this.showToast(msg);
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

// --- Initialization ---
window.onload = () => {
  gameInstance = new Game();
  // Start default game
  gameInstance.start();
};
