const Contest = require('../models/Contest');
const { selectWinners } = require('../services/winnerService');

const closeContests = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const ending = await Contest.find({
      status: 'active',
      end_date: { $gte: today, $lt: tomorrow },
    });

    for (const contest of ending) {
      await selectWinners(contest._id);
      console.log(`[CRON] Winner drawn for contest: ${contest.title}`);
    }
    console.log(`[CRON] ${ending.length} contests closed`);
  } catch (err) {
    console.error('[CRON] Error closing contests:', err.message);
  }
};

module.exports = closeContests;
