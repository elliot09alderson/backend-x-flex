const Merchant = require('../models/Merchant');

const resetMonthlyCaps = async () => {
  try {
    await Merchant.updateMany({}, { current_month_submissions: 0 });
    console.log('[CRON] Monthly submission caps reset');
  } catch (err) {
    console.error('[CRON] Error resetting caps:', err.message);
  }
};

module.exports = resetMonthlyCaps;
