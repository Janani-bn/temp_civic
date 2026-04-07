import { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Components
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
import NearbyComplaints from './components/NearbyComplaints';
import ProtectedRoute from './components/ProtectedRoute';
import LiveFeed from './components/LiveFeed';
import VolunteerDashboard from './components/volunteerdashboard';
import WelcomeOverlay from './components/WelcomeOverlay';
import LiveChatbot from './components/LiveChatbot';

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
  const [reportPreFillData, setReportPreFillData] = useState(null);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [guideStart, setGuideStart] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-IN');

  const handleOpenReport = useCallback((data = null) => {
    setReportPreFillData(data);
    setIsReportModalOpen(true);
  }, []);

  const handleCloseReport = useCallback(() => {
    setIsReportModalOpen(false);
    setReportPreFillData(null);
  }, []);

  return (
    <Router>
      <Navbar onOpenReport={() => handleOpenReport()} />
      <Routes>
        <Route path="/" element={<Home onOpenReport={() => handleOpenReport()} />} />
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
        onClose={handleCloseReport}
        initialData={reportPreFillData}
      />

      <LiveChatbot 
        onAutoFill={handleOpenReport} 
        forceOpen={chatbotOpen} 
        onForceOpened={() => setChatbotOpen(false)} 
      />

      <VoiceGuideAssistant
        externalStart={guideStart}
        onExternalStarted={() => setGuideStart(false)}
        onOpenChatbot={() => setChatbotOpen(true)}
        selectedLanguage={selectedLanguage}
      />

      <WelcomeOverlay
        onStartGuide={() => setGuideStart(true)}
        onOpenChatbot={() => setChatbotOpen(true)}
        onLanguageSelect={(lang) => setSelectedLanguage(lang)}
      />
    </Router>
  );
}

export default App;