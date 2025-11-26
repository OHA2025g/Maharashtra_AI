import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, TrendingDown, AlertTriangle, ChevronRight } from 'lucide-react';

const IndicatorDrilldownModal = ({ 
  isOpen, 
  onClose, 
  indicator, 
  level, 
  entityId, 
  domainName 
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && indicator) {
      fetchDrilldownData();
    }
  }, [isOpen, indicator]);

  const fetchDrilldownData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/indicator-drilldown`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            level: level,
            entity_id: entityId,
            indicator_code: indicator.indicator_code,
            domain_name: domainName
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch drill-down data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold bg-white bg-opacity-20 px-3 py-1 rounded-full">
                {indicator?.indicator_code}
              </span>
              <span className="text-xs bg-white bg-opacity-20 px-3 py-1 rounded-full">
                {domainName}
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {indicator?.indicator_name}
            </h2>
            <p className="text-blue-100 text-sm">
              Detailed performance drill-down and improvement analysis
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading && (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="loading-spinner mx-auto mb-4" style={{ width: '40px', height: '40px' }}></div>
                <p className="text-gray-600">Analyzing performance data...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                <p className="font-semibold">Error loading data</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {data && !loading && (
            <div className="p-6 space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-600 mb-1">Current</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {data.summary.current_achievement}%
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-green-600 mb-1">Target</div>
                  <div className="text-2xl font-bold text-green-900">
                    {data.summary.target}%
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-sm text-orange-600 mb-1">Gap</div>
                  <div className="text-2xl font-bold text-orange-900">
                    {data.summary.gap}%
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm text-purple-600 mb-1">Entities</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {data.summary.districts_analyzed + data.summary.blocks_analyzed + data.summary.schools_analyzed}
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              {data.insights && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span>💡</span> AI-Powered Insights
                  </h3>
                  <div className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
                    {data.insights}
                  </div>
                </div>
              )}

              {/* Districts Needing Improvement */}
              {data.districts_needing_improvement && data.districts_needing_improvement.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Districts Requiring Immediate Attention
                  </h3>
                  <div className="space-y-3">
                    {data.districts_needing_improvement.map((district, index) => (
                      <div key={district.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="bg-red-100 text-red-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                              #{index + 1}
                            </div>
                            <div className="flex-1">
                              <Link 
                                to={`/district/${district.id}`}
                                className="text-blue-600 hover:text-blue-800 font-semibold"
                              >
                                {district.name}
                              </Link>
                              <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <span>Achievement: <span className="font-semibold text-orange-600">{district.achievement}%</span></span>
                                <span>Gap: <span className="font-semibold text-red-600">{district.gap}%</span></span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full h-2"
                              style={{ width: `${district.achievement}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Blocks Needing Improvement */}
              {data.blocks_needing_improvement && data.blocks_needing_improvement.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-orange-600" />
                    Blocks Requiring Support
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.blocks_needing_improvement.map((block, index) => (
                      <div key={block.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="bg-orange-100 text-orange-600 rounded-full w-7 h-7 flex items-center justify-center font-bold text-xs">
                              #{index + 1}
                            </div>
                            <Link 
                              to={`/block/${block.id}`}
                              className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                            >
                              {block.name}
                            </Link>
                          </div>
                        </div>
                        {block.district_name && (
                          <div className="text-xs text-gray-500 mb-2">
                            in {block.district_name}
                          </div>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                          <span>Achievement: <span className="font-semibold text-orange-600">{block.achievement}%</span></span>
                          <span>Gap: <span className="font-semibold text-red-600">{block.gap}%</span></span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-orange-500 rounded-full h-1.5"
                            style={{ width: `${block.achievement}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Schools Needing Improvement */}
              {data.schools_needing_improvement && data.schools_needing_improvement.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                    Schools Requiring Immediate Intervention
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.schools_needing_improvement.map((school, index) => (
                      <div key={school.id} className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex items-start gap-2 mb-2">
                          <div className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            #{index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link 
                              to={`/school/${school.id}`}
                              className="text-blue-600 hover:text-blue-800 font-semibold text-sm block truncate"
                            >
                              {school.name}
                            </Link>
                            {(school.block_name || school.district_name) && (
                              <div className="text-xs text-gray-500">
                                {school.block_name && `${school.block_name}`}
                                {school.district_name && ` • ${school.district_name}`}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
                          <span>Achievement: <span className="font-semibold text-red-600">{school.achievement}%</span></span>
                          <span>Gap: <span className="font-semibold text-red-700">{school.gap}%</span></span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-red-500 rounded-full h-1.5"
                            style={{ width: `${school.achievement}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndicatorDrilldownModal;
