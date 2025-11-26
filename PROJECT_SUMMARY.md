# Maharashtra Education Analytics Dashboard - Complete Project

## 📋 Overview

A comprehensive, multi-level education analytics dashboard for Maharashtra state that provides performance insights across State, District, Block, and School levels. Built with React, FastAPI, and MongoDB.

## 🎯 Key Features

### 1. **Multi-Level Performance Dashboards**
- **State Dashboard**: Overview of all 35 districts
- **District Dashboard**: Detailed view of blocks within a district
- **Block Dashboard**: Performance analysis of schools within a block
- **School Dashboard**: Individual school performance metrics

### 2. **Interactive Heatmaps**
- Visual representation of performance across entities
- Toggle between map view and table view
- Hover interactions showing detailed metrics
- Click-through navigation to detailed dashboards

### 3. **PGI Domain Analysis (6 Domains)**
- Learning Outcomes and Quality
- Access
- Infrastructure & Facilities
- Equity
- Governance Processes
- Teacher Education & Training

### 4. **Domain-Specific Dashboards**
- Accessible from State, District, and Block levels
- 12 indicators per domain with detailed metrics
- Click-through from PGI domain cards
- Performance breakdowns by sub-indicators

### 5. **Comprehensive Insights Generation**
- AI-powered analysis (with fallback for budget constraints)
- Level-aware insights:
  - **State Level**: Districts → Blocks → Schools hierarchy
  - **District Level**: Blocks → Schools analysis
  - **Block Level**: Schools-only analysis
- Sections include:
  - Overall Performance Summary
  - Top Sub-Indicators Needing Improvement
  - Entities Needing Focused Intervention
  - Top Entities Requiring Support
  - Critical Entities for Immediate Intervention
  - Recommended Actions

### 6. **Indicator Drill-Down Analysis**
- Click any indicator to see detailed drill-down
- Shows which districts/blocks/schools need improvement
- Multi-level hierarchy visualization
- AI-powered or data-driven insights
- Actionable recommendations

### 7. **Performance Tables**
- Split into "Top 5" and "Bottom 5" sections
- District-wise, Block-wise, and School-wise performance
- Real-time data filtering and sorting
- Clickable rows for navigation

### 8. **Automatic Features**
- Scroll-to-top on page navigation
- Hot reload for development
- Responsive design for all screen sizes
- Professional color-coded performance indicators

## 🏗️ Technical Architecture

### Frontend
- **Framework**: React 18
- **Styling**: Tailwind CSS, Custom CSS
- **Routing**: React Router v6
- **UI Components**: Custom components + Shadcn UI
- **State Management**: React Hooks (useState, useEffect)

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB
- **AI Integration**: Built-in data-driven insights (no external LLM dependencies)
- **API Design**: RESTful endpoints

### Key Dependencies
**Frontend:**
- react, react-dom, react-router-dom
- tailwindcss, @craco/craco
- lucide-react (icons)

**Backend:**
- fastapi, uvicorn
- motor (MongoDB async driver)
- pydantic (data validation)
# Removed emergentintegrations - using built-in data analysis

## 📁 Project Structure

```
/app/
├── backend/
│   ├── server.py                 # Main FastAPI application
│   ├── pgi_framework.py          # PGI framework definitions
│   ├── requirements.txt          # Python dependencies
│   └── .env                      # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js              # Main landing page
│   │   │   ├── StateDashboard.js         # State-level view
│   │   │   ├── DistrictDashboard.js      # District-level view
│   │   │   ├── BlockDashboard.js         # Block-level view
│   │   │   ├── SchoolDashboard.js        # School-level view
│   │   │   ├── DomainDashboard.js        # Domain-specific view
│   │   │   ├── PGIDomainBreakdown.js     # PGI cards component
│   │   │   ├── IndicatorDrilldownModal.js # Indicator analysis modal
│   │   │   ├── HeatmapVisualization.js   # Interactive heatmap
│   │   │   ├── Navigation.js             # Top navigation
│   │   │   ├── ScrollToTop.js            # Auto scroll utility
│   │   │   └── ui/                       # Shadcn UI components
│   │   ├── App.js                        # Main router
│   │   ├── App.css                       # Global styles
│   │   └── index.js                      # Entry point
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env
├── COMPLETE_FEATURES_LIST.md     # Detailed feature documentation
├── DOMAIN_INSIGHTS_REPORT.md     # Sample insights report
├── LOCAL_SETUP.md                # Local development guide
├── SERVER_SETUP.md               # Production deployment guide
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and Yarn
- Python 3.11+
- MongoDB 4.4+

### Installation

1. **Extract the zip file**
```bash
unzip maharashtra-education-dashboard-complete.zip
cd maharashtra-education-dashboard-complete
```

2. **Backend Setup**
```bash
cd backend
pip install -r requirements.txt

