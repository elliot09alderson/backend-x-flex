const Offer = require('../models/Offer');
const Contest = require('../models/Contest');
const Winner = require('../models/Winner');
const Merchant = require('../models/Merchant');
const Promoter = require('../models/Promoter');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Submission = require('../models/Submission');
const { success, error } = require('../utils/apiResponse');
const { getAllConfigs, setConfig } = require('../services/configService');
const { selectWinners } = require('../services/winnerService');

// --- OFFERS ---
exports.createOffer = async (req, res, next) => {
  try {
    const offer = await Offer.create({ ...req.body, created_by: req.user._id });
    success(res, { offer }, 'Offer created', 201);
  } catch (err) { next(err); }
};

exports.updateOffer = async (req, res, next) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!offer) return error(res, 'Offer not found', 404);
    success(res, { offer }, 'Offer updated');
  } catch (err) { next(err); }
};

exports.deleteOffer = async (req, res, next) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    success(res, null, 'Offer deleted');
  } catch (err) { next(err); }
};

exports.getOffers = async (req, res, next) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    success(res, { offers });
  } catch (err) { next(err); }
};

// --- BANNERS ---
exports.uploadBanner = async (req, res, next) => {
  try {
    if (!req.file) return error(res, 'No image uploaded', 400);
    success(res, { url: `/uploads/${req.file.filename}` }, 'Banner uploaded');
  } catch (err) { next(err); }
};

// --- SYSTEM CONFIG ---
exports.getConfigs = async (req, res, next) => {
  try {
    const configs = await getAllConfigs();
    success(res, { configs });
  } catch (err) { next(err); }
};

exports.updateConfig = async (req, res, next) => {
  try {
    const { value, description } = req.body;
    const config = await setConfig(req.params.key, value, description, req.user._id);
    success(res, { config }, 'Config updated');
  } catch (err) { next(err); }
};

// --- PROMOTER MANAGEMENT ---
exports.getPromoters = async (req, res, next) => {
  try {
    const promoters = await Promoter.find()
      .populate('user_id', 'name phone status avatar_url')
      .sort({ createdAt: -1 });
    success(res, { promoters });
  } catch (err) { next(err); }
};

exports.activatePromoter = async (req, res, next) => {
  try {
    const promoter = await Promoter.findByIdAndUpdate(
      req.params.id,
      { status: 'active', payment_status: 'paid' },
      { new: true }
    ).populate('user_id', 'name phone status avatar_url');
    if (!promoter) return error(res, 'Promoter not found', 404);
    success(res, { promoter }, 'Promoter activated');
  } catch (err) { next(err); }
};

exports.deactivatePromoter = async (req, res, next) => {
  try {
    const promoter = await Promoter.findByIdAndUpdate(
      req.params.id,
      { status: 'inactive' },
      { new: true }
    ).populate('user_id', 'name phone status avatar_url');
    if (!promoter) return error(res, 'Promoter not found', 404);
    success(res, { promoter }, 'Promoter deactivated');
  } catch (err) { next(err); }
};

exports.generateReferralCode = async (req, res, next) => {
  try {
    const promoter = await Promoter.findById(req.params.id).populate('user_id', 'name phone');
    if (!promoter) return error(res, 'Promoter not found', 404);

    // Generate a unique referral code: REF-<first 3 chars of name uppercase>-<4 random digits>
    const namePart = (promoter.user_id?.name || 'XFL').replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase() || 'XFL';
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    let code = `REF-${namePart}-${randomPart}`;

    // Ensure uniqueness
    let exists = await Promoter.findOne({ referral_code: code });
    while (exists) {
      const newRandom = Math.floor(1000 + Math.random() * 9000);
      code = `REF-${namePart}-${newRandom}`;
      exists = await Promoter.findOne({ referral_code: code });
    }

    promoter.referral_code = code;
    await promoter.save();

    success(res, { promoter, referral_code: code }, 'Referral code generated');
  } catch (err) { next(err); }
};

exports.setPromoterLimit = async (req, res, next) => {
  try {
    const { max_shops_allowed } = req.body;
    const promoter = await Promoter.findByIdAndUpdate(
      req.params.id,
      { max_shops_allowed },
      { new: true }
    ).populate('user_id', 'name phone');
    if (!promoter) return error(res, 'Promoter not found', 404);
    success(res, { promoter }, 'Limit updated');
  } catch (err) { next(err); }
};

