/** Routes for games */

import express, { Request, Response, Router } from "express";
import { ParamsDictionary } from 'express-serve-static-core';
import { CorsRequest } from "cors";

import { ensureLoggedIn, ensureGameOwnerOrAdmin } from "../middleware/auth";

import { BoardDimensionsInterface, Game } from "../models/game";

interface DropPieceRequestBody {
  playerId: string;
}

/**
 * I tried to type the request params, but setting explicit
 * types for the params here conflicted with the default types
 * being used in the middleware. I would likely need to create
 * a new type which is an OR of all my custom types and use that
 * uber-type within middleware which handles request containing
 * multiple param sets.
 */

// interface GameIdRequestParam {
//   gameId: string;
// }

// interface DropPieceRequestParams {
//   gameId: string;
//   colId: number;
// }

// interface DeletePlayerRequestParams {
//   gameId: string;
//   playerId: number;
// }

// TODO: Remove the return statements in the routers (they aren't needed)
const router: Router = express.Router();

/** Retrieves and returns a list of games */
router.get(
  "/",
  [ensureLoggedIn],
  async function (req: Request, res: Response) {
    const user = res.locals.user!;
    const games = await Game.getAll(user.id);
    return res.json({ games });
  }
);

/** Creates a new game */
router.post(
  "/",
  [ensureLoggedIn],
  async function (req: Request<{}, {}, BoardDimensionsInterface>, res: Response) {
    const user = res.locals.user!;
    const game = await Game.create(req.body, user.id);
    return res.status(201).json({ game });
  }
);

/** Retrieves the list of players in a game */
router.get(
  "/:gameid/players",
  [ensureLoggedIn, ensureGameOwnerOrAdmin],
  async function (req: Request, res: Response) {
    const players = await Game.getPlayers(req.params.gameid);
    return res.json({ players });
  }
);

/** Retrieves a specific game and its turns */
router.get(
  "/:gameid",
  [ensureLoggedIn, ensureGameOwnerOrAdmin],
  async function (req: Request, res: Response) {
    const game = await Game.getWithTurns(req.params.gameid);
    return res.json({ game });
  }
);

/** Removes a player from a game */
router.delete(
  "/:gameid/players/:playerid",
  [ensureLoggedIn, ensureGameOwnerOrAdmin],
  async function (req: Request, res: Response) {
    await Game.removePlayer(
      req.params.gameid, req.params.playerId
    );
    return res.json({ removed: req.params.playerId });
  }
);

/** Deletes a game */
router.delete(
  "/:gameid",
  [ensureLoggedIn, ensureGameOwnerOrAdmin],
  async function (req: Request, res: Response) {
    await Game.delete(req.params.gameid);
    return res.json({ deleted: req.params.gameid });
  }
);

/** Attempts to place a piece in the specific column in the specified game */
router.post(
  "/:gameid/cols/:colid",
  [ensureLoggedIn, ensureGameOwnerOrAdmin],
  async function (
    req: Request<ParamsDictionary, {}, DropPieceRequestBody>,
    res: Response
  ) {
    await Game.dropPiece(
      req.params.gameid,
      req.body.playerId,
      Number(req.params.colid)
    );
    return res.sendStatus(200);
  }
);

/** Starts or restarts the specified game (based on 'id' in URL param) */
router.post(
  "/:gameid/start",
  [ensureLoggedIn, ensureGameOwnerOrAdmin],
  async function (req: Request, res: Response) {
    await Game.start(req.params.gameid);
    return res.sendStatus(200);
  }
);

/** Adds one or more players to a game. */
router.post(
  "/:gameid/players",
  [ensureLoggedIn, ensureGameOwnerOrAdmin],
  async function (req: Request<ParamsDictionary, {}, string[]>, res: Response) {
    const result = await Game.addPlayers(req.params.gameid, req.body);
    return res.status(201).json({ playerCount: result });
  }
);

export { router as gamesRouter };