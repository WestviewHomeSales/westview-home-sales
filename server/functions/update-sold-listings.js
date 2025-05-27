/**
 * GitHub Actions automated function for updating sold property listings
 *
 * This script is designed for GitHub Actions automation and can also be run directly with Node.js:
 * node server/functions/update-sold-listings.js
 *
 * This function fetches sold listings from the specific Homes.com URL for Westview
 * and maintains an append-only approach to sold listings (never removes existing ones)
 */
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const https = require('https');

/**
 * Main function for updating sold listings
 */
async function updateSoldListings() {
  console.log('=== SOLD LISTINGS UPDATE FUNCTION STARTED ===');
  console.log('Started at:', new Date().toISOString());

  try {
    // Fetch new sold property listings from the specific Homes.com URL
    console.log('Fetching sold listings from Homes.com...');
    const newSoldListings = await fetchSoldListings();

    if (!newSoldListings || newSoldListings.length === 0) {
      console.log('No new sold listings found or error in fetching');
      return {
        success: false,
        message: 'No new sold listings found',
        totalListings: 0,
        newListingsAdded: 0
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
        console.log(`Found ${existingSoldListings.length} existing sold listings`);
      } catch (err) {
        console.log('Error reading existing sold listings, starting fresh:', err.message);
      }
    }

    // Merge new and existing listings (append-only approach)
    const existingIds = new Set(existingSoldListings.map(listing => listing.id));
    const mergedListings = [...existingSoldListings];

    // Add only new listings that don't already exist
    let newListingsAdded = 0;
    for (const listing of newSoldListings) {
      if (!existingIds.has(listing.id)) {
        mergedListings.push(listing);
        existingIds.add(listing.id);
        newListingsAdded++;
        console.log(`Added new sold listing: ${listing.address}`);
      }
    }

    // Save the updated listings to cache
    const saveSuccess = await saveListingsToCache(mergedListings, cachePath);
    if (!saveSuccess) {
      throw new Error('Failed to save listings to cache');
    }

    // Safety check: ensure we never lost any listings during update
    if (existingSoldListings.length > 0 && mergedListings.length < existingSoldListings.length) {
      console.error('WARNING: After update, the number of sold listings decreased. This should never happen!');
      console.error(`Previous count: ${existingSoldListings.length}, New count: ${mergedListings.length}`);
      
      // Restore the previous listings and add any genuinely new ones
      const restoredListings = [...existingSoldListings];
      const existingIdsSet = new Set(existingSoldListings.map(listing => listing.id));
      
      for (const listing of newSoldListings) {
        if (!existingIdsSet.has(listing.id)) {
          restoredListings.push(listing);
          newListingsAdded++;
        }
      }
      
      await saveListingsToCache(restoredListings, cachePath);
      console.log(`Restored previous listings and added ${newListingsAdded} new listings`);
      console.log(`Final count: ${restoredListings.length} sold listings`);
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
    const timestampSuccess = await updateTimestamps('sold_listings', timestamp);
    if (!timestampSuccess) {
      console.warn('Failed to update timestamps');
    }

    console.log(`Sold listings updated successfully. Added ${newListingsAdded} new listings.`);
    console.log(`Total sold listings: ${mergedListings.length}`);
    console.log('=== SOLD LISTINGS UPDATE FUNCTION COMPLETED SUCCESSFULLY ===');

    return {
      success: true,
      message: 'Sold listings updated successfully',
      totalListings: mergedListings.length,
      newListingsAdded,
      timestamp
    };

  } catch (error) {
    console.error('=== ERROR IN SOLD LISTINGS UPDATE FUNCTION ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    return {
      success: false,
      message: 'Error in sold listings update function',
      error: error.message
    };
  }
}

/**
 * Fetches sold property listings from the specific Homes.com URL for Westview
 */
async function fetchSoldListings() {
  return new Promise((resolve, reject) => {
    console.log('Fetching sold listings from specific Homes.com URL for Westview...');

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
      'Referer': 'https://www.homes.com/',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none'
    };

    const options = {
      headers: headers,
      timeout: 60000
    };

    // Use the specific Homes.com URL provided by the user
    const url = 'https://www.homes.com/sold/?sk=ktIpHZv3jTy30im3fzhdtCpyRhOqcbf_4OOs0F_GCt4&bb=_pg20o6_6Gk5kglG';
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
          const properties = parseHomesSoldListings(data);
          console.log(`Parsed ${properties.length} sold listings from Homes.com`);
          resolve(properties);
        } catch (error) {
          console.error('Error parsing listings:', error.message);
          reject(error);
        }
      });
    };

    https.get(url, options, handleResponse).on('error', (error) => {
      console.log(`Error fetching from Homes.com: ${error.message}. Returning empty array.`);
      resolve([]);
    }).on('timeout', () => {
      console.log('Request timed out. Returning empty array.');
      resolve([]);
    });
  });
}

