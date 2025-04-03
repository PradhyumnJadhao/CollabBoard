import { useRef, useEffect, useState } from "react";
import { useCanvas } from "@/lib/useCanvas";
import { Element, DrawingTool, Point } from "@/types/canvas";
import UserCursor from "@/components/UserCursor";
import ColorPicker from "@/components/ColorPicker";
import TextEditor from "@/components/TextEditor";

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
  
  // Text editor state
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [textEditorPosition, setTextEditorPosition] = useState<Point>({ x: 0, y: 0 });
  const [textEditorContent, setTextEditorContent] = useState('');
  const [editingTextElement, setEditingTextElement] = useState<Element | null>(null);
  
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
  // Function to handle text operations
  const handleTextOperation = (text: string) => {
    if (editingTextElement) {
      // Update existing text element
      const updatedElement = {
        ...editingTextElement,
        data: { ...editingTextElement.data, text }
      };
      
      // Replace the element in the array
      const updatedElements = elements.map(el => 
        el.id === editingTextElement.id ? updatedElement : el
      );
      
      // Send update to server
      sendMessage(JSON.stringify({
        type: 'draw',
        element: updatedElement
      }));
      
      // Close the editor
      setShowTextEditor(false);
      setEditingTextElement(null);
    } else if (textEditorPosition) {
      // Create a new text element
      const newTextElement: Element = {
        id: `element-${Date.now()}`,
        type: 'text',
        points: [textEditorPosition],
        color: currentColor,
        width: strokeWidth,
        data: { text }
      };
      
      // Add the element
      onAddElement(newTextElement);
      
      // Close the editor
      setShowTextEditor(false);
    }
  };

  // Function to delete a text element
  const handleDeleteText = () => {
    if (editingTextElement) {
      // Remove the element from the array
      const updatedElements = elements.filter(el => el.id !== editingTextElement.id);
      
      // Send delete message to server (using clearCanvas as a workaround)
      sendMessage(JSON.stringify({
        type: 'clearCanvas'
      }));
      
      // Send all remaining elements
      updatedElements.forEach(element => {
        sendMessage(JSON.stringify({
          type: 'draw',
          element
        }));
      });
      
      // Close the editor
      setShowTextEditor(false);
      setEditingTextElement(null);
    }
  };
  
  // Function to find if a text element was clicked
  const findTextElementAtPosition = (x: number, y: number): Element | null => {
    // Search for text elements that are near the clicked position
    // We do this in reverse order so we get the topmost element
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (element.type === 'text' && element.points && element.points.length > 0) {
        const textX = element.points[0].x;
        const textY = element.points[0].y;
        
        // Get text metrics (approximate)
        const text = element.data.text || '';
        const fontSize = element.width * 5;
        const textWidth = text.length * fontSize * 0.6; // Rough estimate
        
        // Check if within a reasonable area around the text
        if (
          x >= textX - 5 && 
          x <= textX + textWidth + 5 && 
          y >= textY - fontSize - 5 && 
          y <= textY + 5
        ) {
          return element;
        }
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Check if we're clicking on a text element when in select mode
      if (currentTool === 'select') {
        const textElement = findTextElementAtPosition(x, y);
        if (textElement) {
          // Open the text editor for this element
          setEditingTextElement(textElement);
          setTextEditorPosition(textElement.points![0]);
          setTextEditorContent(textElement.data.text || '');
          setShowTextEditor(true);
          return;
        }
      }
      
      // Handle text tool clicks by opening the text editor
      if (currentTool === 'text') {
        setTextEditorPosition({ x, y });
        setTextEditorContent('');
        setEditingTextElement(null);
        setShowTextEditor(true);
        return;
      }
      
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
          
          case 'text':
            // For text elements, we don't update positions during mousemove
            return;
            
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
      
      {/* Text Editor */}
      {showTextEditor && (
        <TextEditor
          position={textEditorPosition}
          initialText={textEditorContent}
          color={editingTextElement ? editingTextElement.color : currentColor}
          fontSize={editingTextElement ? editingTextElement.width : strokeWidth}
          onSave={handleTextOperation}
          onCancel={() => setShowTextEditor(false)}
          onDelete={editingTextElement ? handleDeleteText : undefined}
          isEditing={!!editingTextElement}
        />
      )}
      
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
