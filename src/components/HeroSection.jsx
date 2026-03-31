import { ArrowRight, Map } from 'lucide-react';
<<<<<<< HEAD
import './HeroSection.css';
import './HeroSection.css';

const HeroSection = ({ onOpenReport }) => {
  return (
    <section className="hero section">
      <div className="container hero-container">
        
        <div className="hero-content animate-fade-in">
          <div className="hero-badge">AI-Powered Tech for Communities</div>
=======
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = ({ onOpenReport }) => {
  const navigate = useNavigate();

  return (
    <section className="hero section">
      <div className="container hero-container">

        <div className="hero-content">
          <div className="hero-badge">AI-Powered Tech for Communities</div>

>>>>>>> 3717e99 (Added LiveMap feature)
          <h1 className="hero-title">
            Empowering Citizens.<br />
            <span className="text-primary">Fixing Cities Faster.</span>
          </h1>
<<<<<<< HEAD
          <p className="hero-subtitle">
            Report local issues instantly, track resolutions in real-time, and join a connected community shaping a better tomorrow together.
          </p>
          
=======

          <p className="hero-subtitle">
            Report local issues instantly, track resolutions in real-time.
          </p>

>>>>>>> 3717e99 (Added LiveMap feature)
          <div className="hero-cta">
            <button className="btn btn-primary btn-lg" onClick={onOpenReport}>
              Report an Issue
              <ArrowRight size={20} />
            </button>
<<<<<<< HEAD
            <button className="btn btn-secondary btn-lg">
=======

            <button
              className="btn btn-secondary btn-lg"
              onClick={() => navigate('/map')}
            >
>>>>>>> 3717e99 (Added LiveMap feature)
              <Map size={20} />
              View Live Map
            </button>
          </div>
        </div>
<<<<<<< HEAD
        
        <div className="hero-visual animate-fade-in-delay-1">
          <div className="hero-image-wrapper">
            <div className="mockup-frame">
              <div className="mockup-content">
                <div className="mockup-header">
                  <div className="mockup-dot red"></div>
                  <div className="mockup-dot yellow"></div>
                  <div className="mockup-dot green"></div>
                </div>
                <div className="mockup-body">
                  <div className="mockup-title">Issue #3482: Pothole on 5th Ave</div>
                  <div className="mockup-status">Status: <span>Resolving</span></div>
                  <div className="mockup-bar"></div>
                  <div className="mockup-bar short"></div>
                </div>
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
=======
>>>>>>> 3717e99 (Added LiveMap feature)

      </div>
    </section>
  );
};

<<<<<<< HEAD
export default HeroSection;
=======
export default HeroSection;
>>>>>>> 3717e99 (Added LiveMap feature)
