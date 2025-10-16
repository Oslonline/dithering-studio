import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import DitheringTool from "./pages/DitheringTool";
import AlgorithmExplorer from "./pages/AlgorithmExplorer";
import ErrorBoundary from "./components/ErrorBoundary";
import { SettingsProvider } from "./state/SettingsProvider";

const App: React.FC = () => (
  <ErrorBoundary>
    <SettingsProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Dithering" element={<DitheringTool initialMode="image" />} />
          <Route path="/Dithering/Image" element={<DitheringTool initialMode="image" />} />
          <Route path="/Dithering/Video" element={<DitheringTool initialMode="video" />} />
          <Route path="/Algorithms" element={<AlgorithmExplorer />} />
        </Routes>
      </Router>
    </SettingsProvider>
  </ErrorBoundary>
);

export default App;
