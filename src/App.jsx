import { BrowserRouter, Routes, Route } from "react-router-dom";
import DangerMap from "./pages/DangerMap";
import WatchMe from "./pages/WatchMe";
import TrackView from "./pages/TrackView";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/SOS";
import SOS from "./pages/SOS";
import SOSEvidence from "./pages/SOSEvidence";
import ERVideoCall from "./pages/ERVideoCall";
import Report from "./pages/Report";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DangerMap />} />
        <Route path="/watchme" element={<WatchMe />} />
        <Route path="/track/:journeyId" element={<TrackView />} /> {/* trusted contact link */}
        <Route path="/" element={<Home />} />
        <Route path="/sos" element={<SOS />} />
        <Route path="/sos/evidence" element={<SOSEvidence />} />
        <Route path="/sos/er" element={<ERVideoCall />} />
        <Route path="/report" element={<Report />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
