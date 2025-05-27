#!/usr/bin/env node

/**
 * Westview Home Sales - Function Runner
 *
 * This script allows manually running any of the server functions
 * Usage: node server/setup/run-function.js [function-name]
 *
 * Examples:
 *   node server/setup/run-function.js scheduled-update
 *   node server/setup/run-function.js update-sold-listings
 */

const fs = require('fs');
const path = require('path');
const { fork } = require('child_process');

// Available functions to run
const AVAILABLE_FUNCTIONS = [
  {
    name: 'scheduled-update',
    description: 'Updates property listings data from IDX Broker',
    path: '../functions/scheduled-update.js'
  },
  {
    name: 'update-sold-listings',
    description: 'Updates sold property listings',
    path: '../functions/update-sold-listings.js'
  },
  {
    name: 'update-sales-data',
    description: 'Updates historical sales data',
    path: '../functions/update-sales-data.js'
  },
  {
    name: 'ping-search-engines',
    description: 'Pings search engines to recrawl the site',
    path: '../functions/ping-search-engines.js'
  },
  {
    name: 'send-email',
    description: 'Tests the email sending functionality',
    path: '../functions/send-email.js'
  },
  {
    name: 'simulate-update',
    description: 'Simulates a data update without fetching external data',
    path: '../functions/simulate-nightly-update.js'
  }
];

// Create logs directory if it doesn't exist
const logDir = path.resolve(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
  console.log(`Created logs directory: ${logDir}`);
}

// Main function
function main() {
  console.log('\n=== Westview Home Sales - Function Runner ===\n');

  // Get function name from command line arguments
  const functionName = process.argv[2];

  if (!functionName) {
    console.log('Available functions:');
    AVAILABLE_FUNCTIONS.forEach(func => {
      console.log(`  ${func.name.padEnd(20)} - ${func.description}`);
    });
    console.log('\nUsage: node server/setup/run-function.js [function-name]');
    process.exit(0);
  }

  // Find the function
  const functionToRun = AVAILABLE_FUNCTIONS.find(f => f.name === functionName);

  if (!functionToRun) {
    console.error(`Error: Function "${functionName}" not found.`);
    console.log('Available functions:');
    AVAILABLE_FUNCTIONS.forEach(func => {
      console.log(`  ${func.name}`);
    });
    process.exit(1);
  }

  // Create log file path
  const logFile = path.join(logDir, `${functionName}.log`);
  const logStream = fs.createWriteStream(logFile, { flags: 'a' });

  // Log header
  const timestamp = new Date().toISOString();
  const logHeader = `\n=== MANUAL EXECUTION: ${timestamp} ===\n`;
  logStream.write(logHeader);
  console.log(logHeader);

  // Function path
  const functionPath = path.resolve(__dirname, functionToRun.path);
  console.log(`Running function: ${functionName}`);
  console.log(`Path: ${functionPath}`);
  console.log(`Logging to: ${logFile}`);

  try {
    // Check if file exists
    if (!fs.existsSync(functionPath)) {
      throw new Error(`Function file not found: ${functionPath}`);
    }

    // Fork the process to run the function
    const functionProcess = fork(functionPath, [], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    });

    // Handle stdout
    functionProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      logStream.write(output);
    });

    // Handle stderr
    functionProcess.stderr.on('data', (data) => {
      const output = data.toString();
      console.error(output);
      logStream.write(`ERROR: ${output}`);
    });

    // Handle process exit
    functionProcess.on('exit', (code) => {
      const exitMessage = `\n=== FUNCTION COMPLETED WITH CODE ${code} ===\n`;
      console.log(exitMessage);
      logStream.write(exitMessage);
      logStream.end();
    });

    // Handle errors
    functionProcess.on('error', (err) => {
      const errorMessage = `\n=== ERROR RUNNING FUNCTION: ${err.message} ===\n`;
      console.error(errorMessage);
      logStream.write(errorMessage);
      logStream.end();
      process.exit(1);
    });
  } catch (error) {
    const errorMessage = `\n=== ERROR: ${error.message} ===\n`;
    console.error(errorMessage);
    logStream.write(errorMessage);
    logStream.end();
    process.exit(1);
  }
}

// Run the main function
main();
