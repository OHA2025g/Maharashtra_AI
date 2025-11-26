# Deployment Guide for Easy Panel

This guide explains how to deploy the Maharashtra Education Dashboard using Docker on Easy Panel.

## Prerequisites

- Easy Panel account with Docker support
- MongoDB instance (can be deployed separately or use external MongoDB service)
- Domain name (optional, for production)

## Environment Variables

### Backend Environment Variables

Create these environment variables in Easy Panel for the backend service:

```env
MONGO_URL=mongodb://your-mongodb-host:27017
DB_NAME=maharashtra_education
```

**For MongoDB with authentication:**
```env
MONGO_URL=mongodb://username:password@your-mongodb-host:27017/maharashtra_education?authSource=admin
DB_NAME=maharashtra_education
```

**For MongoDB Atlas (cloud):**
```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/maharashtra_education?retryWrites=true&w=majority
DB_NAME=maharashtra_education
```

### Frontend Environment Variables

Create this environment variable in Easy Panel for the frontend service:

```env
REACT_APP_BACKEND_URL=http://your-backend-url:8001
```

**For production with domain:**
```env
REACT_APP_BACKEND_URL=https://api.yourdomain.com
```

## Deployment Steps

### 1. Deploy Backend

1. In Easy Panel, create a new application
2. Select "Docker" as the deployment method
3. Choose `Dockerfile.backend` as the Dockerfile
4. Set the following:
   - **Port**: `8001`
   - **Environment Variables**: Add `MONGO_URL` and `DB_NAME`
5. Deploy the backend service

### 2. Deploy Frontend

1. In Easy Panel, create a new application
2. Select "Docker" as the deployment method
3. Choose `Dockerfile.frontend` as the Dockerfile
4. Set the following:
   - **Port**: `80`
   - **Build Arguments**: 
     - `REACT_APP_BACKEND_URL`: Set to your backend URL (e.g., `http://backend-service:8001` or your public backend URL)
   - **Environment Variables**: 
     - `REACT_APP_BACKEND_URL`: Same as build argument
5. Deploy the frontend service

### 3. Configure MongoDB

You can deploy MongoDB separately or use an external service:

**Option A: Deploy MongoDB with Easy Panel**
- Use MongoDB Docker image: `mongo:7.0`
- Expose port `27017` (internal only)
- Set up authentication if needed

**Option B: Use MongoDB Atlas (Recommended for Production)**
- Create a free cluster at https://www.mongodb.com/cloud/atlas
- Get the connection string
- Use it as `MONGO_URL` in backend environment variables

### 4. Initialize Data

After deployment, initialize the sample data by calling:

```bash
curl -X POST http://your-backend-url:8001/api/reinitialize-data
```

Or use Easy Panel's terminal/exec feature to run this command.

## Network Configuration

### Internal Communication

If both services are on the same Easy Panel instance:
- Frontend can use internal service name: `http://backend-service-name:8001`
- Backend can use internal MongoDB: `mongodb://mongodb-service:27017`

### External Access

For production:
- Set up reverse proxy (Nginx/Traefik) in Easy Panel
- Configure domain names
- Use HTTPS with SSL certificates
- Update `REACT_APP_BACKEND_URL` to use HTTPS

## Health Checks

Both services include health check endpoints:

- **Backend**: `http://backend-url:8001/api/health`
- **Frontend**: `http://frontend-url/health`

## Troubleshooting

### Backend Issues

1. **MongoDB Connection Failed**
   - Verify `MONGO_URL` is correct
   - Check MongoDB is accessible from backend container
   - Verify network connectivity

2. **Port Already in Use**
   - Change port in Easy Panel settings
   - Update frontend `REACT_APP_BACKEND_URL` accordingly

### Frontend Issues

1. **API Connection Failed**
   - Verify `REACT_APP_BACKEND_URL` is set correctly
   - Check backend is running and accessible
   - Verify CORS settings in backend (should allow all origins)

2. **Build Fails**
   - Check Node.js version (requires 18+)
   - Verify all dependencies in `package.json`
   - Check build logs in Easy Panel

## Production Recommendations

1. **Use Environment-Specific Builds**
   - Development: `REACT_APP_BACKEND_URL=http://localhost:8001`
   - Production: `REACT_APP_BACKEND_URL=https://api.yourdomain.com`

2. **Enable HTTPS**
   - Use Easy Panel's SSL/TLS features
   - Update all URLs to use `https://`

3. **Set Up Monitoring**
   - Monitor health check endpoints
   - Set up alerts for service downtime
   - Monitor MongoDB connection

4. **Backup Strategy**
   - Regular MongoDB backups
   - Version control for code
   - Document environment variables

5. **Security**
   - Use MongoDB authentication
   - Restrict MongoDB access to backend only
   - Use environment variables for sensitive data
   - Enable CORS restrictions in production (update backend CORS settings)

## Scaling

- **Backend**: Can be scaled horizontally (multiple instances)
- **Frontend**: Stateless, can be scaled easily
- **MongoDB**: Consider MongoDB Atlas for managed scaling

## Support

For issues or questions:
1. Check application logs in Easy Panel
2. Verify environment variables are set correctly
3. Test health check endpoints
4. Review MongoDB connection logs

