import { env } from "./config/env";
import { connectDB } from "./config/db";
import { createApp } from "./app";

async function main() {
  await connectDB();
  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT}`);
  });
}

main().catch((e) => {
  console.error("Failed to start server:", e);
  process.exit(1);
});
