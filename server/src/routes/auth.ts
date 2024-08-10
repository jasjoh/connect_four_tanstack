import express, { Request, Response, Router } from "express";
import * as jsonschema from "jsonschema";

import userRegisterSchema from "../schemas/userRegister.json";

import { BadRequestError } from "../expressError";
import { createToken } from "../utilities/tokens";
import { User } from "../models/users";

export const router: Router = express.Router();

router.post("/register", async function (req, res, next) {
  console.log("post to /auth/register called");

  const validator = jsonschema.validate(
    req.body,
    userRegisterSchema,
    {required: true}
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs.join('\\n'));
  }
  const userModel = User.getInstance();
  const newUser = await userModel.register({ ...req.body, isAdmin: false });
  const token = createToken(newUser);
  return res.status(201).json({ token });
});