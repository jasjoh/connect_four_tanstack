import { delay } from "./utils";
import * as C4Server from "./server";

export interface ClientBoardCell {
  playerId: string | null;
  highlight: boolean;
}

export type ClientBoard = ClientBoardCell[][];

export interface ClientState {
  game: C4Server.GameAndTurns;
  clientBoard: ClientBoard;
  newTurnCount: number;
}

export interface GameManagerV2Interface {
  getClientState(): Promise<ClientState>;
  startGame(): Promise<void>;
  setPollRate(frequencyInMs: number): void;
}

/** Provides functionality for managing the board state associated with a game */
export class GameManagerV2 implements GameManagerV2Interface {

  private static instances: Map<string, GameManagerV2> = new Map();
  private static server: C4Server.Server = C4Server.Server.getInstance();

  private gameId: string;
  private server: C4Server.Server;
  private game: C4Server.GameAndTurns | null;
  private clientBoard: ClientBoard | null;
  private clientState: ClientState | null;
  private clientTurns: C4Server.GameTurn[];
  private clientTurnIdsSet: Set<number>;
    // TODO: newTurns should be a queue rather than a simple array.
  private newTurns: C4Server.GameTurn[];
  private pollForTurns: boolean;
  private isPolling: boolean;
  private pollingFrequencyInMs: number;
  public queryServerAllowed: boolean;

  private constructor(gameId: string) {
    this.server = GameManagerV2.server;
    this.gameId = gameId;
    this.clientTurns = [];
    this.clientTurnIdsSet = new Set();
    this.newTurns = [];
    this.queryServerAllowed = true;
    this.pollForTurns = false;
    this.isPolling = false;
    this.pollingFrequencyInMs = 5000;

    this.game = null;
    this.clientBoard = null;
    this.clientState = null;
  }

  static getInstance(gameId: string) : GameManagerV2 {
    if (!this.instances.has(gameId)) {
      this.instances.set(gameId, new GameManagerV2(gameId));
    }
    return this.instances.get(gameId)!;
  }

  /**
   * Returns a client state to render
   * If new turns exist, processes the oldest one, then returns updated state
   * If new turns don't exist no local state exists, initializes local state and returns it
   * If local state exists and no new turns exist, simply returns local state
   * If querying is not permitted (e.g. in the middle of starting a game), throws error
   */
  async getClientState() : Promise<ClientState> {
    if (!this.queryServerAllowed) {
      throw new Error("GameManager is not in valid state to be queried or updated.")
    }

    if (this.clientBoard === null) {
      // game data has not been initialized
      this.game = await this.server.getGame(this.gameId);
      this.clientBoard = this._initializeClientBoardF(this.game.gameData.boardData);
      this._initializeClientTurnData();
      this._generateNewClientState();
      this._enablePolling();
      this._processGameState();
    }

    else if (this.newTurns.length > 0) {
      // game is initialized and there are new turns to process
      this._processNewTurn();
      if (this.newTurns.length === 0) { this._processGameState(); }
      this._generateNewClientState();
    }

    return this.clientState!;
  }

  /** Drops a piece at the specified location for the current player */
  async dropPiece(column: number) : Promise<void> {
    if (this.game?.gameData.gameState !== 1) { return }
    await this.server.dropPiece(this.gameId, this.game!.gameData.currPlayerId!, column);
    await this._updateClientState();
  }

  /**
   * Starts the game associated with this GameManagerV2
   * Once promise is fulfilled successfully, call getGamePlayState() */
  async startGame(): Promise<void> {
    this.queryServerAllowed = false;
    await this.server.startGame(this.gameId);
    this._clearState();
    this.queryServerAllowed = true;
    this._enablePolling();
  }

  /** Deletes the game associated with this GameManagerV2 */
  async deleteGame(): Promise<void> {
    this.server.deleteGame(this.gameId);
  }

  /** Update the rate of polling for client state updates */
  setPollRate(frequencyInMs: number): void {
    this.pollingFrequencyInMs = frequencyInMs;
  }

  /**
   * Retrieves the latest state from the server and stores it locally. If new
   * turns have been discovered, it adds those to the queue to be processed.
   * If new turns already exist or if the game has not been initialized, does nothing.
   *
   */
  private async _updateClientState() : Promise<void> {
    if (this.newTurns.length > 0 || this.clientBoard === null ) { return }
    this.game = await this.server.getGame(this.gameId);
    this._setNewTurns();
  }

  /** Generates a new client state */
  private _generateNewClientState() : void {
    this.clientState = {
      game: this.game!,
      clientBoard: this.clientBoard!,
      newTurnCount: this.newTurns.length
    }
  }

  /** Process a new turn (add it to the board) */
  private _processNewTurn(): void {
    if (this.clientBoard === null) { throw new Error("clientBoard has not been set.")}
    const turnToProcess = this.newTurns[0];
    this.clientTurns = this._addTurnToTurnArrayF(turnToProcess, this.clientTurns);
    this.clientTurnIdsSet = this._addTurnToTurnIdSetF(turnToProcess, this.clientTurnIdsSet);
    this.clientBoard = this._addTurnToClientBoardF(turnToProcess, this.clientBoard);
    this._processGameState();
    this.newTurns = this.newTurns.slice(1);
  }

