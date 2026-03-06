import { Polyline } from "react-leaflet";

function RouteTracker({ positions }) {

  if (!positions.length) return null;

  return (
    <Polyline positions={positions} />
  );

}

export default RouteTracker;