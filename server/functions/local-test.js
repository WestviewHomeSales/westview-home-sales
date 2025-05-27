/**
 * Local test script for scheduled functions
 */
const path = require('path');

// Set up environment
process.env.UPDATE_API_KEY = 'westview-update-key';

// Import the handlers
const { handler: currentListingsHandler } = require('./scheduled-update');
const { handler: soldListingsHandler } = require('./update-sold-listings');

async function testCurrentListings() {
  console.log('=== TESTING CURRENT LISTINGS FUNCTION ===');
  
  const mockEvent = {
    source: 'aws.events',  // Simulate scheduled execution
    headers: undefined     // Scheduled functions don't have headers
  };
  
  const mockContext = {
    functionName: 'scheduled-update',
    functionVersion: '1.0',
    awsRequestId: 'test-request-123'
  };
  
  try {
    const result = await currentListingsHandler(mockEvent, mockContext);
    console.log('Result:', result);
    return result;
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
}

async function testSoldListings() {
  console.log('\n=== TESTING SOLD LISTINGS FUNCTION ===');
  
  const mockEvent = {
    source: 'aws.events',  // Simulate scheduled execution
    headers: undefined     // Scheduled functions don't have headers
  };
  
  const mockContext = {
    functionName: 'update-sold-listings',
    functionVersion: '1.0',
    awsRequestId: 'test-request-456'
  };
  
  try {
    const result = await soldListingsHandler(mockEvent, mockContext);
    console.log('Result:', result);
    return result;
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
}

async function runTests() {
  const functionToTest = process.argv[2] || 'both';
  
  if (functionToTest === 'current' || functionToTest === 'both') {
    await testCurrentListings();
  }
  
  if (functionToTest === 'sold' || functionToTest === 'both') {
    await testSoldListings();
  }
  
  console.log('\n=== TESTS COMPLETED ===');
}

// Run the tests
runTests().catch(console.error);