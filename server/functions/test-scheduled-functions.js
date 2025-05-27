/**
 * Test function to manually trigger scheduled functions for debugging
 */
const { handler: currentListingsHandler } = require('./scheduled-update');
const { handler: soldListingsHandler } = require('./update-sold-listings');

exports.handler = async (event, context) => {
  console.log('=== MANUAL TEST OF SCHEDULED FUNCTIONS ===');
  console.log('Test triggered at:', new Date().toISOString());
  
  const functionType = event.queryStringParameters?.function || 'both';
  const results = {};
  
  try {
    if (functionType === 'current' || functionType === 'both') {
      console.log('\n--- Testing Current Listings Function ---');
      
      // Create a test event that simulates manual invocation
      const testEvent = {
        headers: {
          'x-api-key': process.env.UPDATE_API_KEY
        },
        source: 'manual-test'
      };
      
      const currentResult = await currentListingsHandler(testEvent, context);
      results.currentListings = {
        statusCode: currentResult.statusCode,
        success: currentResult.statusCode === 200,
        response: JSON.parse(currentResult.body)
      };
      
      console.log('Current listings result:', results.currentListings);
    }
    
    if (functionType === 'sold' || functionType === 'both') {
      console.log('\n--- Testing Sold Listings Function ---');
      
      // Create a test event that simulates manual invocation
      const testEvent = {
        headers: {
          'x-api-key': process.env.UPDATE_API_KEY
        },
        source: 'manual-test'
      };
      
      const soldResult = await soldListingsHandler(testEvent, context);
      results.soldListings = {
        statusCode: soldResult.statusCode,
        success: soldResult.statusCode === 200,
        response: JSON.parse(soldResult.body)
      };
      
      console.log('Sold listings result:', results.soldListings);
    }
    
    console.log('\n=== TEST COMPLETED ===');
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Test completed',
        timestamp: new Date().toISOString(),
        functionType,
        results
      }, null, 2)
    };
    
  } catch (error) {
    console.error('Test failed:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Test failed',
        error: error.message,
        timestamp: new Date().toISOString(),
        functionType,
        results
      }, null, 2)
    };
  }
};