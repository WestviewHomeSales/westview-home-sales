#!/bin/bash

# Westview Home Sales - Cron Job Installation Script
# This script installs the cron jobs needed for the website's automated updates

# Get the absolute path to the website's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WEBSITE_DIR="$( cd "$SCRIPT_DIR/../.." && pwd )"

# Make sure we found the website directory
if [ ! -d "$WEBSITE_DIR" ]; then
  echo "Error: Could not determine website directory"
  exit 1
fi

# Determine the Node.js executable path
NODE_PATH=$(which node)
if [ -z "$NODE_PATH" ]; then
  echo "Error: Node.js is not installed or not in PATH"
  exit 1
fi

# Create the logs directory if it doesn't exist
LOGS_DIR="$WEBSITE_DIR/logs"
mkdir -p "$LOGS_DIR"
echo "Created logs directory: $LOGS_DIR"

# Define the cron jobs
DAILY_UPDATE="0 2 * * * $NODE_PATH $WEBSITE_DIR/server/functions/scheduled-update.js >> $LOGS_DIR/scheduled-update.log 2>&1"
SOLD_UPDATE="0 3 * * * $NODE_PATH $WEBSITE_DIR/server/functions/update-sold-listings.js >> $LOGS_DIR/update-sold-listings.log 2>&1"
SALES_UPDATE="0 4 * * * $NODE_PATH $WEBSITE_DIR/server/functions/update-sales-data.js >> $LOGS_DIR/update-sales-data.log 2>&1"
PING_ENGINES="0 5 * * 1 $NODE_PATH $WEBSITE_DIR/server/functions/ping-search-engines.js >> $LOGS_DIR/ping-search-engines.log 2>&1"

# Create a temporary file for the crontab
TEMP_CRONTAB=$(mktemp)

# Get the current crontab
crontab -l > "$TEMP_CRONTAB" 2>/dev/null || echo "# New crontab" > "$TEMP_CRONTAB"

# Check if our jobs already exist
if grep -q "Westview Home Sales Cron Jobs" "$TEMP_CRONTAB"; then
  echo "Existing Westview cron jobs found. Removing them first..."
  sed -i '/# === Westview Home Sales Cron Jobs ===/,/# === End Westview Home Sales Cron Jobs ===/d' "$TEMP_CRONTAB"
fi

# Add our jobs
cat >> "$TEMP_CRONTAB" << EOF

# === Westview Home Sales Cron Jobs ===
# Generated on: $(date --iso-8601=seconds)
# Installation directory: $WEBSITE_DIR

# Daily property data update - runs at 2:00 AM
$DAILY_UPDATE

# Daily sold listings update - runs at 3:00 AM
$SOLD_UPDATE

# Daily sales data update - runs at 4:00 AM
$SALES_UPDATE

# Weekly search engine ping - runs at 5:00 AM every Monday
$PING_ENGINES
# === End Westview Home Sales Cron Jobs ===
EOF

# Install the crontab
echo "Installing cron jobs..."
crontab "$TEMP_CRONTAB"

# Check if it worked
if [ $? -eq 0 ]; then
  echo "Cron jobs installed successfully!"
  echo
  echo "Installed the following jobs:"
  echo "1. Property Update: Every day at 2:00 AM"
  echo "2. Sold Listings Update: Every day at 3:00 AM"
  echo "3. Sales Data Update: Every day at 4:00 AM"
  echo "4. Search Engine Ping: Every Monday at 5:00 AM"
  echo
  echo "You can verify the installed jobs with:"
  echo "crontab -l"
else
  echo "Error: Failed to install cron jobs"
  exit 1
fi

# Clean up
rm "$TEMP_CRONTAB"
echo "Setup complete"
