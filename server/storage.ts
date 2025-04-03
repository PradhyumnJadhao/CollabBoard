import { 
  users, type User, type InsertUser,
  sessions, type Session, type InsertSession,
  elements, type Element, type InsertElement
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Session operations
  getSessions(): Promise<Session[]>;
  getSession(id: number): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: number, name: string): Promise<Session | undefined>;
  
  // Element operations
  getElements(sessionId: number): Promise<Element[]>;
  createElement(element: InsertElement): Promise<Element>;
  clearElements(sessionId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sessions: Map<number, Session>;
  private elements: Map<number, Element>;
  private userIdCounter: number;
  private sessionIdCounter: number;
  private elementIdCounter: number;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.elements = new Map();
    this.userIdCounter = 1;
    this.sessionIdCounter = 1;
    this.elementIdCounter = 1;
    
    // Create a default session
    const defaultSession: Session = {
      id: this.sessionIdCounter++,
      name: "Untitled Whiteboard",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.sessions.set(defaultSession.id, defaultSession);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Session operations
  async getSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values());
  }

  async getSession(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = this.sessionIdCounter++;
    const now = new Date();
    const session: Session = { 
      ...insertSession, 
      id, 
      createdAt: now,
      updatedAt: now
    };
    this.sessions.set(id, session);
    return session;
  }
  
  async updateSession(id: number, name: string): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updatedSession: Session = {
      ...session,
      name,
      updatedAt: new Date()
    };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  // Element operations
  async getElements(sessionId: number): Promise<Element[]> {
    return Array.from(this.elements.values()).filter(
      (element) => element.sessionId === sessionId
    );
  }

  async createElement(insertElement: InsertElement): Promise<Element> {
    const id = this.elementIdCounter++;
    const element: Element = { 
      ...insertElement, 
      id,
      createdAt: new Date()
    };
    this.elements.set(id, element);
    return element;
  }
  
  async clearElements(sessionId: number): Promise<void> {
    // Delete all elements for the given session
    for (const [id, element] of this.elements.entries()) {
      if (element.sessionId === sessionId) {
        this.elements.delete(id);
      }
    }
  }
}

export const storage = new MemStorage();
