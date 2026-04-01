import { MapPin } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ onOpenReport }) => {
  return (
    <nav className="navbar">
      <div className="container nav-container">
        <a href="/" className="logo">
          <MapPin className="logo-icon" size={28} />
          <span className="logo-text">CivicFix</span>
        </a>
        <div className="nav-links">
          <a href="#" className="nav-link">Platform</a>
          <a href="/map" className="nav-link">Live Map</a>
          <a href="#live-map" className="nav-link">Live Map</a>  {/* ✅ scrolls to map */}
          <a href="#" className="nav-link">Community</a>
        </div>
        <div className="nav-actions">
          <button className="btn btn-primary nav-btn" onClick={onOpenReport}>
            Report Issue
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
