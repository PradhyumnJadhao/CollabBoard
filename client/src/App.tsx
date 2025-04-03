import { Switch, Route } from "wouter";
import Home from "@/pages/Home";
import Whiteboard from "@/pages/Whiteboard";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "@/lib/protected-route";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <>
      <Switch>
        <ProtectedRoute path="/" component={Home} />
        <ProtectedRoute path="/board/:id?" component={Whiteboard} />
        <Route path="/auth" component={AuthPage} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
    </>
  );
}

export default App;
