
import { ArrowRight, Map } from 'lucide-react';
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

        <div className="hero-content">
          <span className="hero-badge">Empowering Communities</span>
          <h1 className="hero-title">Report Civic Issues in Your Neighborhood</h1>

          <p className="hero-subtitle">
            Help make your neighborhood a better place by reporting local problems directly to the authorities. Together we can build a cleaner, safer community.
          </p>
          <div className="hero-cta">
            <button className="btn btn-primary btn-lg" onClick={onOpenReport}>
              Report an Issue Now
            </button>

            <button
              className="btn btn-secondary btn-lg"
              onClick={() => navigate('/map')}
            >
              <Map size={20} />

            {/* ✅ Now scrolls to the Live Map section */}
            <a href="#live-map" className="btn btn-secondary btn-lg"
              style={{ textDecoration: "none", display: "inline-block", textAlign: "center" }}>

              View Live Map
            </a>
          </div>
        </div>

        <div className="hero-visual animate-fade-in-delay-1">
        <div className="hero-visual">
          <div className="hero-card float-1">
            <div className="card-icon">!</div>
            <div>
              <strong>Pothole Fixed</strong>
              <span>2 hours ago</span>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <div className="mockup-frame">
              <div className="mockup-header">
                <div className="mockup-dot red"></div>
                <div className="mockup-dot yellow"></div>
                <div className="mockup-dot green"></div>
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
              <div className="mockup-body">
                <h3 className="mockup-title">Issue #12345</h3>
                <div className="mockup-status">Status: <span>In Progress</span></div>
                <div className="mockup-bar"></div>
                <div className="mockup-bar short"></div>
              </div>
            </div>
          </div>
          <div className="hero-card float-2">
            <div className="card-icon bg-green">✓</div>
            <div>
              <strong>Garbage Cleared</strong>
              <span>Just now</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;