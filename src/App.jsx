import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ExplainerSection from './components/ExplainerSection';
import StatsSection from './components/StatsSection';
import FeaturesSection from './components/FeaturesSection';
import Footer from './components/Footer';
import ReportIssueModal from './components/ReportIssueModal';
<<<<<<< HEAD
import { useState } from 'react';
import './App.css';
=======
import LiveMap from './components/LiveMap';
import { useState } from 'react';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function Home({ onOpenReport }) {
  return (
    <>
      <HeroSection onOpenReport={onOpenReport} />
      <ExplainerSection />
      <StatsSection />
      <FeaturesSection />
    </>
  );
}
>>>>>>> 3717e99 (Added LiveMap feature)

function App() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
<<<<<<< HEAD
    <>
      <Navbar onOpenReport={() => setIsReportModalOpen(true)} />
      <main>
        <HeroSection onOpenReport={() => setIsReportModalOpen(true)} />
        <ExplainerSection />
        <StatsSection />
        <FeaturesSection />
      </main>
      <Footer />
      <ReportIssueModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} />
    </>
  )
}

export default App;
=======
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
  );
}

export default App;
>>>>>>> 3717e99 (Added LiveMap feature)
