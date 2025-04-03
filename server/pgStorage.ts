import { db } from "./db";
import { 
  users, type User, type InsertUser,
  sessions, type Session, type InsertSession,
  elements, type Element, type InsertElement
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { IStorage } from "./storage";

export class PgStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Session operations
  async getSessions(): Promise<Session[]> {
    return await db.select().from(sessions).orderBy(sessions.updatedAt);
  }

  async getSession(id: number): Promise<Session | undefined> {
    const result = await db.select().from(sessions).where(eq(sessions.id, id));
    return result[0];
  }

  async createSession(session: InsertSession): Promise<Session> {
    const result = await db.insert(sessions).values(session).returning();
    return result[0];
  }

  async updateSession(id: number, name: string): Promise<Session | undefined> {
    const result = await db
      .update(sessions)
      .set({ name, updatedAt: new Date() })
      .where(eq(sessions.id, id))
      .returning();
    return result[0];
  }

  // Element operations
  async getElements(sessionId: number): Promise<Element[]> {
    return await db
      .select()
      .from(elements)
      .where(eq(elements.sessionId, sessionId))
      .orderBy(elements.createdAt);
  }

  async createElement(element: InsertElement): Promise<Element> {
    const result = await db.insert(elements).values(element).returning();
    return result[0];
  }

  async clearElements(sessionId: number): Promise<void> {
    await db.delete(elements).where(eq(elements.sessionId, sessionId));
  }
}