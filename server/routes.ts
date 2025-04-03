import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { nanoid } from "nanoid";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertSessionSchema, 
  insertElementSchema,
  type WebSocketMessage,
  type User
} from "@shared/schema";
import { z } from "zod";

type ActiveUser = {
  id: string;
  username: string;
  color: string;
  initials: string;
  socket: WebSocket;
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  const httpServer = createServer(app);
  
  // Initialize WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Keep track of connected users
  const activeUsers = new Map<string, ActiveUser>();
  
  // Current active session
  let activeSessionId = 1; // Default to first session
  
  // WebSocket connection handling
  wss.on('connection', (socket) => {
    const userId = nanoid();
    console.log(`User connected: ${userId}`);
    
    // Generate random username and color for the user
    const colors = ['#4361ee', '#f72585', '#7209b7', '#3a0ca3', '#4cc9f0', '#22577a', '#38a3a5'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomUsername = `User${Math.floor(Math.random() * 1000)}`;
    
    // Generate initials from username
    const initials = randomUsername.substring(0, 2).toUpperCase();
    
    // Add user to active users
    const user: ActiveUser = {
      id: userId,
      username: randomUsername,
      color: randomColor,
      initials,
      socket
    };
    activeUsers.set(userId, user);
    
    // Notify all users about new user
    broadcastToAll({
      type: 'userJoin',
      user: {
        id: userId,
        username: randomUsername,
        color: randomColor,
        initials
      }
    });
    
    // Send current users to the new user
    for (const [id, activeUser] of activeUsers.entries()) {
      if (id !== userId) {
        sendToUser(socket, {
          type: 'userJoin',
          user: {
            id: activeUser.id,
            username: activeUser.username,
            color: activeUser.color,
            initials: activeUser.initials
          }
        });
      }
    }
    
    // Load current session for the new user
    loadSessionForUser(socket, activeSessionId);
    
    // Handle messages from the client
    socket.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString()) as WebSocketMessage;
        
        switch (message.type) {
          case 'draw':
            // Save the element to storage
            const elementData = {
              sessionId: activeSessionId,
              type: message.element.type,
              data: message.element.data,
              color: message.element.color,
              width: message.element.width,
              createdBy: null // We're not tracking real user IDs
            };
            
            try {
              await storage.createElement(elementData);
            } catch (err) {
              console.error('Error saving element:', err);
            }
            
            // Broadcast to all users except sender
            broadcastToAllExcept(userId, message);
            break;
            
          case 'cursor':
            // Add user info to cursor message
            const cursorMessage = {
              ...message,
              userId,
              username: user.username,
              color: user.color
            };
            // Broadcast cursor position to all users except sender
            broadcastToAllExcept(userId, cursorMessage);
            break;
            
          case 'clearCanvas':
            // Clear all elements for current session
            await storage.clearElements(activeSessionId);
            // Broadcast clear command to all users
            broadcastToAll(message);
            break;
            
          case 'undoRedo':
            // Broadcast undo/redo state to all other users
            broadcastToAllExcept(userId, message);
            break;
            
          default:
            console.log('Unknown message type:', message);
        }
      } catch (err) {
        console.error('Error processing message:', err);
      }
    });
    
    // Handle disconnection
    socket.on('close', () => {
      console.log(`User disconnected: ${userId}`);
      // Remove user from active users
      activeUsers.delete(userId);
      // Notify all users
      broadcastToAll({
        type: 'userLeave',
        userId
      });
    });
  });
  
  // Helper functions for WebSocket communication
  function broadcastToAll(message: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
  
  function broadcastToAllExcept(userId: string, message: any) {
    wss.clients.forEach((client) => {
      const userEntry = Array.from(activeUsers.entries()).find(([_, user]) => user.socket === client);
      if (userEntry && userEntry[0] !== userId && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
  
  function sendToUser(socket: WebSocket, message: any) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }
  
  async function loadSessionForUser(socket: WebSocket, sessionId: number) {
    try {
      const session = await storage.getSession(sessionId);
      if (!session) return;
      
      const elements = await storage.getElements(sessionId);
      
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'loadSession',
          sessionId,
          elements
        }));
      }
    } catch (err) {
      console.error('Error loading session:', err);
    }
  }
  
  // API Routes with authentication middleware
  // Middleware to check if user is authenticated
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  app.get('/api/sessions', isAuthenticated, async (req, res) => {
    try {
      const sessions = await storage.getSessions();
      res.json(sessions);
    } catch (err) {
      res.status(500).json({ message: 'Error retrieving sessions' });
    }
  });
  
  app.post('/api/sessions', isAuthenticated, async (req, res) => {
    try {
      const sessionData = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(sessionData);
      res.status(201).json(session);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid session data', errors: err.errors });
      } else {
        res.status(500).json({ message: 'Error creating session' });
      }
    }
  });
  
  app.put('/api/sessions/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name } = req.body;
      
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ message: 'Name is required' });
      }
      
      const session = await storage.updateSession(id, name);
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
      
      res.json(session);
    } catch (err) {
      res.status(500).json({ message: 'Error updating session' });
    }
  });
  
  app.get('/api/sessions/:id/elements', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const elements = await storage.getElements(id);
      res.json(elements);
    } catch (err) {
      res.status(500).json({ message: 'Error retrieving elements' });
    }
  });
  
  app.post('/api/sessions/:id/load', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getSession(id);
      
      if (!session) {
        return res.status(404).json({ message: 'Session not found' });
      }
      
      // Set as active session
      activeSessionId = id;
      
      // Load session for all users
      wss.clients.forEach(async (client) => {
        if (client.readyState === WebSocket.OPEN) {
          await loadSessionForUser(client, id);
        }
      });
      
      res.json({ message: 'Session loaded successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error loading session' });
    }
  });
  
  app.delete('/api/sessions/:id/elements', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.clearElements(id);
      
      // Broadcast clear command to all users
      broadcastToAll({
        type: 'clearCanvas'
      });
      
      res.json({ message: 'Canvas cleared successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Error clearing canvas' });
    }
  });

  return httpServer;
}
