import pg from "pg";
import { poolConfig } from "./db-config.js";
const globalForPool = globalThis;
export function getPool() {
  if (!globalForPool.__bibPool) {
    globalForPool.__bibPool = new pg.Pool(poolConfig());
  }
  return globalForPool.__bibPool;
}
export const query = (text, params = []) => getPool().query(text, params);
export async function withTransaction(fn) {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
