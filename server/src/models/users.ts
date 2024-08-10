import { UnauthorizedError, NotFoundError, BadRequestError } from "../expressError";
import * as bcrypt from "bcrypt";
import { BCRYPT_WORK_FACTOR } from "../config";

import db from "../db";
import { QueryResult } from "pg";
import { sqlForPartialUpdate } from "../utilities/sql";

interface UserBasicsInterface {
  username: string;
  email: string;
  isAdmin: boolean,
}

export interface NewUserInterface extends UserBasicsInterface {
  password: string;
};

export interface UserInterface extends UserBasicsInterface {
  id: string;
  createdOn: Date;
};

interface UserWithPasswordInterface extends UserInterface, NewUserInterface { };

export interface UserAuthTokenDataInterface {
  id: string;
  isAdmin: boolean;
}

export class User {

  private static instance: User;

  private constructor() { }

  static getInstance(): User {
    if (!this.instance) {
      this.instance = new User();
    }
    return this.instance;
  }

  /**
   * Registers (creates) a new user in the database and returns it.
   * Throws BadRequestError if username and / or email is not unique.
   * */
  async register(newUser: NewUserInterface): Promise<UserInterface> {

    // TODO: Verify typing of QueryResult
    const duplicatePropCheck: QueryResult<{ username: string; }> = await db.query(`
      SELECT username
      FROM users
      WHERE username = $1 OR email = $2`, [newUser.username, newUser.email],
    );

    if (duplicatePropCheck.rows.length > 0) {
      throw new BadRequestError(`Duplicate username and / or email`);
    }

    const hashedPassword = await bcrypt.hash(newUser.password, BCRYPT_WORK_FACTOR);

    const result: QueryResult<UserInterface> = await db.query(
      `
        INSERT INTO users (
          username,
          password,
          email,
          is_admin
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          username,
          email,
          is_admin AS "isAdmin",
          created_on AS "createdOn"
      `,
      [
        newUser.username,
        hashedPassword,
        newUser.email,
        newUser.isAdmin
      ],
    );

    const createdUser = result.rows[0];
    return createdUser;

  }

  /**
   * Retrieves a user.
   * Throws NotFoundError if user does not exist.
   */
  async get(userId: string): Promise<UserInterface> {
    const result: QueryResult<UserInterface> = await db.query(
      `
        SELECT
          id,
          username,
          email,
          is_admin AS "isAdmin",
          created_on AS "createdOn"
        FROM users
        WHERE
          id = $1
      `,
      [userId],
    );

    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${userId}`);

    return user;
  }

  /**
   * Updates any of username, email or isAdmin properties of a user
   * Throws a BadRequestError if none of the above or unexpected properties are provided
   * Throws a NotFoundError is the specified userId is not found
   * Returns the updated user
   */
  async updateBasics(userId: string, data: UserBasicsInterface): Promise<UserInterface> {

    const validCols = ['username', 'email', 'isAdmin'];
    const onlyValidCols = Object.keys(data).every(col => {
      validCols.includes(col);
    });

    if (!onlyValidCols) {
      throw new BadRequestError(`Invalid update. Only username, email and isAdmin updates are supported.`);
    }

    const { setCols, values } = sqlForPartialUpdate(data);
    const userIdToken = `$${values.length + 1}`;
    const querySql = `
      UPDATE users
      SET ${setCols}
      WHERE id = ${userIdToken}
      RETURNING
        id,
        username,
        email,
        is_admin as "isAdmin",
        created_on AS "createdOn"
    `;
    const result: QueryResult<UserInterface> = await db.query(querySql, [...values, userId]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user with id: ${userId}`);

    return user;
  }

  /** Deletes the specified user and returns NotFoundError if not found */
  async deleteUser(userId: string): Promise<void> {
    let result = await db.query(`
        DELETE
        FROM users
        WHERE userId = $1
        RETURNING username`, [userId],
    );
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user found with id: ${userId}`);
  }

  /**
   * Authenticates a userId / password combination and returns the matching user
   * Returns UnauthorizedError if the userId is not found or the
   * password for that userId does not match the one provided   *
   */
  async authenticate(username: string, password: string): Promise<UserInterface> {

    const result: QueryResult<UserWithPasswordInterface> = await db.query(
      `
        SELECT
          id,
          username,
          email,
          password,
          is_admin AS "isAdmin",
          created_on AS "createdOn"
        FROM users
        WHERE
          username = $1
      `,
      [username],
    );

    const userWithPassword = result.rows[0];

    if (userWithPassword) {
      const isValid = await bcrypt.compare(password, userWithPassword.password);
      if (isValid === true) {
        const { password, ...user } = userWithPassword;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");

  }
}