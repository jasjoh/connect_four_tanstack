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

  console.log('authenticateJWT() called.');
  console.log(`req.cookies:`, req.cookies);

  let cookieToken = null;
  let cookiePayload = null;

  /** Header tokens deprecated */
  // let headerPayload = null;
  // let headerToken = null;
  // headerToken = getAuthTokenFromHeader(req);
  // if (headerToken !== null) {
  //   console.log("found headerToken:", headerToken);
  //   headerPayload = getTokenPayload(headerToken);
  //   if (headerPayload !== null) {
  //     console.log("found headerPayload:", headerPayload);
  //   }
  // }

  cookieToken = getAuthTokenFromCookie(req);
  if (cookieToken !== null) {
    console.log("found cookieToken:", cookieToken);

    try {
      cookiePayload = getTokenPayload(cookieToken);
    } catch (err: unknown) {
      if (err instanceof jwt.TokenExpiredError) {
        clearAuthTokenCookie(res);
        throw new UnauthorizedError('Token has expired. Please login again.');
      }
    /* ignore invalid tokens */
    }

    if (cookiePayload !== null) {
      console.log("found cookiePayload:", cookiePayload);
    }
  }

  if (cookiePayload !== null) {
    res.locals.user = cookiePayload;
  } else {
    if (DEFAULT_USER_ENABLED) {
      res.locals.user = {
        id: '976d455b-2a3b-47ce-82d8-e4ea2fb10a5e',
        isAdmin: false
      };
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

/** Retrieves the auth token from the authorization headers; returns null if not found */
const getAuthTokenFromHeader = (req: Request): string | null => {
  let token = null;
  if (req.headers.authorization) {
    token = req.headers.authorization.replace(/^[Bb]earer /, "").trim();
  }
  return token;
};

/** Retrieves the auth token from the HttpOnly authToken cookie; returns null if not found */
const getAuthTokenFromCookie = (req: Request): string | null => {
  console.log(`req.cookies.authToken:`, req.cookies?.authToken);
  let token = null;
  if (req.cookies.authToken) { token = req.cookies.authToken; }
  return token;
};

/** Verifies and decodes an auth token, returning its payload or null if fails */
const getTokenPayload = (token: string): UserAuthTokenDataInterface | null => {
  let payload = null;
  payload = jwt.verify(token, SECRET_KEY) as UserAuthTokenDataInterface;
  return payload;
};

/** Clears the 'authToken' cookie from an express response */
function clearAuthTokenCookie(res: Response) {
  res.cookie('authToken', '', { expires: new Date(0), httpOnly: true, secure: true });
}