import { NotFoundError, UnauthorizedError } from "../expressError";
import { QueryResult } from "pg";
import db from "../db";

import { SQLQueries } from "../utilities/sql";
import { Game } from "./game";
import { Board } from "./board";


// const { sqlForPartialUpdate } = require("../helpers/sql");

/**
 * TODO:
 * - implement CountResultInterface
 * - implement QueryResult interfaces
 */

interface NewPlayerInterface {
  name: string;
  color: string;
  ai: boolean;
};

interface PlayerInterface extends NewPlayerInterface {
  id: string;
  createdOn: Date;
};

interface PlayerOwnerInterface {
  id: string;
  ownerId: string;
}

const delayInMs = 200;

function delay(ms : number) {
  /**
   * This creates a new Promise for delay purposes.
   * The Promise constructor takes two functions as parameters:
   * - resolve function (a function which if called resolves promise successfully)
   * - reject function (a function which if called resolves promise unsuccessfully)
   * In this case, we are only providing it the resolve function we will call
   * Our resolve function is an anonymous function which calls itself after a set time
   */

  return new Promise(resolve => setTimeout(resolve, ms));
}

class Player {

  /**
   * Create a player (from data), update db, return new player data.
   *
   * data should be { name, color, ai }
   *
   * Returns { id, name, color, ai, createdOn }
   * */
  static async create(
    newPlayer: NewPlayerInterface,
    userId: string
  ) : Promise<PlayerInterface> {

    console.log(`Player.create() called with newPlayer: ${newPlayer} and userId: ${userId}`);

    const result = await db.query(
      `INSERT INTO players (name, color, ai, owner_id)
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        name,
        color,
        ai,
        created_on AS "createdOn"`,
      [
        newPlayer.name,
        newPlayer.color,
        newPlayer.ai,
        userId
      ],
    );

    const player : PlayerInterface = result.rows[0];
    return player;
  }

  /**
   * Find all players
   * Returns [{ id, name, color, ai, createdOn }, ...]   *
   * */
  static async getAll(userId: string) {

    const sqlQuery = `
      SELECT ${SQLQueries.defaultPlayerCols}
      FROM players
      WHERE owner_id = $1
      ORDER BY created_on
    `
    const result = await db.query(sqlQuery, [userId]);

    // console.log("TO BE TYPED: result in Player.getAll");

    return result.rows;
  }

  /**
   * Given a player id, return data about player.
   *
   * Returns { id, name, color, ai, createdOn }
   *
   * Throws NotFoundError if not found.
   **/
  static async get(id: string) : Promise<PlayerInterface> {
    const result = await db.query(`
        SELECT id,
               name,
               color,
               ai,
               created_on AS "createdOn"
        FROM players
        WHERE id = $1
        ORDER BY created_on`, [id]);

    const player : PlayerInterface = result.rows[0];

    if (!player) throw new NotFoundError(`No player with id: ${id}`);

    return player;
  }

  /**
   * Delete given player from database; returns undefined.
   *
   * Throws NotFoundError if player not found.
   **/
  static async delete(id: string) {
    const result = await db.query(`
        DELETE
        FROM players
        WHERE id = $1
        RETURNING id`, [id]);
    const player = result.rows[0];

    if (!player) throw new NotFoundError(`No player: ${id}`);
  }

  /** Performs a turn for the specific player in the specified game.
   * Should only be called on behalf of AI players by the AI logic.
   */
  static async takeTurn(gameId: string, playerId: string) : Promise<undefined> {
    // console.log("takeTurn() called for playerId:", playerId);
    const game = await Game.get(gameId);
    const board = await Board.get(game.boardId);
    const availCols = await Board.getAvailColumns(game.boardId);
    // console.log("columns available:", availCols);
    await delay(delayInMs);
    let colToAttempt = availCols[Math.floor(Math.random() * availCols.length)];
    // console.log(`attempting to drop piece for AI player: ${playerId} at column: ${colToAttempt} ...`);
    await Game.dropPiece(gameId, playerId, colToAttempt);
  }

    /** Throws UnauthorizedError if specified game is not owned by specified user */
  static async verifyPlayerOwner(playerId: string, userId: string): Promise<void> {

    const result: QueryResult<PlayerOwnerInterface> = await db.query(`
      SELECT id, owner_id AS "ownerId"
      FROM players
      WHERE id = $1
    `, [playerId]);

    const player = result.rows[0];

    if (!player) throw new NotFoundError(`No player with id: ${playerId}`);

    if (player.ownerId !== userId) {
      throw new UnauthorizedError("Specified player is not owned by the current user.");
    }
  }
}

export { Player, NewPlayerInterface, PlayerInterface };
