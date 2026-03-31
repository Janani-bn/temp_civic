import { MapPin } from 'lucide-react';
import './Navbar.css';
import './Navbar.css';

const Navbar = ({ onOpenReport }) => {
  return (
    <nav className="navbar">
      <div className="container nav-container">
        <a href="/" className="logo">
          <MapPin className="logo-icon" size={28} />
          <span className="logo-text">CivicFix</span>
        </a>
<<<<<<< HEAD
        
=======

>>>>>>> 3717e99 (Added LiveMap feature)
        <div className="nav-links">
          <a href="#" className="nav-link">Platform</a>
          <a href="#" className="nav-link">Live Map</a>
          <a href="#" className="nav-link">Community</a>
<<<<<<< HEAD
        </div>
        
=======
          <a href="/map" className="nav-link">Live Map</a>
        </div>

>>>>>>> 3717e99 (Added LiveMap feature)
        <div className="nav-actions">
          <button className="btn btn-primary nav-btn" onClick={onOpenReport}>Report Issue</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
