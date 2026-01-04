import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import ErrorBoundary from "./components/providers/ErrorBoundary";
import { FeatureWarnings } from "./components/FeatureWarnings";
import { SettingsProvider } from "./state/SettingsProvider";
import { useWorkerPoolCleanup } from "./hooks/useDitheringWorker";
import { useSyncLanguageWithPath } from "./hooks/useSyncLanguageWithPath";

const Home = lazy(() => import("./pages/Home"));
const DitheringTool = lazy(() => import("./pages/DitheringTool"));
const AlgorithmExplorer = lazy(() => import("./pages/AlgorithmExplorer"));
const Education = lazy(() => import("./pages/Education"));
const EducationBasics = lazy(() => import("./pages/education/EducationBasics"));
const EducationPractice = lazy(() => import("./pages/education/EducationPractice"));

const LanguagePathSync: React.FC = () => {
  useSyncLanguageWithPath();
  return null;
};

const LocaleOutlet: React.FC = () => <Outlet />;

const LegacyRedirect: React.FC<{ to: string }> = ({ to }) => {
  const location = useLocation();
  return (
    <Navigate
      to={{ pathname: to, search: location.search, hash: location.hash }}
      replace
    />
  );
};

const App: React.FC = () => {
  // Cleanup worker pool on unmount
  useWorkerPoolCleanup();

  return (
    <ErrorBoundary>
      <SettingsProvider>
        {/* Skip to main content link for keyboard users */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <FeatureWarnings />
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <LanguagePathSync />
          <Suspense fallback={null}>
            <Routes>
              {/* Canonical locale-based routes */}
              <Route path="/:lang" element={<LocaleOutlet />}>
                <Route index element={<Home />} />
                <Route path="Dithering" element={<Navigate to="Dithering/Image" replace />} />
                <Route path="Dithering/Image" element={<DitheringTool initialMode="image" />} />
                <Route path="Dithering/Video" element={<DitheringTool initialMode="video" />} />
                <Route path="Education" element={<Education />} />
                <Route path="Education/Basics" element={<EducationBasics />} />
                <Route path="Education/Practice" element={<EducationPractice />} />
                <Route path="Education/Algorithms" element={<AlgorithmExplorer />} />
                <Route path="Algorithms" element={<Navigate to="Education" replace />} />
              </Route>

              {/* Legacy (no-locale) entry points */}
              <Route path="/" element={<LegacyRedirect to="/en/" />} />
              <Route path="/Algorithms" element={<LegacyRedirect to="/en/Education" />} />
              <Route path="/Dithering" element={<LegacyRedirect to="/en/Dithering/Image" />} />
              <Route path="/Dithering/Image" element={<LegacyRedirect to="/en/Dithering/Image" />} />
              <Route path="/Dithering/Video" element={<LegacyRedirect to="/en/Dithering/Video" />} />
            </Routes>
          </Suspense>
        </Router>
      </SettingsProvider>
    </ErrorBoundary>
  );
};

export default App;
