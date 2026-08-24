import app from "./app.js";
import { env } from "./config/env.js";
import { db } from "./config/database.js";

const server = app.listen(env.port, () => {
  console.log(
    `Project Atlas backend listening on http://localhost:${env.port}`
  );
});

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down Project Atlas backend...`);

  server.close(async () => {
    await db.end();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
