
// Mocking global variables
let layers = 4;
let hexSize = 30; // Arbitrary

// Copied functions from script.js (stripped of DOM)

function isValid(x, y, dim) {
  if (y < 0 || y >= dim) {
    return false;
  }
  const colHeight = (y < layers) ? (layers + y) : (layers + (2 * layers - 2) - y);
  return 0 <= x && x < colHeight;
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

function bfsReachable(board, start) {
  const dim = board.length;
  const playerNum = board[start[0]][start[1]];
  const queue = [start];
  const visited = new Set([`${start[0]},${start[1]}`]);

  while (queue.length > 0) {
    const [x, y] = queue.shift();
    const neighbors = getNeighbours(dim, [x, y]);

    for (const [nx, ny] of neighbors) {
      if (
        isValid(nx, ny, dim) &&
        !visited.has(`${nx},${ny}`) &&
        board[nx][ny] !== 3 &&
        board[nx][ny] === playerNum
      ) {
        queue.push([nx, ny]);
        visited.add(`${nx},${ny}`);
      }
    }
  }

  return visited;
}

function getAllEdges(dim) {
  const layers = (dim + 1) / 2;
  const range = Array.from({ length: layers - 2 }, (_, i) => i + 1);

  // Helper to get bottom index of a column
  const getBottomIndex = (col) => {
    if (col < layers) return layers + col - 1;
    return layers + (2 * layers - 2) - col - 1;
  };

  const edges = [
    // Left Edge (Col 0): (k, 0)
    range.map(k => [k, 0]),

    // Top-Left Edge (Top of Cols 1..layers-2): (0, k)
    range.map(k => [0, k]),

    // Top-Right Edge (Top of Cols layers..dim-2): (0, layers - 1 + k)
    range.map(k => [0, layers - 1 + k]),

    // Right Edge (Col dim-1): (k, dim-1)
    range.map(k => [k, dim - 1]),

    // Bottom-Right Edge (Bottom of Cols dim-2..layers): (bottom, layers - 1 + k) ? 
    // No, we need cols dim-2 down to layers.
    // Cols: 5, 4. (for layers=4)
    // k=1 -> Col 5. k=2 -> Col 4.
    // Formula: dim - 1 - k.
    range.map(k => {
      const col = dim - 1 - k;
      return [getBottomIndex(col), col];
    }),

    // Bottom-Left Edge (Bottom of Cols layers-2..1):
    // Cols: 2, 1. (for layers=4)
    // k=1 -> Col 2. k=2 -> Col 1.
    // Formula: layers - 1 - k ? 
    // k=1 -> 3-1=2. k=2 -> 3-2=1.
    // But range is 1..layers-2.
    // Let's use the range directly or map it.
    // We want cols: layers-1-1, layers-1-2...
    range.map(k => {
      const col = layers - 1 + k; // Wait. 
      // We want cols 2 and 1.
      // If we use range k=1,2.
      // We can iterate cols 1..layers-2 and take bottom?
      // That would be Bottom-Left.
      // Let's just map k to col.
      // k=1 -> Col 1? No, order doesn't matter for Set.
      // So just cols 1 to layers-2.
      const c = k;
      return [getBottomIndex(c), c];
    })
  ];

  // Fix Bottom-Right mapping:
  // We want cols dim-2 down to layers.
  // range k=1..layers-2.
  // k=1 -> dim-2. k=2 -> dim-3.
  // So col = dim - 1 - k.

  // Fix Bottom-Left mapping:
  // We want cols 1 to layers-2.
  // range k=1..layers-2.
  // col = k.

  // Let's re-verify Bottom-Left with k=1 (Col 1).
  // Bottom of Col 1 is (4,1).
  // My manual check said Bottom-Left Edge is (5,2) and (4,1).
  // Col 2 bottom (5,2). Col 1 bottom (4,1).
  // So cols 1 and 2.
  // range k=1,2. col=k -> 1,2. Correct.

  return edges.map((edge) => new Set(edge.map((e) => `${e[0]},${e[1]}`)));
}

function sideHasReachablePoints(side, visited) {
  for (const point of visited) {
    if (side.has(point)) return true;
  }
  return false;
}

function checkFork(board, move) {
  const visited = bfsReachable(board, move);
  const edges = getAllEdges(board.length);

  const reachableEdges = edges.filter((edge) =>
    sideHasReachablePoints(edge, visited)
  );

  return reachableEdges.length >= 3;
}

function checkRing(board, move) {
  const dim = board.length;
  const [moveR, moveC] = move;

  const allNeighbors = getNeighbours(dim, move);
  const playerNeighbors = allNeighbors.filter(([nr, nc]) => {
    return isValid(nr, nc, dim) && board[nr][nc];
  });

  if (playerNeighbors.length < 2) {
    return false;
  }

  for (let i = 0; i < playerNeighbors.length; i++) {
    for (let j = i + 1; j < playerNeighbors.length; j++) {
      const n1 = playerNeighbors[i];
      const n2 = playerNeighbors[j];
      const [n1r, n1c] = n1;
      const [n2r, n2c] = n2;

      const queue = [[n1, [n1]]];
      const visitedInBFS = new Set();
      visitedInBFS.add(`${moveR},${moveC}`);
      visitedInBFS.add(`${n1r},${n1c}`);

      while (queue.length > 0) {
        const [currentCell, currentPath] = queue.shift();
        const [cr, cc] = currentCell;

        if (cr === n2r && cc === n2c) {
          if (currentPath.length + 1 >= 6) {
            return true;
          }
          break; // BUG: Stops at first path found!
        }

        const neighborsOfCurrent = getNeighbours(dim, currentCell);
        for (const neighbor of neighborsOfCurrent) {
          const [nr, nc] = neighbor;
          const neighborStr = `${nr},${nc}`;

          if (
            isValid(nr, nc, dim) &&
            board[nr][nc] &&
            !visitedInBFS.has(neighborStr)
          ) {
            visitedInBFS.add(neighborStr);
            const newPath = [...currentPath, neighbor];
            queue.push([neighbor, newPath]);
          }
        }
      }
    }
  }

  return false;
}

// --- Tests ---

function createBoard(dim) {
  const board = [];
  for (let i = 0; i < dim; i++) {
    const row = [];
    for (let j = 0; j < dim; j++) {
      row.push(0);
    }
    board.push(row);
  }
  return board;
}

function testGetAllEdges() {
  console.log("Testing getAllEdges...");
  const dim = 7; // layers=4
  const edges = getAllEdges(dim);

  // Expected edges for layers=4
  // TL: (0,1), (0,2)
  // TR: (0,4), (0,5)
  // R: (1,6), (2,6)
  // BR: (4,5), (5,4)
  // BL: (5,2), (4,1)
  // L: (2,0), (1,0)

  const expectedEdges = [
    new Set(["0,1", "0,2"]), // TL
    new Set(["0,4", "0,5"]), // TR
    new Set(["1,6", "2,6"]), // R
    new Set(["4,5", "5,4"]), // BR
    new Set(["5,2", "4,1"]), // BL
    new Set(["2,0", "1,0"])  // L
  ];

  let bugFound = false;

  edges.forEach((edgeSet, index) => {
    console.log(`Edge ${index}:`, [...edgeSet]);
    // Check if it matches any expected edge
    const match = expectedEdges.some(expected => {
      if (expected.size !== edgeSet.size) return false;
      for (let elem of expected) {
        if (!edgeSet.has(elem)) return false;
      }
      return true;
    });

    if (!match) {
      console.log(`Edge ${index} does NOT match any expected edge set.`);
      bugFound = true;
    } else {
      console.log(`Edge ${index} matches an expected edge set.`);
    }
  });

  if (bugFound) {
    console.log("BUG CONFIRMED: getAllEdges returns incorrect cells.");
  } else {
    console.log("getAllEdges seems correct.");
  }
}

testGetAllEdges();
