const User = require('../models/User');
const Promoter = require('../models/Promoter');
const Merchant = require('../models/Merchant');
const { success, error } = require('../utils/apiResponse');
const generateEmployeeId = require('../utils/generateEmployeeId');
const { generateIdCard } = require('../services/idCardService');
const { getConfig } = require('../services/configService');
const { checkEligibility } = require('../services/areaManagerService');

exports.register = async (req, res, next) => {
  try {
    const { referral_code } = req.body;
    const employeeId = await generateEmployeeId();
    const maxShops = await getConfig('default_max_shops_per_promoter');
    const fee = await getConfig('promoter_registration_fee');

    let referredBy = null;
    if (referral_code) {
      // First try matching by referral code on the Promoter model
      const referrerPromoter = await Promoter.findOne({ referral_code: referral_code.trim().toUpperCase() });
      if (referrerPromoter) {
        referredBy = referrerPromoter.user_id;
      } else {
        // Fallback: match by phone number
        const referrer = await User.findOne({ phone: referral_code, role: { $in: ['promoter', 'area_manager'] } });
        if (referrer) referredBy = referrer._id;
      }
    }

    const promoter = await Promoter.create({
      user_id: req.user._id,
      employee_id: employeeId,
      referred_by: referredBy,
      max_shops_allowed: maxShops,
      payment_status: 'pending',
    });

    if (referredBy) {
      await Promoter.findOneAndUpdate(
        { user_id: referredBy },
        { $push: { direct_promoters: req.user._id }, $inc: { total_promoters_count: 1 } }
      );
      await checkEligibility(referredBy);
    }

    const idCardUrl = await generateIdCard(promoter, req.user);
    promoter.id_card_url = idCardUrl;
    await promoter.save();

    success(res, { promoter, amount: fee }, 'Promoter registered', 201);
  } catch (err) { next(err); }
};

exports.activatePromoter = async (req, res, next) => {
  try {
    const promoter = await Promoter.findOneAndUpdate(
      { user_id: req.user._id },
      { payment_status: 'paid', status: 'active' },
      { new: true }
    );
    success(res, { promoter }, 'Promoter activated');
  } catch (err) { next(err); }
};

exports.getProfile = async (req, res, next) => {
  try {
    const promoter = await Promoter.findOne({ user_id: req.user._id });
    if (!promoter) return error(res, 'Promoter not found', 404);
    success(res, { promoter });
  } catch (err) { next(err); }
};

exports.getIdCard = async (req, res, next) => {
  try {
    const promoter = await Promoter.findOne({ user_id: req.user._id });
    if (!promoter) return error(res, 'Promoter not found', 404);
    const idCardUrl = await generateIdCard(promoter, req.user);
    success(res, {
      id_card_url: idCardUrl,
      card: {
        employee_id: promoter.employee_id,
        name: req.user.name,
        phone: req.user.phone,
        address: req.user.address || '',
        avatar_url: req.user.avatar_url || '',
        rank: promoter.rank,
      },
    });
  } catch (err) { next(err); }
};

exports.getNetworkShops = async (req, res, next) => {
  try {
    const promoter = await Promoter.findOne({ user_id: req.user._id });
    if (!promoter) return error(res, 'Promoter not found', 404);

    const shops = await Merchant.find({ onboarded_by_promoter_id: req.user._id })
      .populate('user_id', 'name phone status')
      .sort({ createdAt: -1 });

    success(res, { shops, total: shops.length });
  } catch (err) { next(err); }
};

exports.getNetworkPromoters = async (req, res, next) => {
  try {
    const promoter = await Promoter.findOne({ user_id: req.user._id });
    if (!promoter) return error(res, 'Promoter not found', 404);

    const promoters = await Promoter.find({ referred_by: req.user._id })
      .populate('user_id', 'name phone status')
      .sort({ createdAt: -1 });

    success(res, { promoters, total: promoters.length });
  } catch (err) { next(err); }
};

exports.getEarnings = async (req, res, next) => {
  try {
    const promoter = await Promoter.findOne({ user_id: req.user._id });
    if (!promoter) return error(res, 'Promoter not found', 404);
    success(res, { total_earned: promoter.commission_earned });
  } catch (err) { next(err); }
};

exports.getAreaManagerProgress = async (req, res, next) => {
  try {
    const promoter = await Promoter.findOne({ user_id: req.user._id });
    if (!promoter) return error(res, 'Promoter not found', 404);

    const promoterTarget = await getConfig('area_manager_promoter_target');
    const shopTarget = await getConfig('area_manager_shop_target');

    success(res, {
      rank: promoter.rank,
      promoters: { current: promoter.total_promoters_count, target: promoterTarget },
      shops: { current: promoter.total_shops_count, target: shopTarget },
    });
  } catch (err) { next(err); }
};
