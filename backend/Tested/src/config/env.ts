import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.string().optional().default("development"),
  PORT: z.coerce.number().optional().default(4000),

  MONGODB_URI: z.string().min(1),
  CLIENT_ORIGIN: z.string().min(1),
  JWT_SECRET: z.string().min(1),

  ACCESS_TOKEN_TTL_MIN: z.coerce.number().optional().default(15),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().optional().default(30),

  COOKIE_SECURE: z
    .string()
    .optional()
    .default("false")
    .transform((v) => v === "true")
});

export const env = EnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,
  JWT_SECRET: process.env.JWT_SECRET,
  ACCESS_TOKEN_TTL_MIN: process.env.ACCESS_TOKEN_TTL_MIN,
  REFRESH_TOKEN_TTL_DAYS: process.env.REFRESH_TOKEN_TTL_DAYS,
  COOKIE_SECURE: process.env.COOKIE_SECURE
});
