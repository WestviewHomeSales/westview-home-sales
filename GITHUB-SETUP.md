# GitHub Setup Guide for Westview Home Sales Website

This guide explains how to set up your GitHub repository with automated updates for the Westview Home Sales website.

## Overview

The automation system will:
1. Update Current Listings daily from IDX Broker
2. Add new Sold Listings without removing existing ones
3. Build and deploy the website to your FTP server

## Step 1: Push Your Code to GitHub

You already have a GitHub repository at https://github.com/WestviewHomeSales/westview-home-sales. To update it with your latest code:

```bash
# Navigate to your website directory
cd westview-website

# Initialize Git if not already done
git init

# Add all files
git add .

# Commit changes
git commit -m "Set up automated updates"

# Add the GitHub repository as remote (if not already done)
git remote add origin https://github.com/WestviewHomeSales/westview-home-sales.git

# Push code to GitHub
git push -u origin main
```

## Step 2: Add FTP Credentials as a Secret

1. Go to your GitHub repository: https://github.com/WestviewHomeSales/westview-home-sales
2. Click on "Settings" > "Secrets and variables" > "Actions"
3. Click "New repository secret"
4. Add your FTP password:
   - Name: `FTP_PASSWORD`
   - Value: `73oVQLTZG9fK$G`
5. Click "Add secret"

## Step 3: Enable GitHub Actions

1. Go to the "Actions" tab in your repository
2. Click on "I understand my workflows, go ahead and enable them"
3. You should see the "Daily Property Listings Update" workflow
4. Click on it to view details

## Step 4: Run the Workflow Manually

1. Go to the "Actions" tab
2. Click on "Daily Property Listings Update" workflow
3. Click "Run workflow" > "Run workflow"
4. Wait for the workflow to complete

## How It Works

### Automated Update Process

1. The workflow runs daily at 1 AM UTC
2. It checks out your code from GitHub
3. It updates current listings from IDX Broker
4. It fetches new sold listings and adds them to existing ones
5. It builds the static site
6. It deploys to your FTP server

### Update Scripts

Two key scripts handle the data updates:

1. `server/functions/update-sales-data.js` - Updates current listings by fetching from IDX Broker
2. `server/functions/update-sold-listings.js` - Updates sold listings using the append-only approach

### Manual Updates

If you need to trigger an update manually:

1. Go to the "Actions" tab in your repository
2. Click on "Daily Property Listings Update" workflow
3. Click "Run workflow" > "Run workflow"

## Troubleshooting

### Common Issues

1. **Workflow fails**: Check the workflow logs for detailed error messages
2. **FTP deployment fails**: Verify FTP credentials and server settings
3. **Build process fails**: Check for errors in the build step

### Viewing Logs

1. Go to the "Actions" tab
2. Click on the failed workflow run
3. Expand the section where the failure occurred
4. Review the logs for error messages

## Making Changes

If you need to make changes to the website:

1. Make changes locally
2. Commit and push to GitHub
3. The changes will be included in the next automated update
4. Alternatively, trigger a manual workflow run

## Monitoring

You can set up email notifications for workflow failures:

1. Go to your GitHub profile settings
2. Click on "Notifications"
3. Enable email notifications for workflow failures
