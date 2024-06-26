import { NotFoundError } from "../expressError";
import {
  TooFewPlayers, PlayerAlreadyExists,
  InvalidGameState, InvalidPiecePlacement, NotCurrentPlayer
} from "../utilities/gameErrors";
import { SQLQueries } from "../utilities/sqlQueries";
import { CountResultInterface } from "../utilities/commonInterfaces";
import { fisherSort } from "../utilities/utils";

import db from "../db";
import { Player, PlayerInterface } from "./player";
import {
  Board,
  BoardCellFinalStateInterface,
  BoardDataType,
  BoardDimensionsInterface
} from "./board";
import { Turn, TurnInterface } from "./turns";

import { QueryResult } from "pg";
import _ from "lodash";

/** Game model
 * Supports CRUD operations + Game Turn Logic
 * Games are composed of:
 * - id: GUID
 * - height and width: numbers
 * - gameState: numbers {0: not started, 1: started, 2: won, 3: tied}
 * - placedPieces: array of coordinates, e.g. [[0, 1], [0, 2]]
 * - winningSet: array of coordinates, e.g. [[0, 1], [0, 2]]
 * - currPlayerId: the id (GUID) of the current player
 * - totalPlayers: the total number of players added to the game
 * - createdOn: the datetime for when the game was created
 * - board: a matrix of board cell states: { playerId, validCoordSets }
 * --- validCoordSets: array of coordinates, e.g. [[0, 1], [0, 2]]
 * --- note that board cell states are null until the game is started
 *
 */

/**
 * TODO:
 * - update select statement to return as camelCase + update interfaces
 */

interface GameUpdateInterface {
  boardId?: string;
  gameState?: number;
  placedPieces?: number[][] | null;
  winningSet?: number[][] | null;
  currPlayerId?: string | null;
}

interface GameInterface {
  id: string;
  gameState: number;
  placedPieces: number[][] | null;
  boardId: string,
  boardData: BoardDataType;
  boardWidth: number;
  boardHeight: number;
  winningSet: number[][] | null;
  currPlayerId: string | null;
  createdOn: Date;
  totalPlayers: number;
}

export interface GameWithTurnsInterface {
  gameData: GameInterface;
  gameTurns: TurnInterface[];
}

interface StartedGameInterface extends GameInterface {
  currPlayerIid: string;
}

interface GamePlayersInterface extends PlayerInterface {
  playOrder: number | null;
}

class Game {

  /**
   * Instantiates a new game based on params and returns it.
   *
   * Params are optional, but should be { height, width }
   *
   * Returns { ... game object ... }
   * */
  static async create(
    boardDimensions: BoardDimensionsInterface = { height: 7, width: 6 }
  ): Promise<GameInterface> {

    /** TODO:
     * - input validation
     * - error handling
     * - see if can be combined into single SQL statement
     */

    // console.log("Game.create() called");

    const board = await Board.create(boardDimensions);

    // console.log("board created:", board);

    let result: QueryResult<GameInterface> = await db.query(`
      INSERT INTO games ( board_id )
      VALUES ( $1 )
      RETURNING *
      `, [board.id]
    );

    let game = result.rows[0];

    game = await Game.get(game.id);

    return game;
  }

  /**
   * Creates a new game using an existing board ID
   * Returns the created game as GameInterface
   * */
  static async createWithBoard(
    boardId: string
  ): Promise<GameInterface> {

    /** TODO:
     * - input validation
     * - error handling
     * - see if can be combined into single SQL statement OR
     * - see if can be extended version of create() (DRY principle)
     */

    let result: QueryResult<GameInterface> = await db.query(`
      INSERT INTO games ( board_id )
      VALUES ( $1 )
      RETURNING *
      `, [boardId]
    );

    let game = result.rows[0];

    game = await Game.get(game.id);

    return game;
  }

  /**
   * Retrieves an array of all games with summary information
   * Returns [{ id, gameState, createdOn }, ...]   *
   * */
  static async getAll(): Promise<GameInterface[]> {

    const result: QueryResult<GameInterface> = await db.query(`
        SELECT
          id,
          game_state AS "gameState",
          created_on AS "createdOn",
          COUNT(game_players.game_id)::int AS "totalPlayers"
        FROM games
        LEFT JOIN game_players on games.id = game_players.game_id
        GROUP BY games.id, games.game_state, games.created_on
        ORDER BY created_on`
    );

    return result.rows;
  }

