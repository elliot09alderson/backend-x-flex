const Promoter = require('../models/Promoter');
const { getConfig } = require('./configService');

const creditCommission = async (promoterId, planPrice) => {
  if (!promoterId) return;
  const percentage = await getConfig('commission_percentage');
  const commission = (planPrice * percentage) / 100;
  await Promoter.findOneAndUpdate(
    { user_id: promoterId },
    { $inc: { commission_earned: commission } }
  );
  return commission;
};

module.exports = { creditCommission };
