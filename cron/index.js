const cron = require('node-cron');
const resetMonthlyCaps = require('./resetMonthlyCaps');
const activateContests = require('./activateContests');
const closeContests = require('./closeContests');

const initCronJobs = () => {
  // Reset monthly submission caps — 1st of every month at midnight
  cron.schedule('0 0 1 * *', resetMonthlyCaps);

  // Activate contests — daily at 00:05
  cron.schedule('5 0 * * *', activateContests);

  // Close contests and draw winners — daily at 00:10
  cron.schedule('10 0 * * *', closeContests);

  console.log('Cron jobs initialized');
};

module.exports = initCronJobs;
