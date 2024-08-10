import * as jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config";
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
  if (authHeader) {
    const token = authHeader.replace(/^[Bb]earer /, "").trim();

    try {
      const user = jwt.verify(token, SECRET_KEY) as UserAuthTokenDataInterface;
      res.locals.user = user;
    } catch (err) {
      /* ignore invalid tokens */
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
  throw new UnauthorizedError();
}

/**
 * Router Middleware
 * Throws UnauthorizedError if locals.user.isAdmin is not TRUE
 */
export function ensureAdmin(req: Request, res: Response, next: NextFunction) {
  if (res.locals.user?.isAdmin === true) return next();
  throw new UnauthorizedError();
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