  /**
   * Given a game id, return data about game.
   *
   * Returns { ... game object ... }
   *
   * Throws NotFoundError if not found.
   **/
  static async get(gameId: string): Promise<GameInterface> {
    const result: QueryResult<GameInterface> = await db.query(`
        SELECT
          games.id,
          boards.id AS "boardId",
          boards.data AS "boardData",
          boards.width as "boardWidth",
          boards.height as "boardHeight",
          games.game_state AS "gameState",
          games.placed_pieces AS "placedPieces",
          games.winning_set AS "winningSet",
          games.curr_player_id AS "currPlayerId",
          games.created_on AS "createdOn",
          COUNT(game_players.game_id)::int as "totalPlayers"
        FROM games
        LEFT OUTER JOIN game_players ON games.id = game_players.game_id
        LEFT JOIN boards ON games.board_id = boards.id
        WHERE games.id = $1
        GROUP BY games.id, boards.id, boards.height, boards.width, boards.data,
                  games.game_state, games.placed_pieces, games.winning_set,
                  games.curr_player_id, games.created_on
    `, [gameId]);

    const game = result.rows[0];
    // console.log("game found:", game);

    if (!game) throw new NotFoundError(`No game with id: ${gameId}`);

    return game;
  }

  /**
   * Given a game id, return data about the game and it's turns
   *
   * Returns { game: { game object }, turns: { turns object } }
   *
   * Throws NotFoundError is no matching game is found
   */
  static async getWithTurns(gameId: string): Promise<GameWithTurnsInterface> {
    try {
      await db.query('BEGIN');
      const game = await this.get(gameId);
      const turns = await Turn.getAll(gameId);
      await db.query('COMMIT');
      return { gameData: game, gameTurns: turns };
    } catch (e) {
      await db.query('ROLLBACK');
      throw e;
    }
  }

  /**
   * Updates a game to a given state represented by a GameUpdateInterface
   * Returns the updated GameInterface
   */
  static async update(
    gameId: string,
    gameUpdate: GameUpdateInterface
  ): Promise<GameInterface> {

    // console.log("Game.update() called.");
    const keys = Object.keys(gameUpdate);

    // for every key (e.g. placedPieces)
    // add 'key = $num' to an array
    // join these elements of the clause together into a string with ', '
    // start at 2 (0 + 2) so we reserve $1 for the game ID
    // TODO: Convert camelCase to snake_case

    const setClause = keys.map((key, index) => `${_.snakeCase(key)} = $${index + 2}`).join(', ');
    const sqlQuery = `UPDATE games SET ${setClause} WHERE id = $1`;
    // console.log("update sql query established:", sqlQuery);

    const values = keys.map(key => gameUpdate[key as keyof GameUpdateInterface]);
    values.unshift(gameId);
    // console.log("values for token replacement established:", values);

    await db.query(sqlQuery, values);
    const game = await Game.get(gameId);

    // console.log("Update game:", game);

    return game;
  }

  /**
   * Delete given game from database; returns undefined.   *
   * Throws NotFoundError if game not found.
   **/
  static async delete(gameId: string) {
    const result: QueryResult<GameInterface> = await db.query(`
        DELETE
        FROM games
        WHERE id = $1
        RETURNING id`, [gameId]);
    const game = result.rows[0];

    if (!game) throw new NotFoundError(`No game: ${gameId}`);
  }

  /** Adds a player to an existing game
   * Throws error if game or player doesn't exist or player already added
   * Returns updated current player count if successful
   */
  static async addPlayers(gameId: string, players: string[]): Promise<number> {

    // console.log("Game.addPlayers() called w/ players:", players);

    let sqlQueryValues: string = '';

    for (let i = 0; i < players.length; i++) {
      i === players.length - 1 ? sqlQueryValues += `($1, $${i + 2})` : sqlQueryValues += `($1, $${i + 2}),`;
    }

    try {
      await db.query(
        `
        INSERT INTO game_players (game_id, player_id)
        VALUES ${sqlQueryValues}
        RETURNING
          player_id as "playerId",
          game_id as "gameId",
          play_order as "playOrder"
        `
        , [gameId, ...players]
      );
    } catch (err: unknown) {
      const postgresError = err as { code?: string, message: string; };
      if (postgresError.code === '23505') {
        throw new PlayerAlreadyExists(
          `One or more players have already been added to game ${gameId}`
        );
      } else { throw err; }
    }

    const result: QueryResult<CountResultInterface> = await db.query(`
        SELECT COUNT(*)::int
        FROM game_players
        WHERE game_id = $1
    `, [gameId]);

    // console.log("players added to game; new count:", result);

    return result.rows[0].count;
  }

