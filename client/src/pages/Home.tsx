import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Session } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  // Fetch sessions data
  const { data: sessions, isLoading, error } = useQuery<Session[]>({
    queryKey: ['/api/sessions'],
  });

  const handleCreateSession = async () => {
    try {
      const response = await apiRequest('POST', '/api/sessions', {
        name: `Whiteboard Session ${new Date().toLocaleDateString()}`
      });
      const session = await response.json();
      window.location.href = `/board/${session.id}`;
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-2">CollabBoard</h1>
          <p className="text-xl text-gray-600">Real-time collaborative whiteboard for teams</p>
        </div>

        <div className="flex justify-center mb-12">
          <Button onClick={handleCreateSession} size="lg" className="bg-primary hover:bg-primary/90">
            Create New Whiteboard
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading sessions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Failed to load sessions. Please try again.</p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Your Whiteboards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions && sessions.length > 0 ? (
                sessions.map((session) => (
                  <Card key={session.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle>{session.name}</CardTitle>
                      <CardDescription>
                        Last updated: {new Date(session.updatedAt).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-32 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Board Preview</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/board/${session.id}`}>
                        <Button className="w-full">Open Board</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No whiteboards found. Create your first one!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
