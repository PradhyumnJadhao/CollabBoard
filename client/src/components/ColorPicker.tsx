import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  currentColor: string;
  onColorSelect: (color: string) => void;
}

const COLORS = [
  { value: "#000000", name: "Black" },
  { value: "#ef4444", name: "Red" },
  { value: "#3b82f6", name: "Blue" },
  { value: "#10b981", name: "Green" },
  { value: "#f59e0b", name: "Yellow" },
  { value: "#8b5cf6", name: "Purple" },
  { value: "#ec4899", name: "Pink" },
  { value: "#6b7280", name: "Gray" },
  { value: "#ffffff", name: "White" },
];

export default function ColorPicker({ currentColor, onColorSelect }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(currentColor);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
  };

  const handleCustomColorSelect = () => {
    onColorSelect(customColor);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col items-center space-y-3 p-3 bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-gray-100">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Color</div>
      
      <div className="grid grid-cols-3 gap-2">
        {COLORS.map((color) => (
          <TooltipProvider key={color.value}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all duration-200 flex items-center justify-center",
                    currentColor === color.value 
                      ? "ring-2 ring-primary ring-offset-2 scale-110" 
                      : "hover:scale-105"
                  )}
                  style={{ 
                    backgroundColor: color.value,
                    borderColor: color.value === "#ffffff" ? "#e5e7eb" : "transparent",
                  }}
                  onClick={() => onColorSelect(color.value)}
                >
                  {currentColor === color.value && (
                    <svg 
                      className={`w-4 h-4 ${color.value === "#ffffff" || color.value === "#f59e0b" ? "text-black" : "text-white"}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{color.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
      
      <div className="w-full pt-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full flex items-center justify-center text-xs gap-2 border-dashed"
            >
              <span className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-2"
                  style={{ backgroundColor: customColor }}
                ></div>
                Custom Color
              </span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4">
            <div className="space-y-4">
              <div>
                <label htmlFor="custom-color" className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Color
                </label>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-md border border-gray-300 shadow-inner"
                    style={{ backgroundColor: customColor }}
                  ></div>
                  <input
                    type="color"
                    id="custom-color"
                    value={customColor}
                    onChange={handleColorChange}
                    className="w-full h-10"
                  />
                </div>
              </div>
              <Button onClick={handleCustomColorSelect} className="w-full gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Apply Color
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
