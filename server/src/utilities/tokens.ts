import * as jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config";

import { UserInterface } from "../models/users";

export const createToken = (user: UserInterface) => {
  const payload = {
    userId: user.id,
    isAdmin: user.isAdmin === true,
  };

  return jwt.sign(payload, SECRET_KEY);
}