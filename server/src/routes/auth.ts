import { Router } from "express";
import * as jsonschema from "jsonschema";

import authRegisterSchema from "../schemas/authRegister.json";
import authTokenSchema from "../schemas/authToken.json";

import { BadRequestError } from "../expressError";
import { createToken } from "../utilities/tokens";
import { User } from "../models/users";

export const router: Router = Router();

/**
 * Endpoint for retrieving a new auth token
 * Requires POST body of { username, password }
 * Success returns 201 with auth token in response body
 */
router.post("/token", async function (req, res, next) {

  const validator = jsonschema.validate(
    req.body,
    authTokenSchema,
    {required: true}
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs.join(' | '));
  }

  const { username, password } = req.body;
  const userModel = User.getInstance();
  const user = await userModel.authenticate(username, password);
  const token = createToken(user);
  return res.json({ token });
});

/**
 * Endpoint for registering new users
 * Requires POST body of { username, password, email }
 * Success returns 201 with auth token in response body
 */
router.post("/register", async function (req, res, next) {

  const validator = jsonschema.validate(
    req.body,
    authRegisterSchema,
    {required: true}
  );
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs.join(' | '));
  }
  const userModel = User.getInstance();
  const newUser = await userModel.register({ ...req.body, isAdmin: false });
  const token = createToken(newUser);
  return res.status(201).json({ token });
});