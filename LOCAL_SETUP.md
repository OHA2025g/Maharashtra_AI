# Local Development Setup Guide

Complete guide for setting up the Maharashtra Education Dashboard on your local machine for development.

---

## Prerequisites

### Required Software:

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **Python** (v3.11 or higher)
   - Download: https://python.org/
   - Verify: `python --version`

3. **MongoDB** (v7.0 or higher)
   - Option A: Install locally from https://mongodb.com/
   - Option B: Use Docker: `docker run -d -p 27017:27017 mongo:7.0`
   - Verify: `mongosh` or `mongo`

4. **Yarn** (Package Manager)
   - Install: `npm install -g yarn`
   - Verify: `yarn --version`

---

## Setup Steps

### Step 1: Extract Project

```bash
unzip maharashtra-education-dashboard-complete.zip
cd maharashtra-education-dashboard
```

### Step 2: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Note: AI insights are now generated using built-in data analysis (no external dependencies required)

# Configure environment
cp .env.example .env
# Edit .env if needed

# Verify installation
python -c "import fastapi; import pymongo; print('Backend dependencies OK')"
```

### Step 3: Frontend Setup

```bash
# Open new terminal
cd frontend

# Install dependencies
yarn install

# Configure environment
cp .env.example .env
# Edit .env if needed

# Verify installation
node -e "console.log('Node version:', process.version)"
```

### Step 4: Start MongoDB

```bash
# Option A: If MongoDB installed locally
mongod

# Option B: Using Docker (recommended)
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Verify MongoDB is running
mongosh --eval "db.adminCommand('ping')"
```

### Step 5: Start Backend Server

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate

# Start server with hot reload
uvicorn server:app --reload --port 8001

# Server should start at: http://localhost:8001
# API docs available at: http://localhost:8001/docs
```

### Step 6: Initialize Database

```bash
# In new terminal, initialize sample data
curl -X POST http://localhost:8001/api/reinitialize-data

# Should return:
# {"message": "Data reinitialized successfully"}
```

### Step 7: Start Frontend

```bash
# In new terminal
cd frontend

# Start development server
yarn start

# Frontend should open at: http://localhost:3000
```

---

## Verification

### Check All Services:

1. **MongoDB:** `mongosh` → should connect
2. **Backend:** http://localhost:8001/api/health → `{"status": "healthy"}`
3. **API Docs:** http://localhost:8001/docs → Swagger UI
4. **Frontend:** http://localhost:3000 → Dashboard loads

### Test Functionality:

1. Landing page displays with data
2. Can navigate to State dashboard
3. Can navigate to District dashboard
4. Can navigate to Block dashboard
5. Can navigate to School dashboard
6. All 6 domain dashboards work
7. Heatmaps are interactive
8. Generate Insights button works

---

## Development Workflow

### Backend Changes:

1. Edit files in `backend/`
2. Changes auto-reload (uvicorn --reload)
3. Check terminal for errors
4. Test API at http://localhost:8001/docs

### Frontend Changes:

1. Edit files in `frontend/src/`
2. Changes auto-reload
3. Check browser console for errors
4. Test in browser at http://localhost:3000

### Database Changes:

1. Connect to MongoDB: `mongosh`
2. Switch database: `use maharashtra_education`
3. Query data: `db.districts.find().limit(1)`
4. Re-initialize if needed: `curl -X POST http://localhost:8001/api/reinitialize-data`

---

## Project Structure

```
maharashtra-education-dashboard/
├── backend/
│   ├── server.py          # Main API
│   ├── pgi_framework.py   # PGI logic
│   ├── requirements.txt   # Dependencies
│   └── .env              # Config
│
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── App.js       # Main app
│   │   └── index.js     # Entry point
│   ├── package.json     # Dependencies
│   └── .env            # Config
│
└── docker-deployment/   # Docker setup (optional)
```

---

## Environment Variables

### Backend (.env):

```env
# MongoDB Connection
MONGO_URL=mongodb://localhost:27017
DB_NAME=maharashtra_education

# Note: AI insights are generated using built-in data analysis (no API keys required)
```

### Frontend (.env):

```env
# Backend API URL
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## Common Issues

### Issue: Port already in use

```bash
# Find process using port
lsof -i :3000  # or :8001

# Kill process
kill -9 <PID>

# Or use different port
# Backend: uvicorn server:app --reload --port 8002
# Frontend: PORT=3001 yarn start
```

### Issue: Module not found

```bash
# Backend
pip install -r requirements.txt

# Frontend
rm -rf node_modules
yarn install
```

### Issue: MongoDB connection failed

```bash
# Check if MongoDB is running
mongosh

# Restart MongoDB
# Docker: docker restart mongodb
# Local: sudo systemctl restart mongod
```

### Issue: CORS errors

- Check frontend .env has correct REACT_APP_BACKEND_URL
- Check backend CORS settings in server.py
- Clear browser cache

---

## Testing

### Backend Tests:

```bash
cd backend
pytest tests/
```

### Frontend Tests:

```bash
cd frontend
yarn test
```

### API Testing:

```bash
# Health check
curl http://localhost:8001/api/health

# Get districts
curl http://localhost:8001/api/districts

# Generate insights
curl -X POST http://localhost:8001/api/generate-domain-insights/learning-outcomes
```

---

## IDE Setup

### VS Code (Recommended):

**Extensions:**
- Python
- Pylance
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets

**Settings (.vscode/settings.json):**
```json
{
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

---

## Hot Reload

### Backend (Automatic):
- Uvicorn watches for file changes
- Auto-reloads on save
- Check terminal for reload messages

### Frontend (Automatic):
- React development server watches files
- Auto-reloads browser
- Check console for compilation messages

---

## Performance Tips

1. **Use SSD for project files**
2. **Close unnecessary applications**
3. **Use latest Node.js LTS version**
4. **Keep MongoDB indexes updated**
5. **Clear browser cache regularly**
6. **Use Chrome DevTools for debugging**

---

## Next Steps

After successful setup:

1. ✅ Explore the dashboard
2. ✅ Review code structure
3. ✅ Read API documentation
4. ✅ Try making small changes
5. ✅ Test with different data
6. ✅ Review feature list
7. ✅ Check deployment guides

---

## Additional Resources

- **API Documentation:** http://localhost:8001/docs
- **Features List:** COMPLETE_FEATURES_LIST.md
- **Deployment Guide:** DEPLOYMENT_GUIDE.md
- **Docker Setup:** docker-deployment/README.md

---

**Happy Coding! 🚀**
