import * as jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config";

import { UserInterface } from "../models/user";

export const createToken = (user: UserInterface) => {
  const payload = {
    id: user.id,
    isAdmin: user.isAdmin === true,
  };

  return jwt.sign(payload, SECRET_KEY, { expiresIn: 15 } );
}