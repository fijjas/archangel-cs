import cron from 'node-cron';
import { fetchAllFeeds } from './rss.js';
import { analyzeAllUnprocessed } from './analysis.js';
import { sendAlertsToAllUsers } from './alerts.js';

var isRunning = false;
var lastManualRun = 0;

async function runFullUpdate() {
  if (isRunning) {
    throw new Error('Update already running');
  }

  isRunning = true;

  try {
    console.log('=== Starting full update ===');

    console.log('Step 1: Fetching RSS feeds');
    await fetchAllFeeds();

    console.log('Step 2: Analyzing news');
    await analyzeAllUnprocessed();

    console.log('Step 3: Sending alerts');
    await sendAlertsToAllUsers();

    console.log('=== Full update completed ===');

  } catch (error) {
    console.error('Full update error:', error);
    throw error;
  } finally {
    isRunning = false;
  }
}

async function runFullUpdateWithThrottle() {
  var now = Date.now();

  if (now - lastManualRun < 5 * 60 * 1000) {
    throw new Error('Update was run recently. Please wait 5 minutes.');
  }

  lastManualRun = now;
  await runFullUpdate();
}

function startCronJob() {
  cron.schedule('0 */3 * * *', async () => {
    console.log('Cron job triggered');
    await runFullUpdate();
  });

  console.log('Cron job scheduled: every 3 hours');
}

export { startCronJob, runFullUpdate as runFullUpdate };
