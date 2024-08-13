"use strict";
/** Routes for players */

import express, { Request, Response, Router } from "express";

import { Player } from "../models/player";
import { ensureLoggedIn, ensurePlayerOwnerOrAdmin } from "../middleware/auth";

const router: Router = express.Router();

/** TODO:
 * - add schema validators
 */

/** Retrieves a list of all players
 * Returns array of player objects like { id, ai, color, name, created_on }
 */
router.get(
  "/",
  [ensureLoggedIn],
  async function (req: Request, res: Response) {
    const user = res.locals.user!;
    const players = await Player.getAll(user.id);
    return res.json({ players });
  }
);

/** Retrieves a specific player based on id
 * Returns a player object like { id, ai, color, name, created_on }
 */
router.get(
  "/:playerid",
  [ensureLoggedIn, ensurePlayerOwnerOrAdmin],
  async function (req: Request, res: Response) {
    const player = await Player.get(req.params.playerid);
    return res.json({ player });
  }
);

/** Creates a new player based on req object { name, color, ai }
 * Returns a player object like { id, name, color, ai, createdOn }
 */
router.post(
  "/",
  [ensureLoggedIn],
  async function (req: Request, res: Response) {
    const user = res.locals.user!;
    const player = await Player.create(req.body, user.id);
    return res.status(201).json({ player });
  }
);

/** Deletes a player
 * Returns the delete player's id
 */
router.delete(
  "/:playerid",
  [ensureLoggedIn, ensurePlayerOwnerOrAdmin],
  async function (req: Request, res: Response) {
    await Player.delete(req.params.playerid);
    return res.json({ deleted: req.params.playerid });
  }
);

export { router as playersRouter };