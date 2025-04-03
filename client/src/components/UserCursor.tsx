interface UserCursorProps {
  x: number;
  y: number;
  color: string;
  username: string;
}

export default function UserCursor({ x, y, color, username }: UserCursorProps) {
  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div
        className="w-3 h-3 rounded-full z-50"
        style={{ backgroundColor: color }}
      >
        <div
          className="absolute -top-6 left-0 px-2 py-1 text-xs text-white whitespace-nowrap rounded"
          style={{ backgroundColor: color }}
        >
          {username}
        </div>
        <div
          className="absolute w-1.5 h-1.5 rounded-full bg-white top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        ></div>
      </div>
    </div>
  );
}
