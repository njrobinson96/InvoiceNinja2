import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.warn(
    "DATABASE_URL not set. Using in-memory storage instead of PostgreSQL."
  );
}

// If DATABASE_URL is set, create a pool, otherwise it will be undefined
export const pool = process.env.DATABASE_URL ? new Pool({ connectionString: process.env.DATABASE_URL }) : undefined;
export const db = pool ? drizzle({ client: pool, schema }) : undefined;