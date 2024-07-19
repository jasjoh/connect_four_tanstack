import { delay } from "./utils";
import * as C4Server from "./server";
import { useQueryClient } from "@tanstack/react-query";

const updateTurnsDelayInMs = 500;
const renderTurnsDelayInMs = 1000;

export interface ClientBoardCell {
  playerId: string | null;
  highlight: boolean;
}

export type ClientBoard = ClientBoardCell[][];

export interface ClientBoardAndGameData {
  clientBoard: ClientBoard;
  gameData: C4Server.GameData;
}

export interface GameManagerV2Interface {
  getInitialClientState(): Promise<ClientBoardAndGameData>;
}

/** Provides functionality for managing the board state associated with a game */
export class GameManagerV2 implements GameManagerV2Interface {

  private gameId: string;
  private server: C4Server.Server;
  private game: C4Server.GameAndTurns | null;
  private isPolling: boolean;
  private pollForTurns: boolean;
  private clientBoardAndGameData: ClientBoardAndGameData | null;
  private clientTurns: C4Server.GameTurn[];
  private clientTurnIdsSet: Set<number>;

  constructor(server: C4Server.Server, gameId: string) {
    this.server = server;
    this.gameId = gameId;
    this.isPolling = false;
    this.pollForTurns = false;
    this.clientTurns = [];
    this.clientTurnIdsSet = new Set();

    this.game = null;
    this.clientBoardAndGameData = null;
  }

  /**
   * Establishes and returns initial client state for the game associated
   * with this game manager. Kicks off polling if the game is in a 'started'
   * state.
   */
  async getInitialClientState(): Promise<ClientBoardAndGameData> {
    this.game = await this.server.getGame(this.gameId);
    this.clientTurns = this.game.gameTurns;
    this.game.gameTurns.forEach(t => this.clientTurnIdsSet.add(t.turnId));
    this._initializeClientBoard();
    this._processGameEnd();
    if (this.game.gameData.gameState === 1) { this._enablePolling(); }
    return this.clientBoardAndGameData!;
  }

  /** Internal function for GameManagerV2
   * Enables polling and initiates polling (via this._poll()) */
  private _enablePolling(): void {
    this.pollForTurns = true;
    if (!this.isPolling) {
      this.isPolling = true;
      this._poll();
    }
  }

  /** Internal function for GameManagerV2
   * Disables polling such that on next poll, polling will cease. */
  private _disablePolling(): void {
    this.isPolling = false;
    this.pollForTurns = false;
  }

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
    const clientBoardAndGameData: ClientBoardAndGameData = {
      clientBoard: board,
      gameData: this.game!.gameData
    };
    this.clientBoardAndGameData = clientBoardAndGameData;
  }

  /** Internal function for GameManagerV2
   * Checks for and handles games which are won or tied */
  private _processGameEnd(): void {
    if (this.game!.gameData.gameState === 2) {
      // gameAndTurns is won
      this._disablePolling();
      __highlightWinningCells(this);
    } else if (this.game!.gameData.gameState === 3) {
      // gameAndTurns is tied
      this._disablePolling();
    }

    /** Internal function for GameManager._processGameEnd()
     * Passed the instance of GameManager to update.
     * Sets highlight = true for each winning cell in a won gameAndTurns
     */
    function __highlightWinningCells(parent: GameManagerV2): void {
      for (let cell of parent.game!.gameData.winningSet) {
        parent.clientBoardAndGameData!.clientBoard![cell[0]][cell[1]].highlight = true;
      }
    }
  }

  /** Internal function for GameManagerV2
   * Called during polling to update client state
   */
  private async _updateClientState() {
    this.game = await this.server.getGame(this.gameId);
    const receivedNewTurns = await this._processNewTurns();
    if (receivedNewTurns) {
      this._processGameEnd();
      this._handleQueryClientCalls();
    }
  }

  /** Internal function for GameManagerV2
   * Accepts a QueryClient
   * Retrieves new turns and for each new turn, updates the ClientBoard,
   * calls setQueryData() for the gameDetails query and if 1 or more new turns are
   * discovered, returns true, else false;
   */
  private async _processNewTurns(): Promise<boolean> {
    const newTurns = await this._getNewTurns();
    for (let turn of newTurns) {
      this.clientTurns.push(turn);
      this.clientTurnIdsSet.add(turn.turnId);
      this._updateBoardWithTurn(turn);
      this._handleQueryClientCalls();
      await delay(renderTurnsDelayInMs);
    }
    return newTurns.length > 0;
  }

  private _handleQueryClientCalls(): void {
    const queryClient = useQueryClient();
    queryClient.setQueryData(['clientBoardAndGameData', this.game!.gameData.id], this.clientBoardAndGameData);
    queryClient.invalidateQueries({ queryKey: ['gameDetails', this.game!.gameData.id] });
  }

  /** Internal function for GameManagerV2
   * Compares turns from the current game state against prior list of turns.
   * Returns any newly detected turns as GameTurn[]
   */
  private async _getNewTurns(): Promise<C4Server.GameTurn[]> {
    const newTurns = this.game!.gameTurns.filter(turn => !this.clientTurnIdsSet!.has(turn.turnId));
    return newTurns;
  }

  /** Internal function for GameManagerV2
   * Updates this.clientBoardAndGameData with the provided GameTurn data:
   **/
  private _updateBoardWithTurn(turn: C4Server.GameTurn): void {
    this.clientBoardAndGameData!.clientBoard![turn.location[0]][turn.location[1]].playerId = turn.playerId;
  }

  /** Internal function for GameManagerV2
   * Polling function which calls this.updateClientState() and then
   * awaits updateTurnsDelayInMs to transpire before calling again.
   */
  private async _poll(): Promise<void> {
    while (this.pollForTurns) {
      await this._updateClientState();
      await delay(updateTurnsDelayInMs);
    }
  }
}