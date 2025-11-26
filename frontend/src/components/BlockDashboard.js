import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import PGIDomainBreakdown from './PGIDomainBreakdown';
import HeatmapVisualization from './HeatmapVisualization';

const BlockDashboard = () => {
  const { blockId } = useParams();
  const [blockData, setBlockData] = useState(null);
  const [schools, setSchools] = useState([]);
  const [pgiData, setPgiData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [mapView, setMapView] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlockData();
  }, [blockId]);

  const generateInsights = async () => {
    try {
      setGeneratingInsights(true); // Show generating state
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/generate-insights/block/${blockId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        // Wait for insights to be generated (backend processes in background)
        await new Promise(resolve => setTimeout(resolve, 15000)); // Wait 15 seconds
        
        // Refresh insights after generation
        const insightsRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/insights/block/${blockId}`);
        if (insightsRes.ok) {
          const insightsData = await insightsRes.json();
          setInsights(insightsData);
          setGeneratingInsights(false);
          
          // Navigate to insights section with smooth scroll
          setTimeout(() => {
            const insightsSection = document.querySelector('[data-testid="block-insights-title"]');
            if (insightsSection) {
              insightsSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
              });
            }
          }, 500);
        } else {
          setGeneratingInsights(false);
        }
      } else {
        setGeneratingInsights(false);
        throw new Error('Failed to start insights generation');
      }
    } catch (err) {
      console.error('Failed to generate insights:', err);
      setGeneratingInsights(false);
      alert('Failed to generate insights. Please try again.');
    }
  };

  const fetchBlockData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get block data, schools, PGI data, and insights in parallel
      const [blockRes, schoolsRes, pgiRes, insightsRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blocks/${blockId}`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blocks/${blockId}/schools`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/pgi-score/block/${blockId}`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/insights/block/${blockId}`)
      ]);
      
      if (!blockRes.ok) {
        throw new Error('Failed to fetch block data');
      }

      const block = await blockRes.json();
      setBlockData(block);
      
      // Handle schools data
      if (schoolsRes.ok) {
        const schoolsData = await schoolsRes.json();
        setSchools(schoolsData);
      }

      // Handle PGI data
      if (pgiRes.ok) {
        const pgiDataResult = await pgiRes.json();
        setPgiData(pgiDataResult);
      }

      // Handle insights data
      if (insightsRes.ok) {
        const insightsData = await insightsRes.json();
        setInsights(insightsData);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for school visualization
  const getSchoolColor = (percentage) => {
    if (percentage >= 75) return '#16a34a'; // Excellent - Green
    if (percentage >= 65) return '#2563eb'; // Good - Blue  
    if (percentage >= 55) return '#d97706'; // Average - Orange
    return '#dc2626'; // Needs Focus - Red
  };

  const getSchoolStatus = (percentage) => {
    if (percentage >= 75) return 'Excellent';
    if (percentage >= 65) return 'Good';
    if (percentage >= 55) return 'Average';
    return 'Needs Focus';
  };

  // Generate fixed school positions based on school count
  const generateSchoolPositions = (schools) => {
    const positions = {};
    const totalSchools = schools.length;
    
    // Define a more aesthetically pleasing layout
    if (totalSchools <= 4) {
      // 2x2 grid for small number of schools
      const coords = [
        { top: 25, left: 25 },
        { top: 25, left: 65 },
        { top: 65, left: 25 },
        { top: 65, left: 65 }
      ];
      schools.forEach((school, i) => {
        if (i < coords.length) {
          positions[school.id] = { top: `${coords[i].top}%`, left: `${coords[i].left}%` };
        }
      });
    } else if (totalSchools <= 9) {
      // 3x3 grid
      const gridSize = 3;
      schools.forEach((school, i) => {
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        positions[school.id] = {
          top: `${20 + row * 27}%`,
          left: `${20 + col * 27}%`
        };
      });
    } else {
      // For larger numbers, use a more dynamic grid
      const gridSize = Math.ceil(Math.sqrt(totalSchools));
      schools.forEach((school, i) => {
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        const spacingY = 70 / gridSize;
        const spacingX = 70 / gridSize;
        positions[school.id] = {
          top: `${15 + row * spacingY}%`,
          left: `${15 + col * spacingX}%`
        };
      });
    }
    
    return positions;
  };

  // Calculate positions and stats
  const schoolPositions = generateSchoolPositions(schools);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading block dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Block Dashboard</h2>
        <p>{error}</p>
        <button onClick={fetchBlockData} className="retry-btn">Retry</button>
      </div>
    );
  }

  if (!blockData) {
    return (
      <div className="error-container">
        <h2>Block Not Found</h2>
        <p>The requested block could not be found.</p>
        <Link to="/" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  // Calculate aggregate statistics
  const totalStudents = schools.reduce((sum, school) => sum + (school.student_count || 0), 0);
  const totalTeachers = schools.reduce((sum, school) => sum + (school.teacher_count || 0), 0);
  const avgInfrastructure = schools.length > 0 
    ? schools.reduce((sum, school) => sum + (school.infrastructure_score || 0), 0) / schools.length 
    : 0;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1 className="dashboard-title" data-testid="block-dashboard-title">
            {blockData.name} Block Dashboard
          </h1>
          <p className="dashboard-subtitle">
            Block ID: {blockData.id} | Schools: {schools.length} | Performance Score: {blockData.performance_score?.toFixed(1) || 'N/A'}%
          </p>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => setMapView(!mapView)}
              className={`btn ${mapView ? 'btn-primary' : 'btn-secondary'}`}
              data-testid="toggle-map-view-btn-block"
            >
              {mapView ? '📊 Table View' : '🗺️ Map View'}
            </button>
            <button 
              onClick={generateInsights}
              className="btn btn-primary"
              data-testid="generate-block-insights-btn"
              disabled={generatingInsights}
            >
              {generatingInsights ? 'Generating Insights...' : 'Generate AI Insights'}
            </button>
            <Link to="/" className="btn btn-secondary">
              Back to Overview
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--primary-blue)' }}>
            {schools.length}
          </div>
          <div className="stat-label">Schools</div>
          <div className="stat-trend trend-positive">
            ▲ Full coverage
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--success-green)' }}>
            {totalStudents.toLocaleString()}
          </div>
          <div className="stat-label">Total Students</div>
          <div className="stat-trend trend-positive">
            ▲ {(totalStudents / schools.length).toFixed(0)} avg per school
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>
            {totalTeachers}
          </div>
          <div className="stat-label">Total Teachers</div>
          <div className="stat-trend trend-positive">
            ▲ Ratio: {(totalStudents / totalTeachers).toFixed(1)}:1
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--primary-teal)' }}>
            {avgInfrastructure.toFixed(1)}%
          </div>
          <div className="stat-label">Avg Infrastructure Score</div>
          <div className="stat-trend trend-positive">
            ▲ Block average
          </div>
        </div>
      </div>

      {/* PGI Detailed Breakdown */}
      {pgiData && (
        <div className="pgi-breakdown-section" data-testid="pgi-breakdown-section-block">
          <PGIDomainBreakdown pgiData={pgiData} enableNavigation={true} level="block" entityId={blockId} />
        </div>
      )}

      {/* Map View / Table View Toggle */}
      {mapView && schools.length > 0 ? (
        /* School Performance Map View - Similar to State Level */
        <div className="grid grid-2" style={{ gap: '2rem', marginBottom: '2rem' }}>
          {/* Map Section */}
          <div className="map-container" data-testid="school-performance-map">
            <div className="card" style={{ padding: '1.5rem', minHeight: '600px' }}>
              <div className="card-header" style={{ marginBottom: '1rem' }}>
                <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🗺️ School Performance Map
                </h2>
              </div>
              
              {/* Map Background */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: '450px',
                background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)',
                borderRadius: '12px',
                border: '2px solid var(--border-light)',
                overflow: 'hidden'
              }}>
                {/* Block Boundary */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                  right: '20px',
                  bottom: '20px',
                  border: '3px solid rgba(30, 64, 175, 0.3)',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.1)'
                }}></div>
                
                {/* School Markers */}
                {schools.map((school) => {
                  const position = schoolPositions[school.id];
                  if (!position) return null;
                  
                  return (
                    <div
                      key={school.id}
                      data-testid={`school-marker-${school.id}`}
                      style={{
                        position: 'absolute',
                        top: position.top,
                        left: position.left,
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: getSchoolColor(school.infrastructure_score || 0),
                        border: '2px solid white',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        transition: 'all 0.2s ease',
                        transform: selectedSchool?.id === school.id ? 'scale(1.5)' : 'scale(1)',
                        zIndex: selectedSchool?.id === school.id ? 10 : 1
                      }}
                      onClick={() => setSelectedSchool(school)}
                      onMouseEnter={() => setSelectedSchool(school)}
                      title={`${school.name}: ${school.infrastructure_score?.toFixed(1)}%`}
                    ></div>
                  );
                })}
                
                {/* Legend */}
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '20px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Infrastructure Score</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#16a34a' }}></div>
                      <span>75%+ Excellent</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#2563eb' }}></div>
                      <span>65-75% Good</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#d97706' }}></div>
                      <span>55-65% Average</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#dc2626' }}></div>
                      <span>&lt;55% Needs Focus</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* School Insights Panel */}
          <div className="insights-panel" data-testid="school-insights-panel">
            <div className="card" style={{ padding: '1.5rem', minHeight: '600px' }}>
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                📊 School Insights
              </h2>
              
              {selectedSchool ? (
                <div data-testid={`selected-school-${selectedSchool.id}`}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-teal))',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginBottom: '1.5rem'
                  }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                      {selectedSchool.name}
                    </h3>
                    <div style={{ opacity: 0.9, fontSize: '0.875rem' }}>
                      {blockData?.name}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '12px', 
                      display: 'inline-block',
                      marginTop: '0.5rem'
                    }}>
                      Infrastructure Score: {selectedSchool.infrastructure_score?.toFixed(1)}%
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'var(--background-light)',
                      borderRadius: '8px'
                    }}>
                      <span style={{ color: 'var(--text-medium)' }}>Infrastructure Score</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-blue)' }}>
                        {selectedSchool.infrastructure_score?.toFixed(1)}%
                      </span>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'var(--background-light)',
                      borderRadius: '8px'
                    }}>
                      <span style={{ color: 'var(--text-medium)' }}>Total Students</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-emerald)' }}>
                        {selectedSchool.student_count || 0}
                      </span>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'var(--background-light)',
                      borderRadius: '8px'
                    }}>
                      <span style={{ color: 'var(--text-medium)' }}>Total Teachers</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-orange)' }}>
                        {selectedSchool.teacher_count || 0}
                      </span>
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '1rem',
                      background: 'var(--background-light)',
                      borderRadius: '8px'
                    }}>
                      <span style={{ color: 'var(--text-medium)' }}>Status</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary-teal)' }}>
                        {getSchoolStatus(selectedSchool.infrastructure_score || 0)}
                      </span>
                    </div>

                    <Link 
                      to={`/school/${selectedSchool.id}`}
                      className="btn btn-primary"
                      style={{ 
                        background: 'linear-gradient(135deg, #ea580c, #dc2626)',
                        marginTop: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                      data-testid={`view-detailed-school-report-${selectedSchool.id}`}
                    >
                      View Detailed Report 📈
                    </Link>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '400px',
                  color: 'var(--text-light)'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
                  <p style={{ textAlign: 'center', fontSize: '1rem' }}>
                    Click on any school marker on the map to view detailed insights and performance analytics.
                  </p>
                </div>
              )}
            </div>

            {/* Block Overview Card */}
            <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
              <h3 className="card-title" data-testid="block-overview-title">Block Overview</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.75rem 0'
                }}>
                  <span style={{ color: 'var(--text-medium)' }}>Total Schools</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>{schools.length}</span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.75rem 0'
                }}>
                  <span style={{ color: 'var(--text-medium)' }}>Avg Infrastructure</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                    {schools.length > 0 ? (schools.reduce((sum, s) => sum + (s.infrastructure_score || 0), 0) / schools.length).toFixed(1) : 0}%
                  </span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.75rem 0'
                }}>
                  <span style={{ color: 'var(--text-medium)' }}>Total Students</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                    {totalStudents.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Traditional Stats Grid View when Map View is Off */}
      {!mapView && (
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--primary-blue)' }}>
              {schools.length}
            </div>
            <div className="stat-label">Total Schools</div>
            <div className="stat-trend trend-positive">
              ▲ Full coverage
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--success-green)' }}>
              {totalStudents.toLocaleString()}
            </div>
            <div className="stat-label">Total Students</div>
            <div className="stat-trend trend-positive">
              ▲ {schools.length > 0 ? (totalStudents / schools.length).toFixed(0) : 0} avg per school
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>
              {totalTeachers}
            </div>
            <div className="stat-label">Total Teachers</div>
            <div className="stat-trend trend-positive">
              ▲ Ratio: {totalTeachers > 0 ? (totalStudents / totalTeachers).toFixed(1) : 0}:1
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-value" style={{ color: 'var(--primary-teal)' }}>
              {avgInfrastructure.toFixed(1)}%
            </div>
            <div className="stat-label">Avg Infrastructure Score</div>
            <div className="stat-trend trend-positive">
              ▲ Block average
            </div>
          </div>
        </div>
      )}

      {/* Top 5 Schools Performance */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title" data-testid="top-schools-performance-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🏆 Top 5 School-wise Performance
            </h2>
            <p className="card-subtitle">
              Best performing schools in {blockData?.name}
            </p>
          </div>
        </div>
        
        <div className="table-container">
          <table className="table" data-testid="top-schools-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>School Name</th>
                <th>Students</th>
                <th>Teachers</th>
                <th>Student-Teacher Ratio</th>
                <th>Infrastructure Score</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schools
                .sort((a, b) => (b.infrastructure_score || 0) - (a.infrastructure_score || 0))
                .slice(0, 5)
                .map((school, index) => {
                  const str = school.teacher_count > 0 ? (school.student_count / school.teacher_count).toFixed(1) : 'N/A';
                  const infraScore = school.infrastructure_score || 0;
                  
                  return (
                    <tr key={school.id} data-testid={`top-school-row-${school.id}`}>
                      <td>
                        <span className="badge badge-success">#{index + 1}</span>
                      </td>
                      <td><strong>{school.name}</strong></td>
                      <td>{school.student_count}</td>
                      <td>{school.teacher_count}</td>
                      <td>{str}</td>
                      <td>
                        <div className="progress-container" style={{ width: '120px' }}>
                          <div className="progress-bar" style={{ height: '8px' }}>
                            <div 
                              className="progress-fill"
                              style={{ width: `${infraScore}%` }}
                            ></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                            {infraScore.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${
                          infraScore >= 75 ? 'success' :
                          infraScore >= 60 ? 'info' :
                          infraScore >= 40 ? 'warning' : 'danger'
                        }`}>
                          {infraScore >= 75 ? 'Excellent' :
                           infraScore >= 60 ? 'Good' :
                           infraScore >= 40 ? 'Needs Improvement' : 'Critical'}
                        </span>
                      </td>
                      <td>
                        <Link 
                          to={`/school/${school.id}`}
                          className="btn btn-sm btn-primary"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom 5 Schools Performance */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title" data-testid="bottom-schools-performance-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📊 Bottom 5 School-wise Performance
            </h2>
            <p className="card-subtitle">
              Schools needing focused improvement in {blockData?.name}
            </p>
          </div>
        </div>
        
        <div className="table-container">
          <table className="table" data-testid="bottom-schools-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>School Name</th>
                <th>Students</th>
                <th>Teachers</th>
                <th>Student-Teacher Ratio</th>
                <th>Infrastructure Score</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const sortedSchools = schools.sort((a, b) => (b.infrastructure_score || 0) - (a.infrastructure_score || 0));
                return sortedSchools.slice(-5).reverse().map((school, index) => {
                  const str = school.teacher_count > 0 ? (school.student_count / school.teacher_count).toFixed(1) : 'N/A';
                  const infraScore = school.infrastructure_score || 0;
                  const actualRank = sortedSchools.length - index;
                  
                  return (
                    <tr key={school.id} data-testid={`bottom-school-row-${school.id}`}>
                      <td>
                        <span className="badge badge-warning">#{actualRank}</span>
                      </td>
                      <td><strong>{school.name}</strong></td>
                      <td>{school.student_count}</td>
                      <td>{school.teacher_count}</td>
                      <td>{str}</td>
                      <td>
                        <div className="progress-container" style={{ width: '120px' }}>
                          <div className="progress-bar" style={{ height: '8px' }}>
                            <div 
                              className="progress-fill"
                              style={{ width: `${infraScore}%` }}
                            ></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                            {infraScore.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${
                          infraScore >= 75 ? 'success' :
                          infraScore >= 60 ? 'info' :
                          infraScore >= 40 ? 'warning' : 'danger'
                        }`}>
                          {infraScore >= 75 ? 'Excellent' :
                           infraScore >= 60 ? 'Good' :
                           infraScore >= 40 ? 'Needs Improvement' : 'Critical'}
                        </span>
                      </td>
                      <td>
                        <Link 
                          to={`/school/${school.id}`}
                          className="btn btn-sm btn-primary"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resource Management */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              Resource Allocation Overview
            </h2>
            <p className="card-subtitle">
              Summary of resource distribution across schools in this block
            </p>
          </div>
        </div>
        
        <div className="grid grid-3">
          <div className="card" style={{ margin: '0.5rem' }}>
            <h3 className="card-title">Student Distribution</h3>
            <div className="stat-value" style={{ color: 'var(--primary-blue)', marginTop: '1rem' }}>
              {totalStudents.toLocaleString()}
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-medium)', marginTop: '0.5rem' }}>
              Average {(totalStudents / schools.length).toFixed(0)} students per school
            </p>
          </div>
          
          <div className="card" style={{ margin: '0.5rem' }}>
            <h3 className="card-title">Teacher Deployment</h3>
            <div className="stat-value" style={{ color: 'var(--success-green)', marginTop: '1rem' }}>
              {totalTeachers}
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-medium)', marginTop: '0.5rem' }}>
              Average {(totalTeachers / schools.length).toFixed(1)} teachers per school
            </p>
          </div>
          
          <div className="card" style={{ margin: '0.5rem' }}>
            <h3 className="card-title">Infrastructure Quality</h3>
            <div className="stat-value" style={{ color: 'var(--accent-orange)', marginTop: '1rem' }}>
              {avgInfrastructure.toFixed(1)}%
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-medium)', marginTop: '0.5rem' }}>
              Block average across {schools.length} schools
            </p>
          </div>
        </div>
      </div>

      {/* AI-Generated Insights - Card Structure */}
      <div className="insights-section">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2" data-testid="block-insights-title">
            AI-Powered Performance Insights
          </h2>
          <p className="text-gray-600">Data-driven recommendations for block improvement</p>
        </div>
        
        {insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insights.map(insight => (
              <div 
                key={insight.id} 
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                data-testid={`block-insight-${insight.metric_name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className={`p-4 border-b ${
                  insight.severity === 'critical' ? 'border-red-200 bg-red-50' :
                  insight.severity === 'moderate' ? 'border-yellow-200 bg-yellow-50' :
                  insight.severity === 'good' ? 'border-green-200 bg-green-50' : 
                  'border-blue-200 bg-blue-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-900 flex-1 pr-2">{insight.metric_name}</h3>
                    <span className={`badge badge-${
                      insight.severity === 'critical' ? 'danger' :
                      insight.severity === 'moderate' ? 'warning' :
                      insight.severity === 'good' ? 'success' : 'info'
                    } flex-shrink-0`}>
                      {insight.severity}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Analysis</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{insight.insight_text}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Recommendation</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{insight.recommendation}</p>
                  </div>
                </div>
                
                <div className={`px-4 py-3 ${
                  insight.severity === 'critical' ? 'bg-red-50' :
                  insight.severity === 'moderate' ? 'bg-yellow-50' :
                  insight.severity === 'good' ? 'bg-green-50' : 
                  'bg-blue-50'
                } border-t border-gray-100`}>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>Priority Action</span>
                    <span className="font-semibold">{
                      insight.severity === 'critical' ? 'Immediate' :
                      insight.severity === 'moderate' ? 'High' :
                      insight.severity === 'good' ? 'Monitor' : 'Standard'
                    }</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💡</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              No Insights Generated Yet
            </h3>
            <p style={{ color: 'var(--text-medium)', marginBottom: '1.5rem' }}>
              Click "Generate AI Insights" button above to analyze block performance metrics and get AI-powered recommendations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockDashboard;
