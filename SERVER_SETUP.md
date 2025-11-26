# Server Deployment Guide

Complete guide for deploying Maharashtra Education Dashboard on a production server.

---

## Server Requirements

### Minimum Specifications:
- **OS:** Ubuntu 20.04+ or CentOS 8+
- **RAM:** 4GB
- **CPU:** 2 cores
- **Disk:** 20GB SSD
- **Network:** Public IP with firewall

### Recommended:
- **RAM:** 8GB+
- **CPU:** 4 cores
- **Disk:** 50GB SSD
- **Bandwidth:** 100Mbps+

---

## Option 1: Docker Deployment (Recommended)

### Step 1: Install Docker

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Step 2: Upload Project

```bash
# Upload ZIP to server (from local machine)
scp maharashtra-education-dashboard-complete.zip user@server-ip:/home/user/

# On server, extract
cd /home/user
unzip maharashtra-education-dashboard-complete.zip
cd maharashtra-education-dashboard/docker-deployment
```

### Step 3: Configure Environment

```bash
# Create .env file
cp .env.example .env

# Edit configuration
nano .env
```

**Update for production:**
```env
MONGO_URL=mongodb://mongodb:27017
DB_NAME=maharashtra_education
# Note: AI insights are generated using built-in data analysis (no API keys required)
```

### Step 4: Deploy

```bash
# Start services
docker-compose up -d

# Check status
docker-compose ps

# Initialize data
sleep 30
curl -X POST http://localhost:8001/api/reinitialize-data
```

### Step 5: Configure Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install nginx -y

# Create configuration
sudo nano /etc/nginx/sites-available/education-dashboard
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/education-dashboard /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 6: Configure Firewall

```bash
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Step 7: SSL Certificate (HTTPS)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

---

## Option 2: Manual Deployment

### Step 1: Install System Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y \
    python3.11 \
    python3.11-venv \
    python3-pip \
    nginx \
    mongodb \
    nodejs \
    npm \
    git

# Install Yarn
sudo npm install -g yarn
```

### Step 2: Setup MongoDB

```bash
# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
mongosh --eval "db.adminCommand('ping')"
```

### Step 3: Setup Backend

```bash
cd /var/www/maharashtra-education-dashboard/backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
# Note: AI insights are now generated using built-in data analysis (no external dependencies required)

# Configure environment
cp .env.example .env
nano .env

# Update .env for production
# MONGO_URL=mongodb://localhost:27017
```

### Step 4: Setup Frontend

```bash
cd /var/www/maharashtra-education-dashboard/frontend

# Install dependencies
yarn install

# Configure environment
cp .env.example .env
nano .env

# Update .env
# REACT_APP_BACKEND_URL=https://your-domain.com

# Build production
yarn build
```

### Step 5: Process Manager (PM2)

```bash
# Install PM2
sudo npm install -g pm2

# Start backend
cd /var/www/maharashtra-education-dashboard/backend
pm2 start "uvicorn server:app --host 0.0.0.0 --port 8001" --name education-backend

# Save PM2 configuration
pm2 save
pm2 startup

# Check status
pm2 status
pm2 logs education-backend
```

### Step 6: Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/education-dashboard
```

**Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend (Static files)
    root /var/www/maharashtra-education-dashboard/frontend/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

```bash
# Enable and restart
sudo ln -s /etc/nginx/sites-available/education-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Security Configuration

### 1. MongoDB Authentication

```bash
mongosh

use admin
db.createUser({
  user: "admin",
  pwd: "strong_password_here",
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})

use maharashtra_education
db.createUser({
  user: "dashboard_user",
  pwd: "another_strong_password",
  roles: [ { role: "readWrite", db: "maharashtra_education" } ]
})

exit
```

**Update backend .env:**
```env
MONGO_URL=mongodb://dashboard_user:password@localhost:27017/maharashtra_education
```

### 2. Firewall Rules

```bash
# Only allow necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### 3. Rate Limiting (Nginx)

```nginx
# Add to nginx.conf
http {
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    
    server {
        location /api {
            limit_req zone=api_limit burst=20 nodelay;
            # ... rest of config
        }
    }
}
```

### 4. SSL/HTTPS

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal (runs twice daily)
sudo systemctl status certbot.timer
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Create health check script
sudo nano /usr/local/bin/health-check.sh
```

