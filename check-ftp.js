const ftp = require('basic-ftp');

async function checkFTP() {
  const client = new ftp.Client();
  try {
    await client.access({
      host: 'ftp.westviewhomesales.com',
      user: 'charles@westviewhomesales.com',
      password: '73oVQLTZG9fK$G'
    });
    
    console.log('=== FTP Connection Successful ===');
    await client.cd('public_html');
    console.log('=== Contents of public_html ===');
    const list = await client.list();
    list.forEach(item => {
      console.log(`${item.type === 1 ? 'DIR' : 'FILE'} ${item.name} (${item.size} bytes)`);
    });
    
    // Check if there's an index.html or other entry point
    console.log('\n=== Looking for entry points ===');
    const hasIndexHtml = list.find(item => item.name === 'index.html');
    const hasNextConfig = list.find(item => item.name === 'next.config.js');
    const hasPackageJson = list.find(item => item.name === 'package.json');
    const hasNodeModules = list.find(item => item.name === 'node_modules');
    
    console.log('index.html found:', !!hasIndexHtml);
    console.log('next.config.js found:', !!hasNextConfig);
    console.log('package.json found:', !!hasPackageJson);
    console.log('node_modules found:', !!hasNodeModules);
    
    // Check if we can find any indication of hosting type
    console.log('\n=== Hosting Environment Analysis ===');
    if (hasNextConfig && hasPackageJson && hasNodeModules) {
      console.log('Hosting appears to be: Node.js application deployed');
      console.log('Issue: Likely no Node.js runtime support on this hosting');
    } else if (hasIndexHtml) {
      console.log('Hosting appears to be: Static file hosting');
    } else {
      console.log('Hosting type: Unclear - missing expected files');
    }
    
  } catch (err) {
    console.error('FTP Error:', err.message);
  } finally {
    client.close();
  }
}

checkFTP();