/**
 * Scheduled server function for updating property data
 * Improved version with better error handling and logging
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const { parseIDXListings } = require('./parseIDXListings');

/**
 * This function is configured to run daily at 2:00 AM (set in netlify.toml)
 * It fetches current property listings from IDX Broker and updates the cache
 */
exports.handler = async (event, context) => {
  console.log('=== NETLIFY SCHEDULED FUNCTION STARTED ===');
  console.log('Function triggered at:', new Date().toISOString());
  console.log('Event source:', event?.source || 'unknown');
  console.log('Is scheduled:', event?.source === 'aws.events');
  console.log('Context details:', {
    functionName: context.functionName,
    functionVersion: context.functionVersion,
    awsRequestId: context.awsRequestId
  });

  // For scheduled functions, skip API key check since they don't have headers
  // Only check API key for manual invocations (non-scheduled)
  const isScheduled = event?.source === 'aws.events' || !event?.headers;

  if (!isScheduled) {
    console.log('Manual invocation detected, checking API key...');
    const apiKey = event.headers['x-api-key'] || process.env.UPDATE_API_KEY;
    if (!apiKey || apiKey !== process.env.UPDATE_API_KEY) {
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
    // Add comprehensive logging for environment
    console.log('Environment details:');
    console.log('- Node version:', process.version);
    console.log('- Platform:', process.platform);
    console.log('- Working directory:', process.cwd());
    console.log('- Function directory:', __dirname);
    console.log('- UPDATE_API_KEY set:', !!process.env.UPDATE_API_KEY);

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

    console.log(`Successfully fetched ${currentListingsData.length} listings`);

    // Save the updated listings to cache with improved path handling
    const cacheDir = getCacheDirectory();
    console.log('Cache directory:', cacheDir);

    const success = await saveListingsToCache(currentListingsData, path.join(cacheDir, 'current-listings-latest.json'));

    if (!success) {
      throw new Error('Failed to save listings to cache');
    }

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
    const timestampSuccess = await updateTimestamps('current_listings', timestamp);

    if (!timestampSuccess) {
      console.warn('Failed to update timestamps, but continuing...');
    }

    console.log('Current listings updated successfully');
    console.log('=== NETLIFY SCHEDULED FUNCTION COMPLETED SUCCESSFULLY ===');

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Current listings updated successfully',
        timestamp: new Date().toISOString(),
        listingsCount: currentListingsData.length,
        scheduled: isScheduled
      })
    };
  } catch (error) {
    console.error('=== ERROR IN SCHEDULED FUNCTION ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error in scheduled function',
        error: error.message,
        timestamp: new Date().toISOString(),
        scheduled: isScheduled
      })
    };
  }
};

/**
 * Improved cache directory detection for server environment
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
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    };

    const req = https.get('https://borchinirealty.idxbroker.com/i/westview', options, (res) => {
      let data = '';

      console.log('Response status:', res.statusCode);
      console.log('Response headers:', res.headers);

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          console.log(`Received ${data.length} bytes of data`);
          const properties = parseIDXListings(data);
          console.log(`Parsed ${properties.length} properties`);
          resolve(properties);
        } catch (error) {
          console.error('Error parsing listings:', error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error.message);
      reject(error);
    });

    req.setTimeout(30000, () => {
      console.error('Request timeout after 30 seconds');
      req.destroy();
      reject(new Error('Request timeout'));
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
