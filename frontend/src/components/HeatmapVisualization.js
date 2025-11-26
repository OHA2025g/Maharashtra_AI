import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HeatmapVisualization = ({ 
  title = "PGI Performance Map",
  entities = [], // Array of entities with {id, name, score, percentage}
  entityType = "district", // "district", "block", or "school"
  onEntityClick = null
}) => {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const navigate = useNavigate();

  // Color based on performance percentage
  const getPerformanceColor = (percentage) => {
    if (percentage >= 75) return '#10b981'; // Green - Excellent
    if (percentage >= 65) return '#3b82f6'; // Blue - Good
    if (percentage >= 55) return '#f59e0b'; // Orange - Average
    return '#ef4444'; // Red - Needs Focus
  };

  const getPerformanceLabel = (percentage) => {
    if (percentage >= 75) return 'Excellent';
    if (percentage >= 65) return 'Good';
    if (percentage >= 55) return 'Average';
    return 'Needs Focus';
  };

  // Generate pseudo-random positions for entities in a map-like layout
  const generatePositions = (entities) => {
    return entities.map((entity, index) => {
      // Create a grid-like distribution with some randomness
      const gridSize = Math.ceil(Math.sqrt(entities.length));
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      
      // Base position with some random offset
      const baseX = (col / gridSize) * 80 + 10; // 10-90% range
      const baseY = (row / gridSize) * 80 + 10; // 10-90% range
      
      // Add some randomness but keep it deterministic per entity
      const randomX = (Math.sin(index * 1.5) * 8);
      const randomY = (Math.cos(index * 2.1) * 8);
      
      return {
        ...entity,
        x: baseX + randomX,
        y: baseY + randomY
      };
    });
  };

  const positionedEntities = generatePositions(entities);

  const handleEntityClick = (entity) => {
    setSelectedEntity(entity);
    if (onEntityClick) {
      onEntityClick(entity);
    } else {
      // Default navigation behavior
      if (entityType === 'block') {
        navigate(`/block/${entity.id}`);
      } else if (entityType === 'school') {
        navigate(`/school/${entity.id}`);
      }
    }
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', height: '600px' }}>
      {/* Heatmap Section */}
      <div style={{ flex: 1, position: 'relative', minWidth: '500px' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
          borderRadius: '12px',
          padding: '1.5rem',
          height: '100%',
          position: 'relative',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '1rem',
            color: '#0369a1',
            fontWeight: '600',
            fontSize: '1.125rem'
          }}>
            <span style={{ fontSize: '1.5rem' }}>🗺️</span>
            {title}
          </div>

          {/* Map Container */}
          <div style={{
            position: 'relative',
            height: 'calc(100% - 120px)',
            background: 'rgba(255, 255, 255, 0.4)',
            borderRadius: '8px',
            border: '2px solid rgba(3, 105, 161, 0.2)',
            overflow: 'hidden'
          }}>
            {/* Entity Markers */}
            {positionedEntities.map((entity) => (
              <div
                key={entity.id}
                onClick={() => handleEntityClick(entity)}
                style={{
                  position: 'absolute',
                  left: `${entity.x}%`,
                  top: `${entity.y}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  zIndex: selectedEntity?.id === entity.id ? 10 : 1
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
                }}
              >
                <div
                  style={{
                    width: selectedEntity?.id === entity.id ? '20px' : '16px',
                    height: selectedEntity?.id === entity.id ? '20px' : '16px',
                    borderRadius: '50%',
                    backgroundColor: getPerformanceColor(entity.percentage),
                    border: selectedEntity?.id === entity.id ? '3px solid #fff' : '2px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                  title={`${entity.name}: ${entity.percentage?.toFixed(1)}%`}
                />
              </div>
            ))}
          </div>

          {/* Legend */}
          <div style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: '1.5rem',
            background: 'white',
            padding: '1rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            fontSize: '0.875rem'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#0369a1' }}>
              PGI Performance
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                <span>75%+ Excellent</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />
                <span>65-75% Good</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                <span>55-65% Average</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <span>&lt;55% Needs Focus</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Entity Insights Panel */}
      <div style={{ width: '400px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #0ea5e9 100%)',
          borderRadius: '12px',
          padding: '2rem',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            marginBottom: '1.5rem',
            fontSize: '1.125rem',
            fontWeight: '600'
          }}>
            <span style={{ fontSize: '1.5rem' }}>📊</span>
            {entityType.charAt(0).toUpperCase() + entityType.slice(1)} Insights
          </div>

          {selectedEntity ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {selectedEntity.name}
                </h2>
                <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>
                  {selectedEntity.district_name || selectedEntity.block_name || 'Maharashtra'}
                </p>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '1rem',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.25rem' }}>
                  PGI Score: {selectedEntity.score}/{selectedEntity.maxScore || 1000} ({selectedEntity.percentage?.toFixed(2)}%)
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                  PGI Score
                </h3>
                <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>
                  {selectedEntity.score}/{selectedEntity.maxScore || 1000}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Performance Percentage
                </h3>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#4ade80' }}>
                  {selectedEntity.percentage?.toFixed(1)}%
                </div>
              </div>

              {selectedEntity.blocks_count && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Number of Blocks</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fb923c' }}>
                      {selectedEntity.blocks_count}
                    </div>
                  </div>
                  {selectedEntity.schools_count && (
                    <div>
                      <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Number of Schools</div>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#60a5fa' }}>
                        {selectedEntity.schools_count}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedEntity.schools_count && !selectedEntity.blocks_count && (
                <div style={{
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Number of Schools</div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#60a5fa' }}>
                    {selectedEntity.schools_count}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              opacity: 0.7,
              textAlign: 'center',
              padding: '2rem'
            }}>
              <div>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                <p>Click on any marker on the map to view detailed insights</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeatmapVisualization;
