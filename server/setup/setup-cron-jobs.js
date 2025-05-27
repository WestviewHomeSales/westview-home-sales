#!/usr/bin/env node

/**
 * Westview Home Sales - Cron Job Setup Script
 *
 * This script helps set up cron jobs for automatic data updates
 * Run with: node server/setup/setup-cron-jobs.js
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const readline = require('readline');

// Configuration for cron jobs
const CRON_JOBS = [
  {
    name: 'Daily Property Update',
    description: 'Updates property listings data from IDX Broker',
    cronSchedule: '0 2 * * *', // Run at 2:00 AM every day
    scriptPath: 'server/functions/scheduled-update.js',
    enabled: true
  },
  {
    name: 'Daily Sold Listings Update',
    description: 'Updates sold property listings',
    cronSchedule: '0 3 * * *', // Run at 3:00 AM every day
    scriptPath: 'server/functions/update-sold-listings.js',
    enabled: true
  },
  {
    name: 'Daily Sales Data Update',
    description: 'Updates historical sales data',
    cronSchedule: '0 4 * * *', // Run at 4:00 AM every day
    scriptPath: 'server/functions/update-sales-data.js',
    enabled: true
  },
  {
    name: 'Weekly Search Engine Ping',
    description: 'Pings search engines to recrawl the site',
    cronSchedule: '0 5 * * 1', // Run at 5:00 AM every Monday
    scriptPath: 'server/functions/ping-search-engines.js',
    enabled: true
  }
];

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Checks if cron is installed on the system
 */
function checkCronInstalled() {
  try {
    execSync('which crontab');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Gets the absolute path for a script
 */
function getAbsolutePath(relativePath) {
  return path.resolve(process.cwd(), relativePath);
}

/**
 * Formats a cron job entry
 */
function formatCronJob(cronSchedule, scriptPath, logFile = null) {
  const nodePath = execSync('which node').toString().trim();
  const absoluteScriptPath = getAbsolutePath(scriptPath);
  const logRedirect = logFile ? `>> ${logFile} 2>&1` : '>/dev/null 2>&1';

  return `${cronSchedule} ${nodePath} ${absoluteScriptPath} ${logRedirect}`;
}

/**
 * Gets the current user's crontab
 */
function getCurrentCrontab() {
  try {
    return execSync('crontab -l').toString();
  } catch (error) {
    // If there's no crontab yet, return empty string
    return '';
  }
}

/**
 * Sets up the cron jobs
 */
async function setupCronJobs() {
  console.log('\n=== Westview Home Sales - Cron Job Setup ===\n');

  // Check if cron is installed
  if (!checkCronInstalled()) {
    console.error('Error: crontab is not installed or not in the PATH.');
    console.log('Please install cron and try again:');
    console.log('  For Ubuntu/Debian: sudo apt-get install cron');
    console.log('  For CentOS/RHEL: sudo yum install cronie');
    console.log('  For macOS: cron should be pre-installed');
    process.exit(1);
  }

  // Get current crontab
  const currentCrontab = getCurrentCrontab();
  let newCrontab = currentCrontab;

  // Check for existing Westview cron jobs
  const hasExistingJobs = currentCrontab.includes('# === Westview Home Sales Cron Jobs ===');

  if (hasExistingJobs) {
    console.log('Existing Westview cron jobs found.\n');
    const answer = await askQuestion('Do you want to replace existing cron jobs? (y/n): ');

    if (answer.toLowerCase() !== 'y') {
      console.log('Cron job setup cancelled.');
      rl.close();
      return;
    }

    // Remove existing Westview cron jobs section
    newCrontab = currentCrontab.replace(/# === Westview Home Sales Cron Jobs ===[\s\S]*?# === End Westview Home Sales Cron Jobs ===/g, '');
  }

  // Create log directory if it doesn't exist
  const logDir = path.resolve(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
    console.log(`Created logs directory: ${logDir}`);
  }

  // Add header for Westview cron jobs
  newCrontab += '\n# === Westview Home Sales Cron Jobs ===\n';
  newCrontab += `# Generated on: ${new Date().toISOString()}\n`;
  newCrontab += '# These jobs update property data automatically\n';

  // Get installation directory
  const installDir = process.cwd();
  newCrontab += `# Installation directory: ${installDir}\n\n`;

  // Configure each cron job
  for (const job of CRON_JOBS) {
    console.log(`\nConfiguring job: ${job.name}`);
    console.log(`Description: ${job.description}`);
    console.log(`Default schedule: ${job.cronSchedule} (${translateCronSchedule(job.cronSchedule)})`);

    const enableJob = await askQuestion(`Enable this job? (y/n) [${job.enabled ? 'y' : 'n'}]: `);
    const isEnabled = enableJob.toLowerCase() === 'y' || (enableJob === '' && job.enabled);

    if (isEnabled) {
      let schedule = job.cronSchedule;
      const changeSchedule = await askQuestion('Change schedule? (y/n) [n]: ');

      if (changeSchedule.toLowerCase() === 'y') {
        const newSchedule = await askQuestion('Enter new cron schedule: ');
        if (newSchedule.trim() !== '') {
          schedule = newSchedule.trim();
        }
      }

      // Create log file path
      const logFile = path.join(logDir, `${path.basename(job.scriptPath, '.js')}.log`);

      // Add cron job
      const cronEntry = formatCronJob(schedule, job.scriptPath, logFile);
      newCrontab += `# ${job.name}: ${job.description}\n`;
      newCrontab += `${cronEntry}\n\n`;

      console.log(`Job configured with schedule: ${schedule}`);
      console.log(`Logs will be written to: ${logFile}`);
    } else {
      console.log('Job disabled, skipping.');
    }
  }

  // Add footer
  newCrontab += '# === End Westview Home Sales Cron Jobs ===\n';

  // Write to temporary file
  const tempFile = path.join(process.cwd(), '.temp-crontab');
  fs.writeFileSync(tempFile, newCrontab);

  // Confirm installation
  console.log('\nReady to install cron jobs.');
  const confirmInstall = await askQuestion('Install cron jobs now? (y/n) [y]: ');

  if (confirmInstall.toLowerCase() === 'n') {
    console.log('Cron job installation cancelled.');
    fs.unlinkSync(tempFile);
    rl.close();
    return;
  }

  // Install crontab
  try {
    execSync(`crontab ${tempFile}`);
    console.log('\nCron jobs installed successfully!');
    console.log('You can view installed jobs with the command: crontab -l');
  } catch (error) {
    console.error('Error installing cron jobs:', error.message);
  }

  // Clean up
  fs.unlinkSync(tempFile);
  rl.close();
}

/**
 * Translates a cron schedule to human-readable format
 */
function translateCronSchedule(cronSchedule) {
  const parts = cronSchedule.split(' ');

  if (parts.length !== 5) {
    return 'Invalid cron schedule';
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  if (minute === '0' && hour === '2' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Every day at 2:00 AM';
  } else if (minute === '0' && hour === '3' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Every day at 3:00 AM';
  } else if (minute === '0' && hour === '4' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
    return 'Every day at 4:00 AM';
  } else if (minute === '0' && hour === '5' && dayOfMonth === '*' && month === '*' && dayOfWeek === '1') {
    return 'Every Monday at 5:00 AM';
  } else {
    return 'Custom schedule';
  }
}

/**
 * Helper function to ask a question and get user input
 */
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Execute the main function
setupCronJobs();
