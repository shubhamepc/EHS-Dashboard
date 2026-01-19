# Production Deployment Guide

## Prerequisites

- Ubuntu 20.04+ or similar Linux distribution
- Node.js 18+ installed
- Nginx installed
- Domain name configured (DNS A record pointing to server IP)
- Root or sudo access

## Quick Start

```bash
# 1. Clone repository
git clone https://github.com/your-org/ehs-system.git
cd ehs-system

# 2. Make deployment script executable
chmod +x scripts/deploy.sh
chmod +x scripts/backup.sh

# 3. Run deployment (as root)
sudo ./scripts/deploy.sh

# 4. Configure environment
sudo nano /var/www/ehs-system/backend/.env

# 5. Initialize database
cd /var/www/ehs-system/backend
node setup_sqlite.js
node migrate_audit_logs.js
node migrate_notifications.js

# 6. Verify deployment
pm2 status
pm2 logs
```

## Manual Deployment Steps

### 1. System Preparation

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
sudo apt-get install -y nginx

# Install PM2
sudo npm install -g pm2

# Install Certbot for SSL
sudo apt-get install -y certbot python3-certbot-nginx
```

### 2. Application Setup

```bash
# Create directories
sudo mkdir -p /var/www/ehs-system
sudo mkdir -p /var/www/ehs-uploads
sudo mkdir -p /var/log/ehs-system
sudo mkdir -p /var/backups/ehs-system

# Set ownership
sudo chown -R www-data:www-data /var/www/ehs-system
sudo chown -R www-data:www-data /var/www/ehs-uploads
sudo chown -R www-data:www-data /var/log/ehs-system

# Copy application files
sudo cp -r ./backend /var/www/ehs-system/
sudo cp -r ./frontend /var/www/ehs-system/
```

### 3. Backend Configuration

```bash
cd /var/www/ehs-system/backend

# Install dependencies
npm install --production

# Create .env file
cp .env.example .env
nano .env  # Edit with production values

# Generate JWT secret
openssl rand -base64 32

# Initialize database
node setup_sqlite.js
node migrate_audit_logs.js
node migrate_notifications.js

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow instructions
```

### 4. Frontend Configuration

```bash
cd /var/www/ehs-system/frontend

# Install dependencies
npm install

# Create production build
npm run build

# Start with PM2
pm2 start npm --name "ehs-frontend" -- start
pm2 save
```

### 5. Nginx Configuration

```bash
# Copy Nginx config
sudo cp nginx.conf /etc/nginx/sites-available/ehs-system

# Enable site
sudo ln -s /etc/nginx/sites-available/ehs-system /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 6. SSL Certificate

```bash
# Obtain SSL certificate
sudo certbot --nginx -d ehs.shubhamepc.com -d www.ehs.shubhamepc.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 7. Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Check status
sudo ufw status
```

### 8. Automated Backups

```bash
# Make backup script executable
chmod +x /var/www/ehs-system/scripts/backup.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add line: 0 2 * * * /var/www/ehs-system/scripts/backup.sh
```

## Environment Variables

Required variables in `/var/www/ehs-system/backend/.env`:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=<generated-secret>
DB_PATH=/var/www/ehs-system/backend/ehs.sqlite
UPLOAD_PATH=/var/www/ehs-uploads
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@shubhamepc.com
SMTP_PASS=your-app-password
EHS_HEAD_EMAIL=head.ehs@shubhamepc.com
```

## Monitoring & Maintenance

### PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs

# Restart application
pm2 restart all

# Stop application
pm2 stop all

# Monitor resources
pm2 monit
```

### Log Files

- Application logs: `/var/log/ehs-system/`
- Nginx access: `/var/log/nginx/ehs-access.log`
- Nginx errors: `/var/log/nginx/ehs-error.log`
- PM2 logs: `~/.pm2/logs/`

### Backup Verification

```bash
# List backups
ls -lh /var/backups/ehs-system/

# Test restoration
gunzip -c /var/backups/ehs-system/ehs_backup_YYYYMMDD_HHMMSS.sqlite.gz > test_restore.sqlite
```

## Troubleshooting

### Application won't start

```bash
# Check PM2 logs
pm2 logs --lines 100

# Check environment
pm2 env 0

# Restart
pm2 restart all
```

### Nginx errors

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/ehs-error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Database issues

```bash
# Check database file
ls -lh /var/www/ehs-system/backend/ehs.sqlite

# Check permissions
sudo chown www-data:www-data /var/www/ehs-system/backend/ehs.sqlite
sudo chmod 640 /var/www/ehs-system/backend/ehs.sqlite
```

## Security Updates

```bash
# Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# Update Node.js packages
cd /var/www/ehs-system/backend
npm audit fix
npm update

# Restart application
pm2 restart all
```

## Rollback Procedure

```bash
# Stop application
pm2 stop all

# Restore database backup
gunzip -c /var/backups/ehs-system/ehs_backup_YYYYMMDD_HHMMSS.sqlite.gz > /var/www/ehs-system/backend/ehs.sqlite

# Restore code (if using git)
cd /var/www/ehs-system
git checkout <previous-commit-hash>

# Restart
pm2 restart all
```

## Performance Optimization

### Enable SQLite WAL mode

```bash
sqlite3 /var/www/ehs-system/backend/ehs.sqlite "PRAGMA journal_mode=WAL;"
```

### Nginx caching

Add to Nginx config:
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m;
```

## Support

For issues or questions:
- Email: support@shubhamepc.com
- Documentation: https://docs.ehs.shubhamepc.com
- GitHub Issues: https://github.com/your-org/ehs-system/issues
