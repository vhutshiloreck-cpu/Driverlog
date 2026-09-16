import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

const globalDb = globalThis as typeof globalThis & { __driverlogPool?: Pool };
export const pool = globalDb.__driverlogPool ?? new Pool({ connectionString: url, max: 5, ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined });
if (process.env.NODE_ENV !== "production") globalDb.__driverlogPool = pool;
export const db = drizzle(pool);
