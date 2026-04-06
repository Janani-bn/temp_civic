import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ReportIssueModal from './components/ReportIssueModal';
import LiveMap from './components/LiveMap';
import HeroSection from './components/HeroSection';
import ExplainerSection from './components/ExplainerSection';
import SignUp from './components/SignUp';
import Login from './components/Login';
import TrackComplaint from './components/TrackComplaint';
import AdminDashboard from './components/AdminDashboard';
import VoiceGuideAssistant from './components/VoiceGuideAssistance';
import MyComplaints from './components/MyComplaints';
import AIChatbot from './components/AIChatbot';
import NearbyComplaints from './components/NearbyComplaints';
import ProtectedRoute from './components/ProtectedRoute';
import LiveFeed from './components/LiveFeed';
import VolunteerDashboard from './components/volunteerdashboard';

import { useState, useCallback } from 'react';
import './App.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function Home({ onOpenReport }) {
  return (
    <main>
      <HeroSection onOpenReport={onOpenReport} />
      <ExplainerSection />
      <LiveMap />
      <LiveFeed />
    </main>
  );
}

function App() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [aiPrefillData, setAiPrefillData] = useState(null);

  const handleAIPrefill = useCallback((data) => {
    setAiPrefillData(data);
    setIsReportModalOpen(true);
  }, []);

  return (
    <Router>
      <Navbar onOpenReport={() => setIsReportModalOpen(true)} />
      <Routes>
        <Route path="/" element={<Home onOpenReport={() => setIsReportModalOpen(true)} />} />
        <Route path="/feed" element={<LiveFeed />} />
        <Route path="/map" element={<LiveMap />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/track" element={<TrackComplaint />} />
        <Route
          path="/my-complaints"
          element={
            <ProtectedRoute>
              <MyComplaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/nearby-issues"
          element={
            <ProtectedRoute>
              <NearbyComplaints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer"
          element={
            <ProtectedRoute requiredRole="volunteer">
              <VolunteerDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Footer />

      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => { setIsReportModalOpen(false); setAiPrefillData(null); }}
        prefillData={aiPrefillData}
      />
      <VoiceGuideAssistant />
      <AIChatbot onPrefillReport={handleAIPrefill} />
    </Router>

  );
}

export default App;