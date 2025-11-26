import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import IndicatorDrilldownModal from './IndicatorDrilldownModal';

const DomainDashboard = () => {
  const { domainId, level, entityId } = useParams();
  const [domainData, setDomainData] = useState(null);
  const [entityData, setEntityData] = useState(null);
  const [indicators, setIndicators] = useState([]);
  const [districtPerformance, setDistrictPerformance] = useState([]);
  const [blockPerformance, setBlockPerformance] = useState([]);
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const [showDrilldownModal, setShowDrilldownModal] = useState(false);
  const [schoolPerformance, setSchoolPerformance] = useState([]);
  const [insights, setInsights] = useState(null);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Determine current level (default to state if not specified)
  const currentLevel = level || 'state';
  const currentEntityId = entityId || 'mh_001';

  // Domain mapping
  const domainMap = {
    'learning-outcomes': { name: 'Learning Outcomes and Quality', code: 'LO', color: 'blue' },
    'access': { name: 'Access', code: 'A', color: 'green' },
    'infrastructure': { name: 'Infrastructure & Facilities', code: 'I&F', color: 'purple' },
    'equity': { name: 'Equity', code: 'E', color: 'orange' },
    'governance': { name: 'Governance Processes', code: 'GP', color: 'indigo' },
    'teacher-education': { name: 'Teacher Education & Training', code: 'TE&T', color: 'teal' }
  };

  const currentDomain = domainMap[domainId];

  useEffect(() => {
    if (currentDomain) {
      fetchDomainData();
    }
  }, [domainId]);

  const fetchDomainData = async () => {
    try {
      setLoading(true);
      
      // Fetch entity data if not state level
      if (currentLevel !== 'state') {
        const entityResponse = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/${currentLevel}s/${currentEntityId}`
        );
        if (entityResponse.ok) {
          const entity = await entityResponse.json();
          setEntityData(entity);
        }
      }
      
      // Fetch PGI data for the entity
      const pgiRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/pgi-score/${currentLevel}/${currentEntityId}`);
      if (!pgiRes.ok) throw new Error('Failed to fetch domain data');
      
      const pgiData = await pgiRes.json();
      
      // Find the domain data
      const domain = pgiData.domains?.find(d => d.domain_name === currentDomain.name);
      setDomainData(domain);
      
      if (domain && domain.indicators) {
        setIndicators(domain.indicators);
      }
      
      // Fetch entity-specific performance based on level
      if (currentLevel === 'state') {
        // Fetch district-wise performance for this domain
        const districtsRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/states/mh_001/districts`);
        if (districtsRes.ok) {
          const districts = await districtsRes.json();
          
          // Fetch metrics for each district to calculate domain performance
          const districtPromises = districts.slice(0, 10).map(async (district) => {
            try {
              const metricsRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/metrics/district/${district.id}`);
              if (!metricsRes.ok) return null;
              
              const metrics = await metricsRes.json();
              
              // Filter metrics by domain (metrics use simplified domain names)
              const domainMetrics = metrics.filter(m => {
                // Match domain names - handle both full names and variations
                if (m.domain === currentDomain.name) return true;
                
                // Handle domain name variations between backend and frontend
                if (currentDomain.name === 'Learning Outcomes and Quality' && m.domain === 'Learning Outcomes') return true;
                if (currentDomain.name === 'Teacher Education & Training' && m.domain === 'Teachers Education') return true;
                if (currentDomain.name === 'Infrastructure & Facilities' && m.domain === 'Infrastructure') return true;
                if (currentDomain.name === 'Governance Processes' && m.domain === 'Governance') return true;
                
                return false;
              });
              
              if (domainMetrics.length === 0) return null;
              
              const totalValue = domainMetrics.reduce((sum, m) => sum + m.value, 0);
              const totalMax = domainMetrics.reduce((sum, m) => sum + m.max_value, 0);
              const percentage = totalMax > 0 ? (totalValue / totalMax) * 100 : 0;
              
              return {
                id: district.id,
                name: district.name,
                score: totalValue,
                maxScore: totalMax,
                percentage: percentage,
                metricsCount: domainMetrics.length
              };
            } catch (err) {
              return null;
            }
          });
          
          const districtData = await Promise.all(districtPromises);
          const validDistricts = districtData.filter(d => d !== null);
          
          // Sort by percentage descending
          validDistricts.sort((a, b) => b.percentage - a.percentage);
          
          setDistrictPerformance(validDistricts);
        }
      } else if (currentLevel === 'district') {
        // Fetch block-wise performance for this district and domain
        const blocksRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/districts/${currentEntityId}/blocks`);
        if (blocksRes.ok) {
          const blocks = await blocksRes.json();
          
          const blockPromises = blocks.map(async (block) => {
            try {
              const pgiRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/pgi-score/block/${block.id}`);
              if (!pgiRes.ok) return null;
              
              const pgiData = await pgiRes.json();
              const blockDomain = pgiData.domains?.find(d => d.domain_name === currentDomain.name);
              
              if (!blockDomain) return null;
              
              return {
                id: block.id,
                name: block.name,
                score: blockDomain.score,
                maxScore: blockDomain.max_score,
                percentage: blockDomain.percentage
              };
            } catch (err) {
              return null;
            }
          });
          
          const blockData = await Promise.all(blockPromises);
          const validBlocks = blockData.filter(b => b !== null);
          validBlocks.sort((a, b) => b.percentage - a.percentage);
          
          setBlockPerformance(validBlocks);
        }
      } else if (currentLevel === 'block') {
        // Fetch school-wise performance for this block and domain
        const schoolsRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blocks/${currentEntityId}/schools`);
        if (schoolsRes.ok) {
          const schools = await schoolsRes.json();
          
          const schoolPromises = schools.map(async (school) => {
            try {
              const pgiRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/pgi-score/school/${school.id}`);
              if (!pgiRes.ok) return null;
              
              const pgiData = await pgiRes.json();
              const schoolDomain = pgiData.domains?.find(d => d.domain_name === currentDomain.name);
              
              if (!schoolDomain) return null;
              
              return {
                id: school.id,
                name: school.name,
                score: schoolDomain.score,
                maxScore: schoolDomain.max_score,
                percentage: schoolDomain.percentage
              };
            } catch (err) {
              return null;
            }
          });
          
          const schoolData = await Promise.all(schoolPromises);
          const validSchools = schoolData.filter(s => s !== null);
          validSchools.sort((a, b) => b.percentage - a.percentage);
          
          setSchoolPerformance(validSchools);
        }
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const generateInsights = async () => {
    try {
      setGeneratingInsights(true);
      
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/generate-domain-insights/${domainId}?level=${currentLevel}&entity_id=${currentEntityId}`,
        { method: 'POST' }
      );
      
      if (!response.ok) throw new Error('Failed to generate insights');
      
      const data = await response.json();
      setInsights(data);
      
    } catch (err) {
      console.error('Error generating insights:', err);
      setError(err.message);
    } finally {
      setGeneratingInsights(false);
    }
  };


  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return 'var(--success-green)';
    if (percentage >= 60) return 'var(--warning-amber)';
    return 'var(--error-red)';
  };

  const getPerformanceClass = (percentage) => {
    if (percentage >= 80) return 'badge-success';
    if (percentage >= 60) return 'badge-warning';
    return 'badge-error';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading domain dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Domain Dashboard</h2>
        <p>{error}</p>
        <Link to="/" className="btn btn-primary">Back to Overview</Link>
      </div>
    );
  }

  if (!currentDomain || !domainData) {
    return (
      <div className="error-container">
        <h2>Domain Not Found</h2>
        <p>The requested domain could not be found.</p>
        <Link to="/" className="btn btn-primary">Back to Overview</Link>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Link to="/" className="btn btn-secondary">← Back to Overview</Link>
            <span className={`text-xs font-semibold text-${currentDomain.color}-600 bg-${currentDomain.color}-50 px-3 py-1 rounded-full`}>
              {currentDomain.code}
            </span>
          </div>
          <h1 className="dashboard-title" data-testid="domain-dashboard-title">
            {currentDomain.name}
            {currentLevel !== 'state' && entityData && (
              <span style={{ fontSize: '0.7em', fontWeight: '400', color: 'var(--text-medium)', display: 'block', marginTop: '0.5rem' }}>
                {entityData.name}
              </span>
            )}
          </h1>
          <p className="dashboard-subtitle">
            {currentLevel === 'state' && 'Detailed indicator performance analysis across Maharashtra'}
            {currentLevel === 'district' && entityData && `Detailed indicator performance analysis for ${entityData.name} District`}
            {currentLevel === 'block' && entityData && `Detailed indicator performance analysis for ${entityData.name}`}
          </p>
        </div>
      </div>

      {/* Domain Overview Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value" style={{ color: getPerformanceColor(domainData.percentage) }}>
            {domainData.score?.toFixed(1)}/{domainData.max_score || domainData.maxScore}
          </div>
          <div className="stat-label">
            {currentLevel === 'state' ? 'State' : currentLevel === 'district' ? 'District' : 'Block'} Score
          </div>
          <div className="stat-trend trend-neutral">
            {domainData.percentage?.toFixed(1)}% Achievement
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--primary-blue)' }}>
            {indicators.length}
          </div>
          <div className="stat-label">Total Indicators</div>
          <div className="stat-trend trend-neutral">
            Tracked Metrics
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--primary-blue)' }}>
            {(domainData.weight * 100).toFixed(0)}%
          </div>
          <div className="stat-label">Domain Weight</div>
          <div className="stat-trend trend-neutral">
            in PGI Framework
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--primary-blue)' }}>
            {currentLevel === 'state' ? districtPerformance.length : 
             currentLevel === 'district' ? blockPerformance.length :
             schoolPerformance.length}
          </div>
          <div className="stat-label">
            {currentLevel === 'state' ? 'Districts Analyzed' : 
             currentLevel === 'district' ? 'Blocks Analyzed' :
             'Schools Analyzed'}
          </div>
          <div className="stat-trend trend-neutral">
            Performance Data
          </div>
        </div>
      </div>

      {/* Generate Insights Button */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
        <button
          onClick={generateInsights}
          className="btn btn-primary"
          disabled={generatingInsights}
          style={{
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {generatingInsights ? (
            <>
              <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
              Generating Comprehensive Insights...
            </>
          ) : (
            <>
              🔍 Generate Comprehensive Insights
            </>
          )}
        </button>
      </div>

      {/* Insights Display */}
      {insights && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <div>
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                💡 Comprehensive Domain Insights
              </h2>
              <p className="card-subtitle">
                Actionable intelligence for {currentDomain.name} across all hierarchy levels
              </p>
            </div>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {/* Summary Section */}
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>
                📊 Overall Performance Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Achievement</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{insights.summary.overall_achievement}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Gap to Target</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{insights.summary.overall_gap}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Indicators Below Target</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{insights.summary.indicators_below_target}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Entities Analyzed</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>
                    {insights.summary.districts_analyzed}D + {insights.summary.blocks_analyzed}B + {insights.summary.schools_analyzed}S
                  </div>
                </div>
              </div>
            </div>

            {/* Indicators Needing Improvement */}
            {insights.indicators_needing_improvement && insights.indicators_needing_improvement.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🎯 Top Sub-Indicators Needing Improvement
                </h3>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Indicator</th>
                        <th>Current</th>
                        <th>Target</th>
                        <th>Gap</th>
                        <th>Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {insights.indicators_needing_improvement.slice(0, 5).map((indicator, index) => (
                        <tr key={index}>
                          <td><span className="badge badge-info">#{index + 1}</span></td>
                          <td><strong>{indicator.indicator_name}</strong> ({indicator.indicator_code})</td>
                          <td>{indicator.current}%</td>
                          <td>{indicator.target}%</td>
                          <td><span className="badge badge-warning">{indicator.gap}%</span></td>
                          <td>
                            <span className={`badge ${
                              indicator.priority === 'High' ? 'badge-danger' :
                              indicator.priority === 'Medium' ? 'badge-warning' : 'badge-info'
                            }`}>
                              {indicator.priority}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Districts Needing Improvement - Only show at state level */}
            {currentLevel === 'state' && insights.districts_needing_improvement && insights.districts_needing_improvement.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🏛️ Districts Needing Focused Intervention
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {insights.districts_needing_improvement.slice(0, 5).map((district, index) => (
                    <div key={index} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>#{index + 1}</div>
                      <Link to={`/district/${district.id}`} style={{ fontWeight: '600', color: 'var(--primary-blue)', textDecoration: 'none' }}>
                        {district.name}
                      </Link>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-orange)', margin: '0.5rem 0' }}>
                        {district.percentage}%
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-medium)' }}>
                        Gap: {district.gap_to_target}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Blocks Needing Focused Intervention - For District level as primary section */}
            {currentLevel === 'district' && insights.blocks_needing_improvement && insights.blocks_needing_improvement.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🏫 Blocks Needing Focused Intervention
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {insights.blocks_needing_improvement.slice(0, 5).map((block, index) => (
                    <div key={index} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>#{index + 1}</div>
                      <Link to={`/block/${block.id}`} style={{ fontWeight: '600', color: 'var(--primary-blue)', textDecoration: 'none' }}>
                        {block.name}
                      </Link>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-orange)', margin: '0.5rem 0' }}>
                        {block.percentage}%
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-medium)' }}>
                        Gap: {block.gap_to_target}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Top Blocks Requiring Support - For State and District level as table */}
            {(currentLevel === 'state' || currentLevel === 'district') && insights.blocks_needing_improvement && insights.blocks_needing_improvement.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🏫 Top Blocks Requiring Support
                </h3>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Block Name</th>
                        {currentLevel === 'state' && <th>District</th>}
                        <th>Performance</th>
                        <th>Gap</th>
                      </tr>
                    </thead>
                    <tbody>
                      {insights.blocks_needing_improvement.slice(0, 5).map((block, index) => (
                        <tr key={index}>
                          <td><span className="badge badge-warning">#{index + 1}</span></td>
                          <td>
                            <Link to={`/block/${block.id}`} style={{ fontWeight: '600', color: 'var(--primary-blue)' }}>
                              {block.name}
                            </Link>
                          </td>
                          {currentLevel === 'state' && <td>{block.district_name}</td>}
                          <td><span className="badge badge-warning">{block.percentage}%</span></td>
                          <td>{block.gap_to_target}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Schools Needing Focused Intervention - For Block level as primary section */}
            {currentLevel === 'block' && insights.schools_needing_improvement && insights.schools_needing_improvement.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🏢 Schools Needing Focused Intervention
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {insights.schools_needing_improvement.slice(0, 5).map((school, index) => (
                    <div key={index} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>#{index + 1}</div>
                      <Link to={`/school/${school.id}`} style={{ fontWeight: '600', color: 'var(--primary-blue)', textDecoration: 'none' }}>
                        {school.name}
                      </Link>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--accent-orange)', margin: '0.5rem 0' }}>
                        {school.percentage}%
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-medium)' }}>
                        Gap: {school.gap_to_target}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Critical Schools for Immediate Intervention - For all levels as table */}
            {insights.schools_needing_improvement && insights.schools_needing_improvement.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🏢 Critical Schools for Immediate Intervention
                </h3>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>School Name</th>
                        <th>Block</th>
                        <th>District</th>
                        <th>Performance</th>
                        <th>Gap</th>
                      </tr>
                    </thead>
                    <tbody>
                      {insights.schools_needing_improvement.slice(0, 5).map((school, index) => (
                        <tr key={index}>
                          <td><span className="badge badge-danger">#{index + 1}</span></td>
                          <td>
                            <Link to={`/school/${school.id}`} style={{ fontWeight: '600', color: 'var(--primary-blue)' }}>
                              {school.name}
                            </Link>
                          </td>
                          <td style={{ fontSize: '0.875rem' }}>{school.block_name}</td>
                          <td style={{ fontSize: '0.875rem' }}>{school.district_name}</td>
                          <td><span className="badge badge-danger">{school.percentage}%</span></td>
                          <td>{school.gap_to_target}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recommended Actions */}
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              background: 'var(--background-light)',
              borderRadius: '8px',
              borderLeft: '4px solid var(--primary-blue)'
            }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                📋 Recommended Actions
              </h4>
              <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-dark)' }}>
                {currentLevel === 'state' && insights.districts_needing_improvement.length > 0 && (
                  <li style={{ marginBottom: '0.5rem' }}>
                    Focus immediate intervention on the bottom {Math.min(5, insights.districts_needing_improvement.length)} districts: {insights.districts_needing_improvement.slice(0, 5).map(d => d.name).join(', ')}
                  </li>
                )}
                {(currentLevel === 'state' || currentLevel === 'district') && insights.blocks_needing_improvement.length > 0 && (
                  <li style={{ marginBottom: '0.5rem' }}>
                    Deploy specialized support teams to {insights.blocks_needing_improvement.length} underperforming block{insights.blocks_needing_improvement.length > 1 ? 's' : ''}
                  </li>
                )}
                {insights.schools_needing_improvement.length > 0 && (
                  <li style={{ marginBottom: '0.5rem' }}>
                    Implement targeted remedial programs in the {Math.min(10, insights.schools_needing_improvement.length)} most critical school{insights.schools_needing_improvement.length > 1 ? 's' : ''}
                  </li>
                )}
                {insights.indicators_needing_improvement && insights.indicators_needing_improvement.length > 0 && (
                  <li>
                    Address the top {Math.min(3, insights.indicators_needing_improvement.length)} indicator{insights.indicators_needing_improvement.length > 1 ? 's' : ''} with highest gaps through curriculum and teaching methodology improvements
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Indicators Performance */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Performance Indicators</h2>
            <p className="card-subtitle">
              Detailed breakdown of all {indicators.length} indicators in this domain
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ padding: '1.5rem' }}>
          {indicators.map((indicator, index) => (
            <div 
              key={index} 
              className="card hover:shadow-lg transition-all duration-200 cursor-pointer" 
              style={{ margin: 0, position: 'relative' }}
              onClick={() => {
                setSelectedIndicator(indicator);
                setShowDrilldownModal(true);
              }}
            >
              <div style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-dark)', flex: 1 }}>
                      {indicator.indicator_name}
                    </h4>
                    <span className={`badge ${getPerformanceClass(indicator.achieved_percentage)}`}>
                      {indicator.achieved_percentage?.toFixed(1)}%
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-medium)' }}>
                    Code: {indicator.indicator_code}
                  </p>
                </div>

                <div className="progress-container">
                  <div className="progress-header">
                    <span className="progress-label">Achievement</span>
                    <span className="progress-value">
                      {indicator.achieved_percentage?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${indicator.achieved_percentage}%`,
                        backgroundColor: getPerformanceColor(indicator.achieved_percentage)
                      }}
                    ></div>
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                  <span>Weight: {(indicator.weight_in_domain * 100).toFixed(2)}%</span>
                  <span>Target: {indicator.target}{indicator.unit === 'percentage' ? '%' : indicator.unit}</span>
                </div>

                {/* Click to drill-down hint */}
                <div style={{ 
                  marginTop: '1rem', 
                  paddingTop: '0.75rem', 
                  borderTop: '1px solid var(--border-light)',
                  fontSize: '0.75rem',
                  color: 'var(--primary-blue)',
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  🔍 Click for detailed drill-down analysis
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top 5 Performance Table */}
      {currentLevel === 'state' && districtPerformance.length > 0 && (
        <>
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🏆 Top 5 District-wise Performance
                </h2>
                <p className="card-subtitle">
                  Best performing districts in {currentDomain.name}
                </p>
              </div>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>District</th>
                    <th>Score</th>
                    <th>Achievement</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {districtPerformance.slice(0, 5).map((district, index) => (
                    <tr key={district.id}>
                      <td>
                        <span className="badge badge-success">#{index + 1}</span>
                      </td>
                      <td>
                        <Link to={`/district/${district.id}`} style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: '500' }}>
                          {district.name}
                        </Link>
                      </td>
                      <td style={{ fontWeight: '500' }}>{district.score?.toFixed(1)}/{district.maxScore}</td>
                      <td>
                        <div className="progress-bar" style={{ width: '100px' }}>
                          <div 
                            className="progress-fill"
                            style={{ 
                              width: `${district.percentage}%`,
                              backgroundColor: getPerformanceColor(district.percentage)
                            }}
                          ></div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getPerformanceClass(district.percentage)}`}>
                          {district.percentage?.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom 5 District-wise Performance */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📊 Bottom 5 District-wise Performance
                </h2>
                <p className="card-subtitle">
                  Districts needing improvement in {currentDomain.name}
                </p>
              </div>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>District</th>
                    <th>Score</th>
                    <th>Achievement</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {districtPerformance.slice(-5).reverse().map((district, index) => {
                    const actualRank = districtPerformance.length - index;
                    return (
                      <tr key={district.id}>
                        <td>
                          <span className="badge badge-warning">#{actualRank}</span>
                        </td>
                        <td>
                          <Link to={`/district/${district.id}`} style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: '500' }}>
                            {district.name}
                          </Link>
                        </td>
                        <td style={{ fontWeight: '500' }}>{district.score?.toFixed(1)}/{district.maxScore}</td>
                        <td>
                          <div className="progress-bar" style={{ width: '100px' }}>
                            <div 
                              className="progress-fill"
                              style={{ 
                                width: `${district.percentage}%`,
                                backgroundColor: getPerformanceColor(district.percentage)
                              }}
                            ></div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getPerformanceClass(district.percentage)}`}>
                            {district.percentage?.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Top 5 Block-wise Performance (for District Level) */}
      {currentLevel === 'district' && blockPerformance.length > 0 && (
        <>
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🏆 Top 5 Block-wise Performance
                </h2>
                <p className="card-subtitle">
                  Best performing blocks in {currentDomain.name}
                </p>
              </div>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Block</th>
                    <th>Score</th>
                    <th>Achievement</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {blockPerformance.slice(0, 5).map((block, index) => (
                    <tr key={block.id}>
                      <td>
                        <span className="badge badge-success">#{index + 1}</span>
                      </td>
                      <td>
                        <Link to={`/block/${block.id}`} style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: '500' }}>
                          {block.name}
                        </Link>
                      </td>
                      <td style={{ fontWeight: '500' }}>{block.score?.toFixed(1)}/{block.maxScore}</td>
                      <td>
                        <div className="progress-bar" style={{ width: '100px' }}>
                          <div 
                            className="progress-fill"
                            style={{ 
                              width: `${block.percentage}%`,
                              backgroundColor: getPerformanceColor(block.percentage)
                            }}
                          ></div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getPerformanceClass(block.percentage)}`}>
                          {block.percentage?.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom 5 Block-wise Performance */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📊 Bottom 5 Block-wise Performance
                </h2>
                <p className="card-subtitle">
                  Blocks needing improvement in {currentDomain.name}
                </p>
              </div>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Block</th>
                    <th>Score</th>
                    <th>Achievement</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {blockPerformance.slice(-5).reverse().map((block, index) => {
                    const actualRank = blockPerformance.length - index;
                    return (
                      <tr key={block.id}>
                        <td>
                          <span className="badge badge-warning">#{actualRank}</span>
                        </td>
                        <td>
                          <Link to={`/block/${block.id}`} style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: '500' }}>
                            {block.name}
                          </Link>
                        </td>
                        <td style={{ fontWeight: '500' }}>{block.score?.toFixed(1)}/{block.maxScore}</td>
                        <td>
                          <div className="progress-bar" style={{ width: '100px' }}>
                            <div 
                              className="progress-fill"
                              style={{ 
                                width: `${block.percentage}%`,
                                backgroundColor: getPerformanceColor(block.percentage)
                              }}
                            ></div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getPerformanceClass(block.percentage)}`}>
                            {block.percentage?.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Top 5 School-wise Performance (for Block Level) */}
      {currentLevel === 'block' && schoolPerformance.length > 0 && (
        <>
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🏆 Top 5 School-wise Performance
                </h2>
                <p className="card-subtitle">
                  Best performing schools in {currentDomain.name}
                </p>
              </div>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>School</th>
                    <th>Score</th>
                    <th>Achievement</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {schoolPerformance.slice(0, 5).map((school, index) => (
                    <tr key={school.id}>
                      <td>
                        <span className="badge badge-success">#{index + 1}</span>
                      </td>
                      <td>
                        <Link to={`/school/${school.id}`} style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: '500' }}>
                          {school.name}
                        </Link>
                      </td>
                      <td style={{ fontWeight: '500' }}>{school.score?.toFixed(1)}/{school.maxScore}</td>
                      <td>
                        <div className="progress-bar" style={{ width: '100px' }}>
                          <div 
                            className="progress-fill"
                            style={{ 
                              width: `${school.percentage}%`,
                              backgroundColor: getPerformanceColor(school.percentage)
                            }}
                          ></div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getPerformanceClass(school.percentage)}`}>
                          {school.percentage?.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom 5 School-wise Performance */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📊 Bottom 5 School-wise Performance
                </h2>
                <p className="card-subtitle">
                  Schools needing improvement in {currentDomain.name}
                </p>
              </div>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>School</th>
                    <th>Score</th>
                    <th>Achievement</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {schoolPerformance.slice(-5).reverse().map((school, index) => {
                    const actualRank = schoolPerformance.length - index;
                    return (
                      <tr key={school.id}>
                        <td>
                          <span className="badge badge-warning">#{actualRank}</span>
                        </td>
                        <td>
                          <Link to={`/school/${school.id}`} style={{ color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: '500' }}>
                            {school.name}
                          </Link>
                        </td>
                        <td style={{ fontWeight: '500' }}>{school.score?.toFixed(1)}/{school.maxScore}</td>
                        <td>
                          <div className="progress-bar" style={{ width: '100px' }}>
                            <div 
                              className="progress-fill"
                              style={{ 
                                width: `${school.percentage}%`,
                                backgroundColor: getPerformanceColor(school.percentage)
                              }}
                            ></div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${getPerformanceClass(school.percentage)}`}>
                            {school.percentage?.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Indicator Drilldown Modal */}
      <IndicatorDrilldownModal
        isOpen={showDrilldownModal}
        onClose={() => {
          setShowDrilldownModal(false);
          setSelectedIndicator(null);
        }}
        indicator={selectedIndicator}
        level={currentLevel}
        entityId={currentEntityId}
        domainName={currentDomain.name}
      />
    </div>
  );
};

export default DomainDashboard;
