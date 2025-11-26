import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PGIDomainBreakdown from './PGIDomainBreakdown';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [pgiData, setPgiData] = useState(null);
  const [allDistricts, setAllDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [overviewRes, pgiRes, districtsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/dashboard-overview`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/pgi-score/state/mh_001`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/states/mh_001/districts`)
      ]);
      
      if (!overviewRes.ok) throw new Error('Failed to fetch dashboard data');
      
      const data = await overviewRes.json();
      setDashboardData(data);
      
      if (pgiRes.ok) {
        const pgiDataResult = await pgiRes.json();
        setPgiData(pgiDataResult);
      }

      if (districtsRes.ok) {
        const districts = await districtsRes.json();
        // Sort districts by percentage descending and add rank
        const sortedDistricts = districts
          .sort((a, b) => (b.percentage || 0) - (a.percentage || 0))
          .map((district, index) => ({
            ...district,
            rank: index + 1
          }));
        setAllDistricts(sortedDistricts);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/generate-insights/state/mh_001`, {
        method: 'POST'
      });
      
      if (response.ok) {
        alert('AI insights generation started! Navigating to State Dashboard to view insights...');
        // Navigate to State Dashboard where insights are displayed
        navigate('/state/mh_001');
      } else {
        throw new Error('Failed to start insights generation');
      }
    } catch (err) {
      console.error('Failed to generate insights:', err);
      alert('Failed to generate insights. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard overview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  const { state, top_districts, domain_performance } = dashboardData || {};

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1 className="dashboard-title" data-testid="main-dashboard-title">
            Maharashtra Education Analytics
          </h1>
          <p className="dashboard-subtitle">
            Comprehensive Performance Governance Index (PGI) Dashboard
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button 
              onClick={generateInsights}
              className="btn btn-primary"
              data-testid="generate-insights-btn"
            >
              Generate AI Insights
            </button>
            <Link 
              to={`/state/${state?.id || 'mh_001'}`} 
              className="btn btn-secondary"
              data-testid="view-state-details-btn"
            >
              View State Details
            </Link>
          </div>
        </div>
      </div>

      {/* State Overview Stats */}
      <div className="stats-grid">
        <div className="stat-card" data-testid="state-score-card">
          <div className="stat-value" style={{ color: 'var(--primary-blue)' }}>
            {state?.total_score || 0}
          </div>
          <div className="stat-label">Total PGI Score</div>
          <div className="stat-trend trend-neutral">
            out of 1000 points
          </div>
        </div>
        
        <div className="stat-card" data-testid="state-percentage-card">
          <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>
            {state?.percentage?.toFixed(1) || 0}%
          </div>
          <div className="stat-label">Performance Percentage</div>
          <div className="stat-trend trend-neutral">
            National Rank: #{state?.rank || 'N/A'}
          </div>
        </div>
        
        <div className="stat-card" data-testid="districts-count-card">
          <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>
            {dashboardData?.total_districts || 0}
          </div>
          <div className="stat-label">Total Districts</div>
          <div className="stat-trend trend-positive">
            ▲ Active monitoring
          </div>
        </div>
        
        <div className="stat-card" data-testid="schools-count-card">
          <div className="stat-value" style={{ color: 'var(--primary-teal)' }}>
            {dashboardData?.total_schools || 0}
          </div>
          <div className="stat-label">Total Schools</div>
          <div className="stat-trend trend-positive">
            ▲ Comprehensive coverage
          </div>
        </div>
      </div>

      {/* PGI Framework - Domain Analysis */}
      {pgiData && (
        <div className="pgi-breakdown-section" data-testid="pgi-breakdown-section-overview">
          <PGIDomainBreakdown pgiData={pgiData} enableNavigation={true} />
        </div>
      )}

      {/* Top 5 Performing Districts */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title" data-testid="top-districts-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🏆 Top 5 Performing Districts
            </h2>
            <p className="card-subtitle">
              Best performing districts by PGI-D scores
            </p>
          </div>
        </div>
        
        <div className="table-container">
          <table className="table" data-testid="top-districts-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>District Name</th>
                <th>PGI-D Score</th>
                <th>Percentage</th>
                <th>Blocks</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {allDistricts.slice(0, 5).map((district, index) => (
                <tr key={district.id} data-testid={`top-district-row-${district.id}`}>
                  <td>
                    <span className="badge badge-success">#{district.rank}</span>
                  </td>
                  <td>
                    <strong>{district.name}</strong>
                  </td>
                  <td style={{ fontWeight: '500' }}>
                    {((district.percentage || 0) * 10).toFixed(0)}/1000
                  </td>
                  <td>
                    <span className={`badge ${
                      district.percentage >= 70 ? 'badge-success' : 
                      district.percentage >= 50 ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {district.percentage?.toFixed(1)}%
                    </span>
                  </td>
                  <td>{district.blocks_count}</td>
                  <td>
                    <Link 
                      to={`/district/${district.id}`}
                      className="btn btn-secondary"
                      data-testid={`view-top-district-${district.id}-btn`}
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom 5 Performing Districts */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title" data-testid="bottom-districts-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📊 Bottom 5 Performing Districts
            </h2>
            <p className="card-subtitle">
              Districts needing improvement and focused interventions
            </p>
          </div>
        </div>
        
        <div className="table-container">
          <table className="table" data-testid="bottom-districts-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>District Name</th>
                <th>PGI-D Score</th>
                <th>Percentage</th>
                <th>Blocks</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {allDistricts.slice(-5).reverse().map((district, index) => (
                <tr key={district.id} data-testid={`bottom-district-row-${district.id}`}>
                  <td>
                    <span className="badge badge-warning">#{district.rank}</span>
                  </td>
                  <td>
                    <strong>{district.name}</strong>
                  </td>
                  <td style={{ fontWeight: '500' }}>
                    {((district.percentage || 0) * 10).toFixed(0)}/1000
                  </td>
                  <td>
                    <span className={`badge ${
                      district.percentage >= 70 ? 'badge-success' : 
                      district.percentage >= 50 ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {district.percentage?.toFixed(1)}%
                    </span>
                  </td>
                  <td>{district.blocks_count}</td>
                  <td>
                    <Link 
                      to={`/district/${district.id}`}
                      className="btn btn-secondary"
                      data-testid={`view-bottom-district-${district.id}-btn`}
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-3">
        <div className="card">
          <h3 className="card-title" data-testid="state-navigation-title">State Level Analysis</h3>
          <p className="card-subtitle">
            Comprehensive 73-indicator framework with 1000-point scoring system
          </p>
          <Link 
            to={`/state/${state?.id || 'mh_001'}`}
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
            data-testid="navigate-state-btn"
          >
            Explore State Dashboard
          </Link>
        </div>
        
        <div className="card">
          <h3 className="card-title" data-testid="district-navigation-title">District Level Monitoring</h3>
          <p className="card-subtitle">
            74-indicator PGI-D framework with detailed performance tracking
          </p>
          <div style={{ marginTop: '1rem' }}>
            <span className="badge badge-info">
              {dashboardData?.total_districts} Districts
            </span>
          </div>
        </div>
        
        <div className="card">
          <h3 className="card-title" data-testid="school-navigation-title">School Level Implementation</h3>
          <p className="card-subtitle">
            Ground-level KPIs for quality assurance and improvement tracking
          </p>
          <div style={{ marginTop: '1rem' }}>
            <span className="badge badge-success">
              {dashboardData?.total_schools} Schools
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;