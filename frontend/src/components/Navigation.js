import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') return 'Overview Dashboard';
    if (path.includes('/state/')) return 'State Level Dashboard';
    if (path.includes('/district/')) return 'District Level Dashboard';
    if (path.includes('/block/')) return 'Block Level Dashboard';
    if (path.includes('/school/')) return 'School Level Dashboard';
    return 'Dashboard';
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-logo">
          <h1>Maharashtra Education Dashboard</h1>
        </div>
        <div className="nav-breadcrumb">
          <span>{getBreadcrumb()}</span>
        </div>
        <div className="nav-actions">
          <Link to="/" className="nav-btn">
            Home
          </Link>
          <button 
            onClick={() => window.open(`${process.env.REACT_APP_BACKEND_URL}/api/export-data/state`, '_blank')}
            className="nav-btn primary"
            data-testid="export-data-btn"
          >
            Export Data
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;