  /**
   * Accepts a GameTurn and a GameTurn[]
   * Creates a new GameTurn[], adding the GameTurn to the end.
   * Returns new GameTurn[]
   */
  private _addTurnToTurnArrayF(
    turn: C4Server.GameTurn,
    turnArray: C4Server.GameTurn[]
  ) : C4Server.GameTurn[] {
    return turnArray.concat(turnArray, turn)
  }

  /**
   * Accepts a Set<string> of GameTurn IDs and a GameTurn
   * Creates a new Set<String>, adding all existing GameTurn IDs from
   * the input set in addition to the GameTurn ID from the input GameTurn
   * Returns a new Set<string> of Game Turn IDs
   */
  private _addTurnToTurnIdSetF(
    turn: C4Server.GameTurn,
    turnIdSet: Set<number>
  ) : Set<number> {
    const returnSet : Set<number> = new Set();
    turnIdSet.forEach(turnId => returnSet.add(turnId));
    turnIdSet.add(turn.turnId);
    return returnSet;
  }

  /**
   * Accepts a GameTurn and a ClientBoard
   * Creates a new ClientBoard updated with the action implied by the GameTurn
   * Returns the new ClientBoard
   */
  private _addTurnToClientBoardF(
    turn: C4Server.GameTurn,
    clientBoard: ClientBoard
  ) : ClientBoard {
    const board = clientBoard.map(row => row.map(cell => ({...cell})));
    board[turn.location[0]][turn.location[1]].playerId = turn.playerId;
    return board;
  }

  /** Accepts a ClientBoard and a number[][] representing a set of
   * board coordinates which should be highlighted.
   * Creates and returns a new ClientBoard with those cells highlighted.
   */
  private _highlightWinningTurnSetF(
    clientBoard: ClientBoard,
    winningSet: number[][]
  ) : ClientBoard {
    let board : ClientBoard = clientBoard.map(row => row.map(cell => ({...cell})));
    for (let cell of winningSet) {
      board[cell[0]][cell[1]].highlight = true;
    }
    return board;
  }

  /** Internal function for GameManagerV2
   * Checks for and handles games which have finished */
  private _processGameState() : void {
    if (this.game?.gameData?.gameState !== 1) {
      this._disablePolling();
    }
    if (this.game?.gameData?.gameState === 2) {
      this.clientBoard = this._highlightWinningTurnSetF(
        this.clientBoard!, this.game!.gameData!.winningSet!
      )
      this.queryServerAllowed = false;
    }
  }

  /** Clears game state (e.g. when a game is restarted) */
  private _clearState(): void {
    this.clientBoard = null;
    this.clientTurnIdsSet = new Set();
    this.clientTurns = [];
    this.newTurns = [];
  }

  /** Internal function for GameManagerV2 - PURE Function
   * Accepts a BoardCell[][] and generates and returns a new ClientBoard
  */
  private _initializeClientBoardF(boardData: C4Server.BoardCell[][]): ClientBoard {
    const board = [];
    for (let row of boardData) {
      const clientRow = [];
      for (let col of row) {
        const clientBoardCell: ClientBoardCell = {
          playerId: col.playerId,
          highlight: false
        };
        clientRow.push(clientBoardCell);
      }
      board.push(clientRow);
    }
    return board;
  }

  /** Initializes clientTurns and clientTurnIdsSet based on game data */
  private _initializeClientTurnData() : void {
    this.clientTurns = this.game!.gameTurns;
    this.clientTurns.forEach(t => this.clientTurnIdsSet.add(t.turnId));
  }

  /** Internal function for GameManagerV2
   * Compares turns from the current game state against prior list of turns.
   * Returns any newly detected turns as GameTurn[]
   */
  private _setNewTurns(): void {
    this.newTurns = this.game!.gameTurns.filter(turn => !this.clientTurnIdsSet!.has(turn.turnId));
  }

  /** Internal function for GameManagerV2
   * Updates this.gamePlayState with the provided GameTurn data:
   **/
  private _updateBoardWithTurn(turn: C4Server.GameTurn): void {
    this.clientBoard![turn.location[0]][turn.location[1]].playerId = turn.playerId;
  }

  /** Internal function for GameMAnager
   * Polling function which calls this.updateTurns() and then
   * awaits updateTurnsDelayInMs to transpire before calling again.
   */
  private async _poll() : Promise<void> {
    while (this.pollForTurns) {
      await this._updateClientState();
      await delay(this.pollingFrequencyInMs);
    }
  }

  /** Enables polling and initiates polling (via this._poll()) */
  private _enablePolling(frequency: number = 5000) : void {
    this.pollingFrequencyInMs = frequency;
    this.pollForTurns = true;
    if (!this.isPolling) {
      this.isPolling = true;
      this._poll();
    }
  }

  /** Disables polling such that on next poll, polling will cease. */
  private _disablePolling() : void {
    this.isPolling = false;
    this.pollForTurns = false;
  }
}