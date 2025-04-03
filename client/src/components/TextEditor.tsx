import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Element } from "@/types/canvas";

interface TextEditorProps {
  position: { x: number, y: number };
  initialText?: string;
  color: string;
  fontSize: number;
  onSave: (text: string) => void;
  onCancel: () => void;
  onDelete?: () => void;
  isEditing: boolean;
}

export default function TextEditor({
  position,
  initialText = '',
  color,
  fontSize,
  onSave,
  onCancel,
  onDelete,
  isEditing
}: TextEditorProps) {
  const [text, setText] = useState(initialText);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Focus the textarea when the component mounts
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.focus();
      textAreaRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleSave = () => {
    if (text.trim()) {
      onSave(text);
    } else {
      onCancel();
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div 
      className="absolute z-10 flex flex-col gap-2"
      style={{ 
        top: position.y - 20, 
        left: position.x - 100, 
        width: '200px'
      }}
    >
      <textarea
        ref={textAreaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ 
          color,
          fontSize: `${fontSize * 5}px`,
          resize: 'both',
          minHeight: '60px',
          minWidth: '200px'
        }}
        className="p-2 border border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
        placeholder="Enter text here..."
      />
      
      <div className="flex justify-between">
        <div>
          {isEditing && onDelete && (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDelete}
              className="flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Delete
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave}
            className="flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}