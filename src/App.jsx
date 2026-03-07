import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./services/supabaseClient";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import DangerMap from "./pages/DangerMap";
import WatchMe from "./pages/WatchMe";
import TrackView from "./pages/TrackView";
import SOS from "./pages/SOS";
import SOSEvidence from "./pages/SOSEvidence";
import ERVideoCall from "./pages/ERVideoCall";
import Report from "./pages/Report";
import EmergencyID from "./pages/EmergencyID";
import EmergencyCard from "./pages/EmergencyCard";
import "./App.css";

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Protected routes - require authentication */}
      <Route
        path="/dashboard"
        element={session ? <Dashboard /> : <Navigate to="/login" />}
      />
      <Route
        path="/danger-map"
        element={session ? <DangerMap /> : <Navigate to="/login" />}
      />
      <Route
        path="/watchme"
        element={session ? <WatchMe /> : <Navigate to="/login" />}
      />
      <Route
        path="/track/:journeyId"
        element={session ? <TrackView /> : <Navigate to="/login" />}
      />
      <Route
        path="/sos"
        element={session ? <SOS /> : <Navigate to="/login" />}
      />
      <Route
        path="/sos/evidence"
        element={session ? <SOSEvidence /> : <Navigate to="/login" />}
      />
      <Route
        path="/sos/er"
        element={session ? <ERVideoCall /> : <Navigate to="/login" />}
      />
      <Route
        path="/report"
        element={session ? <Report /> : <Navigate to="/login" />}
      />
      <Route
        path="/emergency-id"
        element={session ? <EmergencyID /> : <Navigate to="/login" />}
      />
      
      {/* Public emergency card - can be viewed without login */}
      <Route path="/emergency-card/:userId" element={<EmergencyCard />} />
    </Routes>
  );
}

export default App;