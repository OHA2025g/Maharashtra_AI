import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Target } from 'lucide-react';

const PGIDomainBreakdown = ({ pgiData, enableNavigation = false, level = 'state', entityId = 'mh_001' }) => {
  const [expandedDomains, setExpandedDomains] = useState({});
  const navigate = useNavigate();

  if (!pgiData || !pgiData.domains) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-500">Loading PGI breakdown...</p>
      </div>
    );
  }

  const domainUrlMap = {
    'Learning Outcomes and Quality': 'learning-outcomes',
    'Access': 'access',
    'Infrastructure & Facilities': 'infrastructure',
    'Equity': 'equity',
    'Governance Processes': 'governance',
    'Teacher Education & Training': 'teacher-education'
  };

  const handleDomainClick = (domain, event) => {
    // Just toggle expansion on card click
    toggleDomain(domain.domain_key);
  };

  const handleFooterClick = (domain, event) => {
    event.stopPropagation(); // Prevent card toggle
    if (enableNavigation) {
      const domainUrl = domainUrlMap[domain.domain_name];
      if (domainUrl) {
        // Navigate to domain dashboard with level and entity context
        if (level === 'state') {
          navigate(`/domain/${domainUrl}`);
        } else {
          navigate(`/domain/${domainUrl}/${level}/${entityId}`);
        }
      }
    }
  };

  const toggleDomain = (domainKey) => {
    setExpandedDomains(prev => ({
      ...prev,
      [domainKey]: !prev[domainKey]
    }));
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">PGI Framework - Domain Analysis</h3>
        <p className="text-gray-600">Six core domains with detailed indicator performance</p>
      </div>

      {/* Domain Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pgiData.domains.map((domain) => (
          <div 
            key={domain.domain_key} 
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
          >
            {/* Card Header */}
            <div 
              className="p-6 border-b border-gray-100 cursor-pointer"
              onClick={(e) => handleDomainClick(domain, e)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {domain.domain_code}
                    </span>
                    <span className="text-xs text-gray-500">Weight: {(domain.weight * 100).toFixed(0)}%</span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 leading-tight">{domain.domain_name}</h4>
                </div>
              </div>
              
              {/* Overall Performance */}
              <div className="mb-4">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-sm text-gray-600">Overall</span>
                  <span className="text-xl font-bold text-gray-900">
                    {domain.score.toFixed(1)}/{domain.max_score.toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-sm text-gray-600">Performance</span>
                  <span className={`text-lg font-semibold ${getPerformanceColor(domain.percentage)}`}>
                    ({domain.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${getProgressBarColor(domain.percentage)} rounded-full h-2 transition-all duration-500`}
                    style={{ width: `${domain.percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Top 3 Indicators Preview */}
              {domain.indicators && domain.indicators.length > 0 && (
                <div className="space-y-2">
                  {domain.indicators.slice(0, 3).map((indicator, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700 truncate flex-1 mr-2">{indicator.indicator_name.substring(0, 40)}...</span>
                      <span className={getPerformanceColor(indicator.achieved_percentage)}>
                        {indicator.achieved_percentage.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                  {domain.indicators.length > 3 && (
                    <div className="text-xs text-blue-600 font-medium pt-2">
                      +{domain.indicators.length - 3} more indicators
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Expandable Detailed Indicators */}
            {expandedDomains[domain.domain_key] && domain.indicators && domain.indicators.length > 0 && (
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h6 className="text-sm font-semibold text-gray-700">
                    All Indicators ({domain.indicators.length})
                  </h6>
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {domain.indicators.map((indicator) => (
                    <div key={indicator.indicator_key} className="bg-white p-3 rounded-lg border border-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              {indicator.indicator_code}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-gray-800 block">
                            {indicator.indicator_name}
                          </span>
                          <div className="flex items-center gap-3 text-xs text-gray-600 mt-2">
                            <div className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              <span>Target: {indicator.target}{indicator.unit === 'percentage' ? '%' : ''}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {indicator.achieved_percentage >= indicator.target ? (
                                <TrendingUp className="w-3 h-3 text-green-600" />
                              ) : (
                                <TrendingDown className="w-3 h-3 text-orange-600" />
                              )}
                              <span>Achieved: {indicator.achieved_percentage.toFixed(1)}{indicator.unit === 'percentage' ? '%' : ''}</span>
                            </div>
                          </div>
                        </div>
                        <div className={`text-sm font-semibold ml-2 ${getPerformanceColor(indicator.achieved_percentage)}`}>
                          {indicator.achieved_percentage >= indicator.target ? '✓' : '⚠'}
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`${getProgressBarColor((indicator.achieved_percentage / indicator.target) * 100)} rounded-full h-1.5`}
                            style={{ width: `${Math.min((indicator.achieved_percentage / indicator.target) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!expandedDomains[domain.domain_key] && (
              <div 
                className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-center domain-footer hover:bg-blue-50 transition-colors cursor-pointer"
                onClick={(e) => enableNavigation ? handleFooterClick(domain, e) : handleDomainClick(domain, e)}
              >
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  {enableNavigation ? 'Click to view detailed dashboard' : 'Click to view all indicators'} 
                  <ChevronDown className="w-3 h-3" />
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PGIDomainBreakdown;
