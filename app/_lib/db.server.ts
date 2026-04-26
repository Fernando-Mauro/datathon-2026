import "server-only";
import mysql from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var __havicaDbPool: mysql.Pool | undefined;
}

function buildPool(): mysql.Pool {
  const {
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_SSL,
  } = process.env;

  if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    throw new Error(
      "Missing DB_* env vars (DB_HOST / DB_USER / DB_PASSWORD / DB_NAME). " +
        "Set them in .env.local locally or in Amplify Hosting → Environment variables.",
    );
  }

  return mysql.createPool({
    host: DB_HOST,
    port: DB_PORT ? Number(DB_PORT) : 3306,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    ssl: DB_SSL === "1" ? { rejectUnauthorized: false } : undefined,
    waitForConnections: true,
    connectionLimit: 4,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10_000,
    namedPlaceholders: false,
  });
}

export function db(): mysql.Pool {
  if (!globalThis.__havicaDbPool) {
    globalThis.__havicaDbPool = buildPool();
  }
  return globalThis.__havicaDbPool;
}
