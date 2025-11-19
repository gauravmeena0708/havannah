class AIPlayer extends BaseAI {
  constructor(playerNumber, simulations = 150) {
    super(playerNumber, playerNumber === 1 ? 2 : 1, simulations);
    this.moveCounter = 0;
    this.size = 0;
  }

  getMove(state) {
    if (this.moveCounter === 0) {
      this.size = (state.length + 1) / 2;
    }
    this.moveCounter++;

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

    // Evaluate moves using heuristics
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
