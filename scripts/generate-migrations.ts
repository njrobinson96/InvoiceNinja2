import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { Pool } from "@neondatabase/serverless";
import * as schema from "../shared/schema";

// This script generates SQL migrations based on schema changes
async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set. Cannot generate migrations.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log("🔄 Generating schema migrations...");
  
  try {
    await migrate(db, { migrationsFolder: "./migrations" });
    console.log("✅ Migration files generated successfully!");
  } catch (error) {
    console.error("❌ Error generating migrations:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();