export const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "prod" ? 12 : 1;
export const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

// Ignores authentication and treats all requests as default user
export const DEFAULT_USER_ENABLED = false;