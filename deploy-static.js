const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

async function deployStatic() {
  const client = new ftp.Client();
  
  try {
    console.log('🚀 Starting static deployment to FTP server...');
    
    // Connect to FTP server
    await client.access({
      host: 'ftp.westviewhomesales.com',
      user: 'charles@westviewhomesales.com',
      password: '73oVQLTZG9fK$G'
    });
    
    console.log('✅ Connected to FTP server');
    
    // Navigate to public_html
    await client.cd('public_html');
    console.log('📁 Navigating to public_html directory');
    
    // Clear existing files first (except for any config files we want to keep)
    console.log('🧹 Cleaning existing files...');
    const existingFiles = await client.list();
    
    for (const item of existingFiles) {
      try {
        if (item.type === 1) { // Directory
          console.log(`🗂️  Removing directory: ${item.name}`);
          await client.removeDir(item.name);
        } else { // File
          console.log(`🗑️  Removing file: ${item.name}`);
          await client.remove(item.name);
        }
      } catch (error) {
        console.log(`⚠️  Could not remove ${item.name}: ${error.message}`);
      }
    }
    
    // Upload the entire out directory
    console.log('📤 Uploading static files...');
    
    const outDir = path.join(process.cwd(), 'out');
    if (!fs.existsSync(outDir)) {
      throw new Error('Out directory not found. Please run "bun run build" first.');
    }
    
    // Upload directory recursively
    await client.uploadFromDir(outDir);
    
    console.log('✅ Static deployment completed successfully!');
    console.log('🌐 Website should be available at: https://WestviewHomeSales.com');
    
    // Verify upload by listing some files
    console.log('\n📋 Verifying deployment...');
    const uploadedFiles = await client.list();
    console.log(`✅ Found ${uploadedFiles.length} items in public_html`);
    
    // Check for key files
    const indexExists = uploadedFiles.find(f => f.name === 'index.html');
    const apiExists = uploadedFiles.find(f => f.name === 'api');
    const nextExists = uploadedFiles.find(f => f.name === '_next');
    
    console.log(`✅ index.html: ${indexExists ? 'Found' : 'Missing'}`);
    console.log(`✅ api directory: ${apiExists ? 'Found' : 'Missing'}`);
    console.log(`✅ _next directory: ${nextExists ? 'Found' : 'Missing'}`);
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  } finally {
    client.close();
  }
}

deployStatic();