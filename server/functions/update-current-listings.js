/**
 * GitHub Actions automated function for updating current property listings
 *
 * This script is designed for GitHub Actions automation and fetches current listings 
 * from IDX Broker for the Westview community
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Main function for updating current listings
 */
async function updateCurrentListings() {
  console.log('=== CURRENT LISTINGS UPDATE FUNCTION STARTED ===');
  console.log('Started at:', new Date().toISOString());

  try {
    // Fetch current property listings from IDX Broker
    console.log('Fetching current listings from IDX Broker...');
    const newCurrentListings = await fetchCurrentListings();

    if (!newCurrentListings || newCurrentListings.length === 0) {
      console.log('No current listings found or error in fetching');
      return {
        success: false,
        message: 'No current listings found',
        totalListings: 0
      };
    }

    // Save the updated listings to cache
    const cacheDir = path.join(__dirname, '../../db-cache');
    const cachePath = path.join(cacheDir, 'current-listings-latest.json');

    const saveSuccess = await saveListingsToCache(newCurrentListings, cachePath);
    if (!saveSuccess) {
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
      console.warn('Failed to update timestamps');
    }

    console.log(`Current listings updated successfully. Total listings: ${newCurrentListings.length}`);
    console.log('=== CURRENT LISTINGS UPDATE FUNCTION COMPLETED SUCCESSFULLY ===');

    return {
      success: true,
      message: 'Current listings updated successfully',
      totalListings: newCurrentListings.length,
      timestamp
    };

  } catch (error) {
    console.error('=== ERROR IN CURRENT LISTINGS UPDATE FUNCTION ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    return {
      success: false,
      message: 'Error in current listings update function',
      error: error.message
    };
  }
}

/**
 * Fetches current property listings from IDX Broker
 */
async function fetchCurrentListings() {
  return new Promise((resolve, reject) => {
    console.log('Fetching current listings from IDX Broker for Westview...');

    // Browser-like headers to prevent blocking
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Upgrade-Insecure-Requests': '1',
      'Referer': 'https://borchinirealty.idxbroker.com/',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none'
    };

    const options = {
      headers: headers,
      timeout: 60000
    };

    // Use the IDX Broker URL for Westview listings
    const url = 'http://borchinirealty.idxbroker.com/i/westview';
    console.log(`Fetching from URL: ${url}`);

    const handleResponse = (res) => {
      let data = '';

      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log(`Following redirect to: ${res.headers.location}`);
        https.get(res.headers.location, options, handleResponse).on('error', reject);
        return;
      }

      if (res.statusCode !== 200) {
        if (res.statusCode === 403 || res.statusCode === 429) {
          console.log(`Received ${res.statusCode}. Website might be blocking scrapers. Returning empty array.`);
          resolve([]);
          return;
        }
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const properties = parseIDXListings(data);
          console.log(`Parsed ${properties.length} current listings from IDX Broker`);
          resolve(properties);
        } catch (error) {
          console.error('Error parsing listings:', error.message);
          reject(error);
        }
      });
    };

    // Use http.get for http URLs
    const http = require('http');
    http.get(url, options, handleResponse).on('error', (error) => {
      console.log(`Error fetching from IDX Broker: ${error.message}. Returning empty array.`);
      resolve([]);
    }).on('timeout', () => {
      console.log('Request timed out. Returning empty array.');
      resolve([]);
    });
  });
}

/**
 * Parse IDX Broker listings HTML
 */
