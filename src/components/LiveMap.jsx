import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ✅ Fix marker icons on all machines
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// 🎨 Color by severity
const getSeverityColor = (severity) => {
    if (severity === 'high') return '#e53e3e';   // 🔴 Red
    if (severity === 'medium') return '#dd6b20'; // 🟠 Orange
    return '#38a169';                            // 🟢 Green
};

const createColoredIcon = (severity) =>
    L.divIcon({
        className: '',
        html: `<div style="
      background-color: ${getSeverityColor(severity)};
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 6px rgba(0,0,0,0.4);
    "></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
    });

// 📍 Auto-center map to user's location
const AutoCenter = ({ userLocation }) => {
    const map = useMap();
    useEffect(() => {
        if (userLocation) map.setView(userLocation, 13);
    }, [userLocation]);
    return null;
};

const LiveMap = () => {
    const [issues, setIssues] = useState([]);
    const [userLocation, setUserLocation] = useState([20.5937, 78.9629]); // Default: India center

    // 📡 Get user's GPS location
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
            () => console.log('Location access denied, using default.')
        );
    }, []);

    // 📦 Load issues from localStorage
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('civicfix_issues') || '[]');
        setIssues(stored);
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h2>Live Map</h2>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '10px', fontSize: '14px' }}>
                <span>🔴 High severity</span>
                <span>🟠 Medium severity</span>
                <span>🟢 Low severity</span>
            </div>

            {issues.length === 0 && (
                <p style={{ color: '#888', marginBottom: '10px', fontSize: '14px' }}>
                    No issues reported yet. Submit a report to see it on the map!
                </p>
            )}

            <MapContainer center={userLocation} zoom={13} style={{ height: '500px', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="© OpenStreetMap contributors"
                />
                <AutoCenter userLocation={userLocation} />

                {issues.map((issue, idx) => (
                    <Marker key={idx} position={issue.position} icon={createColoredIcon(issue.severity)}>
                        <Popup>
                            <strong>{issue.title}</strong><br />
                            📍 {issue.area}, {issue.city}<br />
                            📝 {issue.description || 'No description'}<br />
                            ⚠️ Severity: <b style={{ color: getSeverityColor(issue.severity) }}>{issue.severity}</b><br />
                            🔖 Status: <b>{issue.status}</b><br />
                            🕐 {new Date(issue.submittedAt).toLocaleDateString()}
                        </Popup>
                    </Marker>
                ))}
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