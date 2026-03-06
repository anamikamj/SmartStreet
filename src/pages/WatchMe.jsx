import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import RouteTracker from "../components/RouteTracker";
import {
  getCurrentLocation,
  startJourney,
  saveLocationPing,
  endJourney,
  getJourneyLocations,
} from "../services/locationService";

function WatchMe() {
  const [route, setRoute] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [journeyId, setJourneyId] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [shareLink, setShareLink] = useState(null);
  const [copied, setCopied] = useState(false);

  // Start tracking
  async function handleStart() {
    const loc = await getCurrentLocation();
    setUserLocation(loc);

    const id = await startJourney(loc.lat, loc.lng);
    setJourneyId(id);
    setTracking(true);

    // Generate shareable link
    const link = `${window.location.origin}/track/${id}`;
    setShareLink(link);
  }

  // Stop tracking
  async function handleStop() {
    setTracking(false);
    if (journeyId) await endJourney(journeyId);
  }

  // Copy link to clipboard
  async function handleCopy() {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Ping location every 5 seconds while tracking
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
    <div style={{ padding: "16px" }}>
      <h2>👁️ Watch Me</h2>
      <p style={{ color: "#666" }}>
        Share your live location with a trusted contact.
      </p>

      {/* Controls */}
      <div style={{ marginBottom: "12px", display: "flex", gap: "10px" }}>
        {!tracking ? (
          <button
            onClick={handleStart}
            style={btnStyle("green")}
          >
            ▶ Start Sharing Location
          </button>
        ) : (
          <button
            onClick={handleStop}
            style={btnStyle("red")}
          >
            ⏹ Stop Sharing
          </button>
        )}
      </div>

      {/* Share link */}
      {shareLink && (
        <div style={linkBoxStyle}>
          <p style={{ margin: 0, fontSize: "13px", color: "#aaa" }}>
            📤 Share this link with your trusted contact:
          </p>
          <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
            <input
              readOnly
              value={shareLink}
              style={inputStyle}
            />
            <button onClick={handleCopy} style={btnStyle(copied ? "gray" : "blue")}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          {tracking && (
            <p style={{ color: "limegreen", fontSize: "12px", marginTop: "6px" }}>
              🟢 Live — updating every 5 seconds
            </p>
          )}
          {!tracking && (
            <p style={{ color: "red", fontSize: "12px", marginTop: "6px" }}>
              🔴 Stopped
            </p>
          )}
        </div>
      )}

      {/* Map */}
      <MapContainer center={center} zoom={14} style={{ height: "450px", borderRadius: "10px" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>📍 You are here</Popup>
          </Marker>
        )}
        <RouteTracker positions={route} />
      </MapContainer>
    </div>
  );
}

// Inline styles
const btnStyle = (color) => ({
  background: color,
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
});

const linkBoxStyle = {
  background: "#1a1a1a",
  border: "1px solid #333",
  borderRadius: "8px",
  padding: "12px",
  marginBottom: "14px",
};

const inputStyle = {
  flex: 1,
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #444",
  background: "#111",
  color: "white",
  fontSize: "13px",
};

export default WatchMe;