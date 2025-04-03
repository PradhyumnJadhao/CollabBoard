import { db } from "./db";
import { sessions } from "@shared/schema";

export async function initializeDatabase() {
  try {
    // Check if any sessions exist
    const existingSessions = await db.select().from(sessions);
    
    // If no sessions exist, create a default one
    if (existingSessions.length === 0) {
      console.log("Creating default whiteboard session");
      await db.insert(sessions).values({
        name: "Untitled Whiteboard",
      });
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}