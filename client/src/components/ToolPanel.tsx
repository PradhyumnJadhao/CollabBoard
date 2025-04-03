import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DrawingTool } from "@/types/canvas";

interface ToolPanelProps {
  currentTool: DrawingTool;
  onToolSelect: (tool: DrawingTool) => void;
  onClearCanvas: () => void;
}

export default function ToolPanel({ currentTool, onToolSelect, onClearCanvas }: ToolPanelProps) {
  const ToolButton = ({ tool, icon, title }: { tool: DrawingTool; icon: React.ReactNode; title: string }) => (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "w-10 h-10 rounded-md flex items-center justify-center",
        currentTool === tool && "bg-primary text-white hover:bg-primary hover:text-white"
      )}
      title={title}
      onClick={() => onToolSelect(tool)}
    >
      {icon}
    </Button>
  );

  return (
    <div className="flex flex-col bg-white border-r border-gray-200 shadow-sm w-14 md:w-16 shrink-0">
      <div className="flex-1 flex flex-col items-center pt-4 gap-2">
        {/* Drawing Tools */}
        <ToolButton
          tool="pen"
          title="Pen Tool"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
            </svg>
          }
        />
        
        <ToolButton
          tool="line"
          title="Line Tool"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 20h16M4 20v-4m16 4v-4"></path>
            </svg>
          }
        />
        
        <ToolButton
          tool="rectangle"
          title="Rectangle Tool"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"></path>
            </svg>
          }
        />
        
        <ToolButton
          tool="circle"
          title="Circle Tool"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" strokeWidth="2"></circle>
            </svg>
          }
        />
        
        <ToolButton
          tool="text"
          title="Text Tool"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v18m12-13h-6m6 4h-6m6 4h-6"></path>
            </svg>
          }
        />
        
        <ToolButton
          tool="eraser"
          title="Eraser Tool"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          }
        />
        
        <ToolButton
          tool="select"
          title="Select Tool"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
            </svg>
          }
        />
      </div>
      
      <div className="border-t border-gray-200 py-4 flex flex-col items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-md flex items-center justify-center"
          title="Undo"
          disabled={true} // To be implemented
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-md flex items-center justify-center"
          title="Redo"
          disabled={true} // To be implemented
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-md flex items-center justify-center"
          title="Clear Canvas"
          onClick={onClearCanvas}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
        </Button>
      </div>
    </div>
  );
}
