/**
 * Scheduled server function for updating property data
 *
 * This script can be run directly with Node.js:
 * node server/functions/scheduled-update.js
 *
 * Or it can be scheduled via cron:
 * 0 2 * * * /usr/bin/node /path/to/site/server/functions/scheduled-update.js >> /path/to/site/logs/scheduled-update.log 2>&1
 */
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const https = require('https');
const zlib = require('zlib');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const { parseIDXListings } = require('./parseIDXListings');

/**
 * This function is configured to run daily at 2:00 AM (set in netlify.toml)
 * It fetches current property listings from IDX Broker and updates the cache
 */
exports.handler = async (event, context) => {
  console.log('=== SCHEDULED FUNCTION STARTED ===');
  console.log('Scheduled function triggered at:', new Date().toISOString());
  console.log('Event source:', event?.source || 'unknown');
  console.log('Is scheduled:', !!event?.isScheduled || event?.source === 'aws.events');
  console.log('Context details:', {
    functionName: context?.functionName,
    functionVersion: context?.functionVersion,
    awsRequestId: context?.awsRequestId
  });

  // Set hard-coded API key for development/testing
  const HARDCODED_API_KEY = 'westview-update-key';

  // Allow scheduled events to bypass API key check
  const isScheduledEvent = event?.source === 'aws.events' || !!event?.isScheduled;

  // For manual invocation, check API key
  if (!isScheduledEvent) {
    console.log('Manual invocation detected, checking API key...');
    const apiKey = event?.headers?.['x-api-key'] || process.env.UPDATE_API_KEY || HARDCODED_API_KEY;
    if (
      apiKey !== HARDCODED_API_KEY &&
      (!process.env.UPDATE_API_KEY || apiKey !== process.env.UPDATE_API_KEY)
    ) {
      console.log('Unauthorized access attempt or missing API key');
      return {
        statusCode: 401,
        body: JSON.stringify({
          message: 'Unauthorized access',
          timestamp: new Date().toISOString()
        })
      };
    }
  } else {
    console.log('Scheduled execution detected, skipping API key check');
  }

  try {
    // Fetch current property listings from IDX Broker with retry logic
    console.log('Fetching current listings from IDX Broker...');
    const currentListingsData = await fetchCurrentListingsWithRetry(3);

    if (!currentListingsData || currentListingsData.length === 0) {
      console.log('No current listings found or error in fetching');
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'No current listings found',
          timestamp: new Date().toISOString()
        })
      };
    }

    // Save the updated listings to cache
    const cacheDir = getCacheDirectory();
    await saveListingsToCache(currentListingsData, path.join(cacheDir, 'current-listings-latest.json'));

    // Update timestamp
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }) + ' ET';

    // Update the timestamps in the cache
    await updateTimestamps('current_listings', timestamp);

    console.log('Current listings updated successfully');
    console.log('=== NETLIFY SCHEDULED FUNCTION COMPLETED SUCCESSFULLY ===');

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Current listings updated successfully',
        timestamp: new Date().toISOString(),
        listingsCount: currentListingsData.length,
        scheduled: isScheduledEvent
      })
    };
  } catch (error) {
    console.error('=== ERROR IN SCHEDULED FUNCTION ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error in scheduled function',
        error: error.message,
        timestamp: new Date().toISOString(),
        scheduled: isScheduledEvent
      })
    };
  }
};

/**
 * Improved cache directory detection for server environment
 * Works both as a server function and when run directly
 */
function getCacheDirectory() {
  // In production server, try multiple possible cache locations
  const possiblePaths = [
    path.join(__dirname, '../../db-cache'),
    path.join(process.cwd(), 'db-cache'),
    path.join('/tmp', 'db-cache'),
    path.join('/opt/build/repo/db-cache')
  ];

  for (const cachePath of possiblePaths) {
    try {
      if (fs.existsSync(path.dirname(cachePath))) {
        console.log(`Using cache directory: ${cachePath}`);
        return cachePath;
      }
    } catch (err) {
      console.log(`Cache path ${cachePath} not accessible:`, err.message);
    }
  }

  // Default fallback
  const fallback = path.join(__dirname, '../../db-cache');
  console.log(`Using fallback cache directory: ${fallback}`);
  return fallback;
}

/**
 * Fetches current property listings with retry logic
 */
