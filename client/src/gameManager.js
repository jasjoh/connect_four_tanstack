import { delay } from "./utils";
import ConnectFourServerApi from "./server";

const updateTurnsDelayInMs = 500;
const renderTurnsDelayInMs = 1000;

/** Provides functionality for managing the board state associated with a game */
export class GameManager {

  constructor(gameId, forceReRender) {
    this.gameId = gameId;
    this.forceReRender = forceReRender;

    this.isPolling = false;
    this.pollForTurns = false;

    this.clientTurns = undefined;
    this.clientTurnIdsSet = undefined;
    this.latestServerTurns = undefined; // debug data to be removed
    this.game = undefined;
    this.board = undefined;
    this.gameState = undefined;
    this.players = undefined;
    this.currPlayerId = undefined;
  }

  /**
   * Called after instantiation in order to initialize remaining state based
   * on server-side state. Allows for constructor to be called synchronously.
   * Returns undefined.
   */
  async initialize() {
    // console.log("GameManager.initialize() called.")
    await this._updateLocalGame();
    this.board = this._initializeClientBoard();
    this._gameEnding();
    this.clientTurns = this.game.gameTurns;
    this.clientTurnIdsSet = new Set(this.clientTurns.map(turn => turn.turnId));
    // console.log("initial client turn ids:", this.clientTurnIdsSet);
    this.players = await ConnectFourServerApi.getPlayersForGame(this.gameId);
    if (this.gameState === 1) {
      this.enablePolling();
    }
  }

  /** Internal function for GameManager
  * Fetches an updated version of the game and populates (refreshes) local state
  */
  async _updateLocalGame() {
    this.game = await ConnectFourServerApi.getGame(this.gameId);
    this.gameState = this.game.gameData.gameState;
    this.currPlayerId = this.game.gameData.currPlayerId;
  }

  /** Internal function for GameManager
   * Conductor function to handle all operations that take place during
   * a polling session including any callbacks to React to re-render if needed
   */
  async _conductPoll() {
    // console.log("GameManager._conductPoll() called");
    const newTurns = await this._getNewTurns();
    // console.log("newTurns:", newTurns);
    for (let turn of newTurns) {
      // console.log("updating client turn array and board with new turn");
      this.clientTurns.push(turn);
      this.clientTurnIdsSet.add(turn.turnId);
      // console.log("clientTurnsSet updated with new turn:", this.clientTurnsSet);
      this._updateBoardWithTurn(turn);
      // console.log("board updated with new turn:", this.board);
      this.forceReRender(); // call callback to re-render
      await delay(renderTurnsDelayInMs);
    }
    if (newTurns.length > 0) {
      this._gameEnding();
    }
    // console.log("_conductPoll() finished; client turns:", this.clientTurns);
    // console.log("clientTurnIdSet:", this.clientTurnIdsSet);
  }

  /** Internal function for GameManager
   * Returns the set of new turns based on comparing this.clientTurnsSet
   * against a provided list of serverTurns and returning any server turns
   * not found in the client turns list.
   */
  async _getNewTurns() {
    await this._updateLocalGame();
    // console.log("clientTurnIdsSet prior to identifying new turns:", this.clientTurnIdsSet);
    const newTurns = this.game.gameTurns.filter(turn => !this.clientTurnIdsSet.has(turn.turnId));
    // console.log("server turns retrieved:", this.game.gameTurns);
    return newTurns;
  }

  /** Internal function for GameManager
   * Initializes a client-side representation of the game board on construction
   * Returns boardData: [ [ { playerId, validCoordSets } ] ]
  */
  _initializeClientBoard() {
    // console.log("initializeClientBoard called with boardData:", boardData);
    const board = [];
    for (let row of this.game.gameData.boardData) {
      const clientRow = [];
      for (let col of row) {
        const tileState = {
          playerId: col.playerId,
          highlight: false
        }
        clientRow.push(tileState);
      }
      board.push(clientRow);
    }
    return board;
  }

  /** Internal function for GameManager
   * Updates this.board with the provided turn object:
   * { turnId, location, playerId, gameId, createdOnMs } */
  _updateBoardWithTurn(turn) {
    this.board[turn.location[0]][turn.location[1]].playerId = turn.playerId;
  }

  /** Internal function for GameManager
   * Checks for and handles games which are won or tied */
  _gameEnding() {
    if (this.gameState === 2) {
      // game is won
      this.pollForTurns = false;
      this.isPolling = false;
      _highlightWinningCells(this);
      this.forceReRender(); // call callback to re-render
    } else if (this.gameState === 3) {
      // game is tied
      this.pollForTurns = false;
      this.isPolling = false;
      this.forceReRender(); // call callback to re-render
    }

    /** Internal function for GameManager._gameEnding()
     * Sets highlight = true for each winning cell in a won game
     */
    function _highlightWinningCells(parent) {
      for (let cell of parent.game.gameData.winningSet) {
        parent.board[cell[0]][cell[1]].highlight = true;
      }
    }
  }

  /** Drops a piece at the specified column for the current player associated with
   * the game associated with this game manager. Returns undefined.
   */
  async dropPiece(column) {
    if (this.gameState !== 1) {
      console.log("WARNING: Piece dropped while game is not in STARTED state.");
      return;
    }
    await ConnectFourServerApi.dropPiece(this.gameId, this.currPlayerId, column);
    await this._conductPoll();
  }

  /** Starts (or re-starts) the game associated with this game manager */
  async startGame() {
    await ConnectFourServerApi.startGame(this.gameId);
    await this.initialize();
    this.forceReRender();
  }

  /** Deletes the game associated with this game manager */
  async deleteGame() {
    this.disablePolling();
    await ConnectFourServerApi.deleteGame(this.gameId);
  }

  /** Enables polling and initiates polling (via this._poll()) */
  enablePolling() {
    this.pollForTurns = true;
    if (!this.isPolling) {
      this.isPolling = true;
      this._poll();
    }
  }

  /** Disables polling such that on next poll, polling will cease. */
  disablePolling() {
    this.isPolling = false;
    this.pollForTurns = false;
  }

  /** Internal function for GameMAnager
   * Polling function which calls this.updateTurns() and then
   * awaits updateTurnsDelayInMs to transpire before calling again.
   */
  async _poll() {
    while (this.pollForTurns) {
      await this._conductPoll();
      await delay(updateTurnsDelayInMs);
    }
  }
}