import { Request, Response, NextFunction } from "express";
import crypto from "node:crypto";

export function requestId(req: Request, res: Response, next: NextFunction) {
  const existing = req.header("x-request-id");
  const id = (existing && existing.trim().length > 0) ? existing : crypto.randomUUID();

  (req as any).requestId = id;
  res.setHeader("x-request-id", id);

  next();
}
