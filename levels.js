/**
 * Havannah Levels Configuration
 */

const LEVELS = [
    {
        id: 'tutorial_1',
        title: 'Tutorial: The Bridge',
        description: 'Connect any two corner cells to form a Bridge.',
        type: 'tutorial',
        boardSize: 4,
        player2: 'ai', // Easy AI
        winCondition: 'bridge',
        initialBoard: [] // Empty
    },
    {
        id: 'tutorial_2',
        title: 'Tutorial: The Fork',
        description: 'Connect three edges (not corners) to form a Fork.',
        type: 'tutorial',
        boardSize: 4,
        player2: 'ai',
        winCondition: 'fork',
        initialBoard: []
    },
    {
        id: 'puzzle_1',
        title: 'Puzzle: Mate in 1',
        description: 'Find the winning move for Yellow (Player 1).',
        type: 'puzzle',
        boardSize: 4,
        player2: 'none', // No opponent moves in puzzle mode usually, or restricted
        initialBoard: [
            // Format: [row, col, player]
            // Setting up a board where P1 has a winning move
            [0, 0, 1], [1, 0, 1], [2, 0, 1], // Left edge
            [0, 1, 1], [0, 2, 1], // Top-Left edge
            // Missing link at [0,0] is already there? No.
            // Let's make a fork setup.
            // Edges: Left (0,x), Top-Left (x,0), Top-Right (0, y)
            // P1 at Left Edge: (1,0), (2,0)
            // P1 at Top-Left Edge: (0,1), (0,2)
            // P1 at Top-Right Edge: (0,4), (0,5)
            // Winning move: (0,3) connecting Top-Left and Top-Right?
            // Let's try a simple Bridge puzzle.
            // Corners: (0,0) and (0,3)
            // P1 has path from (0,0) to near (0,3)
            [0, 0, 1], [0, 1, 1], [0, 2, 1], // Path from corner 0
            // Target: Corner (0,3)
            // Move at (0,3) wins?
        ]
    }
];

// Helper to load a level into the Game
function loadLevel(game, levelId) {
    const level = LEVELS.find(l => l.id === levelId);
    if (!level) return;

    // Reset Game
    game.layers = level.boardSize;
    game.renderer.resize(game.layers);
    game.board = game.createBoard(game.layers);
    game.currentPlayer = 0;
    game.gameOver = false;
    game.history = [];

    // Set Opponent
    if (level.player2 === 'ai') game.aiPlayer = new AIPlayer(2);
    else if (level.player2 === 'ai2') game.aiPlayer = new AIPlayer2(2);
    else game.aiPlayer = null;

    // Load Initial Board State
    if (level.initialBoard) {
        level.initialBoard.forEach(([r, c, p]) => {
            game.board[r][c] = p;
        });
    }

    game.renderer.drawBoard(game.board);
    game.updateUI();

    // Show Level Info
    game.showToast(`${level.title}: ${level.description}`);
}
