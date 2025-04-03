import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DrawingTool } from "@/types/canvas";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ToolPanelProps {
  currentTool: DrawingTool;
  onToolSelect: (tool: DrawingTool) => void;
  onClearCanvas: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export default function ToolPanel({ 
  currentTool, 
  onToolSelect, 
  onClearCanvas,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
}: ToolPanelProps) {
  const ToolButton = ({ tool, icon, title }: { tool: DrawingTool; icon: React.ReactNode; title: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={currentTool === tool ? "default" : "ghost"}
            size="icon"
            className={cn(
              "w-12 h-12 rounded-md flex items-center justify-center transition-all duration-200 shadow-sm",
              currentTool === tool 
                ? "bg-primary text-white hover:bg-primary hover:text-white scale-105 shadow-md" 
                : "hover:bg-primary/10"
            )}
            onClick={() => onToolSelect(tool)}
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="flex flex-col bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 shadow-md w-16 md:w-18 shrink-0 rounded-r-lg">
      <div className="flex-1 flex flex-col items-center pt-6 gap-4">
        {/* Drawing Tools */}
        <div className="pb-2 w-full text-center border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Draw</span>
        </div>
        <ToolButton
          tool="pen"
          title="Pen Tool"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
            </svg>
          }
        />
        
        <ToolButton
          tool="line"
          title="Line Tool"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 20h16M4 20v-4m16 4v-4"></path>
            </svg>
          }
        />
        
        <ToolButton
          tool="rectangle"
          title="Rectangle Tool"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"></path>
            </svg>
          }
        />
        
        <ToolButton
          tool="circle"
          title="Circle Tool"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" strokeWidth="2"></circle>
            </svg>
          }
        />
        
        <ToolButton
          tool="text"
          title="Text Tool"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v18m12-13h-6m6 4h-6m6 4h-6"></path>
            </svg>
          }
        />
        
        <div className="pb-2 pt-2 w-full text-center border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Edit</span>
        </div>
        
        <ToolButton
          tool="eraser"
          title="Eraser Tool"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          }
        />
        
        <ToolButton
          tool="select"
          title="Select Tool"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
            </svg>
          }
        />
      </div>
      
      <div className="border-t border-gray-200 py-6 flex flex-col items-center gap-4">
        <div className="pb-2 w-full text-center">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</span>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={canUndo && onUndo ? "outline" : "ghost"}
                size="icon"
                className={cn(
                  "w-12 h-12 rounded-md flex items-center justify-center transition-all duration-200",
                  canUndo && onUndo ? "shadow-sm hover:bg-primary/10" : "opacity-50"
                )}
                disabled={!canUndo || !onUndo}
                onClick={onUndo}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Undo</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={canRedo && onRedo ? "outline" : "ghost"}
                size="icon"
                className={cn(
                  "w-12 h-12 rounded-md flex items-center justify-center transition-all duration-200",
                  canRedo && onRedo ? "shadow-sm hover:bg-primary/10" : "opacity-50"
                )}
                disabled={!canRedo || !onRedo}
                onClick={onRedo}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Redo</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="w-12 h-12 rounded-md flex items-center justify-center transition-all duration-200 shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                onClick={onClearCanvas}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Clear Canvas</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
