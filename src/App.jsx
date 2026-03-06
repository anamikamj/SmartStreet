import { BrowserRouter, Routes, Route } from "react-router-dom";
import DangerMap from "./pages/DangerMap";
import WatchMe from "./pages/WatchMe";
import TrackView from "./pages/TrackView";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DangerMap />} />
        <Route path="/watchme" element={<WatchMe />} />
        <Route path="/track/:journeyId" element={<TrackView />} /> {/* trusted contact link */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
