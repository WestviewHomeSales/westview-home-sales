const https = require('https');
const { parseIDXListings } = require('./parseIDXListings');

async function testParser() {
  console.log('Testing parseIDXListings function...');
  
  // Fetch the HTML
  const html = await new Promise((resolve, reject) => {
    https.get('https://borchinirealty.idxbroker.com/i/westview', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
  
  console.log(`Fetched ${html.length} bytes of HTML`);
  
  // Parse it
  const properties = parseIDXListings(html);
  
  console.log(`Parsed ${properties.length} properties`);
  
  // Show first property details
  if (properties.length > 0) {
    console.log('First property:', JSON.stringify(properties[0], null, 2));
  }
  
  return properties;
}

testParser().catch(console.error);