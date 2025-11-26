import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import PGIDomainBreakdown from './PGIDomainBreakdown';

const SchoolDashboard = () => {
  const { schoolId } = useParams();
  const [schoolData, setSchoolData] = useState(null);
  const [pgiData, setPgiData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSchoolData();
  }, [schoolId]);

  const generateInsights = async () => {
    try {
      setGeneratingInsights(true); // Show generating state
      
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/generate-insights/school/${schoolId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        // Wait for insights to be generated (backend processes in background)
        await new Promise(resolve => setTimeout(resolve, 15000)); // Wait 15 seconds
        
        // Refresh insights after generation
        const insightsRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/insights/school/${schoolId}`);
        if (insightsRes.ok) {
          const insightsData = await insightsRes.json();
          setInsights(insightsData);
          setGeneratingInsights(false);
          
          // Navigate to insights section with smooth scroll
          setTimeout(() => {
            const insightsSection = document.querySelector('[data-testid="school-insights-title"]');
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

  const fetchSchoolData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch school data directly using the new endpoint
      const schoolRes = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/schools/${schoolId}`);
      
      if (!schoolRes.ok) {
        throw new Error('School not found');
      }
      
      const schoolDataResult = await schoolRes.json();
      setSchoolData(schoolDataResult);
      
      // Fetch PGI data and insights in parallel
      try {
        const [pgiRes, insightsRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_BACKEND_URL}/api/pgi-score/school/${schoolId}`),
          fetch(`${process.env.REACT_APP_BACKEND_URL}/api/insights/school/${schoolId}`)
        ]);
        
        if (pgiRes.ok) {
          const pgiDataResult = await pgiRes.json();
          setPgiData(pgiDataResult);
        }
        
        if (insightsRes.ok) {
          const insightsData = await insightsRes.json();
          setInsights(insightsData);
        }
      } catch (e) {
        console.log('PGI/Insights data not available for school');
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading school dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading School Dashboard</h2>
        <p>{error}</p>
        <button onClick={fetchSchoolData} className="retry-btn">Retry</button>
      </div>
    );
  }

  // School level KPI categories
  const schoolKPIs = [
    {
      category: 'Learning Excellence Indicators',
      description: 'Academic performance and student achievement metrics',
      metrics: [
        { name: 'Foundational Literacy & Numeracy', target: 90, current: 87.5, unit: '%', type: 'primary' },
        { name: 'Subject Proficiency Levels', target: 75, current: 78.2, unit: '%', type: 'success' },
        { name: 'Assessment Performance', target: 70, current: 74.1, unit: '%', type: 'success' }
      ]
    },
    {
      category: 'Infrastructure Quality Standards',
      description: 'Facility adequacy and infrastructure completeness',
      metrics: [
        { name: 'Basic Facility Completeness', target: 100, current: 95.0, unit: '%', type: 'primary' },
        { name: 'Digital Infrastructure Readiness', target: 75, current: schoolData?.infrastructure_score || 68, unit: '%', type: 'warning' },
        { name: 'Classroom Adequacy', target: 35, current: schoolData?.student_count && schoolData?.teacher_count ? (schoolData.student_count / schoolData.teacher_count) : 30, unit: ':1', type: 'info' }
      ]
    },
    {
      category: 'Teacher Quality Assurance',
      description: 'Teaching staff qualifications and development metrics',
      metrics: [
        { name: 'Professional Qualification', target: 100, current: 92.5, unit: '%', type: 'success' },
        { name: 'Continuous Professional Development', target: 20, current: 18.5, unit: 'hrs', type: 'warning' },
        { name: 'Student-Teacher Ratio', target: 30, current: schoolData?.student_count && schoolData?.teacher_count ? Math.round(schoolData.student_count / schoolData.teacher_count) : 25, unit: ':1', type: 'info' }
      ]
    },
    {
      category: 'Safety & Protection Systems',
      description: 'Child safety and protection mechanism effectiveness',
      metrics: [
        { name: 'Child Protection Committee', target: 100, current: 85.0, unit: '%', type: 'warning' },
        { name: 'Safety Audit Compliance', target: 100, current: 90.0, unit: '%', type: 'success' },
        { name: 'Grievance Resolution Efficiency', target: 100, current: 88.5, unit: '%', type: 'success' }
      ]
    }
  ];

  const getProgressColor = (current, target, type) => {
    const percentage = type === 'info' ? Math.min(100, (target / current) * 100) : (current / target) * 100;
    if (percentage >= 90) return 'var(--success-green)';
    if (percentage >= 70) return 'var(--warning-amber)';
    return 'var(--error-red)';
  };

  const getStatusBadge = (current, target, type) => {
    const percentage = type === 'info' ? Math.min(100, (target / current) * 100) : (current / target) * 100;
    if (percentage >= 90) return 'badge-success';
    if (percentage >= 70) return 'badge-warning';
    return 'badge-danger';
  };

  const getStatusText = (current, target, type) => {
    const percentage = type === 'info' ? Math.min(100, (target / current) * 100) : (current / target) * 100;
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 70) return 'Good';
    return 'Needs Attention';
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1 className="dashboard-title" data-testid="school-dashboard-title">
            {schoolData?.name || 'School'} Implementation Dashboard
          </h1>
          <p className="dashboard-subtitle">
            School Level KPIs: Learning Excellence | Infrastructure | Teacher Quality | Safety Systems
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
            <button 
              onClick={generateInsights}
              className="btn btn-primary"
              data-testid="generate-school-insights-btn"
              disabled={generatingInsights}
            >
              {generatingInsights ? 'Generating Insights...' : 'Generate AI Insights'}
            </button>
            <Link 
              to={`/block/${schoolData?.block_id || 'block_001_001'}`} 
              className="btn btn-secondary"
            >
              Back to Block
            </Link>
          </div>
        </div>
      </div>

      {/* School Overview Stats */}
      <div className="stats-grid">
        <div className="stat-card" data-testid="school-students">
          <div className="stat-value" style={{ color: 'var(--primary-blue)' }}>
            {schoolData?.student_count || 0}
          </div>
          <div className="stat-label">Total Students</div>
          <div className="stat-trend trend-positive">
            ▲ Active enrollment
          </div>
        </div>
        
        <div className="stat-card" data-testid="school-teachers">
          <div className="stat-value" style={{ color: 'var(--accent-emerald)' }}>
            {schoolData?.teacher_count || 0}
          </div>
          <div className="stat-label">Teaching Staff</div>
          <div className="stat-trend trend-positive">
            ▲ Qualified educators
          </div>
        </div>
        
        <div className="stat-card" data-testid="student-teacher-ratio">
          <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>
            {schoolData?.student_count && schoolData?.teacher_count ? 
              Math.round(schoolData.student_count / schoolData.teacher_count) : 'N/A'}
          </div>
          <div className="stat-label">Student-Teacher Ratio</div>
          <div className="stat-trend trend-neutral">
            Optimal: ≤30:1
          </div>
        </div>
        
        <div className="stat-card" data-testid="infrastructure-score">
          <div className="stat-value" style={{ color: 'var(--primary-teal)' }}>
            {(schoolData?.infrastructure_score * 10 || 0).toFixed(0)}
          </div>
          <div className="stat-label">PGI Score</div>
          <div className="stat-trend trend-neutral">
            out of 1000
          </div>
        </div>
      </div>

      {/* PGI Detailed Breakdown */}
      {pgiData && (
        <div className="pgi-breakdown-section" data-testid="pgi-breakdown-section-school">
          <PGIDomainBreakdown pgiData={pgiData} />
        </div>
      )}

      {/* School Level KPI Framework */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title" data-testid="school-kpi-framework">
              School Level Implementation KPIs
            </h2>
            <p className="card-subtitle">
              Four critical categories for comprehensive school performance evaluation
            </p>
          </div>
        </div>
        
        <div className="grid grid-2">
          {schoolKPIs.map((category, index) => (
            <div key={category.category} className="card" style={{ margin: '0.5rem' }}>
              <h3 className="card-title" data-testid={`kpi-category-${index}`}>
                {category.category}
              </h3>
              <p className="card-subtitle" style={{ marginBottom: '1rem' }}>
                {category.description}
              </p>
              
              <div style={{ marginTop: '1rem' }}>
                {category.metrics.map((metric, metricIndex) => {
                  const isRatio = metric.unit.includes(':');
                  const percentage = isRatio ? 
                    Math.min(100, (metric.target / metric.current) * 100) :
                    (metric.current / metric.target) * 100;
                  
                  return (
                    <div key={metric.name} className="progress-container" style={{ marginBottom: '1rem' }}>
                      <div className="progress-header">
                        <span className="progress-label">{metric.name}</span>
                        <span className="progress-value">
                          {metric.current}{metric.unit}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${Math.min(100, percentage)}%`,
                            background: getProgressColor(metric.current, metric.target, metric.type)
                          }}
                        ></div>
                      </div>
                      <div style={{ 
                        fontSize: '0.75rem', 
                        color: 'var(--text-light)', 
                        marginTop: '0.25rem',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span>Target: {metric.target}{metric.unit}</span>
                        <span className={`badge ${getStatusBadge(metric.current, metric.target, metric.type)}`}>
                          {getStatusText(metric.current, metric.target, metric.type)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Analysis */}
      <div className="grid grid-3">
        <div className="card">
          <h3 className="card-title" data-testid="academic-performance-analysis">Academic Performance</h3>
          <div className="chart-container">
            <div style={{ textAlign: 'left' }}>
              <p><strong>FLN Achievement:</strong> 87.5% (Target: 90%)</p>
              <p><strong>Subject Proficiency:</strong> 78.2% (Target: 75%)</p>
              <p><strong>Assessment Scores:</strong> Above state average</p>
              <div style={{ marginTop: '1rem' }}>
                <span className="badge badge-success">Exceeding Expectations</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="card-title" data-testid="infrastructure-analysis">Infrastructure Quality</h3>
          <div className="chart-container">
            <div style={{ textAlign: 'left' }}>
              <p><strong>Basic Facilities:</strong> 95% complete</p>
              <p><strong>Digital Infrastructure:</strong> {schoolData?.infrastructure_score?.toFixed(1)}%</p>
              <p><strong>Classroom Condition:</strong> Good</p>
              <div style={{ marginTop: '1rem' }}>
                <span className={`badge ${
                  (schoolData?.infrastructure_score || 0) >= 80 ? 'badge-success' : 
                  (schoolData?.infrastructure_score || 0) >= 60 ? 'badge-warning' : 'badge-danger'
                }`}>
                  {(schoolData?.infrastructure_score || 0) >= 80 ? 'Excellent' : 
                   (schoolData?.infrastructure_score || 0) >= 60 ? 'Good' : 'Needs Improvement'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="card-title" data-testid="safety-compliance-analysis">Safety & Compliance</h3>
          <div className="chart-container">
            <div style={{ textAlign: 'left' }}>
              <p><strong>Safety Audit:</strong> 90% compliance</p>
              <p><strong>Child Protection:</strong> Committee active</p>
              <p><strong>Grievance System:</strong> 88.5% efficiency</p>
              <div style={{ marginTop: '1rem' }}>
                <span className="badge badge-success">Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed School Information */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title" data-testid="school-details-title">
              School Details & Statistics
            </h2>
            <p className="card-subtitle">
              Comprehensive overview of school characteristics and performance
            </p>
          </div>
        </div>
        
        <div className="table-container">
          <table className="table" data-testid="school-details-table">
            <thead>
              <tr>
                <th>Metric Category</th>
                <th>Current Value</th>
                <th>Target/Benchmark</th>
                <th>Performance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr data-testid="enrollment-row">
                <td><strong>Student Enrollment</strong></td>
                <td>{schoolData?.student_count || 0} students</td>
                <td>200+ students (optimal)</td>
                <td>
                  {((schoolData?.student_count || 0) / 200 * 100).toFixed(1)}%
                </td>
                <td>
                  <span className={`badge ${
                    (schoolData?.student_count || 0) >= 200 ? 'badge-success' : 'badge-warning'
                  }`}>
                    {(schoolData?.student_count || 0) >= 200 ? 'Optimal' : 'Below Optimal'}
                  </span>
                </td>
              </tr>
              <tr data-testid="staffing-row">
                <td><strong>Teaching Staff</strong></td>
                <td>{schoolData?.teacher_count || 0} teachers</td>
                <td>Student:Teacher ≤ 30:1</td>
                <td>
                  {schoolData?.student_count && schoolData?.teacher_count ? 
                    Math.round(schoolData.student_count / schoolData.teacher_count) : 'N/A'}:1
                </td>
                <td>
                  <span className={`badge ${
                    schoolData?.student_count && schoolData?.teacher_count &&
                    (schoolData.student_count / schoolData.teacher_count) <= 30 ? 
                    'badge-success' : 'badge-warning'
                  }`}>
                    {schoolData?.student_count && schoolData?.teacher_count &&
                     (schoolData.student_count / schoolData.teacher_count) <= 30 ? 
                     'Adequate' : 'Needs Attention'}
                  </span>
                </td>
              </tr>
              <tr data-testid="infrastructure-row">
                <td><strong>Infrastructure Quality</strong></td>
                <td>{schoolData?.infrastructure_score?.toFixed(1) || 0}%</td>
                <td>≥ 75% (good quality)</td>
                <td>
                  {((schoolData?.infrastructure_score || 0) / 75 * 100).toFixed(1)}%
                </td>
                <td>
                  <span className={`badge ${
                    (schoolData?.infrastructure_score || 0) >= 75 ? 'badge-success' : 
                    (schoolData?.infrastructure_score || 0) >= 60 ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {(schoolData?.infrastructure_score || 0) >= 75 ? 'Good' : 
                     (schoolData?.infrastructure_score || 0) >= 60 ? 'Fair' : 'Poor'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* AI-Generated Insights - Card Structure */}
      <div className="insights-section">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2" data-testid="school-insights-title">
            AI-Powered Performance Insights
          </h2>
          <p className="text-gray-600">Data-driven recommendations for school improvement</p>
        </div>
        
        {insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insights.map(insight => (
              <div 
                key={insight.id} 
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                data-testid={`school-insight-${insight.metric_name.toLowerCase().replace(/\s+/g, '-')}`}
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
              Click "Generate AI Insights" button above to analyze school performance metrics and get AI-powered recommendations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolDashboard;