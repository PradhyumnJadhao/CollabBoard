import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
            </svg>
            <Link href="/">
              <h1 className="ml-2 text-xl font-bold text-primary cursor-pointer">CollabBoard</h1>
            </Link>
          </div>
          
          {/* Session Name */}
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-500 mr-2 hidden md:inline">Current Session:</span>
            <span className="text-sm font-medium">{sessionName}</span>
            <button 
              className="ml-3 p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50" 
              title="Rename Session"
              onClick={() => setIsRenameDialogOpen(true)}
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Session Management */}
          <div className="hidden md:flex items-center space-x-3">
            <Link href="/">
              <Button variant="outline" size="sm">
                New
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={onOpenLoadSession}>
              Load
            </Button>
          </div>
          
          {/* User Indicator and Share */}
          <div className="flex items-center">
            <div className="relative">
              <Button size="sm" onClick={handleCopyShareLink}>
                <span className="hidden md:inline mr-1">Share</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                </svg>
              </Button>
            </div>
            
            <div className="ml-3 flex -space-x-2 items-center">
              {activeUsers.map((user) => (
                <div key={user.id} className="relative" title={user.username}>
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-white"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.initials}
                  </div>
                  <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-green-400"></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Whiteboard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              value={newSessionName}
              onChange={(e) => setNewSessionName(e.target.value)}
              placeholder="Enter new name"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRenameSession}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