/**
 * Parses the HTML from Homes.com to extract sold property listings
 */
function parseHomesSoldListings(html) {
  const $ = cheerio.load(html);
  const properties = [];

  $('.property-card, .sold-card, .homes-sold-property, .sold-listing, [data-testid="property-card"]').each((index, element) => {
    try {
      const card = $(element);

      // Only process sold properties - ensure we only get sold ones
      if (!card.find('.sold-badge, .recently-sold, .sold-marker').length &&
          !card.hasClass('sold-card') &&
          !card.text().toLowerCase().includes('sold') &&
          !card.find('[data-testid="sold-badge"]').length) {
        return;
      }

      // Extract address - critical for creating unique ID
      const address = card.find('.property-address, .listing-address, [data-testid="property-address"]').text().trim();
      if (!address) {
        return;
      }

      // Generate consistent ID from address
      const id = `sold-${address.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

      // Image
      const image = card.find('.property-image img, .listing-image img, [data-testid="property-image"] img').attr('src') || '';

      // Sale information - try to extract actual sold date
      const soldDateText = card.find('.sold-date, .property-date, [data-testid="sold-date"]').text().trim() ||
                          card.text().match(/sold\s+(?:on\s+)?([a-z]{3,}\s+\d{1,2},?\s+\d{4})/i)?.[1];

      // Extract date - format may vary, but try to get a clean date
      let soldDate = 'Recently';
      const dateMatch = soldDateText?.match(/sold\s+on\s+(.+)/i) ||
                       soldDateText?.match(/sold\s+(.+)/i) ||
                       soldDateText?.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec).+\d{1,2}.+\d{4}/i);

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
      const priceText = card.find('.property-price, .listing-price, [data-testid="property-price"]').text().trim();
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
      const details = card.find('.property-details, .listing-details, [data-testid="property-details"]').text().trim();

      // Parse beds, baths, sqft
      let beds = 0;
      let baths = 0;
      let sqft = 0;

      const bedsMatch = details.match(/(\d+)\s*bed/i) ||
                       card.find('.property-beds, .listing-beds, [data-testid="property-beds"]').text().match(/(\d+)/);
      if (bedsMatch) beds = parseInt(bedsMatch[1]);

      const bathsMatch = details.match(/(\d+(?:\.\d+)?)\s*bath/i) ||
                        card.find('.property-baths, .listing-baths, [data-testid="property-baths"]').text().match(/(\d+(?:\.\d+)?)/);
      if (bathsMatch) baths = parseFloat(bathsMatch[1]);

      const sqftMatch = details.match(/(\d+(?:,\d+)?)\s*sq\s*ft/i) ||
                       card.find('.property-sqft, .listing-sqft, [data-testid="property-sqft"]').text().match(/(\d+(?:,\d+)?)/);
      if (sqftMatch) sqft = parseInt(sqftMatch[1].replace(',', ''));

      // Property type
      const propertyType = (details.toLowerCase().includes('townhome') ||
                          details.toLowerCase().includes('town home') ||
                          card.find('.property-type, [data-testid="property-type"]').text().toLowerCase().includes('townhome'))
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
      const description = card.find('.property-description, .listing-description').text().trim() ||
                         'Beautiful home in the Westview community.';

      // Listed by information
      const listedBy = card.find('.property-agent, .listing-agent').text().trim() || 'Stellar Non-Member Agent';
      const company = card.find('.property-company, .listing-company').text().trim() || 'Stellar Non-Member Office';

      // Links
      const detailsLink = card.find('a.property-link, a.listing-link').attr('href') ||
                         card.find('a').attr('href') || '';
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
      // Ignore parse errors for individual cards
    }
  });

  return properties;
}

/**
 * Saves property listings to the cache file with improved error handling
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
        // Ignore backup errors
      }
    }

    // Convert listings to the format expected by the frontend
    const formattedListings = {
      soldListings: listings
    };

    // Write the data
    fs.writeFileSync(filePath, JSON.stringify(formattedListings, null, 2), 'utf8');

    // Verify write success
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        JSON.parse(content);
      } catch (err) {
        return false;
      }
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

/**
 * Updates timestamps file with new update times and improved error handling
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
        timestamps = {};
      }
    }

    // Update the specified timestamp
    timestamps[type] = timestamp;

    // Save the updated timestamps using direct fs
    fs.writeFileSync(timestampsPath, JSON.stringify(timestamps, null, 2), 'utf8');

    // Verify write success
    if (fs.existsSync(timestampsPath)) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

/**
 * Exported handler for GitHub Actions or other automation
 */
exports.handler = async () => {
  const result = await updateSoldListings();
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
 * This allows the script to be run from the command line or cron
 */
if (require.main === module) {
  console.log('Running update-sold-listings function directly');

  updateSoldListings()
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