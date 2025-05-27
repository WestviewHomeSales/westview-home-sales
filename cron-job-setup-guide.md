# Setting Up Automated Data Updates for WestviewHomeSales.com

This guide explains how to set up automated data updates for your Westview Home Sales website.

## What Are Automated Updates?

The website needs regular updates to:
1. Refresh current property listings
2. Update sold property listings
3. Notify search engines of content changes

These updates are handled by server functions that run on a schedule using cron jobs.

## Option 1: Automatic Setup (Recommended)

The easiest way to set up the required cron jobs is using the included installation script:

### Step 1: Make the script executable

```bash
# Navigate to your website directory
cd /path/to/westview-website

# Make the installation script executable
chmod +x server/setup/install-cron.sh
```

### Step 2: Run the installation script

```bash
# Run the script
./server/setup/install-cron.sh
```

This script will:
- Create a logs directory for storing update logs
- Define cron jobs for all necessary updates
- Install the cron jobs in your user's crontab
- Verify the installation was successful

### Step 3: Verify the installation

```bash
# List your cron jobs
crontab -l
```

You should see entries for:
- Daily property data update (2:00 AM)
- Daily sold listings update (3:00 AM)
- Daily sales data update (4:00 AM)
- Weekly search engine ping (5:00 AM Mondays)

## Option 2: Manual Setup

If you prefer to set up the cron jobs manually:

### Step 1: Create a logs directory

```bash
mkdir -p /path/to/westview-website/logs
```

### Step 2: Edit your crontab

```bash
crontab -e
```

### Step 3: Add the following entries

Add these lines to your crontab, replacing `/path/to/westview-website` with your actual website directory:

```
# === Westview Home Sales Cron Jobs ===
# Daily property data update - runs at 2:00 AM
0 2 * * * node /path/to/westview-website/server/functions/scheduled-update.js >> /path/to/westview-website/logs/scheduled-update.log 2>&1

# Daily sold listings update - runs at 3:00 AM
0 3 * * * node /path/to/westview-website/server/functions/update-sold-listings.js >> /path/to/westview-website/logs/update-sold-listings.log 2>&1

# Daily sales data update - runs at 4:00 AM
0 4 * * * node /path/to/westview-website/server/functions/update-sales-data.js >> /path/to/westview-website/logs/update-sales-data.log 2>&1

# Weekly search engine ping - runs at 5:00 AM every Monday
0 5 * * 1 node /path/to/westview-website/server/functions/ping-search-engines.js >> /path/to/westview-website/logs/ping-search-engines.log 2>&1
# === End Westview Home Sales Cron Jobs ===
```

## Testing the Updates

To verify that the update process works correctly:

### Test the scheduled update

```bash
cd /path/to/westview-website
node server/functions/test-nightly-update.js
```

### Check the logs

```bash
# View the update logs
cat logs/scheduled-update.log
```

## Troubleshooting

### If cron jobs aren't running:

1. Check your crontab is installed correctly:
   ```bash
   crontab -l
   ```

2. Verify the Node.js path:
   ```bash
   which node
   ```

3. Check file permissions:
   ```bash
   chmod +x /path/to/westview-website/server/functions/*.js
   ```

4. Check for errors in the logs:
   ```bash
   cat /path/to/westview-website/logs/*.log
   ```

5. Verify system cron service is running:
   ```bash
   sudo systemctl status cron
   ```

### Common issues:

- **File not found errors**: Ensure paths in crontab are absolute, not relative
- **Permission denied**: Make sure script files are executable
- **Node not found**: Ensure Node.js is installed and in PATH
- **Empty logs**: Cron job might not be running; check system logs with `grep CRON /var/log/syslog`

## Customizing Update Frequency

To change when updates run, edit the crontab and modify the schedule:

The schedule format is: `minute hour day-of-month month day-of-week command`

Examples:
- Every day at midnight: `0 0 * * * command`
- Every hour: `0 * * * * command`
- Every Monday at 9 AM: `0 9 * * 1 command`

## For Help

If you encounter issues with the cron jobs, refer to:
- The server setup documentation
- The data update process documentation in the `.same` folder
