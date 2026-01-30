#!/bin/bash

# P-Turtor Production Deploy Script
# Run this on VPS after building the app

echo "🚀 Deploying P-Turtor to Production..."
echo "======================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Check if running as root for nginx
if [ "$EUID" -ne 0 ]; then 
   echo "Please run as root or use sudo for nginx setup"
fi

echo ""
echo "1️⃣  Installing PM2..."
npm install -g pm2

echo ""
echo "2️⃣  Building application..."
cd /home/ubuntu/clawd/pturtor
npm install
npx prisma generate
npm run build

echo ""
echo "3️⃣  Running database migrations..."
npx prisma migrate deploy

echo ""
echo "4️⃣  Seeding database (if needed)..."
npx prisma db seed || echo "Seed skipped or already exists"

echo ""
echo "5️⃣  Starting application with PM2..."
pm2 delete pturtor 2>/dev/null || true
pm2 start npm --name "pturtor" -- start
pm2 save

echo ""
echo "6️⃣  Setting up PM2 startup script..."
pm2 startup systemd -u ubuntu --hp /home/ubuntu

echo ""
echo "7️⃣  Installing Nginx..."
apt-get update
apt-get install -y nginx

echo ""
echo "8️⃣  Configuring Nginx..."
cp /home/ubuntu/clawd/pturtor/nginx/pturtor.conf /etc/nginx/sites-available/pturtor
ln -sf /etc/nginx/sites-available/pturtor /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo ""
echo "8️⃣  Setting up SSL with Let's Encrypt..."
apt-get install -y certbot python3-certbot-nginx
# certbot --nginx -d pturtor.com -d www.pturtor.com --non-interactive --agree-tos -m your-email@example.com

echo ""
echo "======================================"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "App URL: http://52.221.194.126"
echo "Admin: http://52.221.194.126/admin"
echo ""
echo "PM2 Commands:"
echo "  pm2 status      - Check app status"
echo "  pm2 logs        - View logs"
echo "  pm2 restart     - Restart app"
echo "  pm2 stop        - Stop app"
echo ""
echo "Nginx Commands:"
echo "  sudo nginx -t   - Test config"
echo "  sudo systemctl restart nginx"
echo ""