function parseIDXListings(html) {
  const cheerio = require('cheerio');
  const $ = cheerio.load(html);
  const properties = [];

  // IDX Broker listing selectors
  $('.idx-results-row, .listing-item, .property-listing').each((index, element) => {
    try {
      const listing = $(element);

      // Extract basic information
      const address = listing.find('.idx-addr, .listing-address, .property-address').text().trim();
      if (!address) return;

      // Generate unique ID
      const id = `current-${address.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

      // Extract price
      const priceText = listing.find('.idx-price, .listing-price, .property-price').text().trim();
      const price = priceText.match(/\$[\d,]+/) ? priceText.match(/\$[\d,]+/)[0] : '';

      // Extract image
      const image = listing.find('.idx-photo img, .listing-photo img, .property-photo img').attr('src') || '';

      // Extract beds, baths, sqft
      const bedsText = listing.find('.idx-beds, .listing-beds, .property-beds').text().trim();
      const bathsText = listing.find('.idx-baths, .listing-baths, .property-baths').text().trim();
      const sqftText = listing.find('.idx-sqft, .listing-sqft, .property-sqft').text().trim();

      const beds = parseInt(bedsText.match(/\d+/)?.[0] || '0');
      const baths = parseFloat(bathsText.match(/\d+(\.\d+)?/)?.[0] || '0');
      const sqft = parseInt(sqftText.replace(/[^0-9]/g, '') || '0');

      // Calculate price per sqft
      const pricePerSqFt = sqft > 0 ? `$${Math.round(parseInt(price.replace(/[$,]/g, '')) / sqft)}` : '';

      // Extract MLS number
      const mlsText = listing.find('.idx-mls, .listing-mls, .property-mls').text().trim();
      const mls = mlsText.match(/MLS[\s#]*(\w+)/i)?.[1] || '';

      // Parse address components
      let street = address;
      let city = 'Kissimmee';
      let state = 'FL';
      let zip = '34758';

      const addressParts = address.split(',');
      if (addressParts.length > 1) {
        street = addressParts[0].trim();
        const cityStateZip = addressParts[1].trim().split(' ');
        if (cityStateZip.length > 2) {
          city = cityStateZip[0];
          state = cityStateZip[1];
          zip = cityStateZip[2];
        }
      }

      // Default values for missing data
      const propertyType = 'Single Family Home';
      const yearBuilt = new Date().getFullYear().toString();
      const lotSize = '0.15 acres';
      const description = 'Beautiful home in the Westview community.';

      // Listing attribution
      const listedBy = 'Charles Borchini';
      const company = 'Borchini Realty';

      // Links
      const detailsLink = listing.find('a').attr('href') || '';
      const photoGalleryLink = detailsLink;

      properties.push({
        id,
        image,
        status: 'active',
        propertyType,
        price,
        address: street,
        city,
        state,
        zip,
        beds,
        baths,
        sqft,
        pricePerSqFt,
        yearBuilt,
        lotSize,
        description,
        listedBy,
        company,
        mls,
        moreDetailsLink: detailsLink,
        photoGalleryLink
      });

    } catch (err) {
      console.error('Error parsing individual listing:', err.message);
    }
  });

  return properties;
}

/**
 * Saves property listings to the cache file
 */
async function saveListingsToCache(listings, filePath) {
  try {
    // Create the cache directory if it doesn't exist
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Create backup of existing file if it exists
    if (fs.existsSync(filePath)) {
      const backupPath = filePath + '.backup';
      try {
        fs.copyFileSync(filePath, backupPath);
      } catch (err) {
        console.warn('Could not create backup:', err.message);
      }
    }

    // Convert listings to the format expected by the frontend
    const formattedListings = {
      currentListings: listings,
      timestamp: new Date().toISOString()
    };

    // Write the data
    fs.writeFileSync(filePath, JSON.stringify(formattedListings, null, 2), 'utf8');

    // Verify write success
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        JSON.parse(content);
        return true;
      } catch (err) {
        console.error('Failed to verify written file:', err.message);
        return false;
      }
    } else {
      console.error('File was not created');
      return false;
    }
  } catch (error) {
    console.error('Error saving listings to cache:', error.message);
    return false;
  }
}

/**
 * Updates timestamps file with new update times
 */
async function updateTimestamps(type, timestamp) {
  try {
    const timestampsPath = path.join(path.join(__dirname, '../../db-cache'), 'timestamps.json');

    // Ensure the directory exists
    const dir = path.dirname(timestampsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Read existing timestamps or create new
    let timestamps = {};
    if (fs.existsSync(timestampsPath)) {
      try {
        const content = fs.readFileSync(timestampsPath, 'utf8');
        timestamps = JSON.parse(content);
      } catch (parseErr) {
        console.warn('Could not parse existing timestamps:', parseErr.message);
        timestamps = {};
      }
    }

    // Update the specified timestamp
    timestamps[type] = timestamp;

    // Save the updated timestamps
    fs.writeFileSync(timestampsPath, JSON.stringify(timestamps, null, 2), 'utf8');

    // Verify write success
    return fs.existsSync(timestampsPath);
  } catch (error) {
    console.error('Error updating timestamps:', error.message);
    return false;
  }
}

/**
 * Exported handler for GitHub Actions or other automation
 */
exports.handler = async () => {
  const result = await updateCurrentListings();
  if (result.success) {
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } else {
    return {
      statusCode: 500,
      body: JSON.stringify(result)
    };
  }
};

/**
 * Run this function directly when called with Node.js
 */
if (require.main === module) {
  console.log('Running update-current-listings function directly');

  updateCurrentListings()
    .then(result => {
      console.log('Direct execution completed with result:', result);
      // Exit with appropriate code
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Direct execution failed:', error);
      process.exit(1);
    });
}