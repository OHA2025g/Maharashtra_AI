import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import PGIDomainBreakdown from './PGIDomainBreakdown';
import HeatmapVisualization from './HeatmapVisualization';

const DistrictDashboard = () => {
  const { districtId } = useParams();
  const [districtData, setDistrictData] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [insights, setInsights] = useState([]);
  const [pgiData, setPgiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [mapView, setMapView] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDistrictData();
  }, [districtId]);

  const fetchDistrictData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [districtRes, blocksRes, insightsRes, pgiRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/districts/${districtId}`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/districts/${districtId}/blocks`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/insights/district/${districtId}`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/pgi-score/district/${districtId}`)
      ]);

      if (!districtRes.ok || !blocksRes.ok) {
        throw new Error('Failed to fetch district data');
      }

      const district = await districtRes.json();
      const blocksData = await blocksRes.json();
      const insightsData = await insightsRes.json();
      
      // PGI data might not be available, handle gracefully
      let pgiDataResult = null;
      if (pgiRes.ok) {
        pgiDataResult = await pgiRes.json();
      }

      setDistrictData(district);
      setBlocks(blocksData);
      setInsights(insightsData);
      setPgiData(pgiDataResult);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    try {
      setGeneratingInsights(true); // Show generating state
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/generate-insights/district/${districtId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        // Wait for insights to be generated (backend processes in background)
        await new Promise(resolve => setTimeout(resolve, 15000)); // Wait 15 seconds
        
        // Refresh insights after generation
        const insightsRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/insights/district/${districtId}`);
        if (insightsRes.ok) {
          const insightsData = await insightsRes.json();
          setInsights(insightsData);
          setGeneratingInsights(false);
          
          // Navigate to insights section with smooth scroll
          setTimeout(() => {
            const insightsSection = document.querySelector('[data-testid="district-insights-title"]');
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

  // Helper functions for block visualization
  const getBlockColor = (percentage) => {
    if (percentage >= 75) return '#16a34a'; // Excellent - Green
    if (percentage >= 65) return '#2563eb'; // Good - Blue  
    if (percentage >= 55) return '#d97706'; // Average - Orange
    return '#dc2626'; // Needs Focus - Red
  };

  const getBlockStatus = (percentage) => {
    if (percentage >= 75) return 'Excellent';
    if (percentage >= 65) return 'Good';
    if (percentage >= 55) return 'Average';
    return 'Needs Focus';
  };

  // Generate fixed block positions based on block count
  const generateBlockPositions = (blocks) => {
    const positions = {};
    const totalBlocks = blocks.length;
    
    // Define a more aesthetically pleasing layout
    // Use a grid-like pattern but with some variation for visual interest
    if (totalBlocks <= 4) {
      // 2x2 grid for small number of blocks
      const coords = [
        { top: 25, left: 25 },
        { top: 25, left: 65 },
        { top: 65, left: 25 },
        { top: 65, left: 65 }
      ];
      blocks.forEach((block, i) => {
        if (i < coords.length) {
          positions[block.id] = { top: `${coords[i].top}%`, left: `${coords[i].left}%` };
        }
      });
    } else if (totalBlocks <= 9) {
      // 3x3 grid
      const gridSize = 3;
      blocks.forEach((block, i) => {
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        positions[block.id] = {
          top: `${20 + row * 27}%`,
          left: `${20 + col * 27}%`
        };
      });
    } else {
      // For larger numbers, use a more dynamic grid
      const gridSize = Math.ceil(Math.sqrt(totalBlocks));
      blocks.forEach((block, i) => {
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        const spacingY = 70 / gridSize;
        const spacingX = 70 / gridSize;
        positions[block.id] = {
          top: `${15 + row * spacingY}%`,
          left: `${15 + col * spacingX}%`
        };
      });
    }
    
    return positions;
  };

  const blockPositions = generateBlockPositions(blocks);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading district dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading District Dashboard</h2>
        <p>{error}</p>
        <button onClick={fetchDistrictData} className="retry-btn">Retry</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1 className="dashboard-title" data-testid="district-dashboard-title">
            {districtData?.name || 'District'} Dashboard
          </h1>
          <p className="dashboard-subtitle">
            Comprehensive district performance monitoring and analysis
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => setMapView(!mapView)}
              className={`btn ${mapView ? 'btn-primary' : 'btn-secondary'}`}
              data-testid="toggle-map-view-btn-district"
            >
              {mapView ? '📊 Table View' : '🗺️ Map View'}
            </button>
            <button 
              onClick={generateInsights}
              className="btn btn-primary"
              data-testid="generate-district-insights-btn"
              disabled={generatingInsights}
            >
              {generatingInsights ? 'Generating Insights...' : 'Generate AI Insights'}
            </button>
            <Link to={`/state/${districtData?.state_id || 'mh_001'}`} className="btn btn-secondary">
              Back to State
            </Link>
          </div>
        </div>
      </div>

      {/* District Performance Stats */}
      <div className="stats-grid">
        <div className="stat-card" data-testid="district-score">
          <div className="stat-value" style={{ color: 'var(--primary-blue)' }}>
            {(districtData?.percentage * 10 || 0).toFixed(0)}
          </div>
          <div className="stat-label">PGI-D Score</div>
          <div className="stat-trend trend-neutral">
            out of 1000
          </div>
        </div>
        
        <div className="stat-card" data-testid="district-percentage">
          <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>
            {districtData?.percentage?.toFixed(1) || 0}%
          </div>
          <div className="stat-label">Performance Rate</div>
          <div className="stat-trend trend-neutral">
            District Rank #{districtData?.rank || 'N/A'}
          </div>
        </div>
        
        <div className="stat-card" data-testid="blocks-count">
          <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>
            {blocks.length}
          </div>
          <div className="stat-label">Blocks Managed</div>
          <div className="stat-trend trend-positive">
            ▲ Full coverage
          </div>
        </div>
        
        <div className="stat-card" data-testid="total-schools">
          <div className="stat-value" style={{ color: 'var(--primary-teal)' }}>
            {blocks.reduce((sum, block) => sum + block.schools_count, 0)}
          </div>
          <div className="stat-label">Total Schools</div>
          <div className="stat-trend trend-positive">
            ▲ Comprehensive monitoring
          </div>
        </div>
      </div>

      {/* Map View / Table View Toggle */}
      {mapView && blocks.length > 0 ? (
        /* Block Performance Map View - Similar to State Level */
        <div className="grid grid-2" style={{ gap: '2rem', marginBottom: '2rem' }}>
          {/* Map Section */}
          <div className="map-container" data-testid="block-performance-map">
            <div className="card" style={{ padding: '1.5rem', minHeight: '600px' }}>
              <div className="card-header" style={{ marginBottom: '1rem' }}>
                <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🗺️ Block PGI Performance Map
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
                {/* District Boundary */}
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
                
                {/* Block Markers */}
                {blocks.map((block) => {
                  const position = blockPositions[block.id];
                  if (!position) return null;
                  
                  return (
                    <div
                      key={block.id}
                      data-testid={`block-marker-${block.id}`}
                      style={{
                        position: 'absolute',
                        top: position.top,
                        left: position.left,
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: getBlockColor(block.percentage || block.performance_score || 0),
                        border: '2px solid white',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        transition: 'all 0.2s ease',
                        transform: selectedBlock?.id === block.id ? 'scale(1.5)' : 'scale(1)',
                        zIndex: selectedBlock?.id === block.id ? 10 : 1
                      }}
                      onClick={() => setSelectedBlock(block)}
                      onMouseEnter={() => setSelectedBlock(block)}
                      title={`${block.name}: ${(block.percentage || block.performance_score || 0).toFixed(1)}%`}
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
                  <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>PGI Performance</div>
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

          {/* Block Insights Panel */}
          <div className="insights-panel" data-testid="block-insights-panel">
            <div className="card" style={{ padding: '1.5rem', minHeight: '600px' }}>
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                📊 Block Insights
              </h2>
              
              {selectedBlock ? (
                <div data-testid={`selected-block-${selectedBlock.id}`}>
                  <div style={{ 
                    background: 'linear-gradient(135deg, var(--primary-blue), var(--primary-teal))',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginBottom: '1.5rem'
                  }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                      {selectedBlock.name}
                    </h3>
                    <div style={{ opacity: 0.9, fontSize: '0.875rem' }}>
                      {districtData?.name}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '12px', 
                      display: 'inline-block',
                      marginTop: '0.5rem'
                    }}>
                      PGI Score: {((selectedBlock.percentage || selectedBlock.performance_score || 0) * 10).toFixed(0)}/1000 ({(selectedBlock.percentage || selectedBlock.performance_score || 0).toFixed(1)}%)
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
                      <span style={{ color: 'var(--text-medium)' }}>PGI Score</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-blue)' }}>
                        {((selectedBlock.percentage || selectedBlock.performance_score || 0) * 10).toFixed(0)}/1000
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
                      <span style={{ color: 'var(--text-medium)' }}>Performance Percentage</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-emerald)' }}>
                        {(selectedBlock.percentage || selectedBlock.performance_score || 0).toFixed(1)}%
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
                      <span style={{ color: 'var(--text-medium)' }}>Number of Schools</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-orange)' }}>
                        {selectedBlock.schools_count || 0}
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
                        {getBlockStatus(selectedBlock.percentage || selectedBlock.performance_score || 0)}
                      </span>
                    </div>

                    <Link 
                      to={`/block/${selectedBlock.id}`}
                      className="btn btn-primary"
                      style={{ 
                        background: 'linear-gradient(135deg, #ea580c, #dc2626)',
                        marginTop: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                      data-testid={`view-detailed-block-report-${selectedBlock.id}`}
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
                    Click on any block marker on the map to view detailed insights and performance analytics.
                  </p>
                </div>
              )}
            </div>

            {/* District Overview Card */}
            <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
              <h3 className="card-title" data-testid="district-overview-title">District Overview</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.75rem 0'
                }}>
                  <span style={{ color: 'var(--text-medium)' }}>Total Blocks</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>{blocks.length}</span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.75rem 0'
                }}>
                  <span style={{ color: 'var(--text-medium)' }}>Avg Performance</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                    {blocks.length > 0 ? (blocks.reduce((sum, b) => sum + (b.percentage || b.performance_score || 0), 0) / blocks.length).toFixed(1) : 0}%
                  </span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.75rem 0'
                }}>
                  <span style={{ color: 'var(--text-medium)' }}>Total Schools</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                    {blocks.reduce((sum, b) => sum + (b.schools_count || 0), 0)}
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
          <div className="stat-card" data-testid="district-pgi-score">
            <div className="stat-value" style={{ color: 'var(--primary-blue)' }}>
              {(districtData?.percentage * 10 || 0).toFixed(0)}
            </div>
            <div className="stat-label">PGI-D Score</div>
            <div className="stat-trend trend-neutral">
              out of 1000
            </div>
          </div>
          
          <div className="stat-card" data-testid="district-avg-performance">
            <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>
              {blocks.length > 0 ? (blocks.reduce((sum, b) => sum + (b.percentage || b.performance_score || 0), 0) / blocks.length).toFixed(1) : 0}%
            </div>
            <div className="stat-label">Avg Block Performance</div>
            <div className="stat-trend trend-neutral">
              across {blocks.length} blocks
            </div>
          </div>
          
          <div className="stat-card" data-testid="total-blocks-managed">
            <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>
              {blocks.length}
            </div>
            <div className="stat-label">Blocks Managed</div>
            <div className="stat-trend trend-positive">
              ▲ Full coverage
            </div>
          </div>
          
          <div className="stat-card" data-testid="total-schools-district">
            <div className="stat-value" style={{ color: 'var(--primary-teal)' }}>
              {blocks.reduce((sum, b) => sum + (b.schools_count || 0), 0)}
            </div>
            <div className="stat-label">Total Schools</div>
            <div className="stat-trend trend-positive">
              ▲ Comprehensive monitoring
            </div>
          </div>
        </div>
      )}

      {/* PGI Detailed Breakdown */}
      {pgiData && (
        <div className="pgi-breakdown-section" data-testid="pgi-breakdown-section-district">
          <PGIDomainBreakdown pgiData={pgiData} enableNavigation={true} level="district" entityId={districtId} />
        </div>
      )}

      {/* Top 5 Blocks Performance */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title" data-testid="top-blocks-performance-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🏆 Top 5 Block-wise Performance
            </h2>
            <p className="card-subtitle">
              Best performing blocks in {districtData?.name}
            </p>
          </div>
        </div>
        
        <div className="table-container">
          <table className="table" data-testid="top-blocks-performance-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Block Name</th>
                <th>Schools</th>
                <th>Performance Score</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {blocks
                .sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0))
                .slice(0, 5)
                .map((block, index) => (
                <tr key={block.id} data-testid={`top-block-row-${block.id}`}>
                  <td>
                    <span className="badge badge-success">#{index + 1}</span>
                  </td>
                  <td>
                    <strong>{block.name}</strong>
                  </td>
                  <td>{block.schools_count}</td>
                  <td>
                    <span className={`badge ${
                      block.performance_score >= 80 ? 'badge-success' : 
                      block.performance_score >= 60 ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {block.performance_score?.toFixed(1)}%
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      block.performance_score >= 80 ? 'badge-success' : 
                      block.performance_score >= 60 ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {block.performance_score >= 80 ? 'Excellent' : 
                       block.performance_score >= 60 ? 'Good' : 'Needs Improvement'}
                    </span>
                  </td>
                  <td>
                    <Link 
                      to={`/block/${block.id}`}
                      className="btn btn-secondary"
                      data-testid={`view-top-block-${block.id}`}
                    >
                      View Block
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom 5 Blocks Performance */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title" data-testid="bottom-blocks-performance-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📊 Bottom 5 Block-wise Performance
            </h2>
            <p className="card-subtitle">
              Blocks needing focused improvement in {districtData?.name}
            </p>
          </div>
        </div>
        
        <div className="table-container">
          <table className="table" data-testid="bottom-blocks-performance-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Block Name</th>
                <th>Schools</th>
                <th>Performance Score</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const sortedBlocks = blocks.sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0));
                return sortedBlocks.slice(-5).reverse().map((block, index) => {
                  const actualRank = sortedBlocks.length - index;
                  return (
                    <tr key={block.id} data-testid={`bottom-block-row-${block.id}`}>
                      <td>
                        <span className="badge badge-warning">#{actualRank}</span>
                      </td>
                      <td>
                        <strong>{block.name}</strong>
                      </td>
                      <td>{block.schools_count}</td>
                      <td>
                        <span className={`badge ${
                          block.performance_score >= 80 ? 'badge-success' : 
                          block.performance_score >= 60 ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {block.performance_score?.toFixed(1)}%
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          block.performance_score >= 80 ? 'badge-success' : 
                          block.performance_score >= 60 ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {block.performance_score >= 80 ? 'Excellent' : 
                           block.performance_score >= 60 ? 'Good' : 'Needs Improvement'}
                        </span>
                      </td>
                      <td>
                        <Link 
                          to={`/block/${block.id}`}
                          className="btn btn-secondary"
                          data-testid={`view-bottom-block-${block.id}`}
                        >
                          View Block
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

      {/* Key Metrics Summary */}
      <div className="grid grid-3">
        <div className="card">
          <h3 className="card-title" data-testid="learning-outcomes-summary">Learning Outcomes</h3>
          <div className="progress-container">
            <div className="progress-header">
              <span className="progress-label">Grade Proficiency</span>
              <span className="progress-value">72.4%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '72.4%' }}></div>
            </div>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
            7 indicators tracked
          </div>
        </div>
        
        <div className="card">
          <h3 className="card-title" data-testid="infrastructure-summary">Infrastructure</h3>
          <div className="progress-container">
            <div className="progress-header">
              <span className="progress-label">Facility Adequacy</span>
              <span className="progress-value">85.2%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '85.2%' }}></div>
            </div>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
            24 indicators tracked
          </div>
        </div>
        
        <div className="card">
          <h3 className="card-title" data-testid="governance-summary">Governance</h3>
          <div className="progress-container">
            <div className="progress-header">
              <span className="progress-label">Process Efficiency</span>
              <span className="progress-value">68.9%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '68.9%' }}></div>
            </div>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>
            7 indicators tracked
          </div>
        </div>
      </div>

      {/* AI-Generated Insights - Card Structure */}
      <div className="insights-section">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2" data-testid="district-insights-title">
            AI-Powered Performance Insights
          </h2>
          <p className="text-gray-600">Data-driven recommendations for district improvement</p>
        </div>
        
        {insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insights.map(insight => (
              <div 
                key={insight.id} 
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                data-testid={`district-insight-${insight.metric_name.toLowerCase().replace(/\s+/g, '-')}`}
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
              Click "Generate AI Insights" button above to analyze district performance metrics and get AI-powered recommendations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DistrictDashboard;