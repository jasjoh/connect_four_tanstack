export const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;
export const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";

export const DEFAULT_USER_ENABLED = true;