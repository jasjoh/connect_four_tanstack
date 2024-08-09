import * as jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config";

export const createToken = (user) => {
  const payload = {
    username: user.username,
    isAdmin: user.isAdmin === true,
  };

  return jwt.sign(payload, SECRET_KEY);
}