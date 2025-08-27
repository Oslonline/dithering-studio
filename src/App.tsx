import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ImageDitheringTool from "./pages/ImageDitheringTool";

const App: React.FC = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Dithering" element={<ImageDitheringTool />} />
      </Routes>
    </Router>
  );
};

export default App;
