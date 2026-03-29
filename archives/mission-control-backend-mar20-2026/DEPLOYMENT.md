# Deployment Guide

Complete guide for deploying Mission Control Backend to production.

## Prerequisites

- Node.js 18+ installed
- Access to production server/VPS
- Cloudflare tunnel configured
- Generated JWT secrets (not dev defaults)
- SQLite database directory with write permissions

## Environment Setup

### 1. Generate Secure Secrets

```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

Save these values securely (password manager, vault, etc.).

### 2. Production .env Configuration

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DATABASE_PATH=/var/mission/mission.db

# JWT
JWT_SECRET=<generated-secret-from-above>
JWT_REFRESH_SECRET=<generated-secret-from-above>
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://mission-api.elevationaiwork.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

## Deployment Options

### Option 1: Direct VPS Deployment

#### Setup

```bash
# SSH into server
ssh user@your-server.com

# Clone or download project
git clone <repo> /opt/mission-control-backend
cd /opt/mission-control-backend

# Install dependencies
npm install --omit=dev

# Create data directory
mkdir -p /var/mission
chmod 755 /var/mission

# Copy .env
cp .env.example .env
# Edit with your values
nano .env

# Build
npm run build

# Seed database
npm run seed
```

#### Run with PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start app
pm2 start npm --name mission-control -- start

# Save PM2 config
pm2 save

# Startup on reboot
pm2 startup
```

Monitor:
```bash
pm2 monit mission-control
pm2 logs mission-control
```

#### Run with systemd Service

Create `/etc/systemd/system/mission-control.service`:

```ini
[Unit]
Description=Mission Control Backend API
After=network.target

[Service]
Type=simple
User=mission
WorkingDirectory=/opt/mission-control-backend
ExecStart=/usr/bin/node /opt/mission-control-backend/dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

# Environment
Environment="NODE_ENV=production"
Environment="PORT=3000"
EnvironmentFile=/opt/mission-control-backend/.env

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable mission-control
sudo systemctl start mission-control
sudo systemctl status mission-control
```

View logs:
```bash
sudo journalctl -u mission-control -f
```

### Option 2: Docker Deployment

#### Create Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY dist ./dist

# Create data directory
RUN mkdir -p data && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

#### Build and Deploy

```bash
# Build image
docker build -t mission-control:latest .

# Run container
docker run -d \
  --name mission-control \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e JWT_SECRET=<your-secret> \
  -e JWT_REFRESH_SECRET=<your-secret> \
  -e CORS_ORIGIN=https://mission-api.elevationaiwork.com \
  -v mission-data:/app/data \
  mission-control:latest

# View logs
docker logs -f mission-control
```

#### Docker Compose

```yaml
version: '3.8'

services:
  api:
    image: mission-control:latest
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      CORS_ORIGIN: https://mission-api.elevationaiwork.com
      LOG_LEVEL: info
    volumes:
      - mission-data:/app/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  mission-data:
    driver: local
```

Deploy:
```bash
docker-compose up -d
docker-compose logs -f
```

### Option 3: Cloudflare Tunnel Direct

If running behind Cloudflare Tunnel:

```bash
# Install cloudflared
# https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/

# Configure tunnel to point to localhost:3000
cloudflared tunnel run mission-api
```

## Cloudflare Configuration

1. Go to Cloudflare Dashboard
2. Select domain (elevationaiwork.com)
3. Navigate to Tunnels
4. Create new tunnel or edit existing
5. Configure routing:
   - Domain: `mission-api.elevationaiwork.com`
   - Service: `localhost:3000` or your VPS IP
   - TLS: Enable HTTPS

## Health Checks & Monitoring

### Manual Health Check
```bash
curl https://mission-api.elevationaiwork.com/api/health
```

### Automated Monitoring

Using cURL in a cron job:
```bash
*/5 * * * * curl -f https://mission-api.elevationaiwork.com/api/health || /path/to/alert.sh
```

### Application Monitoring

Monitor logs for errors:
```bash
tail -f /var/log/mission-control.log
```

Monitor database:
```bash
sqlite3 /var/mission/mission.db ".tables"
sqlite3 /var/mission/mission.db "SELECT COUNT(*) FROM tasks;"
```

## Database Backups

### Manual Backup
```bash
# Backup database
cp /var/mission/mission.db /var/mission/mission.db.backup.$(date +%s)

# Compress and upload
gzip /var/mission/mission.db.backup.*
```

### Automated Daily Backup (Cron)
```bash
# Add to crontab
0 2 * * * cp /var/mission/mission.db /var/mission/backups/mission.db.$(date +\%Y\%m\%d) && gzip /var/mission/backups/*.db
```

## Performance Tuning

### SQLite Optimizations

Add to initialization if needed:
```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 10000;
PRAGMA temp_store = MEMORY;
```

### Rate Limiting Adjustments

In production, you may want stricter limits:
```env
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=50   # Stricter for production
```

## Security Checklist

- [ ] Change all default secrets to generated values
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS via Cloudflare
- [ ] Configure firewall to only allow Cloudflare IPs
- [ ] Set up automated backups
- [ ] Monitor logs for suspicious activity
- [ ] Keep dependencies updated (`npm audit`, `npm update`)
- [ ] Rotate JWT secrets periodically
- [ ] Use strong database file permissions
- [ ] Restrict SSH/VPS access
- [ ] Set up log rotation
- [ ] Monitor disk space
- [ ] Test disaster recovery procedures

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill if needed
kill -9 <PID>
```

### Database Locked
```bash
# Check for hanging connections
ps aux | grep node

# Restart service
sudo systemctl restart mission-control
```

### High Memory Usage
```bash
# Check process memory
ps aux | grep node

# Restart and monitor
sudo systemctl restart mission-control
watch -n 1 'ps aux | grep node'
```

### Connection Refused Errors
```bash
# Verify service is running
sudo systemctl status mission-control

# Check firewall
sudo iptables -L
sudo ufw status
```

## Updating

To update to a new version:

```bash
cd /opt/mission-control-backend

# Pull latest
git pull

# Reinstall and rebuild
npm install --omit=dev
npm run build

# Restart
sudo systemctl restart mission-control
```

## Rollback

If update causes issues:

```bash
# Revert changes
git revert <commit-hash>
npm install --omit=dev
npm run build
sudo systemctl restart mission-control
```

## Support & Monitoring

- **Health endpoint:** `GET /api/health` (no auth required)
- **Status endpoint:** `GET /api/status` (requires auth)
- **Logs:** Check systemd journal or PM2 logs
- **Database:** SQLite at `$DATABASE_PATH`
- **Config:** Check `.env` file for current settings

## Production Checklist

- [ ] Generated secure JWT secrets
- [ ] Set NODE_ENV=production
- [ ] Configured CORS_ORIGIN correctly
- [ ] Set up HTTPS/Cloudflare tunnel
- [ ] Database directory created and writable
- [ ] Seed database with initial users
- [ ] Set up monitoring/alerting
- [ ] Test health endpoint
- [ ] Test login/auth flows
- [ ] Verify task endpoints work
- [ ] Set up backups
- [ ] Document admin procedures
- [ ] Set up incident response plan
- [ ] Monitor logs daily initially
