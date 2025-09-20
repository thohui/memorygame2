import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { GameClientProvider } from "./contexts/GameClientContext";
import { GameClient } from "./lib/client/index.ts";


const apiUrl: string = import.meta.env.VITE_API_URL!;
const gameClient = new GameClient(apiUrl);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GameClientProvider gameClient={gameClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </GameClientProvider>
  </StrictMode >,
);
