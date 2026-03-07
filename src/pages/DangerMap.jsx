import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import SafetyScoreCard from "../components/SafetyScoreCard";
import { getCurrentLocation } from "../services/locationService";
import {
  getOffenders,
  getAbductionCases,
  getCrimeReports,
  getUnsafeZones,
} from "../services/mapService";
import { calculateSafetyScore } from "../services/safetyScore";

const markerColors = {
  sex_offender: "red",
  abductor: "darkred",
  violent: "orangered",
  assault: "orange",
  harassment: "gold",
  stalking: "purple",
  robbery: "brown",
  dark_alley: "gray",
  no_cctv: "slategray",
  known_hotspot: "crimson",
  default: "black",
};

function DangerMap() {
  const [userLocation, setUserLocation] = useState(null);
  const [offenders, setOffenders] = useState([]);
  const [abductions, setAbductions] = useState([]);
  const [crimes, setCrimes] = useState([]);
  const [unsafeZones, setUnsafeZones] = useState([]);
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const location = await getCurrentLocation();
        setUserLocation(location);

        const [o, a, c, u] = await Promise.all([
          getOffenders(),
          getAbductionCases(),
          getCrimeReports(),
          getUnsafeZones(),
        ]);

        setOffenders(o);
        setAbductions(a);
        setCrimes(c);
        setUnsafeZones(u);

        const score = calculateSafetyScore(o, a, c, u, location);
        setScoreData(score);
      } catch (err) {
        console.error(err);
        setError("Could not load map. Please allow location access.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <p style={{ color: "white", padding: 20 }}>📍 Getting your location...</p>;
  if (error) return <p style={{ color: "red", padding: 20 }}>{error}</p>;

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", padding: "16px" }}>

      {/* Map wrapper with overlay */}
      <div style={{ position: "relative" }}>

        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={15}
          style={{ height: "calc(100vh - 100px)", borderRadius: "12px" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={500}
            pathOptions={{ color: scoreData.color, fillOpacity: 0.08 }}
          />

          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>📍 You are here</Popup>
          </Marker>

          {offenders.map((o) => (
            <Circle
              key={o.id}
              center={[o.latitude, o.longitude]}
              radius={40}
              pathOptions={{ color: "red", fillColor: "red", fillOpacity: 0.6 }}
            >
              <Popup>🚨 {o.offender_type?.replace("_", " ")}<br />{o.last_seen_area}</Popup>
            </Circle>
          ))}

          {abductions.map((a) => (
            <Circle
              key={a.id}
              center={[a.latitude, a.longitude]}
              radius={40}
              pathOptions={{ color: "darkred", fillColor: "darkred", fillOpacity: 0.6 }}
            >
              <Popup>⚠️ Abduction Case ({a.year})<br />{a.description}</Popup>
            </Circle>
          ))}

          {crimes.map((c) => (
            <Circle
              key={c.id}
              center={[c.latitude, c.longitude]}
              radius={40}
              pathOptions={{
                color: markerColors[c.crime_type] || markerColors.default,
                fillOpacity: 0.6,
              }}
            >
              <Popup>🔴 {c.crime_type}<br />{c.description}</Popup>
            </Circle>
          ))}

          {unsafeZones.map((u) => (
            <Circle
              key={u.id}
              center={[u.latitude, u.longitude]}
              radius={60}
              pathOptions={{ color: "gray", fillColor: "gray", fillOpacity: 0.4 }}
            >
              <Popup>⚠️ {u.zone_type?.replace("_", " ")}<br />{u.description}</Popup>
            </Circle>
          ))}
        </MapContainer>

        {/* SafetyScoreCard overlay — top left */}
        <div style={{
          position: "absolute",
          top: "16px",
          left: "16px",
          zIndex: 1000,
          maxWidth: "240px",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
        }}>
          <SafetyScoreCard
            score={scoreData.score}
            level={scoreData.level}
            color={scoreData.color}
            advice={scoreData.advice}
            counts={scoreData.counts}
          />
        </div>

        {/* Legend overlay — bottom left */}
        <div style={{
          position: "absolute",
          bottom: "16px",
          left: "16px",
          zIndex: 1000,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(8px)",
          borderRadius: "8px",
          padding: "8px 12px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          fontSize: "11px",
          color: "#ccc",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <span>🔴 Offender</span>
          <span style={{ color: "salmon" }}>🔴 Abduction</span>
          <span style={{ color: "orange" }}>🟠 Crime</span>
          <span style={{ color: "#aaa" }}>⚫ Unsafe Zone</span>
        </div>

      </div>
    </div>
  );
}

export default DangerMap;