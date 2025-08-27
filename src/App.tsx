import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ImageDitheringTool from "./pages/ImageDitheringTool";
import AlgorithmExplorer from "./pages/AlgorithmExplorer";

const App: React.FC = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Dithering" element={<ImageDitheringTool />} />
        <Route path="/Algorithms" element={<AlgorithmExplorer />} />
      </Routes>
    </Router>
  );
};

export default App;
