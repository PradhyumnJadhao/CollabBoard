import { useEffect, useRef, useState, useCallback } from "react";

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);
  
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING);
  
  // Connect to WebSocket server
  useEffect(() => {
    // Create WebSocket connection
    const connect = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setReadyState(WebSocket.OPEN);
        setReconnectAttempt(0);
      };
      
      socket.onmessage = (event) => {
        setLastMessage(event);
      };
      
      socket.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setReadyState(WebSocket.CLOSED);
        
        // Attempt to reconnect with exponential backoff
        const timeout = Math.min(1000 * Math.pow(2, reconnectAttempt), 30000);
        setTimeout(() => {
          setReconnectAttempt(prev => prev + 1);
          // Attempt to reconnect
          if (socketRef.current?.readyState === WebSocket.CLOSED) {
            connect();
          }
        }, timeout);
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        socket.close();
      };
      
      socketRef.current = socket;
    };
    
    connect();
    
    // Clean up WebSocket connection on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [reconnectAttempt]);
  
  // Send message through WebSocket
  const sendMessage = useCallback((message: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(message);
      return true;
    }
    return false;
  }, []);
  
  return {
    isConnected,
    lastMessage,
    readyState,
    sendMessage
  };
}
