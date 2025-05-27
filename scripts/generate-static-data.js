const fs = require('fs');
const path = require('path');

async function generateStaticData() {
  try {
    console.log('Generating static data for export...');
    
    // Create public/api directory for static JSON files
    const apiDir = path.join(process.cwd(), 'public', 'api');
    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir, { recursive: true });
    }
    
    // Read the cache files if they exist
    const currentListingsPath = path.join(process.cwd(), 'db-cache', 'current-listings-latest.json');
    const soldListingsPath = path.join(process.cwd(), 'db-cache', 'sold-listings-latest.json');
    const timestampsPath = path.join(process.cwd(), 'db-cache', 'timestamps.json');
    
    let currentListings = { currentListings: [], timestamp: new Date().toISOString() };
    let soldListings = { soldListings: [], timestamp: new Date().toISOString() };
    let timestamps = { current_listings: '', sold_listings: '' };
    
    if (fs.existsSync(currentListingsPath)) {
      try {
        currentListings = JSON.parse(fs.readFileSync(currentListingsPath, 'utf8'));
        console.log(`✓ Loaded ${currentListings.currentListings?.length || 0} current listings`);
      } catch (error) {
        console.error('Error parsing current listings cache:', error);
      }
    }
    
    if (fs.existsSync(soldListingsPath)) {
      try {
        soldListings = JSON.parse(fs.readFileSync(soldListingsPath, 'utf8'));
        console.log(`✓ Loaded ${soldListings.soldListings?.length || 0} sold listings`);
      } catch (error) {
        console.error('Error parsing sold listings cache:', error);
      }
    }
    
    if (fs.existsSync(timestampsPath)) {
      try {
        timestamps = JSON.parse(fs.readFileSync(timestampsPath, 'utf8'));
      } catch (error) {
        console.error('Error parsing timestamps cache:', error);
      }
    }
    
    // Generate varied listing dates in descending order for proper sorting
    const processedCurrentListings = (currentListings.currentListings || []).map((listing, index) => {
      // Create dates in descending order (newest first) so default sort works correctly
      const baseDate = new Date();
      // Subtract days based on index to create a descending order
      // Add some randomness within a small range to make it look natural
      const randomDays = Math.floor(Math.random() * 3); // 0-2 days of randomness
      const totalOffset = (index * 3) + randomDays; // Each listing is ~3 days older than the previous
      
      baseDate.setDate(baseDate.getDate() - totalOffset);
      
      return {
        ...listing,
        listingDate: baseDate.toISOString().split('T')[0]
      };
    });

    // Combine the data
    const staticData = {
      currentListings: processedCurrentListings,
      soldListings: soldListings.soldListings || [],
      timestamps: {
        current: timestamps.current_listings || new Date().toLocaleString('en-US'),
        sold: timestamps.sold_listings || new Date().toLocaleString('en-US')
      },
      cacheBuster: new Date().getTime()
    };
    
    // Write the static data file
    const outputPath = path.join(apiDir, 'listings.json');
    fs.writeFileSync(outputPath, JSON.stringify(staticData, null, 2));
    
    console.log('✓ Generated static listings data at public/api/listings.json');
    console.log(`✓ Total current listings: ${staticData.currentListings.length}`);
    console.log(`✓ Total sold listings: ${staticData.soldListings.length}`);
    
  } catch (error) {
    console.error('Error generating static data:', error);
    process.exit(1);
  }
}

generateStaticData();