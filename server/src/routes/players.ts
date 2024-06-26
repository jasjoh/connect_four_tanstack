"use strict";
/** Routes for players */

import express, { Request, Response, Router } from "express";

import { Player } from "../models/player";

const router: Router = express.Router();

/** TODO:
 * - add schema validators
 */

/** Retrieves a list of all players
 * Returns array of player objects like { id, ai, color, name, created_on }
 */
router.get("/", async function (req: Request, res: Response) {
  const players = await Player.getAll();
  return res.json({ players });
});

/** Retrieves a specific player based on id
 * Returns a player object like { id, ai, color, name, created_on }
 */
router.get("/:id", async function (req: Request, res: Response) {
  const player = await Player.get(req.params.id);
  return res.json({ player });
});

/** Creates a new player based on req object { name, color, ai }
 * Returns a player object like { id, name, color, ai, createdOn }
 */
router.post("/", async function (req: Request, res: Response) {
  const player = await Player.create(req.body);
  return res.status(201).json({ player });
});

/** Deletes a player
 * Returns the delete player's id
 */
router.delete("/:id", async function (req: Request, res: Response) {
  await Player.delete(req.params.id);
  return res.json({ deleted: req.params.id });
});


export { router as playersRouter };