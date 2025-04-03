import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";

interface ColorPickerProps {
  currentColor: string;
  onColorSelect: (color: string) => void;
}

const COLORS = [
  "#000000", // Black
  "#ef4444", // Red
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Yellow
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#6b7280", // Gray
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
    <div className="flex items-center space-x-2">
      <div className="flex space-x-1">
        {COLORS.map((color) => (
          <button
            key={color}
            className="w-6 h-6 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            style={{ 
              backgroundColor: color,
              borderColor: currentColor === color ? 'white' : 'transparent',
              boxShadow: currentColor === color ? '0 0 0 1px #000' : 'none'
            }}
            onClick={() => onColorSelect(color)}
          />
        ))}
      </div>
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary p-0">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="custom-color" className="block text-sm font-medium text-gray-700 mb-1">
                Custom Color
              </label>
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded-md border border-gray-300"
                  style={{ backgroundColor: customColor }}
                ></div>
                <input
                  type="color"
                  id="custom-color"
                  value={customColor}
                  onChange={handleColorChange}
                  className="w-full"
                />
              </div>
            </div>
            <Button onClick={handleCustomColorSelect} className="w-full">
              Apply Color
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
