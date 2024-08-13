import * as jwt from "jsonwebtoken";
import { SECRET_KEY, DEFAULT_USER_ENABLED } from "../config";
import { UnauthorizedError } from "../expressError";
import { Request, Response, NextFunction } from "express";

import { UserAuthTokenDataInterface } from "../models/user";
import { Game } from "../models/game";
import { Player } from "../models/player";

// TODO: Add function comments

/**
 * Router Middleware
 * Inspects headers for authorization and pulls token, verifies it and
 * if valid, injects UserAuthTokenDataInterface into locals.user
 */
export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^[Bb]earer /, "").trim();
    try {
      const user = jwt.verify(token, SECRET_KEY) as UserAuthTokenDataInterface;
      res.locals.user = user;
    } catch (err) {
      /* ignore invalid tokens */
    }
  } else {
    if (DEFAULT_USER_ENABLED) {
      res.locals.user = {
        id: '976d455b-2a3b-47ce-82d8-e4ea2fb10a5e',
        isAdmin: false
      }
      return next();
    }
  }
  return next();
}

/**
 * Router Middleware
 * Throws UnauthorizedError if locals.user.id does not exist
 */
export function ensureLoggedIn(req: Request, res: Response, next: NextFunction) {
  if (res.locals.user?.id) return next();
  throw new UnauthorizedError(
    "Unauthorized: You must be logged in to access this endpoint."
  );
}

/**
 * Router Middleware
 * Throws UnauthorizedError if locals.user.isAdmin is not TRUE
 */
export function ensureAdmin(req: Request, res: Response, next: NextFunction) {
  if (res.locals.user?.isAdmin === true) return next();
  throw new UnauthorizedError(
    "Unauthorized: You must be logged in as an admin to access this endpoint."
  );
}

/**
 * Router Middleware
 * Ensures params.gameid is owned by res.locals.user.id or res.local.user.isAdmin is TRUE
 * Throws UnauthorizedError otherwise
*/
export async function ensureGameOwnerOrAdmin(req: Request, res: Response, next: NextFunction) {
  const currentUser = res.locals.user as UserAuthTokenDataInterface;
  if (currentUser.isAdmin === false) {
    await Game.verifyGameOwner(req.params.gameid, currentUser.id);
  }
  return next();
}

/**
 * Router Middleware
 * Ensures params.playerid is owned by res.locals.user.id or res.local.user.isAdmin is TRUE
 * Throws UnauthorizedError otherwise
*/
export async function ensurePlayerOwnerOrAdmin(req: Request, res: Response, next: NextFunction) {
  const currentUser = res.locals.user as UserAuthTokenDataInterface;
  if (currentUser.isAdmin === false) {
    await Player.verifyPlayerOwner(req.params.playerid, currentUser.id);
  }
  return next();
}