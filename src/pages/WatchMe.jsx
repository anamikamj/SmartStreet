import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import RouteTracker from "../components/RouteTracker";
import SafetyScoreCard from "../components/SafetyScoreCard";
import {
  getCurrentLocation,
  startJourney,
  saveLocationPing,
  endJourney,
} from "../services/locationService";

function WatchMe() {
  const [route, setRoute] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [journeyId, setJourneyId] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [shareLink, setShareLink] = useState(null);
  const [copied, setCopied] = useState(false);

  async function handleStart() {
    const loc = await getCurrentLocation();
    setUserLocation(loc);
    const id = await startJourney(loc.lat, loc.lng);
    setJourneyId(id);
    setTracking(true);
    setShareLink(`${window.location.origin}/track/${id}`);
  }

  async function handleStop() {
    setTracking(false);
    if (journeyId) await endJourney(journeyId);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  useEffect(() => {
    if (!tracking || !journeyId) return;
    const interval = setInterval(async () => {
      const loc = await getCurrentLocation();
      setUserLocation(loc);
      setRoute((prev) => [...prev, [loc.lat, loc.lng]]);
      await saveLocationPing(journeyId, loc.lat, loc.lng);
    }, 5000);
    return () => clearInterval(interval);
  }, [tracking, journeyId]);

  const center = userLocation ? [userLocation.lat, userLocation.lng] : [9.98, 76.29];

  return (
    // position: fixed + inset: 0 makes this fill the entire viewport with no gaps
    <div style={{ position: "fixed", inset: 0 }}>

      {/* Map fills the entire container */}
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>📍 You are here</Popup>
          </Marker>
        )}
        <RouteTracker positions={route} />
      </MapContainer>

      {/* Safety card floats top-left over the map */}
      <div style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        zIndex: 1000,
      }}>
        <SafetyScoreCard
          score={11}
          level="Dangerous"
          color="#c0392b"
          advice="Serious threat history. Do not travel alone. Call for help if needed."
          counts={{ offenders: 1, abductions: 2, crimes: 1, unsafeZones: 2 }}
        />
      </div>

      {/* Controls float bottom-center over the map */}
      <div style={{
        position: "absolute",
        bottom: "28px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
      }}>
        {!tracking ? (
          <button onClick={handleStart} style={btnStyle("#16a34a")}>
            ▶ Start Sharing Location
          </button>
        ) : (
          <button onClick={handleStop} style={btnStyle("#dc2626")}>
            ⏹ Stop Sharing
          </button>
        )}

        {shareLink && (
          <div style={{
            background: "rgba(10,10,10,0.85)",
            border: "1px solid #333",
            borderRadius: "10px",
            padding: "10px 14px",
            display: "flex",
            gap: "8px",
            alignItems: "center",
            backdropFilter: "blur(8px)",
          }}>
            <input readOnly value={shareLink} style={inputStyle} />
            <button onClick={handleCopy} style={btnStyle(copied ? "#555" : "#2563eb")}>
              {copied ? "Copied!" : "Copy"}
            </button>
            <span style={{ fontSize: "12px", color: tracking ? "limegreen" : "#f87171", whiteSpace: "nowrap" }}>
              {tracking ? "🟢 Live" : "🔴 Stopped"}
            </span>
          </div>
        )}
      </div>

    </div>
  );
}

const btnStyle = (bg) => ({
  background: bg,
  color: "white",
  border: "none",
  padding: "10px 20px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  whiteSpace: "nowrap",
  boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
});

const inputStyle = {
  width: "220px",
  padding: "7px 10px",
  borderRadius: "6px",
  border: "1px solid #444",
  background: "#111",
  color: "white",
  fontSize: "12px",
};

export default WatchMe;