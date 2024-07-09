import axios from "axios";

let BASE_URL: string | undefined;

process.env.NODE_ENV === 'production' ?
  BASE_URL = process.env.REACT_APP_BASE_URL :
  BASE_URL = "http://localhost:3001";

export interface NewPlayer {
  ai: boolean;
  color: string;
  name: string;
}

export interface Player extends NewPlayer {
  createdOn: string;
  id: string;
}

export interface GamePlayer extends Player {
  playOrder: number;
}

export interface NewGameDimensions {
  width: number;
  height: number;
}

export interface GameData {
  boardData: BoardCell[][],
  boardHeight: number;
  boardId: number;
  boardWidth: number;
  createdOn: string;
  currPlayerId: string;
  gameState: number;
  id: string;
  placedPieces: number[][];
  totalPlayers: number;
  winningSet: number[][];
}

export interface BoardCell {
  playerId: string | null;
  validCoordSets: number[][][];
}

export interface GameTurn {
  createdOnMs: string;
  gameId: string;
  location: number[];
  playerId: string;
  turnId: number;
}

export interface GameAndTurns {
  gameData: GameData;
  gameTurns: GameTurn[];
}

export interface GameList {
  games: GameSummary[];
}

export interface GameSummary {
  id: string;
  gameState: number;
  createdOn: string;
  totalPlayers: number;
}

export interface GetPlayersResponseData {
  players: Player[];
}

export interface GetGamePlayersResponseData {
  players: GamePlayer[];
}

export interface GetPostPlayerResponseData {
  player: Player;
}

export interface AddPlayerToGameResponseData {
  playerCount: number;
}

export interface RemovePlayerFromGameResponseData {
  removed: string;
}

export interface DeletePlayerResponseData {
  deleted: string;
}

export interface GetGameResponseData {
  game: GameAndTurns;
}

export interface PostGameResponseData {
  game: GameData;
}

export interface GetGamesResponseData {
  games: GameSummary[];
}

export interface ServerInterface {
  getGames(): Promise<GameSummary[]>;
  getGame(gameId: string): Promise<GameAndTurns>;
  getPlayers(): Promise<Player[]>;
  getPlayer(pId: string): Promise<Player>;
  getPlayersForGame(gameId: string): Promise<GamePlayer[]>;
  createPlayer(player: NewPlayer): Promise<Player>;
  createGame(dimensions: NewGameDimensions): Promise<GameData>;
  startGame(gameId: string): Promise<void>;
  dropPiece(gameId: string, playerId: string, col: number): Promise<void>;
  addPlayersToGame(gameId: string, players: string[]): Promise<AddPlayerToGameResponseData>;
  deletePlayer(playerId: string): Promise<void>;
  removePlayerFromGame(gameId: string, playerId: string): Promise<void>;
  deleteGame(gameId: string): Promise<void>;
}

/** Singleton class representing a controller for interacting with the server */
export class Server implements ServerInterface {

  private static instance: Server;

  private constructor() { }

  static getInstance(): Server {
    if (!this.instance) {
      this.instance = new Server();
    }
    return this.instance;
  }

