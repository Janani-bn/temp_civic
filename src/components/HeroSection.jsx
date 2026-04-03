import { ArrowRight, Map, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import './HeroSection.css';

const HeroSection = ({ onOpenReport }) => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="container hero-container">
        <div className="hero-content animate-fade-in">
          <div className="hero-badge">AI-Powered Tech for Communities</div>
          <h1 className="hero-title">
            Empowering Citizens.<br />
            <span className="text-primary">Fixing Cities Faster.</span>
          </h1>
          <p className="hero-subtitle">
            Help make your neighborhood a better place by reporting local problems directly to the authorities. Together we can build a cleaner, safer community.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary btn-lg" onClick={onOpenReport} data-guide-id="report-button">
              Report an Issue Now
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/signup')}
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
              <UserPlus size={20} />
              Sign Up
            </button>
          </div>
        </div>

        <div className="hero-visual animate-fade-in-delay-1">
          <div className="hero-image-wrapper">
             <div className="mockup-frame">
              <div className="mockup-header">
                <div className="mockup-dot red"></div>
                <div className="mockup-dot yellow"></div>
                <div className="mockup-dot green"></div>
              </div>
              <div className="mockup-body">
                <h3 className="mockup-title">Issue #12345</h3>
                <div className="mockup-status">Status: <span>In Progress</span></div>
                <div className="mockup-bar"></div>
                <div className="mockup-bar short"></div>
              </div>
            </div>

            <div className="hero-card float-1 animate-fade-in-delay-2">
              <div className="card-icon"><Map size={18} /></div>
              <div>
                <strong>Water Leak Reported</strong>
                <span>2 mins ago</span>
              </div>
            </div>

            <div className="hero-card float-2 animate-fade-in-delay-2">
              <div className="card-icon bg-green"><ArrowRight size={18} /></div>
              <div>
                <strong>Streetlight Fixed</strong>
                <span>In your area</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;