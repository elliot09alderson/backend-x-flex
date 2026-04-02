const Submission = require('../models/Submission');
const Winner = require('../models/Winner');
const Contest = require('../models/Contest');

const selectWinners = async (contestId) => {
  const contest = await Contest.findById(contestId);
  if (!contest || contest.is_locked) return null;

  const query = {};
  if (contest.filters.areas && contest.filters.areas.length > 0) {
    query['area'] = { $in: contest.filters.areas };
  }

  const submissions = await Submission.find({
    createdAt: {
      $gte: contest.start_date,
      $lte: contest.end_date,
    },
  }).populate('customer_id');

  if (submissions.length === 0) return [];

  let winners = [];

  if (contest.winner_selection_algorithm === 'random_draw') {
    const count = contest.first_n_count || 1;
    const shuffled = submissions.sort(() => 0.5 - Math.random());
    winners = shuffled.slice(0, count);
  } else if (contest.winner_selection_algorithm === 'first_n') {
    winners = submissions.slice(0, contest.first_n_count || 1);
  }

  const winnerRecords = [];
  for (const sub of winners) {
    const winner = await Winner.create({
      contest_id: contestId,
      customer_id: sub.customer_id._id,
      merchant_id: sub.merchant_id,
      prize: contest.title,
      prize_value: 0,
      is_public: false,
    });
    winnerRecords.push(winner);
  }

  contest.is_locked = true;
  contest.status = 'completed';
  await contest.save();

  return winnerRecords;
};

module.exports = { selectWinners };
