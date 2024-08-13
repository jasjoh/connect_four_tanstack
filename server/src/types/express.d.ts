/** Override to explicitly type res.locals.user */

import { UserAuthTokenDataInterface } from "../models/user"

declare global {
  namespace Express {
    interface Locals {
      user?: UserAuthTokenDataInterface;
    }
  }
}