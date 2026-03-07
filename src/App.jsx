import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./services/supabaseClient";
import Navbar from "./components/Navbar";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import DangerMap from "./pages/DangerMap";
import SOS from "./pages/SOS";
import SOSEvidence from "./pages/SOSEvidence";
import ERVideoCall from "./pages/ERVideoCall";
import Report from "./pages/Report";
import EmergencyID from "./pages/EmergencyID";
import EmergencyCard from "./pages/EmergencyCard";
import Profile from "./pages/Profile";

import "./App.css";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center",
        height: "100vh", background: "#0f0f0f", color: "#fff",
      }}>
        Loading...
      </div>
    );
  }

  const ProtectedRoute = ({ element }) =>
    session ? element : <Navigate to="/login" />;

  const hideNavbar = ["/", "/dashboard", "/login", "/signup"];

  return (
    <>
      {!hideNavbar.includes(location.pathname) && <Navbar />}

      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected */}
        <Route path="/dashboard"    element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/danger-map"   element={<ProtectedRoute element={<DangerMap />} />} />
        <Route path="/sos"          element={<ProtectedRoute element={<SOS />} />} />
        <Route path="/sos/evidence" element={<ProtectedRoute element={<SOSEvidence />} />} />
        <Route path="/sos/er"       element={<ProtectedRoute element={<ERVideoCall />} />} />
        <Route path="/report"       element={<ProtectedRoute element={<Report />} />} />
        <Route path="/emergency-id" element={<ProtectedRoute element={<EmergencyID />} />} />
        <Route path="/profile"      element={<ProtectedRoute element={<Profile />} />} />

        {/* Public */}
        <Route path="/emergency-card/:userId" element={<EmergencyCard />} />
      </Routes>
    </>
  );
}

export default App;