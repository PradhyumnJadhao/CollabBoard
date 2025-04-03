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
          // Add the received element to the canvas
          setElements(prev => [...prev, data.element]);
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
          // Load session elements
          setElements(data.elements);
          // Reset history
          setHistory([data.elements]);
          setHistoryIndex(0);
          break;
          
        case 'clearCanvas':
          // Clear all elements
          setElements([]);
          // Add empty state to history
          setHistory(prev => [...prev, []]);
          setHistoryIndex(prev => prev + 1);
          
          toast({
            title: "Canvas Cleared",
            description: "All elements have been cleared from the canvas",
          });
          break;
          
        case 'undoRedo':
          // Update canvas state from undo/redo action by other user
          setElements(data.elements);
          // We don't update our history here as this is someone else's action
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
      setElements([]);
      sendMessage(JSON.stringify({ type: 'clearCanvas' }));
    } catch (error) {
      console.error('Error clearing canvas:', error);
      toast({
        title: "Error",
        description: "Failed to clear canvas",
        variant: "destructive",
      });
    }
  };
  
  // Add to history when elements change
  useEffect(() => {
    // Don't update history for initial load or when manually handling history
    if (elements.length > 0 && historyIndex === history.length - 1) {
      setHistory(prev => [...prev.slice(0, historyIndex + 1), elements]);
      setHistoryIndex(prev => prev + 1);
    }
  }, [elements, history, historyIndex]);

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
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
      
      // Notify other users about undo
      sendMessage(JSON.stringify({
        type: 'undoRedo',
        elements: history[newIndex]
      }));
    }
  };
  
  // Handle redo action
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setElements(history[newIndex]);
      
      // Notify other users about redo
      sendMessage(JSON.stringify({
        type: 'undoRedo',
        elements: history[newIndex]
      }));
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
