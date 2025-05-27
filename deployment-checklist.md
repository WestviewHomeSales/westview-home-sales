# Deployment Checklist for WestviewHomeSales.com

Use this checklist to ensure a smooth deployment of your Westview Home Sales website.

## Pre-Deployment

### Environment Configuration
- [ ] Update `.env.local` with production values
- [ ] Configure email settings (SendGrid API key or SMTP credentials)
- [ ] Set proper site URL to https://westviewhomesales.com

### Content Review
- [ ] Verify all property listings are up-to-date
- [ ] Check all images are loading correctly
- [ ] Review all text content for accuracy
- [ ] Test all links to ensure they work properly
- [ ] Verify contact information is correct

### Performance Optimization
- [ ] Run `bun run build` to verify production build works
- [ ] Check for any console warnings or errors
- [ ] Optimize large images (compress if needed)
- [ ] Remove any unused dependencies or assets

## Server Setup

### Web Server
- [ ] Set up your web server (see server-setup-guide.md)
- [ ] Install Node.js and Bun
- [ ] Install Nginx or Apache as reverse proxy
- [ ] Configure process manager (PM2 recommended)

### Domain and SSL
- [ ] Configure DNS settings for westviewhomesales.com
- [ ] Point A record to your server's IP address
- [ ] Set up CNAME for www subdomain if needed
- [ ] Install SSL certificate (Let's Encrypt recommended)
- [ ] Configure HTTPS redirects

### Server Security
- [ ] Set up firewall (allow ports 80, 443, SSH)
- [ ] Configure secure SSH access
- [ ] Set up proper file permissions
- [ ] Install security updates for server OS

## Deployment Process

### Transfer Files
- [ ] Transfer website files to production server
- [ ] Verify all files transferred correctly
- [ ] Set proper file permissions

### Configuration
- [ ] Create production `.env.local` file
- [ ] Configure reverse proxy (Nginx/Apache)
- [ ] Set up PM2 process file

### Build and Start
- [ ] Run `bun install` to install dependencies
- [ ] Run `bun run build` to create production build
- [ ] Start the application with PM2
- [ ] Verify the website is accessible

### Scheduled Tasks
- [ ] Set up cron jobs for data updates (see cron-job-setup-guide.md)
- [ ] Test cron jobs to ensure they run correctly
- [ ] Configure log rotation for log files

## Post-Deployment

### Testing
- [ ] Test all pages load correctly
- [ ] Verify site works on mobile devices
- [ ] Test contact form submission
- [ ] Check property listings display correctly
- [ ] Verify floor plans and PDFs can be viewed
- [ ] Test site performance and loading speed

### Monitoring
- [ ] Set up uptime monitoring
- [ ] Configure error logging
- [ ] Set up analytics (if needed)
- [ ] Monitor server resources

### SEO and Analytics
- [ ] Verify sitemap.xml is accessible
- [ ] Check robots.txt configuration
- [ ] Set up Google Search Console
- [ ] Configure Google Analytics (if using)

### Backup
- [ ] Set up regular database backups
- [ ] Configure file system backups
- [ ] Test backup restoration process

## Final Steps

### Documentation
- [ ] Document server configuration
- [ ] Create maintenance procedures
- [ ] Document update process
- [ ] Store credentials securely

### Launch
- [ ] Announce website launch
- [ ] Monitor for any issues in first 48 hours
- [ ] Gather feedback from users

## Regular Maintenance

### Weekly
- [ ] Check server logs for errors
- [ ] Verify scheduled updates are running
- [ ] Monitor site performance

### Monthly
- [ ] Install security updates
- [ ] Review analytics data
- [ ] Back up configuration files
- [ ] Check SSL certificate expiration

### Quarterly
- [ ] Comprehensive content review
- [ ] Test all functionality
- [ ] Update dependencies if needed
- [ ] Review and optimize SEO
