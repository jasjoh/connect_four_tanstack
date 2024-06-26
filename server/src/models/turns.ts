import { QueryResult } from "pg";

import db from "../db";

export interface TurnInterface {
  turnId: number;
  gameId: string;
  playerId: string;
  location: string[];
  createdOnMs: number;
}

export class Turn {

  /**
   * Creates a new record of a turn taking place for a given game and player
   * @param gameId - The ID of the game this turn is associated with.
   * @param playerId - The Id of the player this turn is associated with.
   * @param location - The [y, x] coordinates of where the piece was placed.
   * Returns undefined.
   */
  static async create(
    gameId: string,
    playerId: string,
    location: number[]
  ) : Promise<undefined> {
    // console.log("Turns.create() called.")
    await db.query(`
        INSERT INTO game_turns ( game_id, player_id, location )
        VALUES ( $1, $2, $3 )
      `, [gameId, playerId, location]);
  }

  /**
   * Retrieves all the turns associated with a game and optionally a specific player
   * Returns an array of 0 or more turns in the form of TurnInterface[]
   */
  static async getAll(gameId: string, playerId?: string) : Promise<TurnInterface[]> {
    // console.log("Turns.getAll() called");

    let whereConditions : string = 'game_id = $1';
    let values = [gameId];
    if (playerId !== undefined) {
      whereConditions += ' AND player_id = $2';
      values.push(playerId);
    }
    const sqlQuery = `
      SELECT
        id as "turnId",
        game_id as "gameId",
        player_id as "playerId",
        location,
        (created_on_epoch * 1000) + created_on_milliseconds as "createdOnMs"
      FROM game_turns
      WHERE ${whereConditions}
      ORDER BY id
    `
    const result : QueryResult<TurnInterface> = await db.query(sqlQuery,values)
    return result.rows;
  }


  /**
   * Deletes all the turns associated with a game and optionally a specific player
   * Returns undefined if successful
   */
  static async deleteAll(gameId: string, playerId?: string) : Promise<undefined> {
    // console.log("Turns.deleteAll() called");

    let whereConditions : string = 'game_id = $1';
    let values = [gameId];
    if (playerId !== undefined) {
      whereConditions += ' AND player_id = $2';
      values.push(playerId);
    }
    const sqlQuery = `
      DELETE
      FROM game_turns
      WHERE ${whereConditions}
    `
    await db.query(sqlQuery, values);
  }
}