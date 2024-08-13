import * as jwt from "jsonwebtoken";
import { SECRET_KEY, DEFAULT_USER_ENABLED } from "../config";
import { UnauthorizedError } from "../expressError";
import { Request, Response, NextFunction } from "express";

import { UserAuthTokenDataInterface } from "../models/users";

// TODO: Add function comments

/**
 * Router Middleware
 * Inspects headers for authorization and pulls token, verifies it and
 * if valid, injects UserAuthTokenDataInterface into locals.user
 */
export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  console.log("authHeader discovered:", authHeader);
  if (authHeader) {
    const token = authHeader.replace(/^[Bb]earer /, "").trim();
    console.log("token discoverd:", token);
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
 * Ensures params.userId === res.locals.user.id or res.local.user.isAdmin is TRUE
 * Throws UnauthorizedError otherwise
*/
export function ensureCorrectUserOrAdmin(req: Request, res: Response, next: NextFunction) {
  const routeUserId = req.params.userId;
  const currentUser = res.locals.user as UserAuthTokenDataInterface;

  if (currentUser.id !== routeUserId && currentUser.isAdmin === false) {
    throw new UnauthorizedError();
  }
  return next();
}