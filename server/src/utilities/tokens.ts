import * as jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config";

import { UserInterface } from "../models/user";

/** expressed in seconds or a string describing a time span
 * zeit/ms. Eg: 60, "2 days", "10h", "7d" */
const tokenExpiration : string|number = 10;
export const tokenMaxAge = 100000; // 100 seconds
// export const tokenMaxAge = 360000; // 1 hour

export const createToken = (user: UserInterface) => {
  const payload = {
    id: user.id,
    isAdmin: user.isAdmin === true,
  };

  return jwt.sign(payload, SECRET_KEY, { expiresIn: 15 } );
}