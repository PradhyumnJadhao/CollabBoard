import { Switch, Route } from "wouter";
import Home from "@/pages/Home";
import Whiteboard from "@/pages/Whiteboard";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/board/:id?" component={Whiteboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
