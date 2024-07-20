// import { delay } from "./utils";
import * as C4Server from "./server";
// import { useQueryClient } from "@tanstack/react-query";

// const updateTurnsDelayInMs = 500;
// const renderTurnsDelayInMs = 1000;

export interface ClientBoardCell {
  playerId: string | null;
  highlight: boolean;
}

export type ClientBoard = ClientBoardCell[][];

export interface GamePlayState {
  clientBoard: ClientBoard;
  gameData: C4Server.GameData;
}

export interface GameManagerV2Interface {
  getGamePlayState(): Promise<GamePlayState>;
  countNewTurnsRemaining(): number;
}

/** Provides functionality for managing the board state associated with a game */
export class GameManagerV2 implements GameManagerV2Interface {

  private gameId: string;
  private server: C4Server.Server;
  private game: C4Server.GameAndTurns | null;
  // private isPolling: boolean;
  // private pollForTurns: boolean;
  private gamePlayState: GamePlayState | null;
  private clientTurns: C4Server.GameTurn[];
  private clientTurnIdsSet: Set<number>;
  private newTurns: C4Server.GameTurn[];
  private firstQuery: boolean;

  constructor(server: C4Server.Server, gameId: string) {
    this.server = server;
    this.gameId = gameId;
    // this.isPolling = false;
    // this.pollForTurns = false;
    this.clientTurns = [];
    this.clientTurnIdsSet = new Set();
    this.newTurns = [];
    this.firstQuery = true;

    this.game = null;
    this.gamePlayState = null;
  }

  // /**
  //  * Establishes and returns initial client state for the game associated
  //  * with this game manager. Kicks off polling if the game is in a 'started'
  //  * state.
  //  */
  // async getInitialClientState(): Promise<gamePlayState> {
  //   this.game = await this.server.getGame(this.gameId);
  //   this.clientTurns = this.game.gameTurns;
  //   this.game.gameTurns.forEach(t => this.clientTurnIdsSet.add(t.turnId));
  //   this._initializeClientBoard();
  //   this._processGameEnd();
  //   if (this.game.gameData.gameState === 1) { this._enablePolling(); }
  //   return this.gamePlayState!;
  // }

  /**
   * Returns game
   * with this game manager. Kicks off polling if the game is in a 'started'
   * state.
   */
  async getGamePlayState(): Promise<GamePlayState> {
    this.game = await this.server.getGame(this.gameId);
    if (this.firstQuery) {
      this.clientTurns = this.game.gameTurns;
      this.game.gameTurns.forEach(t => this.clientTurnIdsSet.add(t.turnId));
      this._initializeClientBoard();
      this._processGameEnd();
      return this.gamePlayState!;
    }
    await this._setNewTurns();
    return this.gamePlayState!;
  }

  /** Process a new turn (add it to the board) and return the updated gamePlayState */
  processNewTurn() : GamePlayState {
    let i = this.newTurns.length - 1;
    this.clientTurns.push(this.newTurns[i]);
    this.clientTurnIdsSet.add(this.newTurns[i].turnId);
    this._updateBoardWithTurn(this.newTurns[i]);
    this._processGameEnd();
    this.newTurns.pop();
    return this.gamePlayState!;
  }

  /** Return the number of new turns to-be-processed */
  countNewTurnsRemaining() : number {
    return this.newTurns.length;
  }

  // /** Internal function for GameManagerV2
  //  * Enables polling and initiates polling (via this._poll()) */
  // private _enablePolling(): void {
  //   this.pollForTurns = true;
  //   if (!this.isPolling) {
  //     this.isPolling = true;
  //     this._poll();
  //   }
  // }

  // /** Internal function for GameManagerV2
  //  * Disables polling such that on next poll, polling will cease. */
  // private _disablePolling(): void {
  //   this.isPolling = false;
  //   this.pollForTurns = false;
  // }

