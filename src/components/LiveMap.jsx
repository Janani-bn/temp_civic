import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { API_BASE } from "../services/api";
import { useEffect, useState, useCallback } from "react";

const getColor = (severity) => {
    const s = String(severity || "").toLowerCase();
    if (s === "high") return "red";
    if (s === "medium") return "orange";
    return "green";
};

// Recenter map to user's location
const RecenterMap = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
        if (coords) {
            map.setView([coords.lat, coords.lng], 15);
        }
    }, [coords, map]);
    return null;
};

const LiveMap = () => {
    const [reports, setReports] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [locating, setLocating] = useState(false);

    // Load reports from both API (backend) and localStorage (immediate local)
    const loadReports = useCallback(async () => {
        let apiReports = [];
        try {
            const res = await fetch(`${API_BASE}/complaints`);
            const data = await res.json();
            if (res.ok) apiReports = data.data || [];
        } catch (err) {
            console.error("Failed to fetch reports from API:", err);
        }

        const localReports = JSON.parse(localStorage.getItem("reports") || "[]");
        
        // Merge them, avoiding duplicates by complaint ID
        const merged = [...apiReports];
        const apiIds = new Set(apiReports.map(r => r.complaint_id || r.id));
        
        localReports.forEach(r => {
            const id = r.complaint_id || r.id;
            if (id && !apiIds.has(id)) {
                merged.push(r);
            }
        });

        // Normalize lat/lng property names
        const normalized = merged.map(r => ({
            ...r,
            lat: r.latitude || r.lat,
            lng: r.longitude || r.lng,
            issueType: r.issue_type || r.issueType || "Unknown",
            place: r.area ? `${r.area}, ${r.city}` : (r.place || "Unknown"),
            severity: r.severity || "Low",
            status: r.status || "Pending",
            date: r.created_at ? new Date(r.created_at).toLocaleDateString() : (r.date || "Today")
        })).filter(r => r.lat && r.lng);

        setReports(normalized);
    }, []);

    useEffect(() => {
        loadReports();
        
        // Listen for new reports from the modal in the same tab
        window.addEventListener('civicfix:complaint-created', loadReports);
        
        // Refresh periodically for reports from other users
        const interval = setInterval(loadReports, 10000);
        
        return () => {
            window.removeEventListener('civicfix:complaint-created', loadReports);
            clearInterval(interval);
        };
    }, [loadReports]);

    // Auto-request location on mount
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser.");
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setUserLocation(coords);
                setLocating(false);
                // Save to localStorage so report form can use it
                localStorage.setItem("userLocation", JSON.stringify(coords));
            },
            (error) => {
                setLocating(false);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setLocationError("Location access denied. Please allow location in browser settings.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setLocationError("Location unavailable. Showing default map.");
                        break;
                    case error.TIMEOUT:
                        setLocationError("Location request timed out. Showing default map.");
                        break;
                    default:
                        setLocationError("Could not get location.");
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    }, []);

    // Group reports by same location
    const grouped = {};
    reports.forEach((r) => {
        if (!r.lat || !r.lng) return;
        const key = `${parseFloat(r.lat).toFixed(4)}-${parseFloat(r.lng).toFixed(4)}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(r);
    });

    const defaultCenter = [13.0827, 80.2707]; // Chennai

    return (
        <div style={{ height: "650px", padding: "20px" }}>
            <h2 style={{ textAlign: "center" }}>🗺️ Live Issue Map</h2>

            {/* Status bar */}
            <div style={{ textAlign: "center", marginBottom: "6px", fontSize: "13px", color: "#555" }}>
                {locating && "📍 Getting your location..."}
                {!locating && userLocation && `📍 Location detected — showing issues near you`}
                {!locating && locationError && `⚠️ ${locationError}`}
            </div>

            {/* Legend + count */}
            <div style={{ textAlign: "center", marginBottom: "10px", fontSize: "14px" }}>
                🔴 High &nbsp;|&nbsp; 🟡 Medium &nbsp;|&nbsp; 🟢 Low
                <span style={{ marginLeft: "16px", color: "#888", fontSize: "13px" }}>
                    {reports.filter(r => r.lat && r.lng).length} issue(s) on map
                    {reports.filter(r => !r.lat || !r.lng).length > 0 &&
                        ` · ${reports.filter(r => !r.lat || !r.lng).length} without location`}
                </span>
            </div>

            <MapContainer
                center={userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter}
                zoom={13}
                style={{ height: "550px", borderRadius: "12px" }}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Recenter when location is obtained */}
                {userLocation && <RecenterMap coords={userLocation} />}

                {/* User's own location marker */}
                {userLocation && (
                    <CircleMarker
                        center={[userLocation.lat, userLocation.lng]}
                        radius={10}
                        pathOptions={{
                            color: "#1a73e8",
                            fillColor: "#4da3ff",
                            fillOpacity: 0.9,
                        }}
                    >
                        <Popup>
                            <strong>📍 Your location</strong>
                        </Popup>
                    </CircleMarker>
                )}

                {/* Render grouped issue markers */}
                {Object.values(grouped).map((group, groupIndex) =>
                    group.map((report, i) => {
                        const angle = (i / group.length) * 2 * Math.PI;
                        const offset = group.length > 1 ? 0.0003 : 0;
                        const lat = parseFloat(report.lat) + offset * Math.cos(angle);
                        const lng = parseFloat(report.lng) + offset * Math.sin(angle);

                        return (
                            <CircleMarker
                                key={`${groupIndex}-${i}`}
                                center={[lat, lng]}
                                radius={8}
                                pathOptions={{
                                    color: getColor(report.severity),
                                    fillColor: getColor(report.severity),
                                    fillOpacity: 0.8,
                                }}
                            >
                                <Popup>
                                    <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
                                        <strong>{report.issueType}</strong>
                                        <br />📍 {report.place || "Location not specified"}
                                        <br />⚠️ {report.severity}
                                        <br />📅 {report.date}
                                        <br />🏢 {report.department}
                                        <br />📊 {report.status}
                                        {group.length > 1 && (
                                            <div style={{ marginTop: "6px", color: "#e67e22", fontWeight: "500" }}>
                                                🔥 {group.length} issues at this location
                                            </div>
                                        )}
                                    </div>
                                </Popup>
                            </CircleMarker>
                        );
                    })
                )}
            </MapContainer>
        </div>
    );
};

export default LiveMap;