# Update .env with your configuration
# MONGO_URL=your_mongodb_connection_string
# Note: AI insights are generated using built-in data analysis (no API keys required)

# Run backend
python server.py
```

3. **Frontend Setup**
```bash
cd frontend
yarn install

# Update .env with your backend URL
# REACT_APP_BACKEND_URL=http://localhost:8001

# Run frontend
yarn start
```

4. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Docs: http://localhost:8001/docs

## 🔑 Key API Endpoints

### Main Endpoints
- `GET /api/dashboard-overview` - Overall statistics
- `GET /api/states/mh_001/districts` - All districts
- `GET /api/districts/{district_id}/blocks` - Blocks in district
- `GET /api/blocks/{block_id}/schools` - Schools in block

### PGI & Performance
- `GET /api/pgi-score/{level}/{entity_id}` - PGI data for entity
- `GET /api/metrics/{level}/{entity_id}` - Performance metrics

### Insights
- `POST /api/generate-domain-insights/{domain_key}` - Generate comprehensive insights
- `POST /api/indicator-drilldown` - Indicator-specific analysis

## 📊 Data Model

### Key Collections
- **districts**: District information and metadata
- **blocks**: Block information linked to districts
- **schools**: School information linked to blocks
- **metrics**: Performance metrics for all entities
- **insights**: Generated insights cache

### PGI Framework
6 domains with 12 indicators each (72 total indicators):
- Each indicator has: name, code, weight, target, unit
- Calculated scores at all levels (state, district, block, school)
- Aggregated domain scores and overall PGI score

## 🎨 Design System

### Color Palette
- **Primary Blue**: #2563eb
- **Success Green**: #10b981
- **Warning Amber**: #f59e0b
- **Danger Red**: #ef4444
- **Accent Orange**: #fb923c

### Performance Color Coding
- **Excellent**: 80%+ (Green)
- **Good**: 60-79% (Amber)
- **Needs Improvement**: <60% (Red)

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```
MONGO_URL=mongodb://localhost:27017/education_dashboard
# Note: AI insights are generated using built-in data analysis (no API keys required)
```

**Frontend (.env):**
```
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=3000
```

## 📈 Performance Optimizations

- PGI data caching
- Efficient MongoDB queries with projections
- React component memoization
- Lazy loading of large datasets
- Responsive image handling

## 🐛 Known Issues & Solutions

1. **Frontend-Backend Connection Loss**
   - **Issue**: Pages stuck loading after backend changes
   - **Solution**: `sudo supervisorctl restart all`

2. **Insights Budget Exceeded**
   - **Issue**: LLM budget limits reached
   - **Solution**: Fallback insights system automatically activates

3. **Empty Data for Some Entities**
   - **Issue**: Metrics not generated for all districts/blocks
   - **Solution**: Now uses PGI data directly (fixed in latest version)

## 📚 Documentation Files

- **COMPLETE_FEATURES_LIST.md**: Exhaustive list of all features
- **DOMAIN_INSIGHTS_REPORT.md**: Sample insights report
- **LOCAL_SETUP.md**: Detailed local development setup
- **SERVER_SETUP.md**: Production deployment guide

## 🚢 Deployment

### Docker Deployment
A separate Docker deployment package is available in `/app/docker-deployment/` with:
- Dockerfile for backend and frontend
- docker-compose.yml
- Startup scripts
- Deployment README

### Production Checklist
- [ ] Update environment variables for production
- [ ] Configure MongoDB connection string
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure CORS settings
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for MongoDB

## 🎓 Educational Impact

This dashboard enables:
- **Data-driven decision making** at all administrative levels
- **Early identification** of underperforming entities
- **Targeted interventions** based on specific indicators
- **Resource allocation** optimization
- **Performance tracking** over time
- **Accountability** and transparency

## 📞 Support

For issues or questions:
1. Check the documentation files included in the project
2. Review API documentation at `/docs` endpoint
3. Check browser console for frontend errors
4. Check backend logs for API errors

## 📄 License

This project is provided as-is for educational and analytical purposes.

## 🙏 Acknowledgments

Built with modern web technologies and best practices for educational analytics and data visualization.

---

**Version**: 1.0.0  
**Last Updated**: November 25, 2025  
**Status**: Production Ready ✅
