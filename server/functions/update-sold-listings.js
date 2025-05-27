/**
 * update-sold-listings.js
 *
 * Fetches new sold listings and appends them to existing sold listings data
 * without removing any historical entries.
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { parseIDXListings } = require('./parseIDXListings');

// Configuration
const SOLD_LISTINGS_URL = 'https://www.homes.com/sold/?sk=ktIpHZv3jTy30im3fzhdtCpyRhOqcbf_4OOs0F_GCt4&bb=_pg20o6_6Gk5kglG';
const DB_CACHE_DIR = path.join(__dirname, '../../db-cache');
const SOLD_LISTINGS_FILE = path.join(DB_CACHE_DIR, 'sold-listings-latest.json');
const TIMESTAMPS_FILE = path.join(DB_CACHE_DIR, 'timestamps.json');

/**
 * Updates the timestamp for when sold listings were last updated
 */
function updateTimestamp() {
  try {
    // Read existing timestamps
    let timestamps = {};
    try {
      if (fs.existsSync(TIMESTAMPS_FILE)) {
        timestamps = JSON.parse(fs.readFileSync(TIMESTAMPS_FILE));
      }
    } catch (error) {
      console.log('No existing timestamps file found, creating new one');
    }

    // Update the sold timestamp
    const now = new Date();
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    };

    timestamps.sold = now.toLocaleDateString('en-US', options);

    // Write updated timestamps
    fs.writeFileSync(TIMESTAMPS_FILE, JSON.stringify(timestamps, null, 2));
    console.log(`Updated sold listings timestamp to ${timestamps.sold}`);
  } catch (error) {
    console.error('Error updating timestamp:', error);
  }
}

/**
 * Fetches sold listings from Homes.com
 * This function would need to be implemented based on the Homes.com site structure
 */
async function fetchSoldListings() {
  try {
    console.log(`Fetching sold listings from ${SOLD_LISTINGS_URL}`);
    const response = await fetch(SOLD_LISTINGS_URL);

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`Received ${html.length} bytes of HTML`);

    // Using cheerio to parse the HTML
    const $ = cheerio.load(html);

    // Extract sold listings (actual implementation would depend on Homes.com structure)
    const soldListings = [];

    // Example: finding property cards and extracting data
    $('.for-sale-card').each((index, element) => {
      try {
        // This is a placeholder - actual selectors would need to match Homes.com structure
        const address = $(element).find('.address').text().trim();
        const price = $(element).find('.price').text().trim();
        const soldDate = $(element).find('.sold-date').text().trim();
        const beds = parseInt($(element).find('.beds').text().trim(), 10);
        const baths = parseInt($(element).find('.baths').text().trim(), 10);
        const sqft = parseInt($(element).find('.sqft').text().replace(/[^0-9]/g, ''), 10);
        const image = $(element).find('img').attr('src');

        // Generate a unique ID for this listing
        const id = `sold-${address.replace(/\W+/g, '-').toLowerCase()}`;

        soldListings.push({
          id,
          image,
          status: 'sold',
          soldDate,
          propertyType: 'Single Family Home',
          price,
          address,
          city: 'Kissimmee',
          state: 'FL',
          zip: '34758',
          beds,
          baths,
          sqft,
          pricePerSqFt: `$${Math.round(parseInt(price.replace(/[^0-9]/g, ''), 10) / sqft)}`,
          yearBuilt: '2024',  // This might need to be extracted from the page
          lotSize: '0.15 acres',  // This might need to be extracted from the page
          description: `Beautiful ${beds}-bedroom home in Westview community.`,
          listedBy: 'Westview Homes',
          company: 'Westview Realty',
          moreDetailsLink: $(element).find('a').attr('href'),
          photoGalleryLink: $(element).find('a').attr('href')
        });
      } catch (error) {
        console.error(`Error parsing listing ${index}:`, error);
      }
    });

    console.log(`Extracted ${soldListings.length} sold listings`);
    return soldListings;
  } catch (error) {
    console.error('Error fetching sold listings:', error);
    return [];
  }
}

/**
 * Updates sold listings by adding new ones while preserving existing ones
 */
async function updateSoldListings() {
  try {
    // Create DB cache directory if it doesn't exist
    if (!fs.existsSync(DB_CACHE_DIR)) {
      fs.mkdirSync(DB_CACHE_DIR, { recursive: true });
    }

    // Read existing sold listings
    let existingSoldListings = [];
    try {
      if (fs.existsSync(SOLD_LISTINGS_FILE)) {
        existingSoldListings = JSON.parse(fs.readFileSync(SOLD_LISTINGS_FILE));
        console.log(`Read ${existingSoldListings.length} existing sold listings`);
      }
    } catch (error) {
      console.log('No existing sold listings file found, creating new one');
    }

    // Fetch new sold listings
    const newSoldListings = await fetchSoldListings();

    if (newSoldListings.length === 0) {
      console.log('No new sold listings found, keeping existing data');
      return;
    }

    // Create map of existing listings by ID to avoid duplicates
    const existingListingsMap = new Map();
    existingSoldListings.forEach(listing => {
      existingListingsMap.set(listing.id, listing);
    });

    // Add new listings (avoiding duplicates)
    let addedCount = 0;
    newSoldListings.forEach(newListing => {
      if (!existingListingsMap.has(newListing.id)) {
        existingSoldListings.push(newListing);
        addedCount++;
      }
    });

    // Sort by sold date (newest first)
    existingSoldListings.sort((a, b) => {
      const dateA = new Date(a.soldDate);
      const dateB = new Date(b.soldDate);
      return dateB - dateA;
    });

    // Save combined listings
    fs.writeFileSync(SOLD_LISTINGS_FILE, JSON.stringify(existingSoldListings, null, 2));
    console.log(`Added ${addedCount} new sold listings, total is now ${existingSoldListings.length}`);

    // Update timestamp
    updateTimestamp();

    console.log('Sold listings update completed successfully');
  } catch (error) {
    console.error('Error updating sold listings:', error);
  }
}

// Execute the update function if run directly
if (require.main === module) {
  updateSoldListings()
    .then(() => console.log('Update sold listings process completed'))
    .catch(err => console.error('Update sold listings process failed:', err));
}

module.exports = { updateSoldListings };