  /**
   * Removes a player from a game; returns undefined.
   * Throws NotFoundError if game or player not found.
   * Returns an updated count of players in the game if successful.
   **/
  static async removePlayer(gameId: string, playerId: string): Promise<number> {
    const queryGPIResult: QueryResult<GamePlayersInterface> = await db.query(`
        DELETE
        FROM game_players
        WHERE player_id = $1 AND game_id = $2
        RETURNING player_id as "playerId"`, [playerId, gameId]);
    const removedPlayer = queryGPIResult.rows[0];

    if (!removedPlayer) throw new NotFoundError(`No such player or game.`);

    const queryCRIResult: QueryResult<CountResultInterface> = await db.query(`
        SELECT COUNT(*)::int
        FROM game_players
        WHERE game_id = $1
    `, [gameId]);

    // console.log("result of getting count from game_players:", queryCRIResult);

    return queryCRIResult.rows[0].count;
  }

  /**
   * Retrieves an array of all players in a game
   */
  static async getPlayers(gameId: string): Promise<GamePlayersInterface[]> {
    // console.log("Game.getPlayers() called with gameId:", gameId)
    const sqlQuery = `
      SELECT
        ${SQLQueries.defaultPlayerCols},
        game_players.play_order as "playOrder"
      FROM players
      INNER JOIN game_players
      ON game_players.player_id = players.id
      WHERE game_players.game_id = $1
      ORDER BY players.created_on
    `;
    const result: QueryResult<GamePlayersInterface> = await db.query(sqlQuery, [gameId]);
    // console.log("result rows of selecting game players:", result.rows);
    return result.rows;
  }

  /** Starts or restarts a game (conductor function)
   * - initializes (or resets) boards state
   * - sets (or resets) play order
   * - updates game state to started
   * - unless indicated otherwise, calls Game.nextTurn()
   * Throws error if:
   * - there are insufficient players to start a game
   * - sub functions throw errors
   * Returns undefined
  */
  static async start(gameId: string, nextTurn: boolean = true): Promise<undefined> {

    // console.log("Game.start() called.");

    const game = await Game.get(gameId);

    if (game.totalPlayers < 2) {
      throw new TooFewPlayers(`Game (${gameId}) has too few players to be started.`);
    }

    const gamePlayers = await Game.getPlayers(gameId);

    // initialize the game and start the first turn if directed to
    await _resetGameData();
    await Board.reset(game.boardId);
    await Turn.deleteAll(gameId);

    await _setPlayOrder();

    await Game.update(gameId, { gameState: 1 });

    if (nextTurn) Game.nextTurn(gameId);
    return undefined;

    /**
     * Internal function for Game.start()
     * Called as part of starting a new game to select play order
     * - Queries for all players in a game
     * - Randomly sorts those players and selects one
     * - Sets play order based on sorted order and sets player at index 0
     * to be the current player
     */
    async function _setPlayOrder(): Promise<undefined> {
      let gamePlayerIds = gamePlayers.map(p => p.id);
      const sortedGamePlayerIds = fisherSort(gamePlayerIds) as string[];

      // console.log("playerIds after randomly sorting:", sortedGamePlayerIds);

      // set play order
      // console.log("setting play order in game_players.");

      let sqlQuery = 'UPDATE game_players SET play_order = CASE ';
      for (let i = 0; i < sortedGamePlayerIds.length; i++) {
        sqlQuery += `WHEN player_id = '${sortedGamePlayerIds[i]}' THEN ${i} `;
      }
      sqlQuery += `END WHERE game_id = $1`;
      await db.query(sqlQuery, [gameId]);

      // console.log("play order set in game_players");

      return;
    }

    /** Internal function for Game.start()
     * Calls the DB to reset the placedPieces and winningSet for a game to [][]
     */
    async function _resetGameData(): Promise<undefined> {
      await db.query(`
        UPDATE games
        SET
          placed_pieces = '{}',
          winning_set = '{}'
        WHERE id = $1
      `, [gameId]);
    }
  }

