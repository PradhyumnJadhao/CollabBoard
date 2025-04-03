import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Initialize postgres client
const connectionString = process.env.DATABASE_URL as string;

// For use with drizzle
const client = postgres(connectionString);
export const db = drizzle(client, { schema });