import { Marker, Popup } from "react-leaflet";

function HazardMarker({ position, type }) {

  return (
    <Marker position={position}>
      <Popup>
        Hazard: {type}
      </Popup>
    </Marker>
  );

}

export default HazardMarker;