**health-check.sh:**
```bash
#!/bin/bash

# Check backend
if ! curl -f http://localhost:8001/api/health > /dev/null 2>&1; then
    echo "Backend unhealthy" | mail -s "Alert: Backend Down" admin@example.com
    pm2 restart education-backend
fi

# Check MongoDB
if ! mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "MongoDB unhealthy" | mail -s "Alert: MongoDB Down" admin@example.com
    sudo systemctl restart mongod
fi
```

```bash
sudo chmod +x /usr/local/bin/health-check.sh

# Add to crontab (run every 5 minutes)
crontab -e
# Add: */5 * * * * /usr/local/bin/health-check.sh
```

### Log Management

```bash
# Backend logs (PM2)
pm2 logs education-backend
pm2 logs education-backend --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Docker logs
docker-compose logs -f
```

### Backup Strategy

```bash
# Create backup script
sudo nano /usr/local/bin/backup-dashboard.sh
```

**backup-dashboard.sh:**
```bash
#!/bin/bash
BACKUP_DIR="/backups/dashboard"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup MongoDB
mongodump --out $BACKUP_DIR/mongo_$DATE

# Backup code
tar -czf $BACKUP_DIR/code_$DATE.tar.gz /var/www/maharashtra-education-dashboard

# Remove old backups (keep last 7 days)
find $BACKUP_DIR -name "mongo_*" -mtime +7 -delete
find $BACKUP_DIR -name "code_*" -mtime +7 -delete
```

```bash
sudo chmod +x /usr/local/bin/backup-dashboard.sh

# Schedule daily backup at 2 AM
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-dashboard.sh
```

---

## Performance Optimization

### 1. Nginx Caching

```nginx
# Add to nginx.conf
http {
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;
    
    server {
        location /api {
            proxy_cache api_cache;
            proxy_cache_valid 200 5m;
            proxy_cache_methods GET HEAD;
            add_header X-Cache-Status $upstream_cache_status;
            # ... rest of config
        }
    }
}
```

### 2. MongoDB Indexes

```javascript
// Connect to MongoDB
mongosh

use maharashtra_education

// Create indexes
db.districts.createIndex({ "id": 1 })
db.blocks.createIndex({ "id": 1, "district_id": 1 })
db.schools.createIndex({ "id": 1, "block_id": 1 })
db.metrics.createIndex({ "level": 1, "entity_id": 1, "domain": 1 })
db.insights.createIndex({ "level": 1, "entity_id": 1 })
```

### 3. Resource Limits

```bash
# Update PM2 configuration
pm2 start server.py --name education-backend --max-memory-restart 1G
```

---

## Troubleshooting

### Service Won't Start

```bash
# Check logs
pm2 logs education-backend --err
sudo journalctl -u nginx -n 50

# Check ports
sudo netstat -tlnp | grep -E '(3000|8001|27017)'

# Restart services
pm2 restart education-backend
sudo systemctl restart nginx
sudo systemctl restart mongod
```

### High Memory Usage

```bash
# Check memory
free -h
htop

# Restart services
pm2 restart education-backend
docker-compose restart
```

### Slow Performance

```bash
# Check MongoDB slow queries
mongosh
db.setProfilingLevel(1, { slowms: 100 })
db.system.profile.find().sort({ts:-1}).limit(5)

# Check Nginx access logs for slow requests
sudo awk '$NF > 1.0' /var/log/nginx/access.log
```

---

## Update & Maintenance

### Update Application

```bash
# Backup first
/usr/local/bin/backup-dashboard.sh

# Stop services
pm2 stop education-backend
# or
docker-compose down

# Update code
cd /var/www/maharashtra-education-dashboard
git pull  # if using git
# or upload new ZIP

# Update dependencies
cd backend
source venv/bin/activate
pip install -r requirements.txt

cd ../frontend
yarn install
yarn build

# Restart services
pm2 restart education-backend
# or
docker-compose up -d --build
```

---

## Production Checklist

- [ ] Server secured (firewall, SSH keys)
- [ ] MongoDB authentication enabled
- [ ] SSL/HTTPS configured
- [ ] Rate limiting enabled
- [ ] Health monitoring set up
- [ ] Automated backups configured
- [ ] Logs rotation enabled
- [ ] Performance optimizations applied
- [ ] Error tracking set up
- [ ] Documentation updated
- [ ] Team trained on deployment

---

**Your dashboard is now production-ready! 🚀**