  /** Internal function for GameManagerV2
   * Initializes a client-side representation of the game board
  */
  private _initializeClientBoard(): void {
    const board = [];
    for (let row of this.game!.gameData.boardData) {
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

    const gamePlayState: GamePlayState = {
      clientBoard: board,
      gameData: this.game!.gameData
    };
    this.gamePlayState = gamePlayState;
  }

  /** Internal function for GameManagerV2
   * Checks for and handles games which are won or tied */
  private _processGameEnd(): void {
    if (this.game!.gameData.gameState === 2) {
      // gameAndTurns is won
      // this._disablePolling();
      __highlightWinningCells(this);
    } else if (this.game!.gameData.gameState === 3) {
      // gameAndTurns is tied
      // this._disablePolling();
    }

    /** Internal function for GameManager._processGameEnd()
     * Passed the instance of GameManager to update.
     * Sets highlight = true for each winning cell in a won gameAndTurns
     */
    function __highlightWinningCells(parent: GameManagerV2): void {
      for (let cell of parent.game!.gameData.winningSet) {
        parent.gamePlayState!.clientBoard![cell[0]][cell[1]].highlight = true;
      }
    }
  }

  // /** Internal function for GameManagerV2
  //  * Called during polling to update client state
  //  */
  // private async _updateClientState() {
  //   this.game = await this.server.getGame(this.gameId);
  //   const receivedNewTurns = await this._processNewTurns();
  //   if (receivedNewTurns) {
  //     this._processGameEnd();
  //     this._handleQueryClientCalls();
  //   }
  // }

  // /** Internal function for GameManagerV2
  //  * Accepts a QueryClient
  //  * Retrieves new turns and for each new turn, updates the ClientBoard,
  //  * calls setQueryData() for the gameDetails query and if 1 or more new turns are
  //  * discovered, returns true, else false;
  //  */
  // private async _processNewTurns(): Promise<boolean> {
  //   this.newTurns = await this._getNewTurns();
  //   const newTurnsFound = this.newTurns.length > 0;
  //   for (let i = this.newTurns.length - 1; i >= 0; i--) {
  //     this.clientTurns.push(this.newTurns[i]);
  //     this.clientTurnIdsSet.add(this.newTurns[i].turnId);
  //     this._updateBoardWithTurn(this.newTurns[i]);
  //     this.newTurns.pop();
  //     this._handleQueryClientCalls();
  //     await delay(renderTurnsDelayInMs);
  //   }
  //   return newTurnsFound;
  // }

  // private _handleQueryClientCalls(): void {
  //   const queryClient = useQueryClient();
  //   queryClient.setQueryData(['gamePlayState', this.game!.gameData.id], this.gamePlayState);
  //   queryClient.invalidateQueries({ queryKey: ['gameDetails', this.game!.gameData.id] });
  // }

  // /** Internal function for GameManagerV2
  //  * Compares turns from the current game state against prior list of turns.
  //  * Returns any newly detected turns as GameTurn[]
  //  */
  // private async _getNewTurns(): Promise<C4Server.GameTurn[]> {
  //   const newTurns = this.game!.gameTurns.filter(turn => !this.clientTurnIdsSet!.has(turn.turnId));
  //   return newTurns;
  // }

  /** Internal function for GameManagerV2
   * Compares turns from the current game state against prior list of turns.
   * Returns any newly detected turns as GameTurn[]
   */
  private async _setNewTurns(): Promise<void> {
    this.newTurns = this.game!.gameTurns.filter(turn => !this.clientTurnIdsSet!.has(turn.turnId));
  }

  /** Internal function for GameManagerV2
   * Updates this.gamePlayState with the provided GameTurn data:
   **/
  private _updateBoardWithTurn(turn: C4Server.GameTurn): void {
    this.gamePlayState!.clientBoard![turn.location[0]][turn.location[1]].playerId = turn.playerId;
  }

  // /** Internal function for GameManagerV2
  //  * Polling function which calls this.updateClientState() and then
  //  * awaits updateTurnsDelayInMs to transpire before calling again.
  //  */
  // private async _poll(): Promise<void> {
  //   while (this.pollForTurns) {
  //     await this._updateClientState();
  //     await delay(updateTurnsDelayInMs);
  //   }
  // }
}