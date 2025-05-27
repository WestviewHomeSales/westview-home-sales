const ftp = require('basic-ftp');
const fs = require('fs');

async function deployWebsite() {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    console.log('Connecting to FTP server...');
    await client.access({
      host: 'ftp.westviewhomesales.com',
      user: 'charles@westviewhomesales.com',
      password: '73oVQLTZG9fK$G',
      secure: false,
    });

    console.log('✓ Connected successfully!');

    // Navigate to public_html directory
    console.log('Navigating to public_html directory...');
    try {
      await client.cd('public_html');
      console.log('✓ In public_html directory');
    } catch (error) {
      console.error('Failed to navigate to public_html:', error.message);
      throw error;
    }

    // Clear existing contents first
    console.log('Clearing existing contents...');
    try {
      const list = await client.list();
      console.log(`Found ${list.length} items to potentially remove`);
      for (const item of list) {
        if (item.isFile) {
          console.log(`Removing file: ${item.name}`);
          await client.remove(item.name);
        } else if (item.isDirectory && item.name !== '.' && item.name !== '..') {
          console.log(`Removing directory: ${item.name}`);
          await client.removeDir(item.name);
        }
      }
      console.log('✓ Existing contents cleared');
    } catch (error) {
      console.log('Note: Could not clear some files (might not exist):', error.message);
    }

    // Upload .next directory (built application)
    console.log('Uploading .next directory...');
    if (fs.existsSync('.next')) {
      await client.uploadFromDir('.next', '.next');
      console.log('✓ .next directory uploaded');
    } else {
      console.log('⚠ .next directory not found - please run "bun run build" first');
    }

    // Upload public directory (static assets)
    console.log('Uploading public directory...');
    if (fs.existsSync('public')) {
      await client.uploadFromDir('public', 'public');
      console.log('✓ public directory uploaded');
    }

    // Upload db-cache directory (data files)
    console.log('Uploading db-cache directory...');
    if (fs.existsSync('db-cache')) {
      await client.uploadFromDir('db-cache', 'db-cache');
      console.log('✓ db-cache directory uploaded');
    }

    // Upload server directory (server functions)
    console.log('Uploading server directory...');
    if (fs.existsSync('server')) {
      await client.uploadFromDir('server', 'server');
      console.log('✓ server directory uploaded');
    }

    // Upload src directory (source code)
    console.log('Uploading src directory...');
    if (fs.existsSync('src')) {
      await client.uploadFromDir('src', 'src');
      console.log('✓ src directory uploaded');
    }

    // Upload configuration files
    console.log('Uploading configuration files...');
    const configFiles = [
      'package.json',
      'next.config.js',
      '.env.local',
      'tsconfig.json',
      'tailwind.config.ts',
      'postcss.config.mjs',
      'components.json',
      'biome.json',
      'eslint.config.mjs',
      'next-env.d.ts',
      'bun.lock'
    ];

    for (const file of configFiles) {
      if (fs.existsSync(file)) {
        console.log(`Uploading ${file}...`);
        await client.uploadFrom(file, file);
        console.log(`✓ ${file} uploaded`);
      } else {
        console.log(`⚠ ${file} not found, skipping`);
      }
    }

    // Upload documentation files
    console.log('Uploading documentation files...');
    const docFiles = [
      'README.md',
      'deployment-checklist.md',
      'server-setup-guide.md',
      'cron-job-setup-guide.md',
      'contact-form-setup.md',
      'deployment-config.md'
    ];

    for (const file of docFiles) {
      if (fs.existsSync(file)) {
        console.log(`Uploading ${file}...`);
        await client.uploadFrom(file, file);
        console.log(`✓ ${file} uploaded`);
      }
    }

    // Upload .same directory if it exists
    if (fs.existsSync('.same')) {
      console.log('Uploading .same directory...');
      await client.uploadFromDir('.same', '.same');
      console.log('✓ .same directory uploaded');
    }

    console.log('\n🎉 Deployment completed successfully!');
    console.log('Your website is now live at: https://WestviewHomeSales.com');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    throw error;
  } finally {
    client.close();
  }
}

// Run the deployment
deployWebsite().catch(console.error);