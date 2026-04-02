const Contest = require('../models/Contest');

const activateContests = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await Contest.updateMany(
      { status: 'draft', start_date: { $gte: today, $lt: tomorrow } },
      { status: 'active' }
    );
    console.log('[CRON] Contests activated for today');
  } catch (err) {
    console.error('[CRON] Error activating contests:', err.message);
  }
};

module.exports = activateContests;
