/** ExpressError extends normal JS error so we can
 *  add a status and code when we make an instance of it.
 *
 *  The error-handling middleware will return this.
 */

const codeToError : { [key: string]: string; }= {
  '401100': 'Unauthorized: You must be logged in to access this endpoint.',
  '401200': 'Unauthorized: You must be logged in as an admin to access this endpoint.',
  '401300': 'Authorization token has expired. Please login again.',
}

class ExpressError extends Error {
  message: string;
  code: string;
  status: number;

  constructor(messageOrCode: string, status: number) {
    super();
    if (codeToError[messageOrCode]) {
      this.code = messageOrCode;
      this.message = codeToError[messageOrCode];
      this.status = status;
    } else {
      this.message = messageOrCode;
      this.status = status;
      this.code = "" + (status * 1000);
    }
  }
}

/** 404 NOT FOUND error. */

class NotFoundError extends ExpressError {
  constructor(message = "Not Found") {
    super(message, 404);
  }
}

/** 401 UNAUTHORIZED error. */

class UnauthorizedError extends ExpressError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

/** 400 BAD REQUEST error. */

class BadRequestError extends ExpressError {
  constructor(message = "Bad Request") {
    super(message, 400);
  }
}

/** 403 FORBIDDEN error. */

class ForbiddenError extends ExpressError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

export {
  ExpressError,
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
  ForbiddenError,
};
