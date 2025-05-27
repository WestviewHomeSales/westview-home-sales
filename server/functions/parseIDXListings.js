/**
 * Parses the HTML from IDX Broker to extract property listings
 * Updated to use current IDX Broker HTML structure
 */
function parseIDXListings(html) {
  const cheerio = require('cheerio');
  const $ = cheerio.load(html);
  const properties = [];

  console.log('Parsing IDX Broker HTML for current listings...');

  // Find property cards on the IDX page - use current IDX Broker structure
  $('.IDX-resultsCell').each((index, element) => {
    try {
      const card = $(element);

      // Skip if this is not an active listing (e.g., sold, pending)
      const statusText = card.find('.IDX-field-propStatus .IDX-resultsText').text().toLowerCase();
      if (statusText.includes('sold') || statusText.includes('pending')) {
        console.log(`Skipping non-active property with status: ${statusText}`);
        return;
      }

      // Extract ID from data attributes
      let id = card.attr('data-listingid') || card.attr('data-idxid');

      // Fallback if no ID found
      if (!id) {
        const idMatch = card.find('a[href*="details"]').attr('href')?.match(/listing\/[^\/]+\/([^\/]+)/);
        id = idMatch ? idMatch[1] : `idx-${Date.now()}-${index}`;
      }

      console.log(`Processing property with ID: ${id}`);

      // Get the image from noscript or img tags
      let image = card.find('.IDX-resultsPhotoImg').attr('src') ||
                  card.find('.IDX-loadImage').attr('data-src') ||
                  card.find('img').attr('src') || '';

      // Extract price
      const priceText = card.find('.IDX-field-listingPrice .IDX-text').text().trim();
      const price = priceText.match(/\$[\d,]+/) ? priceText.match(/\$[\d,]+/)[0] : '';

      // Extract address components
      const addressNum = card.find('.IDX-resultsAddressNumber').text().trim();
      const addressName = card.find('.IDX-resultsAddressName').text().trim();
      const addressCity = card.find('.IDX-resultsAddressCity').text().trim();
      const addressState = card.find('.IDX-resultsAddressStateAbrv').text().trim();
      
      const address = `${addressNum} ${addressName}`.trim();

      // Parse address components
      let street = address;
      let city = addressCity || 'Kissimmee';
      let state = addressState || 'FL';
      let zip = '34758';

      // Parse beds, baths, sqft from IDX structure
      let beds = 0;
      let baths = 0;
      let sqft = 0;

      // Get bedrooms
      const bedsText = card.find('.IDX-field-bedrooms .IDX-resultsText').text().trim();
      if (bedsText) beds = parseInt(bedsText) || 0;

      // Get total baths
      const bathsText = card.find('.IDX-field-totalBaths .IDX-resultsText').text().trim();
      if (bathsText) baths = parseFloat(bathsText) || 0;

      // Get square footage
      const sqftText = card.find('.IDX-field-sqFt .IDX-text').text().trim().replace(/,/g, '');
      if (sqftText) sqft = parseInt(sqftText) || 0;

      // Get subdivision/community
      const subdivision = card.find('.IDX-field-subdivision .IDX-resultsText').text().trim();

      // Property type - determine from subdivision or default to Single Family Home
      const propertyType = (subdivision.toLowerCase().includes('townhome') ||
                          subdivision.toLowerCase().includes('town home')) 
        ? 'Townhome'
        : 'Single Family Home';

      // Calculate price per sqft
      const pricePerSqFt = sqft > 0 ? `$${Math.round(parseInt(price.replace(/[$,]/g, '')) / sqft)}` : '';

      // Extract description
      const description = card.find('.IDX-resultsDescription').text().trim() ||
                         'Under Construction. Beautiful new home in the Westview community.';

      // Listed by information - default to builder based on subdivision
      let listedBy = 'Borchini Realty';
      let company = 'BORCHINI REALTY';
      
      if (subdivision.includes('Lennar') || description.toLowerCase().includes('lennar')) {
        listedBy = 'Lennar';
        company = 'LENNAR REALTY';
      } else if (subdivision.includes('Taylor') || description.toLowerCase().includes('taylor')) {
        listedBy = 'Taylor Morrison';
        company = 'TAYLOR MORRISON REALTY OF FLORIDA INC';
      }

      // Links
      const detailsLink = card.find('a[href*="details"]').attr('href') || '';
      const galleryLink = card.find('a[href*="photogallery"]').attr('href') || detailsLink;

      // Current date for listing date
      const listingDate = new Date().toISOString().split('T')[0];

      // Year built - try to extract from description or default to 2024
      let yearBuilt = '2024';
      const yearBuiltMatch = description.match(/built\s*in\s*(20\d{2})/i) ||
                           description.match(/year\s*built[:\s]*(20\d{2})/i) ||
                           description.match(/completed\s*in\s*(20\d{2})/i);

      if (yearBuiltMatch) yearBuilt = yearBuiltMatch[1];

      // Acres
      const acresText = card.find('.IDX-field-acres .IDX-text').text().trim();
      const lotSize = acresText ? `${acresText} acres` : '0.14 acres';

      // Add the property to our list
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
        moreDetailsLink: detailsLink,
        photoGalleryLink: galleryLink,
        listingDate
      });

      console.log(`Successfully parsed property: ${address} - ${price}`);
    } catch (err) {
      console.error(`Error parsing property ${index}:`, err);
    }
  });

  console.log(`Found a total of ${properties.length} active properties`);
  return properties;
}

module.exports = { parseIDXListings };