  /**
   * Initializes a new turn for a given game; accepts the id of that game
   * Updates current player and if it's an AI, calls that player's aiTakeTurn()
   * Returns undefined
   */
  static async nextTurn(gameId: string) {
    // console.log("Game.nextTurn called w/ gameId:", gameId);
    /**
     * Core Logic:
     * - determines current player
     * -- if current player is AI, calls that player's aiTakeTurn() callback
     * -- if current player is human, awaits that player's pieceDrop
     */

    //TODO: Add check to ensure game_state is 1 and throw error if not

    let game = await Game.get(gameId);
    let gamePlayers = await Game.getPlayers(gameId);
    let currPlayerId = game.currPlayerId;

    // update current player
    const nextPlayer = await _updateCurrentPlayer(gamePlayers);
    if (nextPlayer.ai === true) { await Player.takeTurn(gameId, nextPlayer.id); }

    /**
     * Internal function for Game.nextTurn()
     * Updates the current player
     * - If there is no current player (new game), sets it to play order 0
     * - If it's the last player in player order, sets it to play order 0
     */
    async function _updateCurrentPlayer(gamePlayers: GamePlayersInterface[]): Promise<GamePlayersInterface> {

      let nextPlayer: GamePlayersInterface;
      const currPlayer = gamePlayers.find(
        p => p.id === currPlayerId
      );

      // if current player is not set or last player, next player is the turn 0 player
      if (currPlayer === undefined || currPlayer.playOrder === gamePlayers.length - 1) {

        const turnZeroPlayer = gamePlayers.find(p => p.playOrder === 0);
        if (turnZeroPlayer === undefined) {
          throw new Error("Unable to find turn zero player.");
        }

        // next player will be turn 0 player
        nextPlayer = turnZeroPlayer;

      } else {

        // we are not the last player, so just go to next player in order
        const currPlayerPlayOrder = currPlayer.playOrder;

        if (currPlayerPlayOrder === null) {
          throw new Error("Player play order improperly initialized.");
        }

        const potentialNextPlayer = gamePlayers.find(
          o => o.playOrder === currPlayerPlayOrder + 1
        );

        if (potentialNextPlayer === undefined) {
          throw new Error("Unable to find next player.");
        }

        // next player is simply the next player in play order
        nextPlayer = potentialNextPlayer;

      }

      // console.log("new current player selected:", nextPlayer);

      const queryGIResult = await db.query(`
          UPDATE games
          SET curr_player_id = $2
          WHERE id = $1
          RETURNING games.id, games.curr_player_id as "currPlayerId"
      `, [gameId, nextPlayer.id]);

      // console.log("game updated w/ curr player set:", queryGIResult.rows[0]);

      return nextPlayer;
    }
  }

  /**
   * Retrieves the game turns for a given game ID
   * Game turns are an array of TurnInterface objects
   * If not no game turns exist, returns null
   */
  static async getTurns(gameId: string): Promise<TurnInterface[]> {
    // console.log("getTurns() called");
    const turns = await Turn.getAll(gameId);
    return turns;
  }

