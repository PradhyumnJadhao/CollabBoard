export type Point = {
  x: number;
  y: number;
};

export type DrawingTool = 'pen' | 'line' | 'rectangle' | 'circle' | 'text' | 'eraser' | 'select';

export type Element = {
  id: string;
  type: string;
  points?: Point[];
  color: string;
  width: number;
  data: {
    text?: string;
    [key: string]: any;
  };
};

export type UserCursor = {
  userId: string;
  username: string;
  color: string;
  x: number;
  y: number;
};
