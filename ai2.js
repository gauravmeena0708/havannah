class AIPlayer2 extends BaseAI {
  constructor(playerNumber, simulations = 150) {
    super(playerNumber, playerNumber === 1 ? 2 : 1, simulations);
    this.moveCounter = 0;
    this.size = 0;
    this.criticalBlocks = []; // Initialize critical blocks as empty, will be populated in getMove if applicable
  }

  // Define the critical blocks based on the game board size
  getCriticalBlocks() {
    return [
      // [(0, 0), (0, 3), (1, 2)] block
      [
        [0, 0],
        [0, 3],
        [1, 2],
      ],
      // [(3, 0), (6, 3), (4, 2)] block
      [
        [3, 0],
        [6, 3],
        [4, 2],
      ],
      // [(6, 3), (3, 6), (4, 4)] block
      [
        [6, 3],
        [3, 6],
        [4, 4],
      ],
      // [(3, 6), (0, 6), (2, 5)] block
      [
        [3, 6],
        [0, 6],
        [2, 5],
      ],
      // [(0, 6), (0, 3), (1, 4)] block
      [
        [0, 6],
        [0, 3],
        [1, 4],
      ],
      // [(0, 0), (3, 0), (2, 1)] block
      [
        [0, 0],
        [3, 0],
        [2, 1],
      ],
    ];
  }

  // Check if opponent is about to complete a critical block
  checkOpponentCriticalBlocks(state) {
    for (const block of this.criticalBlocks) {
      let opponentCount = 0;
      let emptyCount = 0;
      let emptyAction = null;

      // Iterate through each block
      for (const [row, col] of block) {
        if (state[row][col] === this.opponentNumber) {
          opponentCount++;
        } else if (state[row][col] === 0) {
          emptyCount++;
          emptyAction = [row, col];
        }
      }

      // If the opponent has two pieces and there's one empty space left, block it
      if (opponentCount === 2 && emptyCount === 1) {
        return emptyAction; // Block this critical block
      }
    }

    return null; // No critical block to block
  }

  // Check if AI is about to complete a critical block
  checkCriticalBlocks(state) {
    for (const block of this.criticalBlocks) {
      let playerCount = 0;
      let emptyCount = 0;
      let emptyAction = null;

      // Iterate through each block
      for (const [row, col] of block) {
        if (state[row][col] === this.playerNumber) {
          playerCount++;
        } else if (state[row][col] === 0) {
          emptyCount++;
          emptyAction = [row, col];
        }
      }

      // If the AI has two pieces and there's one empty space left, complete this block
      if (playerCount === 2 && emptyCount === 1) {
        return emptyAction; // Complete this critical block
      }
    }

    return null; // No critical block to complete
  }

  getMove(state) {
    this.moveCounter++; // Increment move counter at the beginning

    if (this.moveCounter === 1) { // First move for this AI instance
      const currentLayers = (state.length + 1) / 2;
      this.size = currentLayers; // Set the size property
      if (currentLayers === 4) {
        this.criticalBlocks = this.getCriticalBlocks();
      } else {
        this.criticalBlocks = []; // Ensure it's empty for other sizes
      }
    }

    // console.log(state); // Optional: for debugging
    const validActions = this.getValidActions(state);

    // Check for immediate winning move for AI
    for (const action of validActions) {
      state[action[0]][action[1]] = this.playerNumber;
      const [win] = checkWin(state, action, this.playerNumber);
      state[action[0]][action[1]] = 0;
      if (win) {
        return action;
      }
    }

    // Check for immediate winning move for opponent
    for (const action of validActions) {
      state[action[0]][action[1]] = this.opponentNumber;
      const [win] = checkWin(state, action, this.opponentNumber);
      state[action[0]][action[1]] = 0;
      if (win) {
        return action;
      }
    }

    // **If AI is Player 2 (defensive strategy)**:
    // Block opponent's critical block before forming own.
    if (this.playerNumber === 2) {
      const blockOpponent = this.checkOpponentCriticalBlocks(state);
      if (blockOpponent) {
        return blockOpponent; // Block the opponent's critical block
      }
    }

    // **If AI is Player 1 or no critical block needs blocking**:
    // Try to form own critical block.
    const criticalMove = this.checkCriticalBlocks(state);
    if (criticalMove) {
      return criticalMove; // Form own critical block
    }

    // Evaluate moves using heuristics if no critical blocks found
    let bestActions = null;
    let bestScore = -Infinity;

    for (const action of validActions) {
      state[action[0]][action[1]] = this.playerNumber;
      const opponentMoves = this.getValidActions(state);
      const maxOpponentThreatScore = this.evaluateOpponentThreat(
        state,
        opponentMoves
      );
      let currentScore = this.assignHeuristicScore(state, action);
      if (this.moveCounter > 1) {
        currentScore += this.runMonteCarloSimulations(state, action);
      }
      currentScore -= maxOpponentThreatScore;
      state[action[0]][action[1]] = 0;

      if (currentScore > bestScore) {
        bestScore = currentScore;
        bestActions = [action];
      } else if (currentScore === bestScore) {
        bestActions.push(action);
      }
    }

    return bestActions[Math.floor(Math.random() * bestActions.length)];
  }
}
