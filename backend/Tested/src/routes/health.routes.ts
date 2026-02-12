import { Router } from "express";
import { ok } from "../utils/apiResponse";
import { isDbReady } from "../config/db";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json(ok({ status: "ok" }));
});

healthRouter.get("/ready", (_req, res) => {
  const db = isDbReady();
  if (!db) return res.status(503).json(ok({ status: "not_ready", db }));
  return res.json(ok({ status: "ready", db }));
});
