import express from "express";
import helmet from "helmet";
import pino from "pino-http";
import cookieParser from "cookie-parser";
import { corsMiddleware } from "./config/cors";
import { requestId } from "./middleware/requestId";
import { healthRouter } from "./routes/health.routes";
import { authRouter } from "./routes/auth.routes";

import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/error";

export function createApp() {
  const app = express();

  app.use(requestId);
  app.use(pino());
  app.use(helmet());
  app.use(corsMiddleware);
  app.use(express.json({ limit: "1mb" }));

  app.use("/v1", healthRouter);
  app.use("/v1", authRouter);

  app.use(notFound);
  app.use(errorHandler);

  app.use(cookieParser());

  

  return app;
}
