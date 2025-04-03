import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Session } from "@shared/schema";

interface SessionModalProps {
  onClose: () => void;
  onLoadSession: (sessionId: number) => void;
}

export default function SessionModal({ onClose, onLoadSession }: SessionModalProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  
  // Fetch sessions data
  const { data: sessions, isLoading, error } = useQuery<Session[]>({
    queryKey: ['/api/sessions'],
  });
  
  const handleSessionSelect = (sessionId: number) => {
    setSelectedSessionId(sessionId);
  };
  
  const handleLoadSelectedSession = () => {
    if (selectedSessionId !== null) {
      onLoadSession(selectedSessionId);
      onClose();
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Load Whiteboard Session</DialogTitle>
        </DialogHeader>
        <div className="mb-6 max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading sessions...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">Failed to load sessions. Please try again.</p>
            </div>
          ) : sessions && sessions.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {sessions.map((session) => (
                <li
                  key={session.id}
                  className={`py-3 flex justify-between items-center hover:bg-gray-50 rounded-md px-2 cursor-pointer ${
                    selectedSessionId === session.id ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => handleSessionSelect(session.id)}
                >
                  <div>
                    <h4 className="text-base font-medium text-gray-900">{session.name}</h4>
                    <p className="text-sm text-gray-500">
                      Last edited: {new Date(session.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    className="ml-4 p-2 rounded-md hover:bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSessionSelect(session.id);
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No sessions found.</p>
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleLoadSelectedSession}
            disabled={selectedSessionId === null}
          >
            Load
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
