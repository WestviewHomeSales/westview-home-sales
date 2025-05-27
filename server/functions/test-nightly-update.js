/**
 * Test script to simulate the nightly update process
 * This script will invoke both scheduled functions in sequence to update
 * current listings and sold listings
 */
const { handler: updateCurrentListings } = require('./scheduled-update');
const { handler: updateSoldListings } = require('./update-sold-listings');

// Environment for testing
process.env.UPDATE_API_KEY = 'westview-update-key';

/**
 * Main function to run the test
 */
async function runTest() {
  console.log('=== TESTING NIGHTLY UPDATE PROCESS ===');
  console.log('Starting time:', new Date().toISOString());

  try {
    // Create a mock event and context for testing
    const mockEvent = {
      source: 'test',
      isScheduled: true,
      headers: {
        'x-api-key': process.env.UPDATE_API_KEY
      }
    };

    const mockContext = {
      functionName: 'test-nightly-update',
      functionVersion: '1.0',
      awsRequestId: 'test-request-id'
    };

    // Step 1: Update current listings
    console.log('\n=== STEP 1: UPDATING CURRENT LISTINGS ===');
    const currentListingsResult = await updateCurrentListings(mockEvent, mockContext);
    console.log('Current listings update result:', currentListingsResult);

    // Step 2: Update sold listings
    console.log('\n=== STEP 2: UPDATING SOLD LISTINGS ===');
    const soldListingsResult = await updateSoldListings(mockEvent, mockContext);
    console.log('Sold listings update result:', soldListingsResult);

    console.log('\n=== NIGHTLY UPDATE PROCESS COMPLETED ===');
    console.log('Ending time:', new Date().toISOString());
    console.log('Total duration:', (new Date() - testStartTime) / 1000, 'seconds');

    return {
      currentListings: JSON.parse(currentListingsResult.body),
      soldListings: JSON.parse(soldListingsResult.body)
    };
  } catch (error) {
    console.error('=== ERROR IN TEST PROCESS ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
}

// Start time for tracking duration
const testStartTime = new Date();

// Run the test
runTest()
  .then(results => {
    console.log('Test completed successfully with results:', results);
    process.exit(0);
  })
  .catch(error => {
    console.error('Test failed with error:', error);
    process.exit(1);
  });
