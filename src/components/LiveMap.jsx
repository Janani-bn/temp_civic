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
    );
};

export default LiveMap;