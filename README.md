# Maharashtra Education Analytics Dashboard

A comprehensive, multi-level education analytics platform for Maharashtra state.

## Quick Info

- **Frontend**: React + Tailwind CSS
- **Backend**: FastAPI + MongoDB
- **Features**: Multi-level dashboards, Interactive heatmaps, PGI domain analysis, AI-powered insights
- **Levels**: State → District → Block → School

## Documentation

For complete project documentation, see:
- **PROJECT_SUMMARY.md** - Comprehensive overview and features
- **LOCAL_SETUP.md** - Local development setup guide
- **SERVER_SETUP.md** - Production deployment guide
- **DEPLOYMENT.md** - Docker deployment guide for Easy Panel
- **COMPLETE_FEATURES_LIST.md** - Detailed feature list

## Docker Deployment

This project includes Dockerfiles for easy deployment:

- **Dockerfile.backend** - FastAPI backend service
- **Dockerfile.frontend** - React frontend with Nginx

For detailed deployment instructions, see **DEPLOYMENT.md**.

Quick start with Docker Compose:
```bash
docker-compose up -d
```

## Quick Start

```bash
# Backend
cd backend
pip install -r requirements.txt
python server.py

# Frontend
cd frontend
yarn install
yarn start
```

## Download

Complete project zip: `maharashtra-education-dashboard-complete.zip`

Access at: http://localhost:3000