  /**
   * General wrapper for making requests to the server
   * Leverages axios as the library for handling async communication
   * Returns the contents of the axios response.data on success
   * Throws error if any issue occurs with making the request
   * @param {string} endpoint - the path to the resources
   * @param {object} data - the data (payload) to submit; can be url params or a json body payload
   * @param {string} method - the method associated with the request
   */
  private async _request(endpoint: string, data = {}, method = "get"): Promise<any> {
    // console.debug("API Call:", endpoint, data, method);

    const url = `${BASE_URL as string}/${endpoint}`;
    // const headers = { Authorization: `Bearer ${ShareBnbApi.token}` };
    // this uses the params config key (for GET) and data key (for non-GET) requests
    const params = (method === "get")
      ? data
      : {};

    try {
      const axiosConfig = { url, method, data, params };
      const axiosResponse = await axios(axiosConfig);
      const responseData = axiosResponse.data;
      return responseData;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("API Error:", err.response);
        let message = err.response?.data.error.message as string | string[];
        throw Array.isArray(message) ? message : [message];
      } else {
        throw err;
      }
    }
  }

  // Individual API routes

  /** Get a list of all games */
  async getGames(): Promise<GameSummary[]> {
    const data: GetGamesResponseData = await this._request(`games`);
    // console.log("retrieved games:", data);
    return data.games;
  }

  /** Get a specific game */
  async getGame(gameId: string): Promise<GameAndTurns> {
    const data: GetGameResponseData = await this._request(`games/${gameId}`,);
    // console.log("retrieved game:", data);
    return data.game;
  }

  /** Get all players */
  async getPlayers(): Promise<Player[]> {
    const data: GetPlayersResponseData = await this._request(`players`,);
    // console.log("retrieved players:", data.players);
    return data.players;
  }

  /** Get a specific player */
  async getPlayer(pId: string): Promise<Player> {
    const data: GetPostPlayerResponseData = await this._request(`players/${pId}`,);
    // console.log("retrieved player:", data);
    return data.player;
  }

  /** Get all players for a specific game */
  async getPlayersForGame(gameId: string): Promise<GamePlayer[]> {
    const data: GetGamePlayersResponseData = await this._request(`games/${gameId}/players`,);
    // console.log("retrieved players:", data);
    return data.players;
  }

  /** Creates a new player
   * Experts a NewPlayer object to create
   * Returns the created Player object
   */
  async createPlayer(player: NewPlayer): Promise<Player> {
    const data: GetPostPlayerResponseData = await this._request(`players`, player, 'POST');
    // console.log("created player:", data);
    return data.player;
  }

  /** Creates a new game
   * Expects game dimensions for the new game
   * Returns the created game (GameData)
   *    placedPieces, winningSet, currPlayerId, createdOn, totalPlayers }
   */
  async createGame(dimensions: NewGameDimensions): Promise<GameData> {
    const data: PostGameResponseData = await this._request(`games`, dimensions, 'POST');
    // console.log("created game:", data);
    return data.game;
  }

  /** Start (or restart) an existing game
   * Returns undefined if successful and throws error otherwise */
  async startGame(gameId: string): Promise<void> {
    await this._request(`games/${gameId}/start`, {}, 'POST');
  }

  /** Attempts to drop a piece
   * Expects a game ID, player ID and the column of where to drop the piece.
   * Returns undefined if successful and throws error otherwise */
  async dropPiece(gameId: string, playerId: string, col: number): Promise<void> {
    await this._request(
      `games/${gameId}/cols/${col}`, { playerId: playerId }, 'POST'
    );
  }

  /** Adds an array of players to a game
   * Expects a game ID an an array of player IDs to add to a game
   * Returns the updated player count (AddPlayerToGameResponseData)
   */
  async addPlayersToGame(gameId: string, players: string[]): Promise<AddPlayerToGameResponseData> {
    console.log("Server.addPlayersToGame() called for players, ", players);
    const data: AddPlayerToGameResponseData = await this._request(`games/${gameId}/players`, players, 'POST');
    return data;
  }

  /** Deletes a player (from the database completely)
   * Returns undefined if successful and throws error otherwise */
  async deletePlayer(playerId: string): Promise<void> {
    await this._request(`players/${playerId}`, {}, 'DELETE');
  }

  /** Removes a player from the specified game
   * Returns undefined if successful and throws error otherwise */
  async removePlayerFromGame(gameId: string, playerId: string): Promise<void> {
    console.log("Server.removePlayerFromGame() called for player, ", playerId);
    await this._request(`games/${gameId}/players/${playerId}`, {}, 'DELETE');
    return undefined;
  }

  /** Deletes a game
   * Returns undefined if successful and throws error otherwise */
  async deleteGame(gameId: string): Promise<void> {
    await this._request(`games/${gameId}`, {}, 'DELETE');
    // console.log("deleted game response:", data);
    return undefined;
  }

}