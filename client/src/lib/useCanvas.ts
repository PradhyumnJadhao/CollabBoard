import { useState, useCallback } from "react";
import { Element } from "@/types/canvas";

export function useCanvas() {
  // Function to initialize canvas
  const initializeCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);
  
  // Function to draw a single element
  const drawElement = useCallback((
    ctx: CanvasRenderingContext2D,
    element: Element
  ) => {
    const { type, points, color, width } = element;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    
    switch (type) {
      case 'pen':
        if (points && points.length > 0) {
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
          
          ctx.stroke();
        }
        break;
        
      case 'eraser':
        if (points && points.length > 0) {
          // Save current context state
          ctx.save();
          
          // Set composite operation to destination-out to erase
          ctx.globalCompositeOperation = 'destination-out';
          
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
          
          ctx.stroke();
          
          // Restore context to previous state
          ctx.restore();
        }
        break;
        
      case 'line':
        if (points && points.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          ctx.lineTo(points[1].x, points[1].y);
          ctx.stroke();
        }
        break;
        
      case 'rectangle':
        if (points && points.length >= 2) {
          const [start, end] = points;
          const width = end.x - start.x;
          const height = end.y - start.y;
          
          ctx.beginPath();
          ctx.rect(start.x, start.y, width, height);
          ctx.stroke();
        }
        break;
        
      case 'circle':
        if (points && points.length >= 2) {
          const [start, end] = points;
          const radius = Math.sqrt(
            Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
          );
          
          ctx.beginPath();
          ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
        break;
        
      case 'text':
        if (points && points.length > 0 && element.data.text) {
          ctx.font = `${width * 5}px Arial`;
          ctx.fillStyle = color;
          ctx.fillText(element.data.text, points[0].x, points[0].y);
        }
        break;
        
      default:
        break;
    }
  }, []);
  
  // Function to draw all elements
  const drawElements = useCallback((
    canvas: HTMLCanvasElement,
    elements: Element[]
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw each element
    elements.forEach((element) => {
      drawElement(ctx, element);
    });
  }, [drawElement]);
  
  return {
    initializeCanvas,
    drawElement,
    drawElements
  };
}
