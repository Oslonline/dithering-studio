import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import "./i18n";
import App from "./App.tsx";
import ErrorBoundary from './components/providers/ErrorBoundary';
import { ToastProvider } from './components/providers/ToastProvider';

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <ErrorBoundary>
      <ToastProvider>
        <Analytics />
        <App />
      </ToastProvider>
    </ErrorBoundary>
  </HelmetProvider>
);
