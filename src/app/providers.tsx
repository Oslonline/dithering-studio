"use client";

import type { ReactNode } from "react";
import ErrorBoundary from "../components/providers/ErrorBoundary";
import { ToastProvider } from "../components/providers/ToastProvider";
import { FeatureWarnings } from "../components/FeatureWarnings";
import { SettingsProvider } from "../state/SettingsProvider";
import "../index.css";
import "../i18n";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <FeatureWarnings />
        <ToastProvider>{children}</ToastProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}
