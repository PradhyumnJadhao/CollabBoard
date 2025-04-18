import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import ToolPanel from "@/components/ToolPanel";
import Canvas from "@/components/Canvas";
import { useWebSocket } from "@/lib/useWebSocket";
import { Session } from "@shared/schema";
import SessionModal from "@/components/SessionModal";
import { useToast } from "@/hooks/use-toast";
import { Element, DrawingTool } from "@/types/canvas";

export default function Whiteboard() {
  const { id } = useParams<{ id?: string }>();
  const sessionId = id ? parseInt(id) : 1; // Default to 1 if no ID
  const { toast } = useToast();
  
  // State for whiteboard
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [currentTool, setCurrentTool] = useState<DrawingTool>("pen");
  const [currentColor, setCurrentColor] = useState<string>("#000000");
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [elements, setElements] = useState<Element[]>([]);
  // Undo/Redo history
  const [history, setHistory] = useState<Element[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  // Multi-user state
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [userCursors, setUserCursors] = useState<Record<string, { x: number; y: number; color: string; username: string }>>({});
  const [isSessionModalOpen, setIsSessionModalOpen] = useState<boolean>(false);
  
  // Get current session data
  const { data: session } = useQuery<Session>({
    queryKey: [`/api/sessions/${sessionId}`],
    enabled: false,
  });
  
  // Setup WebSocket connection
  const { 
    sendMessage, 
    lastMessage, 
    readyState 
  } = useWebSocket();
  
  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage !== null) {
      const data = JSON.parse(lastMessage.data);
      
      switch (data.type) {
        case 'draw':
          // Add the received element to the canvas (making a deep copy to avoid reference issues)
          const newElement = JSON.parse(JSON.stringify(data.element));
          setElements(prev => [...prev, newElement]);
          break;
          
        case 'cursor':
          // Update cursor position for a specific user
          setUserCursors(prev => ({
            ...prev,
            [data.userId]: {
              x: data.x,
              y: data.y,
              color: data.color,
              username: data.username
            }
          }));
          break;
          
        case 'userJoin':
          // Add user to active users list
          setActiveUsers(prev => {
            // Check if user already exists
            if (prev.some(user => user.id === data.user.id)) {
              return prev;
            }
            return [...prev, data.user];
          });
          
          toast({
            title: "User Joined",
            description: `${data.user.username} joined the whiteboard`,
          });
          break;
          
        case 'userLeave':
          // Remove user from active users
          setActiveUsers(prev => prev.filter(user => user.id !== data.userId));
          // Remove user cursor
          setUserCursors(prev => {
            const newCursors = { ...prev };
            delete newCursors[data.userId];
            return newCursors;
          });
          
          toast({
            title: "User Left",
            description: "A user left the whiteboard",
            variant: "default",
          });
          break;
          
        case 'loadSession':
          // Set flag to prevent adding this state change to history
          setIsUndoRedoOperation(true);
          
          // Load session elements (deep copy to avoid reference issues)
          const loadedElements = JSON.parse(JSON.stringify(data.elements));
          setElements(loadedElements);
          
          // Reset history with deep copy
          setHistory([loadedElements]);
          setHistoryIndex(0);
          
          console.log(`Loaded session with ${loadedElements.length} elements`);
          break;
          
        case 'clearCanvas':
          // Set flag to prevent adding this state change to history automatically
          setIsUndoRedoOperation(true);
          
          // Clear all elements
          setElements([]);
          
          // Add empty state to history directly
          // This prevents duplicate history entries
          const newHistory = [...history.slice(0, historyIndex + 1), []];
          setHistory(newHistory);
          setHistoryIndex(newHistory.length - 1);
          
          toast({
            title: "Canvas Cleared",
            description: "All elements have been cleared from the canvas",
          });
          break;
          
        case 'undoRedo':
          // Set flag to prevent adding this state change to history again
          setIsUndoRedoOperation(true);
          
          // Update canvas state from undo/redo action by other user
          // Make a deep copy to avoid reference issues
          const receivedElements = JSON.parse(JSON.stringify(data.elements));
          setElements(receivedElements);
          
          // Log the action
          console.log('Received undo/redo action from another user');
          break;
          
        default:
          console.log("Unknown message type", data);
          break;
      }
    }
  }, [lastMessage, toast]);
  
  // Set current session when data is loaded
  useEffect(() => {
    if (session) {
      setCurrentSession(session);
    }
  }, [session]);
  
  // Handle tool selection
  const handleToolSelect = (tool: DrawingTool) => {
    setCurrentTool(tool);
  };
  
  // Handle color selection
  const handleColorSelect = (color: string) => {
    setCurrentColor(color);
  };
  
  // Handle stroke width change
  const handleStrokeWidthChange = (width: number) => {
    setStrokeWidth(width);
  };
  
  // Handle canvas clear
  const handleClearCanvas = async () => {
    try {
      await fetch(`/api/sessions/${sessionId}/elements`, {
        method: 'DELETE',
      });
      
      // Set flag to prevent adding this state change to history automatically
      setIsUndoRedoOperation(true);
      
      // Clear elements on canvas
      setElements([]);
      
      // Directly update history to prevent double history entries
      const newHistory = [...history.slice(0, historyIndex + 1), []];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      
      // Notify other users
      sendMessage(JSON.stringify({ type: 'clearCanvas' }));
      
      toast({
        title: "Canvas Cleared",
        description: "All elements have been removed from the whiteboard",
      });
      
      console.log(`Clear canvas: History length ${newHistory.length}, index ${newHistory.length-1}`);
    } catch (error) {
      console.error('Error clearing canvas:', error);
      toast({
        title: "Error",
        description: "Failed to clear canvas",
        variant: "destructive",
      });
    }
  };
  
  // Track if we're in an undo/redo operation to avoid double history entries
  const [isUndoRedoOperation, setIsUndoRedoOperation] = useState(false);
  
  // Add to history when elements change
  useEffect(() => {
    // Skip if we're in the middle of an explicit undo/redo operation
    if (isUndoRedoOperation) {
      setIsUndoRedoOperation(false);
      return;
    }
    
    // Skip if this is the first time or history is empty
    if (history.length === 0) {
      // Initialize history with current elements
      setHistory([JSON.parse(JSON.stringify(elements))]);
      setHistoryIndex(0);
      return;
    }
    
    // Skip if user is navigating history (not at the latest point)
    if (historyIndex !== history.length - 1) {
      return;
    }
    
    // Don't add duplicate entries to history (for same elements state)
    const currentHistoryState = JSON.stringify(history[historyIndex]);
    const newState = JSON.stringify(elements);
    
    if (currentHistoryState !== newState) {
      // Make a deep copy to ensure history states are fully independent
      const elementsCopy = JSON.parse(JSON.stringify(elements));
      setHistory(prev => [...prev.slice(0, historyIndex + 1), elementsCopy]);
      setHistoryIndex(prev => prev + 1);
    }
  }, [elements, history, historyIndex, isUndoRedoOperation]);

  // Handle element addition with history tracking
  const handleAddElement = (element: Element) => {
    // Add element to canvas
    setElements(prev => [...prev, element]);
    
    // Send to other users
    sendMessage(JSON.stringify({
      type: 'draw',
      element
    }));
  };
  
  // Handle undo action
  const handleUndo = () => {
    if (historyIndex > 0) {
      // Set flag to prevent adding this state change to history
      setIsUndoRedoOperation(true);
      
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      
      // Make deep copy to avoid reference issues
      const elementsToRestore = JSON.parse(JSON.stringify(history[newIndex]));
      setElements(elementsToRestore);
      
      // Notify other users about undo
      sendMessage(JSON.stringify({
        type: 'undoRedo',
        elements: elementsToRestore
      }));
      
      console.log(`Undo to history index ${newIndex} of ${history.length-1}`);
    }
  };
  
  // Handle redo action
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      // Set flag to prevent adding this state change to history
      setIsUndoRedoOperation(true);
      
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      
      // Make deep copy to avoid reference issues
      const elementsToRestore = JSON.parse(JSON.stringify(history[newIndex]));
      setElements(elementsToRestore);
      
      // Notify other users about redo
      sendMessage(JSON.stringify({
        type: 'undoRedo',
        elements: elementsToRestore
      }));
      
      console.log(`Redo to history index ${newIndex} of ${history.length-1}`);
    }
  };
  
  // Handle session load/save modal
  const handleOpenSessionModal = () => {
    setIsSessionModalOpen(true);
  };
  
  const handleCloseSessionModal = () => {
    setIsSessionModalOpen(false);
  };
  
  // Handle session load
  const handleLoadSession = async (sessionId: number) => {
    try {
      await fetch(`/api/sessions/${sessionId}/load`, {
        method: 'POST',
      });
      window.location.href = `/board/${sessionId}`;
    } catch (error) {
      console.error('Error loading session:', error);
      toast({
        title: "Error",
        description: "Failed to load session",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header 
        sessionName={currentSession?.name || "Untitled Whiteboard"} 
        sessionId={sessionId}
        activeUsers={activeUsers}
        onOpenLoadSession={handleOpenSessionModal}
      />
      
      <main className="flex-1 flex overflow-hidden">
        <ToolPanel 
          currentTool={currentTool}
          onToolSelect={handleToolSelect}
          onClearCanvas={handleClearCanvas}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
        />
        
        <Canvas 
          elements={elements}
          currentTool={currentTool}
          currentColor={currentColor}
          strokeWidth={strokeWidth}
          onAddElement={handleAddElement}
          userCursors={userCursors}
          sendMessage={sendMessage}
          onColorSelect={handleColorSelect}
          onStrokeWidthChange={handleStrokeWidthChange}
        />
      </main>
      
      {isSessionModalOpen && (
        <SessionModal
          onClose={handleCloseSessionModal}
          onLoadSession={handleLoadSession}
        />
      )}
    </div>
  );
}
