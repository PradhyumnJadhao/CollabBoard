import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HeaderProps {
  sessionName: string;
  sessionId: number;
  activeUsers: Array<{
    id: string;
    username: string;
    color: string;
    initials: string;
  }>;
  onOpenLoadSession: () => void;
}

export default function Header({ sessionName, sessionId, activeUsers, onOpenLoadSession }: HeaderProps) {
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState(sessionName);
  const { toast } = useToast();

  const handleRenameSession = async () => {
    if (!newSessionName.trim()) return;
    
    try {
      const response = await apiRequest('PUT', `/api/sessions/${sessionId}`, {
        name: newSessionName
      });
      
      if (response.ok) {
        toast({
          title: "Session renamed",
          description: "The whiteboard name has been updated.",
        });
        setIsRenameDialogOpen(false);
      }
    } catch (error) {
      console.error('Failed to rename session:', error);
      toast({
        title: "Error",
        description: "Failed to rename the whiteboard.",
        variant: "destructive",
      });
    }
  };

  const handleCopyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => {
        toast({
          title: "Link copied",
          description: "Whiteboard link copied to clipboard.",
        });
      })
      .catch((err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: "Error",
          description: "Failed to copy link to clipboard.",
          variant: "destructive",
        });
      });
  };

  return (
    <header className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/">
            <div className="flex items-center group">
              <div className="bg-primary/10 p-2 rounded-lg mr-2 transition-all duration-300 group-hover:bg-primary/20">
                <svg className="w-7 h-7 text-primary" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zm0 6a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1zm0 6a1 1 0 011-1h16a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary cursor-pointer transition-all duration-300 group-hover:text-primary/80">
                  CollabBoard
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Real-time Whiteboard</p>
              </div>
            </div>
          </Link>
          
          {/* Session Name */}
          <div className="flex items-center px-4 py-1.5 bg-white rounded-full border border-gray-200 shadow-sm">
            <span className="text-sm font-medium text-gray-500 mr-2 hidden md:inline">Session:</span>
            <span className="text-sm font-semibold truncate max-w-[150px] md:max-w-[200px]">{sessionName}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="ml-2 p-1.5 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all duration-200" 
                    onClick={() => setIsRenameDialogOpen(true)}
                  >
                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Rename Whiteboard</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Session Management */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/">
              <Button variant="outline" size="sm" className="rounded-full px-4 flex gap-2 shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                New Board
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full px-4 flex gap-2 shadow-sm"
              onClick={onOpenLoadSession}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
              </svg>
              Load
            </Button>
          </div>
          
          {/* User Indicator and Share */}
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    className="rounded-full px-4 shadow-md flex gap-2"
                    onClick={handleCopyShareLink}
                  >
                    <span className="hidden md:inline">Share</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                    </svg>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Copy whiteboard link</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <div className="flex -space-x-2 items-center">
              {activeUsers.map((user) => (
                <TooltipProvider key={user.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative cursor-help">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-white shadow-md transition-transform hover:scale-110"
                          style={{ backgroundColor: user.color }}
                        >
                          {user.initials}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-green-400"></span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{user.username}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
              
              {activeUsers.length > 0 && (
                <div className="bg-gray-100 text-gray-800 text-xs font-medium ml-1 px-2 py-0.5 rounded-full border border-gray-200">
                  {activeUsers.length} online
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Whiteboard</DialogTitle>
            <DialogDescription>
              Enter a new name for your whiteboard session.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              placeholder="Enter new name"
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameSession} className="gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
