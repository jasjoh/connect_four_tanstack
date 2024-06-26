"use strict";
/** Routes for games */

import express, { Request, Response, Router } from "express";

import { Game } from "../models/game";

interface DropPieceRequestBody {
  playerId: string;
}

const router: Router = express.Router();

/** Retrieves a list of all games
 * Returns array of game objects like { id, ai, color, name, createdOn }
 */
router.get("/", async function (req: Request, res: Response) {
  const games = await Game.getAll();
  return res.json({ games });
});

/** Retrieves the list of players in a game
 * Returns an array of player objects like { id, ai, color, name, createdOn }
 */
router.get("/:id/players", async function (req: Request, res: Response) {
  const players = await Game.getPlayers(req.params.id);
  return res.json({ players });
});

/** Retrieves the list of all turns associated with a game
 * Returns an array of turn objects like { id, gameId, playerId, location, createdOnEpoch }
 */
router.get("/:id/turns", async function (req: Request, res: Response) {
  const turns = await Game.getTurns(req.params.id);
  return res.json({ turns });
});

/** Retrieves a specific game and it's turns based on game id
 * Returns a game object like {
 *  gameData {
 *    id, boardId, boardData, boardWidth, boardHeight, gameState
 *    placedPieces, winningSet, currPlayerId, createdOn, totalPlayers
 * }
 *  gameTurns [ { turnId, gameId, playerId, location, createdOnMs } ]
 * }
 */
router.get("/:id", async function (req: Request, res: Response) {
  const game = await Game.getWithTurns(req.params.id);
  return res.json({ game });
});

/** Removes a player from a game
 * Returns the removed player's ID
 */
router.delete("/:gameid/players/:playerid", async function (req: Request, res: Response) {
  const result = await Game.removePlayer(req.params.gameid, req.params.playerid);
  return res.json({ removed: req.params.playerid });
});

/** Deletes a game
 * Returns the delete game's id
 */
router.delete("/:id", async function (req: Request, res: Response) {
  await Game.delete(req.params.id);
  return res.json({ deleted: req.params.id });
});

/** Attempts to place a piece in the specific column in the specified game
 * Returns 200 OK for valid piece drop location
 */
router.post("/:gameid/cols/:colid", async function (
    req: Request<{ gameid: string, colid: number}, {}, DropPieceRequestBody>,
    res: Response
  ) {
  const result = await Game.dropPiece(
    req.params.gameid,
    req.body.playerId,
    req.params.colid);
  return res.sendStatus(200);
});

/** Starts or restarts the specified game (based on 'id' in URL param)
 * Returns 200 OK with no body if successful
 */
router.post("/:id/start", async function (req: Request, res: Response) {
  // console.log("Start game called with gameId:", req.params.id);
  await Game.start(req.params.id);
  return res.sendStatus(200);
});

/** Adds a player to a game.
 * Game is specified via 'id' URL param. Player is specified via body like { id }
 * Returns updated count of players
 */
router.post("/:id/players", async function (req: Request, res: Response) {
  // console.log("add players called with playerId, gameId:", req.body.id, req.params.id);
  const result = await Game.addPlayers(req.params.id, req.body);
  return res.status(201).json({ playerCount: result });
});

/** Creates a new game based on req object { name, color, ai }
 * Returns a game object like { id, name, color, ai, createdOn }
 */
router.post("/", async function (req: Request, res: Response) {
  const game = await Game.create(req.body);
  return res.status(201).json({ game });
});

export { router as gamesRouter };

// module.exports = router;