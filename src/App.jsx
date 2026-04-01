import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ExplainerSection from './components/ExplainerSection';
import StatsSection from './components/StatsSection';
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';
import ReportIssueModal from './components/ReportIssueModal';

import LiveMap from './components/LiveMap';

import LiveMap from './components/LiveMap'; // ✅ normal import

import { useState } from 'react';
import './App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function Home({ onOpenReport }) {
  return (
    <main>
      <HeroSection onOpenReport={onOpenReport} />
      <ExplainerSection />
      <StatsSection />
      <FeaturesSection />
    </main>
  );
}

function App() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  return (
    <Router>
      <Navbar onOpenReport={() => setIsReportModalOpen(true)} />


      <Routes>
        <Route path="/" element={<Home onOpenReport={() => setIsReportModalOpen(true)} />} />
        <Route path="/map" element={<LiveMap />} />
      </Routes>

      <Footer />

      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </Router>

      <main>
        <HeroSection onOpenReport={() => setIsReportModalOpen(true)} />
        <ExplainerSection />
        <LiveMap />  {/* ✅ Map here */}
        <StatsSection />
        <FeaturesSection />
      </main>
      <Footer />
      <ReportIssueModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
    </>

  );
}

export default App;