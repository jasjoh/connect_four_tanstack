import axios from "axios";

let BASE_URL;
process.env.NODE_ENV === 'production' ?
  BASE_URL = process.env.REACT_APP_BASE_URL :
  BASE_URL = "http://localhost:3001";

class ConnectFourServerApi {

  /**
   * General wrapper for making requests to the server
   * Leverages axios as the library for handling async communication
   * Returns the contents of the axios response.data on success
   * Throws error if any issue occurs with making the request
   * @param {string} endpoint - the path to the resources
   * @param {object} data - the data (payload) to submit; can be url params or a json body payload
   * @param {string} method - the method associated with the request
   */
  static async request(endpoint, data = {}, method = "get") {
    // console.debug("API Call:", endpoint, data, method);

    const url = `${BASE_URL}/${endpoint}`;
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
    } catch (err) {
      console.error("API Error:", err.response);
      let message = err.response.data.error.message;
      throw Array.isArray(message) ? message : [message];
    }
  }

  // Individual API routes

  /** Get a list of all games */
  static async getGames() {
    const data = await ConnectFourServerApi.request(`games`);
    // console.log("retrieved games:", data);
    return data.games;
  }

  /** Get a specific game */
  static async getGame(gameId) {
    const data = await ConnectFourServerApi.request(`games/${gameId}`, );
    // console.log("retrieved game:", data);
    return data.game;
  }

  /** Get all players */
  static async getPlayers() {
    const data = await ConnectFourServerApi.request(`players`, );
    // console.log("retrieved players:", data.players);
    return data.players;
  }

  /** Get a specific player */
  static async getPlayer(pId) {
    const data = await ConnectFourServerApi.request(`players/${pId}`, );
    // console.log("retrieved player:", data);
    return data.player;
  }

  /** Get all players for a specific game */
  static async getPlayersForGame(gameId) {
    const data = await ConnectFourServerApi.request(`games/${gameId}/players`, );
    // console.log("retrieved players:", data);
    return data.players;
  }

  /** Get all turns for a specific game */

  // DEPRECATED - TURNS NOW RETURN AS PART OF GETTING A GAME

  // static async getTurnsForGame(gameId) {
  //   const data = await ConnectFourServerApi.request(`games/${gameId}/turns`, );
  //   // console.log("retrieved turns:", data);
  //   return data.turns;
  // }

  /** Creates a new player
   * Expects: { name, color, ai }
   * Returns: { id, name, color, ai, createdOn }
   */
  static async createPlayer(player) {
    const data = await ConnectFourServerApi.request(`players`, player, 'POST' );
    // console.log("created player:", data);
    return data.player;
  }

  /** Creates a new game
   * Expects: Game dimensions: { height, width }
   * Returns: { id, boardId, boardData, boardWidth, boardHeight, gameState.
   *    placedPieces, winningSet, currPlayerId, createdOn, totalPlayers }
   */
  static async createGame(dimensions) {
    const data = await ConnectFourServerApi.request(`games`, dimensions, 'POST' );
    // console.log("created game:", data);
    return data.game;
  }

  /** Start (or restart) an existing game
   * Returns the started / restarted game */
  static async startGame(gameId) {
    const data = await ConnectFourServerApi.request(`games/${gameId}/start`, {}, 'POST' );
    // console.log("started game:", data);
    return data.game;
  }

  /** Attempts to drop a piece
   * Expects: gameId, playerId, col
   * Returns undefined if successful and throws error otherwise */
  static async dropPiece(gameId, playerId, col) {
    await ConnectFourServerApi.request(
      `games/${gameId}/cols/${col}`, { playerId: playerId }, 'POST'
    );
    return undefined;
  }

  /** Adds an array of players to a game
   * Expects: gameId, [ playerId ]
   * Returns: { playerCount }
   */
  static async addPlayersToGame(gameId, players) {
    const data = await ConnectFourServerApi.request(`games/${gameId}/players`, players, 'POST' );
    // console.log("updated player count:", data);
    return data;
  }

  /** Deletes a player (from the database completely)
   * Returns undefined if successful and throws error otherwise */
  static async deletePlayer(playerId) {
    await ConnectFourServerApi.request(`players/${playerId}`, {}, 'DELETE' );
    // console.log("player delete response:", data);
    return undefined;
  }

  /** Removes a player from a game
   * Returns undefined if successful and throws error otherwise */
  static async removePlayerFromGame(gameId, playerId) {
    await ConnectFourServerApi.request(`games/${gameId}/players/${playerId}`, {}, 'DELETE' );
    // console.log("removed player response:", data);
    return undefined;
  }

}
export default ConnectFourServerApi;