import { delay } from "./utils";
import * as C4Server from "./server";

const updateTurnsDelayInMs = 500;
const renderTurnsDelayInMs = 1000;

export interface ClientBoardCell {
  playerId: string | null;
  highlight: boolean;
}

export type ClientBoard = ClientBoardCell[][];

/** Provides functionality for managing the board state associated with a game */
export class GameManager {

  gameId: string | undefined;
  forceReRender: () => void;
  isPolling: boolean;
  pollForTurns: boolean;
  server: C4Server.Server | undefined;
  game: C4Server.GameAndTurns | undefined;
  gameState: number | undefined;
  currPlayerId: string | undefined;
  players: C4Server.Player[] | undefined;
  clientBoard: ClientBoard | undefined;
  clientTurns: C4Server.GameTurn[] | undefined;
  clientTurnIdsSet: Set<number> | undefined;

  constructor(gameId : string, forceReRender : () => void) {
    this.gameId = gameId;
    this.forceReRender = forceReRender;

    this.isPolling = false;
    this.pollForTurns = false;

    this.clientTurns = undefined;
    this.clientTurnIdsSet = undefined;
    // this.latestServerTurns = undefined; // debug data to be removed
    this.server = undefined;
    this.game = undefined;
    this.clientBoard = undefined;
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
    this.server = C4Server.Server.getInstance();
    await this._updateLocalGame();
    this.clientBoard = this._initializeClientBoard();
    this._gameEnding();

    this.clientTurns = this.game!.gameTurns;
    this.clientTurnIdsSet = new Set(this.clientTurns.map(turn => turn.turnId));
    // console.log("initial client turn ids:", this.clientTurnIdsSet);

    this.players = await this.server.getPlayersForGame(this.gameId!);
    if (this.gameState === 1) {
      this.enablePolling();
    }
  }

  /** Internal function for GameManager
  * Fetches an updated version of the game and populates (refreshes) local state
  */
  private async _updateLocalGame() : Promise<void> {
    if (this.gameId === undefined) {
      throw new Error("Game ID is undefined. Was game deleted? Use setGameAndInitialize().")
    }
    this.game = await this.server!.getGame(this.gameId);
    this.gameState = this.game.gameData.gameState;
    this.currPlayerId = this.game.gameData.currPlayerId;
  }

  /** Internal function for GameManager
   * Conductor function to handle all operations that take place during
   * a polling session including any callbacks to React to re-render if needed
   */
  private async _conductPoll() : Promise<void> {
    // console.log("GameManager._conductPoll() called");
    const newTurns = await this._getNewTurns();
    // console.log("newTurns:", newTurns);
    for (let turn of newTurns) {
      // console.log("updating client turn array and board with new turn");
      this.clientTurns!.push(turn);
      this.clientTurnIdsSet!.add(turn.turnId);
      // console.log("clientTurnsSet updated with new turn:", this.clientTurnsSet);
      this._updateBoardWithTurn(turn);
      // console.log("board updated with new turn:", this.clientBoard);
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
   * Triggers an update to local game state and the compares old client state
   * against new client state to determine new turns that have transpired.
   * Returns any newly detected turns as GameTurn[]   *
   */
  private async _getNewTurns() : Promise<C4Server.GameTurn[]>  {
    await this._updateLocalGame();
    // console.log("clientTurnIdsSet prior to identifying new turns:", this.clientTurnIdsSet);
    const newTurns = this.game!.gameTurns.filter(turn => !this.clientTurnIdsSet!.has(turn.turnId));
    // console.log("server turns retrieved:", this.game.gameTurns);
    return newTurns;
  }

  /** Internal function for GameManager
   * Initializes a client-side representation of the game board on construction
   * Returns ClientBoard
  */
  private _initializeClientBoard() : ClientBoard {
    if (this.game === undefined) {
      throw new Error("Game is undefined.")
    }
    // console.log("initializeClientBoard called with boardData:", boardData);
    const board = [];
    for (let row of this.game.gameData.boardData) {
      const clientRow = [];
      for (let col of row) {
        const clientBoardCell : ClientBoardCell= {
          playerId: col.playerId,
          highlight: false
        }
        clientRow.push(clientBoardCell);
      }
      board.push(clientRow);
    }
    return board;
  }

  /** Internal function for GameManager
   * Updates this.clientBoard with the provided GameTurn object:
   **/
  private _updateBoardWithTurn(turn : C4Server.GameTurn) : void {
    this.clientBoard![turn.location[0]][turn.location[1]].playerId = turn.playerId;
  }

  /** Internal function for GameManager
   * Checks for and handles games which are won or tied */
  private _gameEnding() : void {
    if (this.gameState === 2) {
      // game is won
      this.pollForTurns = false;
      this.isPolling = false;
      __highlightWinningCells(this);
      this.forceReRender(); // call callback to re-render
    } else if (this.gameState === 3) {
      // game is tied
      this.pollForTurns = false;
      this.isPolling = false;
      this.forceReRender(); // call callback to re-render
    }

    /** Internal function for GameManager._gameEnding()
     * Passed the instance of GameManager to update.
     * Sets highlight = true for each winning cell in a won game
     */
    function __highlightWinningCells(parent : GameManager) : void {
      for (let cell of parent.game!.gameData.winningSet) {
        parent.clientBoard![cell[0]][cell[1]].highlight = true;
      }
    }
  }

  /** Drops a piece at the specified column for the current player
   * associated with the game associated with this game manager.
   * Returns undefined.
   */
  async dropPiece(column: number) : Promise<void> {
    if (this.gameState !== 1) {
      console.log("WARNING: Piece dropped while game is not in STARTED state.");
      return;
    }
    await this.server!.dropPiece(this.gameId!, this.currPlayerId!, column);
    await this._conductPoll();
  }

  /** Starts (or re-starts) the game associated with this game manager */
  async startGame() : Promise<void> {
    await this.server!.startGame(this.gameId!);
    await this.initialize();
    this.forceReRender();
  }

  /** Deletes the game associated with this game manager */
  async deleteGame() : Promise<void> {
    this.disablePolling();
    await this.server!.deleteGame(this.gameId!);
  }

  /**
   * Accepts a Game ID
   * Assigns this GameManager to manage the specific game and initializes
   * the GameManager using that game state.
   * Returns undefined */
  async setGameAndInitialize(gameId: string) : Promise<void> {
    this.gameId = gameId;
    this.initialize();
  }

  /** Enables polling and initiates polling (via this._poll()) */
  enablePolling() : void {
    this.pollForTurns = true;
    if (!this.isPolling) {
      this.isPolling = true;
      this._poll();
    }
  }

  /** Disables polling such that on next poll, polling will cease. */
  disablePolling() : void {
    this.isPolling = false;
    this.pollForTurns = false;
  }

  /** Internal function for GameMAnager
   * Polling function which calls this.updateTurns() and then
   * awaits updateTurnsDelayInMs to transpire before calling again.
   */
  private async _poll() : Promise<void> {
    while (this.pollForTurns) {
      await this._conductPoll();
      await delay(updateTurnsDelayInMs);
    }
  }
}