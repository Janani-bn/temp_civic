import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VolunteerDashboard.css";

const HIGH_CASE_VOLUNTEER_THRESHOLD = 10;

const SEVERITY_COLOR = {
    Low: "sev-low",
    Medium: "sev-med",
    High: "sev-high",
};

const canVolunteerTake = (report) => {
    if (report.severity === "Low" || report.severity === "Medium") return true;
    if (
        report.severity === "High" &&
        report.status !== "Resolved" &&
        (report.reportCount || 1) < HIGH_CASE_VOLUNTEER_THRESHOLD
    )
        return true;
    return false;
};

const VolunteerDashboard = () => {
    const [reports, setReports] = useState([]);
    const [filter, setFilter] = useState("All");
    const [claimedIds, setClaimedIds] = useState([]);
    const navigate = useNavigate();

    const volunteerName =
        localStorage.getItem("userName") || "Volunteer";

    useEffect(() => {
        const role = localStorage.getItem("userRole");
        if (role !== "volunteer") navigate("/");

        const raw = localStorage.getItem("reports");
        const all = raw ? JSON.parse(raw) : [];
        const available = all.filter(
            (r) => r.status !== "Resolved" && canVolunteerTake(r)
        );
        setReports(available);

        const claimed = JSON.parse(
            localStorage.getItem("volunteerClaimed") || "[]"
        );
        setClaimedIds(claimed);
    }, [navigate]);

    const handleClaim = (id) => {
        const updated = [...claimedIds, id];
        setClaimedIds(updated);
        localStorage.setItem("volunteerClaimed", JSON.stringify(updated));

        const raw = localStorage.getItem("reports");
        const all = raw ? JSON.parse(raw) : [];
        const patched = all.map((r) =>
            r.id === id ? { ...r, status: "In Progress", claimedBy: volunteerName } : r
        );
        localStorage.setItem("reports", JSON.stringify(patched));
        setReports((prev) =>
            prev.map((r) =>
                r.id === id ? { ...r, status: "In Progress", claimedBy: volunteerName } : r
            )
        );
    };

    const handleResolve = (id) => {
        const raw = localStorage.getItem("reports");
        const all = raw ? JSON.parse(raw) : [];
        const patched = all.map((r) =>
            r.id === id ? { ...r, status: "Resolved", resolvedBy: volunteerName } : r
        );
        localStorage.setItem("reports", JSON.stringify(patched));
        setReports((prev) => prev.filter((r) => r.id !== id));
        setClaimedIds((prev) => prev.filter((c) => c !== id));
        const updatedClaimed = claimedIds.filter((c) => c !== id);
        localStorage.setItem("volunteerClaimed", JSON.stringify(updatedClaimed));
    };

    const filtered =
        filter === "All"
            ? reports
            : reports.filter((r) => r.severity === filter);

    const myCases = reports.filter((r) => claimedIds.includes(r.id));
    const availableCases = reports.filter((r) => !claimedIds.includes(r.id));

    return (
        <div className="vdash-wrap">
            <div className="vdash-header">
                <div>
                    <h2 className="vdash-title">Volunteer Dashboard</h2>
                    <p className="vdash-sub">Welcome, {volunteerName}</p>
                </div>
                <div className="vdash-stats">
                    <div className="vstat">
                        <p className="vstat-val">{myCases.length}</p>
                        <p className="vstat-label">My active cases</p>
                    </div>
                    <div className="vstat">
                        <p className="vstat-val">{availableCases.length}</p>
                        <p className="vstat-label">Available to claim</p>
                    </div>
                </div>
            </div>

            <div className="vdash-notice">
                <span className="notice-icon">ℹ</span>
                You can resolve <strong>Low</strong> and <strong>Moderate</strong> cases
                directly. <strong>High severity</strong> cases are shown only when they
                are unresolved and under-reported — government handles the rest.
            </div>

            {/* My claimed cases */}
            {myCases.length > 0 && (
                <div className="vsection">
                    <h3 className="vsection-title">My claimed cases</h3>
                    <div className="vcard-list">
                        {myCases.map((r) => (
                            <div className="vcard claimed" key={r.id}>
                                <div className="vcard-top">
                                    <span className={`vsev ${SEVERITY_COLOR[r.severity]}`}>
                                        {r.severity}
                                    </span>
                                    <span className="vcard-type">{r.issueType}</span>
                                </div>
                                <p className="vcard-place">📍 {r.place || "Location not specified"}</p>
                                <p className="vcard-date">Reported on {r.date}</p>
                                {r.description && (
                                    <p className="vcard-desc">{r.description}</p>
                                )}
                                <div className="vcard-actions">
                                    <span className="in-progress-badge">In progress</span>
                                    <button
                                        className="vbtn-resolve"
                                        onClick={() => handleResolve(r.id)}
                                    >
                                        Mark as resolved
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Filter */}
            <div className="vfilter-row">
                {["All", "Low", "Medium", "High"].map((f) => (
                    <button
                        key={f}
                        className={`vfilter-btn ${filter === f ? "active" : ""}`}
                        onClick={() => setFilter(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Available cases */}
            <div className="vsection">
                <h3 className="vsection-title">Available cases</h3>
                {availableCases.length === 0 ? (
                    <div className="vempty">No cases available right now. Check back later!</div>
                ) : (
                    <div className="vcard-list">
                        {filtered
                            .filter((r) => !claimedIds.includes(r.id))
                            .map((r) => (
                                <div className="vcard" key={r.id}>
                                    <div className="vcard-top">
                                        <span className={`vsev ${SEVERITY_COLOR[r.severity]}`}>
                                            {r.severity}
                                        </span>
                                        <span className="vcard-type">{r.issueType}</span>
                                        {r.severity === "High" && (
                                            <span className="high-tag">Low count — volunteer eligible</span>
                                        )}
                                    </div>
                                    <p className="vcard-place">📍 {r.place || "Location not specified"}</p>
                                    <p className="vcard-date">Reported on {r.date}</p>
                                    {r.description && (
                                        <p className="vcard-desc">{r.description}</p>
                                    )}
                                    <div className="vcard-actions">
                                        <button
                                            className="vbtn-claim"
                                            onClick={() => handleClaim(r.id)}
                                        >
                                            Claim this case
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VolunteerDashboard;