exports.rechargePromoter = async (req, res, next) => {
  try {
    const { type, amount } = req.body;
    if (!type || !amount || amount <= 0) {
      return error(res, 'Provide type (merchant/promoter) and a positive amount', 400);
    }

    const promoter = await Promoter.findById(req.params.id);
    if (!promoter) return error(res, 'Promoter not found', 404);

    if (type === 'merchant') {
      promoter.max_shops_allowed = (promoter.max_shops_allowed || 0) + Number(amount);
    } else if (type === 'promoter') {
      promoter.max_promoters_allowed = (promoter.max_promoters_allowed || 0) + Number(amount);
    } else {
      return error(res, 'Invalid type. Use merchant or promoter', 400);
    }

    await promoter.save();
    const updated = await Promoter.findById(promoter._id).populate('user_id', 'name phone status avatar_url');
    success(res, { promoter: updated }, `Recharged ${amount} ${type} credits`);
  } catch (err) { next(err); }
};

// --- MERCHANT MANAGEMENT ---
exports.getMerchants = async (req, res, next) => {
  try {
    const merchants = await Merchant.find()
      .populate('user_id', 'name phone status')
      .populate('onboarded_by_promoter_id', 'name phone')
      .sort({ createdAt: -1 });
    success(res, { merchants });
  } catch (err) { next(err); }
};

exports.updateMerchant = async (req, res, next) => {
  try {
    const merchant = await Merchant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!merchant) return error(res, 'Merchant not found', 404);
    success(res, { merchant }, 'Merchant updated');
  } catch (err) { next(err); }
};

// --- CONTESTS ---
exports.createContest = async (req, res, next) => {
  try {
    const contest = await Contest.create(req.body);
    success(res, { contest }, 'Contest created', 201);
  } catch (err) { next(err); }
};

exports.updateContest = async (req, res, next) => {
  try {
    const contest = await Contest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!contest) return error(res, 'Contest not found', 404);
    success(res, { contest }, 'Contest updated');
  } catch (err) { next(err); }
};

exports.getContests = async (req, res, next) => {
  try {
    const contests = await Contest.find().populate('offer_id', 'title').sort({ createdAt: -1 });
    success(res, { contests });
  } catch (err) { next(err); }
};

exports.triggerDraw = async (req, res, next) => {
  try {
    const winners = await selectWinners(req.params.id);
    if (!winners) return error(res, 'Contest already completed or not found', 400);
    success(res, { winners, count: winners.length }, 'Winner draw completed');
  } catch (err) { next(err); }
};

exports.getContestEntries = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return error(res, 'Contest not found', 404);
    const submissions = await Submission.find({
      createdAt: { $gte: contest.start_date, $lte: contest.end_date },
    })
      .populate('customer_id', 'name phone')
      .sort({ createdAt: -1 });
    success(res, { entries: submissions, total: submissions.length });
  } catch (err) { next(err); }
};

// --- WINNERS ---
exports.getWinners = async (req, res, next) => {
  try {
    const winners = await Winner.find()
      .populate('customer_id', 'name phone')
      .populate('contest_id', 'title')
      .sort({ selected_at: -1 });
    success(res, { winners });
  } catch (err) { next(err); }
};

exports.publishWinner = async (req, res, next) => {
  try {
    const winner = await Winner.findByIdAndUpdate(req.params.id, { is_public: true }, { new: true });
    if (!winner) return error(res, 'Winner not found', 404);
    success(res, { winner }, 'Winner published');
  } catch (err) { next(err); }
};

// --- LEADERBOARDS ---
exports.shopLeaderboard = async (req, res, next) => {
  try {
    const merchants = await Merchant.find({ status: 'active' })
      .populate('user_id', 'name phone')
      .sort({ current_month_submissions: -1 })
      .limit(25);
    success(res, { leaderboard: merchants });
  } catch (err) { next(err); }
};

exports.promoterLeaderboard = async (req, res, next) => {
  try {
    const promoters = await Promoter.find({ status: 'active' })
      .populate('user_id', 'name phone')
      .sort({ total_shops_count: -1 })
      .limit(25);
    success(res, { leaderboard: promoters });
  } catch (err) { next(err); }
};

// --- DASHBOARD STATS ---
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalMerchants, totalPromoters, totalCustomers, totalSubmissions, activeMerchants, activeContests] = await Promise.all([
      Merchant.countDocuments(),
      Promoter.countDocuments(),
      Customer.countDocuments(),
      Submission.countDocuments(),
      Merchant.countDocuments({ status: 'active' }),
      Contest.countDocuments({ status: 'active' }),
    ]);
    success(res, {
      totalMerchants, totalPromoters, totalCustomers,
      totalSubmissions, activeMerchants, activeContests,
    });
  } catch (err) { next(err); }
};
