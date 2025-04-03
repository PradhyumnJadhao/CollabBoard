import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Session } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

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

  // Format date to a more readable format
  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If it's today, show time
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
            </svg>
            Load Whiteboard Session
          </DialogTitle>
          <DialogDescription>
            Select a previously saved whiteboard session to continue your work.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="recent" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="recent">Recent Sessions</TabsTrigger>
            <TabsTrigger value="all">All Sessions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recent" className="mt-0">
            <div className="mb-6 max-h-72 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="text-center py-10 flex flex-col items-center">
                  <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
                  <p className="mt-4 text-gray-500">Loading your whiteboards...</p>
                </div>
              ) : error ? (
                <div className="text-center py-10 bg-red-50 rounded-lg">
                  <svg className="w-10 h-10 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p className="text-red-600 font-medium">Failed to load sessions</p>
                  <p className="text-red-500 text-sm mt-1">Please try again later</p>
                </div>
              ) : sessions && sessions.length > 0 ? (
                <ul className="space-y-3">
                  {sessions
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                    .slice(0, 5) // Show only 5 most recent sessions
                    .map((session) => (
                      <li
                        key={session.id}
                        className={cn(
                          "p-3 flex justify-between items-center rounded-md cursor-pointer transition-all duration-200 border",
                          selectedSessionId === session.id 
                            ? "bg-primary/5 border-primary/30 shadow-sm" 
                            : "hover:bg-gray-50 border-gray-100"
                        )}
                        onClick={() => handleSessionSelect(session.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h4 className="text-base font-medium text-gray-900 truncate">{session.name}</h4>
                            {new Date(session.updatedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000 && (
                              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">New</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Last edited: {formatDate(session.updatedAt)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 p-2 h-auto text-gray-400 hover:text-primary focus:ring-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSessionSelect(session.id);
                          }}
                        >
                          {selectedSessionId === session.id ? (
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          )}
                        </Button>
                      </li>
                    ))}
                </ul>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                  </svg>
                  <p className="text-gray-500 font-medium">No sessions found</p>
                  <p className="text-gray-400 text-sm mt-1">Create a new whiteboard to get started</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="all" className="mt-0">
            <div className="mb-6 max-h-72 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="text-center py-10 flex flex-col items-center">
                  <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
                  <p className="mt-4 text-gray-500">Loading your whiteboards...</p>
                </div>
              ) : error ? (
                <div className="text-center py-10 bg-red-50 rounded-lg">
                  <svg className="w-10 h-10 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p className="text-red-600 font-medium">Failed to load sessions</p>
                  <p className="text-red-500 text-sm mt-1">Please try again later</p>
                </div>
              ) : sessions && sessions.length > 0 ? (
                <ul className="space-y-3">
                  {sessions
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                    .map((session) => (
                      <li
                        key={session.id}
                        className={cn(
                          "p-3 flex justify-between items-center rounded-md cursor-pointer transition-all duration-200 border",
                          selectedSessionId === session.id 
                            ? "bg-primary/5 border-primary/30 shadow-sm" 
                            : "hover:bg-gray-50 border-gray-100"
                        )}
                        onClick={() => handleSessionSelect(session.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center">
                            <h4 className="text-base font-medium text-gray-900 truncate">{session.name}</h4>
                            {new Date(session.updatedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000 && (
                              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">New</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Last edited: {formatDate(session.updatedAt)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 p-2 h-auto text-gray-400 hover:text-primary focus:ring-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSessionSelect(session.id);
                          }}
                        >
                          {selectedSessionId === session.id ? (
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          )}
                        </Button>
                      </li>
                    ))}
                </ul>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                  </svg>
                  <p className="text-gray-500 font-medium">No sessions found</p>
                  <p className="text-gray-400 text-sm mt-1">Create a new whiteboard to get started</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex sm:justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-full px-4">
            Cancel
          </Button>
          <Button
            onClick={handleLoadSelectedSession}
            disabled={selectedSessionId === null}
            size="sm"
            className="rounded-full px-4 gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
            </svg>
            Load Whiteboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
