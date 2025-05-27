# Server Setup Guide for WestviewHomeSales.com

This guide provides step-by-step instructions for deploying the Westview Home Sales website to your own server.

## Prerequisites

- A web server running Linux (Ubuntu/Debian recommended)
- Node.js 18.x or later
- Bun 1.x or later (recommended)
- Nginx or Apache as a reverse proxy
- Domain name configured to point to your server
- SSL certificate (Let's Encrypt recommended)

## Step 1: Prepare the Server

### Install required software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Bun (recommended)
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

## Step 2: Set Up the Web Server Directory

```bash
# Create directory for the website
sudo mkdir -p /var/www/westviewhomesales.com
sudo chown -R $USER:$USER /var/www/westviewhomesales.com
```

## Step 3: Deploy the Website

### Option 1: Clone from Git (if using version control)

```bash
# Clone repository (if using Git)
git clone your-repository-url /var/www/westviewhomesales.com
cd /var/www/westviewhomesales.com

# Install dependencies
bun install
```

### Option 2: Manual Transfer

```bash
# Transfer files to server (from your local machine)
scp -r /path/to/westview-website/* user@your-server:/var/www/westviewhomesales.com/

# Install dependencies on server
cd /var/www/westviewhomesales.com
bun install
```

## Step 4: Create Environment File

Create a `.env.local` file with your production settings:

```bash
nano /var/www/westviewhomesales.com/.env.local
```

Add the content from your local `.env.local` file.

## Step 5: Build the Website

```bash
cd /var/www/westviewhomesales.com
bun run build
```

## Step 6: Set Up Process Manager (PM2)

PM2 keeps your Node.js application running and manages restarts.

```bash
# Install PM2 globally
npm install -g pm2

# Start the Next.js application
cd /var/www/westviewhomesales.com
pm2 start npm --name "westview" -- start

# Set PM2 to start on boot
pm2 startup
pm2 save
```

## Step 7: Configure Nginx as Reverse Proxy

Create an Nginx server block:

```bash
sudo nano /etc/nginx/sites-available/westviewhomesales.com
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name westviewhomesales.com www.westviewhomesales.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Caching static assets for better performance
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_cache_valid 200 302 60m;
        proxy_cache_valid 404 1m;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # Caching public assets
    location /public/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_valid 200 302 60m;
        proxy_cache_valid 404 1m;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
    }

    # Specific configuration for sitemap
    location /api/sitemap {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        add_header Content-Type "application/xml";
        add_header Cache-Control "public, max-age=86400";
    }
}
```

Enable the configuration:

```bash
sudo ln -s /etc/nginx/sites-available/westviewhomesales.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 8: Set Up SSL with Let's Encrypt

```bash
sudo certbot --nginx -d westviewhomesales.com -d www.westviewhomesales.com
```

## Step 9: Set Up Cron Jobs for Data Updates

```bash
cd /var/www/westviewhomesales.com/server/setup
bash install-cron.sh
```

This will configure the necessary cron jobs for updating property listings.

## Step 10: Final Checks

1. Visit https://westviewhomesales.com to ensure the site loads properly
2. Test the contact form
3. Verify all images and PDFs load correctly
4. Check mobile responsiveness

## Troubleshooting

### If the website doesn't load:

1. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
2. Check application logs: `pm2 logs westview`
3. Verify the Node.js application is running: `pm2 status`
4. Check firewall settings: `sudo ufw status`

### If the cron jobs aren't running:

1. Check the cron job configuration: `crontab -l`
2. Verify script permissions: `ls -la /var/www/westviewhomesales.com/server/functions/`
3. Check cron logs: `grep CRON /var/log/syslog`

## Maintenance

### To update the website:

```bash
cd /var/www/westviewhomesales.com
git pull # if using Git
bun install
bun run build
pm2 restart westview
```

### Renewing SSL certificate:

Let's Encrypt certificates auto-renew, but you can test the renewal process:

```bash
sudo certbot renew --dry-run
```
