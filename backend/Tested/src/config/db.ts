import mongoose from "mongoose";
import { env } from "./env";

export async function connectDB() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGODB_URI);
}

export function isDbReady(): boolean {
  return mongoose.connection.readyState === 1;
}
