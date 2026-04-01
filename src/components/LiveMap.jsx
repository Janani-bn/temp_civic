import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const icon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const LiveMap = () => {
    const position = [13.0827, 80.2707]; // Chennai

    return (
        <div style={{ padding: "20px" }}>
            <h2>Live Map</h2>

            <MapContainer
                center={position}
                zoom={13}
                style={{ height: "500px", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={position} icon={icon}>
                    <Popup>🚨 Issue reported here</Popup>
                </Marker>
            </MapContainer>
        </div>
import L from 'leaflet';

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LiveMap = () => {
    const position = [13.0827, 80.2707];
    return (
        <section id="live-map" style={{ padding: "40px 20px" }}>
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Live Map</h2>
            <MapContainer
                center={position}
                zoom={13}
                style={{ height: "500px", width: "100%", borderRadius: "16px" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />
                <Marker position={position}>
                    <Popup>🚨 Issue reported here</Popup>
                </Marker>
            </MapContainer>
        </section>
    );
};

export default LiveMap;