# Havannah-like Hexagonal Game

This is a web-based implementation of a game similar to Havannah, played on a hexagonal grid. The objective is to form one of three winning structures:

*   **Bridge**: Connect any two corner cells of the board.
*   **Fork**: Connect any three non-adjacent edges of the board.
*   **Ring**: Form a closed loop of your pieces around at least one empty cell or opponent's piece.

The board size can be selected before starting the game. Players take turns placing their pieces on empty cells.

## How to Play

1.  Clone or download the repository.
2.  Open the `index.html` file in a modern web browser.
3.  Select the desired board size from the dropdown menu.
4.  Select Player 2 type (Human, AI, or AI2).
5.  Click the "Start Game" button.
6.  Players take turns clicking on empty cells to place their pieces.

## How to Run Tests

The game includes a suite of JavaScript unit tests to verify core game logic. To run these tests:

1.  Open the `index.html` file in a web browser.
2.  Open the browser's Developer Console.
    *   In most browsers (Chrome, Firefox, Edge), you can do this by right-clicking anywhere on the page and selecting "Inspect" or "Inspect Element", then navigating to the "Console" tab. Alternatively, you can use keyboard shortcuts like `Ctrl+Shift+J` (Windows/Linux) or `Cmd+Option+J` (Mac) for Chrome, or `Ctrl+Shift+K` (Windows/Linux) or `Cmd+Option+K` (Mac) for Firefox.
3.  In the console, type the following command and press Enter:
    ```javascript
    runAllTests()
    ```
4.  The test results will be logged in the console. Look for messages like "Assertion Passed" or "Assertion Failed". At the end, "All tests finished." should appear.

## Game Features

*   Variable board size.
*   Player vs Player, Player vs AI, and Player vs AI2 modes.
*   Timer for each player.
*   Win detection for Bridge, Fork, and Ring conditions.
*   Visual feedback for game state and winning moves.
