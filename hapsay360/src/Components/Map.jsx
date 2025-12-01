import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";

// Fix marker icons (Leaflet bug)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function Map() {
  const [position, setPosition] = useState([8.482, 124.647]); // CDO default

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={position}>
        <Popup>Your selected location</Popup>
      </Marker>
    </MapContainer>
  );
}
