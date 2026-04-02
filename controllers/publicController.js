const Offer = require('../models/Offer');
const Winner = require('../models/Winner');
const { success } = require('../utils/apiResponse');

exports.getBanners = async (req, res, next) => {
  try {
    const offers = await Offer.find({ is_active: true })
      .select('title banner_image_url description prize_description')
      .sort({ createdAt: -1 })
      .limit(10);
    success(res, { banners: offers });
  } catch (err) { next(err); }
};

exports.getOffers = async (req, res, next) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      is_active: true,
      start_date: { $lte: now },
      end_date: { $gte: now },
    }).sort({ createdAt: -1 });
    success(res, { offers });
  } catch (err) { next(err); }
};

exports.getWinners = async (req, res, next) => {
  try {
    const winners = await Winner.find({ is_public: true })
      .populate('customer_id', 'name phone profile_photo_url')
      .populate('contest_id', 'title')
      .sort({ selected_at: -1 })
      .limit(50);
    success(res, { winners });
  } catch (err) { next(err); }
};
