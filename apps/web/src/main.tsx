import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { hydrateQueryCache, persistQueryCache, queryClient } from "./api/queryClient";
import "./styles/global.css";
import "./styles/polish.css";

async function bootstrap() {
  await hydrateQueryCache();
  persistQueryCache();

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

void bootstrap();