async function fetchCurrentListingsWithRetry(maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Fetch attempt ${attempt}/${maxRetries}`);
      return await fetchCurrentListings();
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      if (attempt === maxRetries) {
        throw error;
      }
      // Wait before retry (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Fetches current property listings from the IDX Broker website
 */
async function fetchCurrentListings() {
  // Add proper browser-like headers to prevent blocking
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Upgrade-Insecure-Requests': '1',
    'Referer': 'https://borchinirealty.idxbroker.com/'
  };

  return new Promise((resolve, reject) => {
    const options = {
      headers: headers,
      timeout: 60000 // Increase timeout to 60 seconds
    };

    console.log('Fetching current listings from IDX Broker...');

    https.get('https://borchinirealty.idxbroker.com/i/westview', options, (res) => {
      let data = '';

      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log(`Following redirect to: ${res.headers.location}`);
        https.get(res.headers.location, options, handleResponse).on('error', reject);
        return;
      }

      const handleResponse = (res) => {
        // Handle gzip encoding
        const encoding = res.headers['content-encoding'];
        const stream = encoding === 'gzip' ? res.pipe(zlib.createGunzip()) : res;

        stream.on('data', (chunk) => {
          data += chunk;
        });

        stream.on('end', () => {
          if (res.statusCode !== 200) {
            return reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          }

          try {
            // Parse the HTML response and extract property listings
            const properties = parseIDXListings(data);
            resolve(properties);
          } catch (error) {
            reject(error);
          }
        });
      };

      handleResponse(res);
    }).on('error', reject).on('timeout', () => {
      reject(new Error('Request timed out'));
    });
  });
}

/**
 * Saves property listings to the cache file with improved error handling
 */
async function saveListingsToCache(listings, filePath) {
  try {
    // Create the cache directory if it doesn't exist
    const dir = path.dirname(filePath);
    console.log(`Ensuring directory exists: ${dir}`);

    if (!fs.existsSync(dir)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    }

    // Verify directory is writable
    try {
      fs.accessSync(dir, fs.constants.W_OK);
      console.log('Directory is writable');
    } catch (err) {
      throw new Error(`Directory not writable: ${dir} - ${err.message}`);
    }

    // Create backup of existing file if it exists
    if (fs.existsSync(filePath)) {
      const backupPath = filePath + '.backup';
      try {
        fs.copyFileSync(filePath, backupPath);
        console.log(`Created backup at: ${backupPath}`);
      } catch (err) {
        console.warn('Could not create backup:', err.message);
      }
    }

    // Convert new listings to the format expected by the frontend
    const formattedListings = {
      currentListings: listings,
      timestamp: new Date().toISOString()
    };

    // Log file info before writing
    console.log(`About to write ${listings.length} listings to: ${filePath}`);
    console.log(`Directory exists: ${fs.existsSync(dir)}`);

    // Write the final data
    fs.writeFileSync(filePath, JSON.stringify(formattedListings, null, 2), 'utf8');

    // Verify write success
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`Successfully saved ${listings.length} listings to ${filePath}`);
      console.log(`File size: ${stats.size} bytes`);
      console.log(`File modified: ${stats.mtime}`);
      console.log('Listings have been updated with fresh IDX Broker data');

      // Verify the content is valid JSON
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(content);
        console.log(`Verified: file contains ${parsed.currentListings.length} listings`);
      } catch (err) {
        console.error('Warning: saved file is not valid JSON:', err.message);
        return false;
      }

      return true;
    } else {
      throw new Error(`File not created: ${filePath}`);
    }
  } catch (error) {
    console.error('Error saving listings to cache:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return false;
  }
}

/**
 * Updates timestamps file with new update times and improved error handling
 */
async function updateTimestamps(type, timestamp) {
  try {
    const timestampsPath = path.join(getCacheDirectory(), 'timestamps.json');
    console.log(`Updating timestamps at: ${timestampsPath}`);

    // Ensure the directory exists
    const dir = path.dirname(timestampsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Read existing timestamps or create new
    let timestamps = {};
    if (fs.existsSync(timestampsPath)) {
      console.log('Reading existing timestamps file');
      try {
        const content = fs.readFileSync(timestampsPath, 'utf8');
        console.log(`File content: ${content}`);
        timestamps = JSON.parse(content);
      } catch (parseErr) {
        console.warn('Could not parse existing timestamps, creating new:', parseErr.message);
        timestamps = {};
      }
    } else {
      console.log('No existing timestamps file, will create new one');
    }

    // Update the specified timestamp
    timestamps[type] = timestamp;
    console.log(`New timestamps object: ${JSON.stringify(timestamps)}`);

    // Save the updated timestamps using direct fs
    fs.writeFileSync(timestampsPath, JSON.stringify(timestamps, null, 2), 'utf8');

    // Verify write success
    if (fs.existsSync(timestampsPath)) {
      const stats = fs.statSync(timestampsPath);
      console.log(`Updated ${type} timestamp to ${timestamp}`);
      console.log(`File size: ${stats.size} bytes`);
      console.log(`File modified: ${stats.mtime}`);
      return true;
    } else {
      throw new Error(`Timestamp file not created: ${timestampsPath}`);
    }
  } catch (error) {
    console.error('Error updating timestamps:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return false;
  }
}

/**
 * Run this function directly when called with Node.js
 * This allows the script to be run from the command line or cron
 */
if (require.main === module) {
  console.log('Running scheduled update function directly');

  const mockEvent = { source: 'direct' };
  const mockContext = { functionName: 'scheduled-update-direct' };

  exports.handler(mockEvent, mockContext)
    .then(result => {
      console.log('Direct execution completed with result:', result);
      // Exit with appropriate code
      process.exit(result.statusCode === 200 ? 0 : 1);
    })
    .catch(error => {
      console.error('Direct execution failed:', error);
      process.exit(1);
    });
}
