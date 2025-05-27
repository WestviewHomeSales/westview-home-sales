# Deployment Configuration Guide for WestviewHomeSales.com

## Pre-Deployment Checklist

1. Update `.env` file with your production settings:
   - Set `NEXT_PUBLIC_SITE_URL` to https://westviewhomesales.com
   - Configure email settings with your actual email addresses
   - Add any API keys needed for email services

2. Configure DNS Settings:
   - Point your domain (westviewhomesales.com) to your hosting provider
   - Set up SSL certificate for secure HTTPS connections

3. Database Configuration:
   - The site uses JSON files in the `db-cache` directory for data storage
   - Ensure these files are writable by the application process
   - Consider setting up scheduled tasks for data updates (see server/setup directory)

## Build Process

Build the application for production:

```bash
cd westview-website
bun run build
```

The build output will be in the `.next` directory.

## Server Configuration

For optimal performance, consider:
- Setting up a reverse proxy (Nginx/Apache) in front of the Next.js server
- Configuring caching headers for static assets
- Setting up HTTPS with proper certificates

## Cron Jobs (Optional)

The application includes server functions that can be set up as cron jobs:
- Review `server/setup/setup-cron-jobs.js` and `server/setup/install-cron.sh`
- These help with scheduled updates to property listings

## Post-Deployment

After deploying:
1. Verify all pages load correctly
2. Test the contact form functionality
3. Check that property listings are displaying properly
4. Verify all links and navigation work as expected
