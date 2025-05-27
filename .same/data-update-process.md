# Westview Home Sales Data Update Process

## Overview

The website automatically updates property listings data using server-side functions. This document explains how the data update process works and how to manage it.

## Data Storage

Property data is stored in JSON files in the `/db-cache` directory:
- `current-listings-latest.json`: Contains active property listings
- `sold-listings-latest.json`: Contains sold property listings
- `timestamps.json`: Tracks when data was last updated

## Update Process

The data update process involves several steps:

1. **Fetching new data**: The system retrieves new property data from external sources
2. **Parsing and formatting**: Raw data is processed into the format needed by the website
3. **Updating local cache**: Processed data is saved to the JSON files in `/db-cache`
4. **Updating timestamps**: The update time is recorded in `timestamps.json`
5. **Notifying search engines** (optional): Pings search engines to inform them of content updates

## Key Server Functions

### Main Update Functions

1. **`scheduled-update.js`**: Main function that orchestrates the update process
   - Located at: `/server/functions/scheduled-update.js`
   - Designed to run on a schedule (e.g., daily)
   - Updates both current and sold listings

2. **`update-sales-data.js`**: Updates current property listings
   - Located at: `/server/functions/update-sales-data.js`
   - Fetches, parses, and saves current property listings

3. **`update-sold-listings.js`**: Updates sold property listings
   - Located at: `/server/functions/update-sold-listings.js`
   - Processes sold property data

4. **`ping-search-engines.js`**: Notifies search engines of updates
   - Located at: `/server/functions/ping-search-engines.js`
   - Pings Google and Bing to request re-indexing

### Utility Functions

1. **`parseIDXListings.js`**: Parses raw property data
   - Located at: `/server/functions/parseIDXListings.js`
   - Transforms data from external sources into the website's format

2. **`send-email.js`**: Handles email notifications
   - Located at: `/server/functions/send-email.js`
   - Can be configured to send notifications about updates

### Test Functions

1. **`test-nightly-update.js`**: Tests the update process
   - Located at: `/server/functions/test-nightly-update.js`
   - Runs the update process without affecting production data

2. **`simulate-nightly-update.js`**: Simulates a full update
   - Located at: `/server/functions/simulate-nightly-update.js`
   - Updates production data but can be run manually

## Setting Up Scheduled Updates

### Using Cron Jobs

The recommended way to schedule updates is using cron jobs:

1. Navigate to the setup directory:
   ```bash
   cd /path/to/westview-website/server/setup
   ```

2. Run the installation script:
   ```bash
   bash install-cron.sh
   ```

This script will:
- Install necessary cron jobs for daily updates
- Configure paths based on your server setup
- Set up logging for the update process

### Manual Configuration

If you prefer to set up cron jobs manually:

1. Edit your crontab:
   ```bash
   crontab -e
   ```

2. Add the following entry to run updates daily at 1:00 AM:
   ```
   0 1 * * * cd /path/to/westview-website/server/functions && node scheduled-update.js >> /path/to/update-log.log 2>&1
   ```

## Testing and Troubleshooting

### Testing Updates

You can test the update process without affecting production data:

```bash
cd /path/to/westview-website
bun run test-update
```

### Simulating Updates

To run a real update manually:

```bash
cd /path/to/westview-website
bun run simulate-update
```

### Troubleshooting

If updates aren't working:

1. Check update logs in your configured log location
2. Verify file permissions on the `/db-cache` directory
3. Ensure your server has internet access to fetch external data
4. Verify that Node.js and required modules are installed
5. Check cron job configuration with `crontab -l`

## Customizing the Update Process

### Changing Update Frequency

Edit the cron job schedule in the crontab or `install-cron.sh` script.

### Modifying Data Sources

If you need to change where data comes from, modify:
- `/server/functions/update-sales-data.js` for current listings
- `/server/functions/update-sold-listings.js` for sold listings

### Changing Data Processing

To modify how data is formatted, edit:
- `/server/functions/parseIDXListings.js`
