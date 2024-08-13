/** Override to explicitly type res.locals.user */

import { UserAuthTokenDataInterface } from "../models/users"

declare global {
  namespace Express {
    interface Locals {
      user?: UserAuthTokenDataInterface;
    }
  }
}