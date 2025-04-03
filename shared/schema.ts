import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  color: text("color").notNull().default('#4361ee'),
  initials: text("initials").notNull().default('U'),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  color: true,
  initials: true,
});

// Whiteboard sessions
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  name: true,
});

// Drawing elements
export const elements = pgTable("elements", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => sessions.id),
  type: text("type").notNull(), // pen, line, rectangle, circle, text, eraser
  data: jsonb("data").notNull(), // x, y, width, height, points, etc.
  color: text("color").notNull(),
  width: integer("width").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const insertElementSchema = createInsertSchema(elements).pick({
  sessionId: true,
  type: true,
  data: true,
  color: true,
  width: true,
  createdBy: true,
});

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type Element = typeof elements.$inferSelect;
export type InsertElement = z.infer<typeof insertElementSchema>;

// WebSocket message types
export type DrawAction = {
  type: "draw";
  element: Omit<InsertElement, "sessionId" | "createdBy"> & { id: string; points?: Array<{ x: number; y: number }> };
};

export type CursorAction = {
  type: "cursor";
  x: number;
  y: number;
};

export type UserJoinAction = {
  type: "userJoin";
  user: {
    id: string;
    username: string;
    color: string;
    initials: string;
  };
};

export type UserLeaveAction = {
  type: "userLeave";
  userId: string;
};

export type LoadSessionAction = {
  type: "loadSession";
  sessionId: number;
  elements: Array<Element>;
};

export type ClearCanvasAction = {
  type: "clearCanvas";
};

export type UndoRedoAction = {
  type: "undoRedo";
  elements: Array<Element>;
};

export type WebSocketMessage = 
  | DrawAction 
  | CursorAction 
  | UserJoinAction 
  | UserLeaveAction
  | LoadSessionAction
  | ClearCanvasAction
  | UndoRedoAction;
