import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ onOpenReport }) => {
  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="logo">
          <MapPin className="logo-icon" size={28} />
          <span className="logo-text">CivicFix</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/map" className="nav-link">Live Map</Link>
          <Link to="/track" className="nav-link" data-guide-id="track-link">Track Status</Link>
          <Link to="/admin" className="nav-link admin-link-pill">Admin Portal</Link>
        </div>
        <div className="nav-actions">
          <button className="btn btn-primary nav-btn" onClick={onOpenReport} data-guide-id="report-button">
            Report Issue
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
