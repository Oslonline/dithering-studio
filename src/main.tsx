import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import App from "./App.tsx";
import ErrorBoundary from './components/ErrorBoundary';

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <ErrorBoundary>
      <Analytics />
      <App />
    </ErrorBoundary>
  </HelmetProvider>
);
