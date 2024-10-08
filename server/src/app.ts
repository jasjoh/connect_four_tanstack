/** Simple demo Express app. */
import express, { Express, Request, Response, NextFunction } from "express";
import { ExpressError, NotFoundError } from "./expressError";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";

import { authenticateJWT } from "./middleware/auth";
import { gamesRouter } from "./routes/games";
import { playersRouter } from "./routes/players";
import { router as authRouter } from "./routes/auth";

const app: Express = express();

const corsOptions : CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Request not allowed. CORS violation.'))
    }
  },
  credentials: true,
}

app.use(express.json());
app.use(cors(corsOptions));
app.use((req, res, next) => {
  console.log(`Request headers: ${JSON.stringify(req.headers)}`);
  next();
})
app.use(cookieParser())
app.use(authenticateJWT);

/** ROUTES BELOW */

app.use("/games", gamesRouter);
app.use("/players", playersRouter);
app.use("/auth", authRouter);

/** Handle 404 errors -- this matches everything */
app.use(function (req: Request, res: Response, next: NextFunction) {
	console.log("Not Found error");
	throw new NotFoundError();
});

/** Generic error handler; anything unhandled goes here. */
app.use(function (err: ExpressError, req: Request, res: Response, next: NextFunction) {
  // if (process.env.NODE_ENV !== "test") console.error(err.stack);
  /* istanbul ignore next (ignore for coverage) */
  const status = err.status || 500;
  const message = err.message;
  const code = err.code;

  return res.status(status).json({
    error: { code, message, status },
  });
});

export default app;