/**
 * Scheduled server function for pinging search engines
 *
 * This script can be run directly with Node.js:
 * node server/functions/ping-search-engines.js
 *
 * Or it can be scheduled via cron:
 * 0 5 * * 1 /usr/bin/node /path/to/site/server/functions/ping-search-engines.js >> /path/to/site/logs/ping-search-engines.log 2>&1
 */
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const https = require('https');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);

/**
 * This function is configured to run daily at 3:00 AM (set in netlify.toml)
 * It fetches sold property listings from homes.com and updates the cache
 * while preserving existing sold listings
 */
exports.handler = async (event, context) => {
  console.log('=== NETLIFY SOLD LISTINGS UPDATE FUNCTION STARTED ===');
  console.log('Scheduled function triggered at:', new Date().toISOString());

  // Verify API key for security
  const apiKey = event.headers && event.headers['x-api-key'] || process.env.UPDATE_API_KEY;
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

  try {
    // Fetch new sold property listings from Homes.com
    console.log('Fetching sold listings from Homes.com...');
    const newSoldListings = await fetchSoldListings();

    if (!newSoldListings || newSoldListings.length === 0) {
      console.log('No new sold listings found or error in fetching');
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'No new sold listings found',
          timestamp: new Date().toISOString()
        })
      };
    }

    // Get existing sold listings to merge with new ones
    const cacheDir = path.join(__dirname, '../../db-cache');
    const cachePath = path.join(cacheDir, 'sold-listings-latest.json');
    let existingSoldListings = [];

    if (fs.existsSync(cachePath)) {
      try {
        const existingData = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        existingSoldListings = existingData.soldListings || [];
      } catch (err) {
        console.log('Error reading existing sold listings, starting fresh:', err.message);
      }
    }

    // Merge new and existing listings
    // Keep track of listing IDs to avoid duplicates
    const existingIds = new Set(existingSoldListings.map(listing => listing.id));
    const mergedListings = [...existingSoldListings];

    // Add only new listings that don't already exist
    let newListingsAdded = 0;
    for (const listing of newSoldListings) {
      if (!existingIds.has(listing.id)) {
        mergedListings.push(listing);
        existingIds.add(listing.id);
        newListingsAdded++;
      }
    }

    // Save the updated listings to cache
    await saveListingsToCache(mergedListings, cachePath);

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
    await updateTimestamps('sold_listings', timestamp);

    console.log(`Sold listings updated successfully. Added ${newListingsAdded} new listings.`);
    console.log('=== NETLIFY SOLD LISTINGS UPDATE FUNCTION COMPLETED SUCCESSFULLY ===');

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Sold listings updated successfully',
        timestamp: new Date().toISOString(),
        existingListings: existingSoldListings.length,
        newListingsAdded,
        totalListings: mergedListings.length
      })
    };
  } catch (error) {
    console.error('=== ERROR IN SOLD LISTINGS UPDATE FUNCTION ===');
    console.error('Error message:', error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error in sold listings update function',
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

/**
 * Fetches sold property listings from Homes.com
 */
async function fetchSoldListings() {
  return new Promise((resolve, reject) => {
    https.get('https://www.homes.com/sold/?sk=ktIpHZv3jTy30im3fzhdtCpyRhOqcbf_4OOs0F_GCt4&bb=_pg20o6_6Gk5kglG', (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const properties = parseHomesSoldListings(data);
          resolve(properties);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Parses the HTML from Homes.com to extract sold property listings
 */
function parseHomesSoldListings(html) {
  const $ = cheerio.load(html);
  const properties = [];

  // Find property cards on the Homes.com page
  $('.property-card, .sold-card').each((index, element) => {
    try {
      const card = $(element);

      // Skip if not a sold property
      if (!card.find('.sold-badge').length && !card.hasClass('sold-card')) {
        return;
      }

      // Extract basic property info
      const address = card.find('.property-address').text().trim();

      // Generate consistent ID from address
      const id = `sold-${address.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

      // Image
      const image = card.find('.property-image img').attr('src') || '';

      // Sale information
      const soldDateText = card.find('.sold-date').text().trim() ||
                          card.find('.property-date').text().trim();

      // Extract date - format may vary, but try to get a clean date
      let soldDate = 'Recently';
      const dateMatch = soldDateText.match(/sold\s+on\s+(.+)/i) ||
                       soldDateText.match(/sold\s+(.+)/i) ||
                       soldDateText.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec).+\d{1,2}.+\d{4}/i);

      if (dateMatch) {
        soldDate = dateMatch[1].trim();
      } else {
        // If no explicit date, use current date
        soldDate = new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }

      // Price
      const priceText = card.find('.property-price').text().trim();
      const price = priceText.match(/\$[\d,]+/) ? priceText.match(/\$[\d,]+/)[0] : '';

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

      // Extract property details
      const details = card.find('.property-details').text().trim();

      // Parse beds, baths, sqft
      let beds = 0;
      let baths = 0;
      let sqft = 0;

      const bedsMatch = details.match(/(\d+)\s*bed/i);
      if (bedsMatch) beds = parseInt(bedsMatch[1]);

      const bathsMatch = details.match(/(\d+(?:\.\d+)?)\s*bath/i);
      if (bathsMatch) baths = parseFloat(bathsMatch[1]);

      const sqftMatch = details.match(/(\d+(?:,\d+)?)\s*sq\s*ft/i);
      if (sqftMatch) sqft = parseInt(sqftMatch[1].replace(',', ''));

      // Property type
      const propertyType = details.includes('townhome') || details.includes('town')
        ? 'Townhome'
        : 'Single Family Home';

      // Calculate price per sqft
      const pricePerSqFt = sqft > 0 ? `$${Math.round(parseInt(price.replace(/[$,]/g, '')) / sqft)}` : '';

      // Current year for yearBuilt if not found
      const yearBuilt = details.match(/built\s+in\s+(\d{4})/i)
        ? details.match(/built\s+in\s+(\d{4})/i)[1]
        : new Date().getFullYear().toString();

      // Lot size
      const lotSize = details.match(/([\d.]+)\s*acres/i)
        ? details.match(/([\d.]+)\s*acres/i)[1] + ' acres'
        : '0.15 acres';

      // Extract description or use generic
      const description = card.find('.property-description').text().trim() ||
                         'Beautiful home in the Westview community.';

      // Listed by information
      const listedBy = card.find('.property-agent').text().trim() || 'Stellar Non-Member Agent';
      const company = card.find('.property-company').text().trim() || 'Stellar Non-Member Office';

      // Links
      const detailsLink = card.find('a.property-link').attr('href') || '';
      const galleryLink = detailsLink;

      properties.push({
        id,
        image,
        status: 'sold',
        soldDate,
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
        moreDetailsLink: detailsLink,
        photoGalleryLink: galleryLink
      });
    } catch (err) {
      console.error(`Error parsing sold property ${index}:`, err);
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

    // Convert listings to the format expected by the frontend
    const formattedListings = {
      soldListings: listings
    };

    // Write to file
    await writeFileAsync(filePath, JSON.stringify(formattedListings, null, 2));
    console.log(`Successfully saved ${listings.length} sold listings to ${filePath}`);
    return true;
  } catch (error) {
    console.error('Error saving sold listings to cache:', error);
    throw error;
  }
}

/**
 * Updates timestamps file with new update times
 */
async function updateTimestamps(type, timestamp) {
  try {
    const timestampsPath = path.join(__dirname, '../../db-cache/timestamps.json');

    // Read existing timestamps or create new
    let timestamps = {};
    if (fs.existsSync(timestampsPath)) {
      timestamps = JSON.parse(fs.readFileSync(timestampsPath, 'utf8'));
    }

    // Update the specified timestamp
    timestamps[type] = timestamp;

    // Save the updated timestamps
    await writeFileAsync(timestampsPath, JSON.stringify(timestamps, null, 2));
    console.log(`Updated ${type} timestamp to ${timestamp}`);
    return true;
  } catch (error) {
    console.error('Error updating timestamps:', error);
    throw error;
  }
}

/**
 * Run this function directly when called with Node.js
 * This allows the script to be run from the command line or cron
 */
if (require.main === module) {
  console.log('Running ping-search-engines function directly');

  const mockEvent = { source: 'direct', headers: { 'x-api-key': process.env.UPDATE_API_KEY || '' } };
  const mockContext = { functionName: 'ping-search-engines-direct' };

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