  /**
   * Attempts to drop a piece on behalf of a player at a given column
   * Accepts a game ID, player ID and column to drop in
   * If successful, adds turn record and checks for game end
   * If game is not over, starts next turn (to switch to next player)
   * Returns true if the drop was successful, otherwise false   *
   */
  static async dropPiece(gameId: string, playerId: string, col: number): Promise<GameInterface> {
    /**
     * Core Logic:
     * - determine validity of drop
     * - place piece if valid (update board state)
     * - add game turn record
     * - check for end game:
     * -- if end game, update state accordingly and you're done
     * -- if game is not ended, call nextTurn for provide gameId
     */

    // console.log(`dropPiece() called with
    //   gameId: ${gameId}, playerId: ${playerId}, col: ${col}`
    // );

    let game = await Game.get(gameId);
    const validGame = _validateGameState(game);

    if (col < 0 || col > validGame.boardWidth - 1) {
      throw new InvalidPiecePlacement('Specified column is out of bounds.');
    }

    const targetRow = _findEmptyCellInColumn(validGame, col);

    const pieceLocation = [targetRow, col];

    await _addToBoard(validGame, playerId, pieceLocation);
    await _addToPlacedPieces(validGame, pieceLocation);

    await Turn.create(gameId, playerId, pieceLocation);

    // board updated so let's refresh in-memory state in prep for checking game end
    game = await Game.get(gameId);

    game = Game.checkForGameEnd(game);

    // console.log("checkForGameEnd() called and updated game is:", game);

    await _refreshGameState(game);

    if (game.gameState === 1) {
      // console.log("Game has not ended so calling nextTurn()");
      // start the next turn
      await Game.nextTurn(gameId);
    }

    return game;

    /** Internal function for Game.dropPiece()
     * Validates games is in state where a piece can be dropped by the current player. */
    function _validateGameState(game: GameInterface): StartedGameInterface {
      if (game === null) throw new NotFoundError(`No game with id: ${gameId}`);
      if (game.gameState !== 1) {
        throw new InvalidGameState('Game is not started or has finished.');
      }
      if (game.currPlayerId !== playerId) {
        throw new NotCurrentPlayer(`${playerId} is not the current player.`);
      }
      return game as StartedGameInterface;
    }

    /** Internal function for Game.dropPiece()
     * Finds an empty row in a given column to place a piece. */
    function _findEmptyCellInColumn(
      validGame: StartedGameInterface,
      col: number
    ): number {

      // console.log(`_findEmptyCellInColumn(${col}) called.`);

      // check if the column is full and return 'null' if true
      if (validGame.boardData[0][col].playerId !== null) {
        throw new InvalidPiecePlacement('Column is full.');
      }

      let row = 0; // start at first row

      // loop through rows top to bottom until we either:
      // -- find a non-null cell (and return the slot above)
      // -- reach the last cell and return it
      while (row < validGame.boardHeight) {
        if (validGame.boardData[row][col].playerId !== null) {
          // console.log("found a piece at row, col", row, " ", col);
          // console.log("returning the row above:", row - 1);
          // console.log(`returning ${row} - 1.`);
          return row - 1;
        }
        row++;
      }
      //console.log(`returning validGame.boardHeight (${validGame.boardHeight}) - 1:`, validGame.boardHeight - 1);
      return validGame.boardHeight - 1;
    }

    /** Internal function for Game.dropPiece()
     * Adds the specified playerId to the specified location in the specified Game
     * */
    async function _addToBoard(
      game: StartedGameInterface,
      playerId: string,
      location: number[]
    ): Promise<undefined> {

      game.boardData[location[0]][location[1]].playerId = playerId;
      await Board.update(game.boardId, game.boardData);

    }

    /** Internal function for Game.dropPiece()
     * Adds the specified location to the placed pieces for the specified game */
    async function _addToPlacedPieces(
      game: GameInterface,
      location: number[]
    ): Promise<undefined> {

      if (game.placedPieces === null) {
        game.placedPieces = [[location[0], location[1]]];
      } else {
        game.placedPieces.push([location[0], location[1]]);
      }

      await Game.update(game.id, { placedPieces: game.placedPieces });

    }

    /** Internal function for Game.dropPiece()
     * Refreshes DB game state based on in-memory game state. Sets winning set if won. */
    async function _refreshGameState(game: GameInterface): Promise<undefined> {
      if (game.gameState === 2) {
        if (game.currPlayerId !== playerId) {
          throw new Error("Game is won, but not by current player. Something went wrong.");
        }
        // console.log("updating game gameState in DB since winner was found");
        await Game.update(game.id, { winningSet: game.winningSet, gameState: 2 });
      }

      // check for tie
      if (game.gameState === 3) {
        // console.log("updating game gameState in DB since tie was found");
        await Game.update(game.id, { gameState: 3 });
        return;
      }
    }
  }

  /** Checks to see if a game has ended and if there is a winner, what
   * the winning pieces are and who the winning player is.
   * Accepts a game state (CheckEndGameInterface)
   * Returns an end game state (gameInterface)
   */
  static checkForGameEnd(game: GameInterface): GameInterface {

    // console.log("checkForGameEnd() called with game:", game);

    if (game.placedPieces === null) { throw new Error("placedPiece is null."); };

    // check each player game piece to see if one of it's valid coord sets contains
    // all the same player IDs
    for (let i = 0; i < game.placedPieces.length; i++) {
      const py = game.placedPieces[i][0];
      const px = game.placedPieces[i][1];
      // console.log("checking placed piece at xy", py, px);

      // grab the player associated with this piece
      const playerId = game.boardData[py][px].playerId;

      // check each valid coord set for this played game piece
      for (let j = 0; j < game.boardData[py][px].validCoordSets.length; j++) {

        // grab the coordinate set to evaluate
        const validCoordSet = game.boardData[py][px].validCoordSets[j];

        // check if the playerId for this played piece is not null AND
        // check if the playerId for every other piece at each coordinate
        // in the valid coordinate set is also not null AND the same player ID
        if (playerId !== null &&
          validCoordSet.every(
            c => {
              return (
                game.boardData[c[0]][c[1]].playerId !== null &&
                game.boardData[c[0]][c[1]].playerId === playerId);
            }
          )
        ) {
          // console.log("checkForGameEnd() determined game is won");
          game.gameState = 2;
          game.winningSet = validCoordSet;
          return game as GameInterface;
        }
      }
    }

    // check for tie
    if (game.boardData[0].every(cell => cell.playerId !== null)) {
      // console.log("checkForGameEnd() determined game is tied");
      game.gameState = 3;
      return game as GameInterface;
    }

    // console.log("checkForGameEnd() determined game should continue");
    return game as GameInterface;
  }
}

export {
  Game,
  GameInterface,
  GameUpdateInterface,
  BoardDimensionsInterface,
  BoardCellFinalStateInterface,
  BoardDataType
};
