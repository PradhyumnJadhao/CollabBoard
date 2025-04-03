import { useRef, useEffect, useState } from "react";
import { useCanvas } from "@/lib/useCanvas";
import { Element, DrawingTool } from "@/types/canvas";
import UserCursor from "@/components/UserCursor";
import ColorPicker from "@/components/ColorPicker";

interface CanvasProps {
  elements: Element[];
  currentTool: DrawingTool;
  currentColor: string;
  strokeWidth: number;
  onAddElement: (element: Element) => void;
  userCursors: Record<string, { x: number; y: number; color: string; username: string }>;
  sendMessage: (message: string) => void;
  onColorSelect: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
}

export default function Canvas({
  elements,
  currentTool,
  currentColor,
  strokeWidth,
  onAddElement,
  userCursors,
  sendMessage,
  onColorSelect,
  onStrokeWidthChange
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<Element | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  
  // Create a unique canvas ID for rendering
  const canvasId = useRef(`canvas-${Date.now()}`);
  
  // Get drawing methods from custom hook
  const { initializeCanvas, drawElements } = useCanvas();
  
  // Initialize canvas on mount
  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      
      // Set canvas dimensions
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      // Initialize canvas
      initializeCanvas(canvasRef.current);
      
      // Draw all elements
      drawElements(canvasRef.current, elements);
    }
  }, [initializeCanvas, drawElements]);
  
  // Redraw elements when they change
  useEffect(() => {
    if (canvasRef.current) {
      drawElements(canvasRef.current, elements);
    }
  }, [elements, drawElements]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        // Redraw all elements
        drawElements(canvas, elements);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [elements, drawElements]);
  
  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setIsDrawing(true);
      
      // Create a new element based on the current tool
      let newElement: Element;
      
      switch (currentTool) {
        case 'pen':
          newElement = {
            id: `element-${Date.now()}`,
            type: 'pen',
            points: [{ x, y }],
            color: currentColor,
            width: strokeWidth,
            data: {}
          };
          break;
          
        case 'line':
          newElement = {
            id: `element-${Date.now()}`,
            type: 'line',
            points: [{ x, y }, { x, y }],
            color: currentColor,
            width: strokeWidth,
            data: {}
          };
          break;
          
        case 'rectangle':
          newElement = {
            id: `element-${Date.now()}`,
            type: 'rectangle',
            points: [{ x, y }, { x, y }],
            color: currentColor,
            width: strokeWidth,
            data: {}
          };
          break;
          
        case 'circle':
          newElement = {
            id: `element-${Date.now()}`,
            type: 'circle',
            points: [{ x, y }, { x, y }],
            color: currentColor,
            width: strokeWidth,
            data: {}
          };
          break;
          
        case 'text':
          // Not fully implemented
          newElement = {
            id: `element-${Date.now()}`,
            type: 'text',
            points: [{ x, y }],
            color: currentColor,
            width: strokeWidth,
            data: { text: 'Text' }
          };
          break;
          
        case 'eraser':
          newElement = {
            id: `element-${Date.now()}`,
            type: 'eraser',
            points: [{ x, y }],
            color: '#ffffff',
            width: strokeWidth * 3, // Make eraser a bit larger
            data: {}
          };
          break;
          
        default:
          return;
      }
      
      setCurrentElement(newElement);
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Send cursor position update
      sendMessage(JSON.stringify({
        type: 'cursor',
        x,
        y
      }));
      
      if (isDrawing && currentElement) {
        const newElement = { ...currentElement };
        
        // Update element based on the current tool
        switch (currentTool) {
          case 'pen':
          case 'eraser':
            if (newElement.points) {
              newElement.points = [...newElement.points, { x, y }];
            }
            break;
            
          case 'line':
          case 'rectangle':
          case 'circle':
            if (newElement.points && newElement.points.length >= 2) {
              newElement.points[1] = { x, y };
            }
            break;
            
          default:
            break;
        }
        
        setCurrentElement(newElement);
        
        // Clear canvas and redraw all elements including current element
        if (canvas) {
          drawElements(canvas, [...elements, newElement]);
        }
      }
    }
  };
  
  const handleMouseUp = () => {
    if (isDrawing && currentElement) {
      // Add current element to elements array
      onAddElement(currentElement);
      
      // Reset current element
      setCurrentElement(null);
      setIsDrawing(false);
    }
  };
  
  const handleMouseLeave = () => {
    handleMouseUp(); // Treat the same as mouse up
  };
  
  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (canvasRef.current && e.touches.length > 0) {
      const touch = e.touches[0];
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      // Create synthetic mouse event
      const mouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        preventDefault: () => {}
      } as unknown as React.MouseEvent<HTMLCanvasElement>;
      
      handleMouseDown(mouseEvent);
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (canvasRef.current && e.touches.length > 0) {
      e.preventDefault(); // Prevent scrolling
      
      const touch = e.touches[0];
      
      // Create synthetic mouse event
      const mouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        preventDefault: () => {}
      } as unknown as React.MouseEvent<HTMLCanvasElement>;
      
      handleMouseMove(mouseEvent);
    }
  };
  
  const handleTouchEnd = () => {
    handleMouseUp();
  };
  
  // Zoom handlers
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };
  
  return (
    <div ref={containerRef} className="relative flex-1 overflow-hidden">
      <canvas
        id={canvasId.current}
        ref={canvasRef}
        className="absolute w-full h-full bg-white"
        style={{
          touchAction: 'none',
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'center'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      
      {/* User Cursors */}
      {Object.entries(userCursors).map(([userId, cursor]) => (
        <UserCursor
          key={userId}
          x={cursor.x}
          y={cursor.y}
          color={cursor.color}
          username={cursor.username}
        />
      ))}
      
      {/* Floating Controls */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 flex items-center space-x-4">
        {/* Color Picker */}
        <ColorPicker currentColor={currentColor} onColorSelect={onColorSelect} />
        
        {/* Stroke Width */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">Stroke:</span>
          <input
            type="range"
            min="1"
            max="20"
            value={strokeWidth}
            onChange={(e) => onStrokeWidthChange(parseInt(e.target.value))}
            className="w-24 h-2 rounded-lg appearance-none bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          />
        </div>
        
        {/* Zoom Controls */}
        <div className="flex items-center space-x-1">
          <button
            className="p-1 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            title="Zoom Out"
            onClick={handleZoomOut}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
            </svg>
          </button>
          <span className="text-xs text-gray-500">{zoomLevel}%</span>
          <button
            className="p-1 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            title="Zoom In"
            onClick={handleZoomIn}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
