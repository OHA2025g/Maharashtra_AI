import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import components
import Dashboard from './components/Dashboard';
import StateDashboard from './components/StateDashboard';
import DistrictDashboard from './components/DistrictDashboard';
import BlockDashboard from './components/BlockDashboard';
import SchoolDashboard from './components/SchoolDashboard';
import DomainDashboard from './components/DomainDashboard';
import Navigation from './components/Navigation';
import ScrollToTop from './components/ScrollToTop';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [apiHealth, setApiHealth] = useState(false);

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/health`);
      if (response.ok) {
        setApiHealth(true);
      }
    } catch (error) {
      console.error('API health check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h2>Loading Maharashtra Education Dashboard...</h2>
      </div>
    );
  }

  if (!apiHealth) {
    return (
      <div className="error-container">
        <h2>Service Unavailable</h2>
        <p>Unable to connect to the dashboard API. Please try again later.</p>
        <button onClick={checkApiHealth} className="retry-btn">
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="App">
      <Router>
        <ScrollToTop />
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/state/:stateId" element={<StateDashboard />} />
            <Route path="/district/:districtId" element={<DistrictDashboard />} />
            <Route path="/block/:blockId" element={<BlockDashboard />} />
            <Route path="/school/:schoolId" element={<SchoolDashboard />} />
            <Route path="/domain/:domainId" element={<DomainDashboard />} />
            <Route path="/domain/:domainId/:level/:entityId" element={<DomainDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}

export default App;