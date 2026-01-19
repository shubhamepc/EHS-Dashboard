#!/bin/bash

# Production Deployment Script for EHS System
# Run as: sudo ./deploy.sh

set -e

echo "========================================="
echo "EHS System Production Deployment"
echo "========================================="

# Configuration
APP_DIR="/var/www/ehs-system"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
NGINX_CONF="/etc/nginx/sites-available/ehs-system"
USER="www-data"

# 1. Update system packages
echo "Step 1: Updating system packages..."
apt-get update
apt-get upgrade -y

# 2. Install dependencies
echo "Step 2: Installing dependencies..."
apt-get install -y nginx nodejs npm certbot python3-certbot-nginx

# 3. Install PM2 globally
echo "Step 3: Installing PM2..."
npm install -g pm2

# 4. Create application directory
echo "Step 4: Creating application directories..."
mkdir -p $APP_DIR
mkdir -p /var/www/ehs-uploads
mkdir -p /var/log/ehs-system
mkdir -p /var/backups/ehs-system

# 5. Set permissions
echo "Step 5: Setting permissions..."
chown -R $USER:$USER $APP_DIR
chown -R $USER:$USER /var/www/ehs-uploads
chown -R $USER:$USER /var/log/ehs-system
chmod 755 /var/www/ehs-uploads

# 6. Copy application files (assumes files are in current directory)
echo "Step 6: Copying application files..."
cp -r ./backend/* $BACKEND_DIR/
cp -r ./frontend/* $FRONTEND_DIR/

# 7. Install backend dependencies
echo "Step 7: Installing backend dependencies..."
cd $BACKEND_DIR
npm install --production

# 8. Install frontend dependencies and build
echo "Step 8: Building frontend..."
cd $FRONTEND_DIR
npm install
npm run build

# 9. Setup environment file
echo "Step 9: Setting up environment..."
if [ ! -f "$BACKEND_DIR/.env" ]; then
    cp $BACKEND_DIR/.env.example $BACKEND_DIR/.env
    echo "WARNING: Please edit $BACKEND_DIR/.env with your production values"
fi

# 10. Setup Nginx
echo "Step 10: Configuring Nginx..."
cp nginx.conf $NGINX_CONF
ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
nginx -t

# 11. Setup SSL with Let's Encrypt
echo "Step 11: Setting up SSL..."
read -p "Enter your domain name (e.g., ehs.shubhamepc.com): " DOMAIN
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@shubhamepc.com

# 12. Setup PM2
echo "Step 12: Starting application with PM2..."
cd $BACKEND_DIR
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 13. Setup backup cron job
echo "Step 13: Setting up automated backups..."
chmod +x $APP_DIR/scripts/backup.sh
(crontab -l 2>/dev/null; echo "0 2 * * * $APP_DIR/scripts/backup.sh") | crontab -

# 14. Restart services
echo "Step 14: Restarting services..."
systemctl restart nginx
pm2 restart all

echo "========================================="
echo "Deployment Complete!"
echo "========================================="
echo "Backend running on: http://localhost:5000"
echo "Frontend: https://$DOMAIN"
echo ""
echo "Next steps:"
echo "1. Edit $BACKEND_DIR/.env with production values"
echo "2. Run database migrations: cd $BACKEND_DIR && node setup_sqlite.js"
echo "3. Check PM2 status: pm2 status"
echo "4. Check logs: pm2 logs"
echo "========================================="
