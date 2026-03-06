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

// Color per crime type
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
        console.log(location);
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
    <div style={{ padding: "16px", background: "#0a0a0a", minHeight: "100vh" }}>
      <h2 style={{ color: "white" }}>🛡️ Street Safety</h2>

      <SafetyScoreCard
        score={scoreData.score}
        level={scoreData.level}
        color={scoreData.color}
        advice={scoreData.advice}
        counts={scoreData.counts}
      />

      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={15}
        style={{ height: "480px", borderRadius: "12px" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* 500m safety radius around user */}
        <Circle
          center={[userLocation.lat, userLocation.lng]}
          radius={500}
          pathOptions={{ color: scoreData.color, fillOpacity: 0.08 }}
        />

        {/* User */}
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>📍 You are here</Popup>
        </Marker>

        {/* Offenders */}
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

        {/* Abduction cases */}
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

        {/* Crime reports */}
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

        {/* Unsafe zones */}
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

      {/* Legend */}
      <div style={{ marginTop: "12px", color: "#aaa", fontSize: "12px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <span>🔴 Offender</span>
        <span style={{ color: "darkred" }}>🔴 Abduction</span>
        <span style={{ color: "orange" }}>🟠 Crime</span>
        <span style={{ color: "gray" }}>⚫ Unsafe Zone</span>
      </div>
    </div>
  );
}

export default DangerMap;
