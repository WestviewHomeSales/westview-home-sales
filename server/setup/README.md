# Westview Home Sales - Server Setup Guide

This guide provides instructions for setting up the server-side components of the Westview Home Sales website.

## Cron Jobs for Scheduled Data Updates

The Westview Home Sales website relies on several scheduled tasks to keep property data up-to-date. These tasks fetch data from IDX Broker and other sources, then update the website's data cache.

### Automated Setup (Recommended)

We've created a script to help you set up the necessary cron jobs on your server:

1. Make sure you have Node.js installed on your server
2. Navigate to the website's root directory
3. Run the setup script:

```bash
node server/setup/setup-cron-jobs.js
```

4. Follow the interactive prompts to configure and install the cron jobs

The script will guide you through setting up the following scheduled tasks:

- **Daily Property Update**: Runs at 2:00 AM every day to update property listings
- **Daily Sold Listings Update**: Runs at 3:00 AM every day to update sold properties
- **Daily Sales Data Update**: Runs at 4:00 AM every day to update historical sales data
- **Weekly Search Engine Ping**: Runs at 5:00 AM every Monday to notify search engines about updates

### Manual Setup

If you prefer to set up the cron jobs manually, follow these steps:

1. Open your crontab file for editing:
   ```bash
   crontab -e
   ```

2. Add the following entries, replacing `/path/to/website` with the actual path to your website:

```cron
# === Westview Home Sales Cron Jobs ===
# Daily property data update - runs at 2:00 AM
0 2 * * * /usr/bin/node /path/to/website/server/functions/scheduled-update.js >> /path/to/website/logs/scheduled-update.log 2>&1

# Daily sold listings update - runs at 3:00 AM
0 3 * * * /usr/bin/node /path/to/website/server/functions/update-sold-listings.js >> /path/to/website/logs/update-sold-listings.log 2>&1

# Daily sales data update - runs at 4:00 AM
0 4 * * * /usr/bin/node /path/to/website/server/functions/update-sales-data.js >> /path/to/website/logs/update-sales-data.log 2>&1

# Weekly search engine ping - runs at 5:00 AM every Monday
0 5 * * 1 /usr/bin/node /path/to/website/server/functions/ping-search-engines.js >> /path/to/website/logs/ping-search-engines.log 2>&1
# === End Westview Home Sales Cron Jobs ===
```

3. Save and exit the editor

### Verifying Cron Jobs

To verify that your cron jobs are set up correctly:

1. List your current cron jobs:
   ```bash
   crontab -l
   ```

2. Check the log files after the scheduled time to ensure the jobs ran successfully:
   ```bash
   cat logs/scheduled-update.log
   ```

## Manual Data Updates

If you need to run a data update manually:

```bash
# Update property listings
node server/functions/scheduled-update.js

# Update sold listings
node server/functions/update-sold-listings.js

# Update sales data
node server/functions/update-sales-data.js

# Ping search engines
node server/functions/ping-search-engines.js
```

## Troubleshooting

If your cron jobs aren't running as expected:

1. Check the log files in the `logs/` directory
2. Verify that the server time is correct: `date`
3. Ensure Node.js is installed and in the PATH for the cron user
4. Check file permissions on the script files
5. Try running the scripts manually to check for errors

For additional assistance, contact your web administrator.
