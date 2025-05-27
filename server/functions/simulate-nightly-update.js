/**
 * Script to simulate a nightly update without fetching new data
 * This will update timestamps to simulate a fresh update
 */
const fs = require('fs');
const path = require('path');

// Get cache directory
function getCacheDirectory() {
  return path.join(__dirname, '../../db-cache');
}

// Update timestamps
async function updateTimestamps() {
  try {
    const timestampsPath = path.join(getCacheDirectory(), 'timestamps.json');
    console.log(`Updating timestamps at: ${timestampsPath}`);

    // Ensure the directory exists
    const dir = path.dirname(timestampsPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Generate current timestamp in Eastern Time
    const currentDate = new Date();
    const timestamp = currentDate.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }) + ' ET';

    // Generate a sold timestamp (pretend it was updated yesterday)
    const yesterdayDate = new Date(currentDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const soldTimestamp = yesterdayDate.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }) + ' ET';

    // Create the timestamps object
    const timestamps = {
      current_listings: timestamp,
      sold_listings: soldTimestamp
    };

    console.log(`New timestamps: ${JSON.stringify(timestamps, null, 2)}`);

    // Save the updated timestamps
    fs.writeFileSync(timestampsPath, JSON.stringify(timestamps, null, 2), 'utf8');

    // Verify write success
    if (fs.existsSync(timestampsPath)) {
      const content = fs.readFileSync(timestampsPath, 'utf8');
      console.log(`Timestamp file updated successfully: ${content}`);
      return true;
    } else {
      throw new Error(`Timestamp file not created: ${timestampsPath}`);
    }
  } catch (error) {
    console.error('Error updating timestamps:', error);
    return false;
  }
}

// Update the client-side fallback timestamps file
async function updateClientTimestamps() {
  try {
    const filePath = path.join(__dirname, '../../src/data/update-timestamps.ts');
    console.log(`Updating client-side timestamps at: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.error(`Client timestamps file not found: ${filePath}`);
      return false;
    }

    // Generate current timestamp in Eastern Time
    const currentDate = new Date();
    const timestamp = currentDate.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }) + ' ET';

    // Generate a sold timestamp (pretend it was updated yesterday)
    const yesterdayDate = new Date(currentDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const soldTimestamp = yesterdayDate.toLocaleString('en-US', {
      timeZone: 'America/New_York',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }) + ' ET';

    // Read the current file
    let content = fs.readFileSync(filePath, 'utf8');

    // Update the timestamps
    content = content.replace(
      /const DEFAULT_TIMESTAMPS = \{[\s\S]*?\};/m,
      `const DEFAULT_TIMESTAMPS = {\n  current_listings: "${timestamp}",\n  sold_listings: "${soldTimestamp}",\n};`
    );

    // Write the updated content
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Client-side timestamps updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating client-side timestamps:', error);
    return false;
  }
}

// Main function to run the simulation
async function runSimulation() {
  console.log('=== SIMULATING NIGHTLY UPDATE PROCESS ===');
  console.log('Starting time:', new Date().toISOString());

  try {
    // Update server-side timestamps
    console.log('\n=== STEP 1: UPDATING SERVER-SIDE TIMESTAMPS ===');
    const timestampResult = await updateTimestamps();

    // Update client-side timestamps
    console.log('\n=== STEP 2: UPDATING CLIENT-SIDE TIMESTAMPS ===');
    const clientTimestampResult = await updateClientTimestamps();

    console.log('\n=== NIGHTLY UPDATE SIMULATION COMPLETED ===');
    console.log('Ending time:', new Date().toISOString());
    console.log('Simulation successful:', timestampResult && clientTimestampResult);

    return {
      serverTimestampsUpdated: timestampResult,
      clientTimestampsUpdated: clientTimestampResult
    };
  } catch (error) {
    console.error('=== ERROR IN SIMULATION PROCESS ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return {
      serverTimestampsUpdated: false,
      clientTimestampsUpdated: false,
      error: error.message
    };
  }
}

// Run the simulation
runSimulation()
  .then(results => {
    console.log('Simulation results:', results);
    process.exit(0);
  })
  .catch(error => {
    console.error('Simulation failed with error:', error);
    process.exit(1);
  });
