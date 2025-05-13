import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { db, pool } from "./db";

// This script will create tables in the database if they don't exist
async function main() {
  if (!pool || !db) {
    console.error("Database connection not available. Cannot create schema.");
    process.exit(1);
  }

  console.log("🔄 Creating database schema...");
  
  try {
    // This will create tables based on the schema definitions
    await migrate(db, { migrationsFolder: "./migrations" });
    console.log("✅ Database schema created successfully!");
  } catch (error) {
    console.error("❌ Error creating database schema:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();