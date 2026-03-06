import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import RouteTracker from "../components/RouteTracker";
import { getJourneyLocations } from "../services/locationService";

function TrackView() {
  const { journeyId } = useParams();
  const [route, setRoute] = useState([]);
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    // Poll every 5 seconds for new location pings
    async function fetchLocations() {
      const locs = await getJourneyLocations(journeyId);
      if (locs.length > 0) {
        const positions = locs.map((l) => [l.latitude, l.longitude]);
        setRoute(positions);
        setLatest(positions[positions.length - 1]);
      }
    }

    fetchLocations();
    const interval = setInterval(fetchLocations, 5000);
    return () => clearInterval(interval);
  }, [journeyId]);

  const center = latest || [9.98, 76.29];

  return (
    <div style={{ padding: "16px" }}>
      <h2>📍 Live Location</h2>
      <p style={{ color: "#aaa" }}>Tracking journey: {journeyId}</p>
      {latest ? (
        <p style={{ color: "limegreen" }}>🟢 Live — updates every 5 seconds</p>
      ) : (
        <p style={{ color: "#aaa" }}>Waiting for location data...</p>
      )}

      <MapContainer center={center} zoom={15} style={{ height: "500px", borderRadius: "10px" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {latest && (
          <Marker position={latest}>
            <Popup>📍 Current location</Popup>
          </Marker>
        )}
        <RouteTracker positions={route} />
      </MapContainer>
    </div>
  );
}

export default TrackView;