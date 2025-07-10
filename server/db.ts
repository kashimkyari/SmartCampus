import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";
import dotenv from 'dotenv';
dotenv.config(); 

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Example: postgresql://username:password@localhost:5432/database_name",
  );
}

console.log("Connecting to local PostgreSQL database...");

// Create the postgres client
const client = postgres(process.env.DATABASE_URL, {
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Test database connection
client`SELECT 1`.then(() => {
  console.log("Database connection successful");
}).catch((error) => {
  console.error("Database connection failed:", error);
});