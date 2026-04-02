const User = require('../models/User');
const Merchant = require('../models/Merchant');
const Customer = require('../models/Customer');
const Submission = require('../models/Submission');
const Winner = require('../models/Winner');
const Contest = require('../models/Contest');
const { success, error } = require('../utils/apiResponse');
const { getConfig } = require('../services/configService');
const { creditCommission } = require('../services/commissionService');
const { checkEligibility } = require('../services/areaManagerService');
const Promoter = require('../models/Promoter');

exports.register = async (req, res, next) => {
  try {
    const { plan_type, shop_name, area, city, shop_category, promoter_id } = req.body;
    if (!plan_type || !shop_name) return error(res, 'Plan type and shop name required', 400);

    const planPrice = plan_type === 'basic'
      ? await getConfig('basic_plan_price')
      : await getConfig('premium_plan_price');
    const cap = plan_type === 'basic' ? await getConfig('basic_plan_cap') : 999999;

    const merchant = await Merchant.create({
      user_id: req.user._id,
      plan_type,
      plan_price: planPrice,
      monthly_submission_cap: cap,
      shop_name,
      area,
      city,
      shop_category,
      onboarded_by_promoter_id: promoter_id || null,
      payment_status: 'pending',
    });

    if (promoter_id) {
      await Promoter.findOneAndUpdate(
        { user_id: promoter_id },
        { $push: { direct_shops: req.user._id }, $inc: { total_shops_count: 1 } }
      );
      await creditCommission(promoter_id, planPrice);
      await checkEligibility(promoter_id);
    }

    success(res, { merchant, amount: planPrice }, 'Merchant registered', 201);
  } catch (err) { next(err); }
};

exports.activateMerchant = async (req, res, next) => {
  try {
    const merchant = await Merchant.findOneAndUpdate(
      { user_id: req.user._id },
      { payment_status: 'paid', status: 'active' },
      { new: true }
    );
    success(res, { merchant }, 'Merchant activated');
  } catch (err) { next(err); }
};

exports.getProfile = async (req, res, next) => {
  try {
    const merchant = await Merchant.findOne({ user_id: req.user._id }).populate('assigned_qr_code_id');
    if (!merchant) return error(res, 'Merchant not found', 404);
    success(res, { merchant });
  } catch (err) { next(err); }
};

exports.getSubmissionStatus = async (req, res, next) => {
  try {
    const merchant = await Merchant.findOne({ user_id: req.user._id });
    if (!merchant) return error(res, 'Merchant not found', 404);
    success(res, {
      current: merchant.current_month_submissions,
      cap: merchant.monthly_submission_cap,
      remaining: Math.max(0, merchant.monthly_submission_cap - merchant.current_month_submissions),
      plan_type: merchant.plan_type,
    });
  } catch (err) { next(err); }
};

exports.getCustomers = async (req, res, next) => {
  try {
    const customers = await Customer.find({ merchant_id: req.user._id })
      .sort({ createdAt: -1 })
      .populate('selected_offer_id', 'title prize_value');
    success(res, { customers, total: customers.length });
  } catch (err) { next(err); }
};

exports.getWinners = async (req, res, next) => {
  try {
    const winners = await Winner.find({ merchant_id: req.user._id, is_public: true })
      .populate('customer_id', 'name phone')
      .populate('contest_id', 'title')
      .sort({ selected_at: -1 });
    success(res, { winners });
  } catch (err) { next(err); }
};

exports.getStats = async (req, res, next) => {
  try {
    const merchant = await Merchant.findOne({ user_id: req.user._id });
    if (!merchant) return error(res, 'Merchant not found', 404);
    const customerCount = await Customer.countDocuments({ merchant_id: req.user._id });
    const winnerCount = await Winner.countDocuments({ merchant_id: req.user._id, is_public: true });
    success(res, {
      submissions: merchant.current_month_submissions,
      cap: merchant.monthly_submission_cap,
      customers: customerCount,
      winners: winnerCount,
      plan: merchant.plan_type,
      status: merchant.status,
    });
  } catch (err) { next(err); }
};

exports.getContests = async (req, res, next) => {
  try {
    const merchant = await Merchant.findOne({ user_id: req.user._id });
    if (!merchant) return error(res, 'Merchant not found', 404);
    const contests = await Contest.find({
      status: 'active',
      target_audience: 'merchant',
      $or: [
        { 'filters.areas': { $size: 0 } },
        { 'filters.areas': merchant.area },
      ],
    }).sort({ end_date: 1 });
    success(res, { contests });
  } catch (err) { next(err); }
};
