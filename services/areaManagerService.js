const Promoter = require('../models/Promoter');
const User = require('../models/User');
const { getConfig } = require('./configService');

const checkEligibility = async (promoterUserId) => {
  const promoter = await Promoter.findOne({ user_id: promoterUserId });
  if (!promoter || promoter.rank === 'area_manager') return false;

  const promoterTarget = await getConfig('area_manager_promoter_target');
  const shopTarget = await getConfig('area_manager_shop_target');

  if (promoter.total_promoters_count >= promoterTarget && promoter.total_shops_count >= shopTarget) {
    promoter.rank = 'area_manager';
    await promoter.save();
    await User.findByIdAndUpdate(promoterUserId, { role: 'area_manager' });
    return true;
  }
  return false;
};

module.exports = { checkEligibility };
