/** Common functionality for use in tests */

/** Simple function to generate hexadecimal MD5 hashes from strings */

/**
 * Creates a mock game object for use in testing the Game component
 * Takes in four parameters:
 * - boardState: the result of creating a board using createBoardState()
 * - gameState: 0, 1, 2 or 3 representing game state (defaults to 0)
 * - numPlayers: the number of players to emulate added to game (defaults to 0)
 * - currPlayerName: the string name for the current players (defaults to 'foo')
 * Returns a mock 'game' object which can be passed into the Game component
 */
function createMockGame(
    boardState,
    gameState=0,
    numPlayers=0,
    currPlayerName='foo'
  ) {

  // create players for use in getting players.length
  let players = [];
  let curIndex = 0;
  while (curIndex < numPlayers) {
    players.push('');
    curIndex++;
  }

  // create mock game
  let game = {
    gameState: gameState,
    board: boardState,
    players: players,
    currPlayer: { name: currPlayerName }
  }

  return game;
}

/**
 * Creates a mock board state for using in testing the GameBoard component
 * Takes in two parameters:
 * - height: the height of the game board (defaults to 3)
 * - width: the width of the game board (defaults to 3)
 */
function createBoardState(height=3, width=3) {
  let boardState = [];
  let curRow = 0;
  while (curRow < height) {
    let row = [];
    let curCol = 0;
    while (curCol < width) {
      row.push(
        {
          player: null
        }
      )
      curCol++;
    }
    boardState.push(row);
    curRow++;
  }
  return boardState;
}

/**
 * Sets the state of a given cell in a mock game board
 * Takes in give parameters:
 * - board: the game board to set cell state in
 * - y, x: the y and x coordinates of the cell
 * - player: an ID to set as the player for that cell
 * - highlight: if set to true, sets the cell as highlighted
 * */
function setCellState(board, y, x, player, highlight) {
  if (player !== undefined) {
    board[y][x].player = player;
  }
  if (highlight) {
    board[y][x].highlight = true;
  }
}

export { createMockGame, createBoardState, setCellState };