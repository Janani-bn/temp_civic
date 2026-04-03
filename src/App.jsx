import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ReportIssueModal from './components/ReportIssueModal';
import LiveMap from './components/LiveMap';
import HeroSection from './components/HeroSection';
import ExplainerSection from './components/ExplainerSection';
import StatsSection from './components/StatsSection';
import FeaturesSection from './components/FeaturesSection';
import SignUp from './components/SignUp';
import TrackComplaint from './components/TrackComplaint';
import AdminDashboard from './components/AdminDashboard';
import VoiceGuideAssistant from './components/VoiceGuideAssistance';

import { useState } from 'react';
import './App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function Home({ onOpenReport }) {
  return (
    <main>
      <HeroSection onOpenReport={onOpenReport} />
      <ExplainerSection />
      <LiveMap />
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
        <Route path="/signup" element={<SignUp />} />
        <Route path="/track" element={<TrackComplaint />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>

      <Footer />

      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
      <VoiceGuideAssistant />
    </Router>

  );
}

export default App;