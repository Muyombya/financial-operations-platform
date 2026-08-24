import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

export const db = new Pool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.database,
  user: env.db.user,
  password: env.db.password,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

export async function verifyDatabaseConnection() {
  const result = await db.query(
    "SELECT current_database() AS database, NOW() AS server_time"
  );

  return result.rows[0];
}
