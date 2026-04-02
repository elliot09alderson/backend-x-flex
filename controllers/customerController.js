const QRCode = require('../models/QRCode');
const Merchant = require('../models/Merchant');
const Customer = require('../models/Customer');
const Submission = require('../models/Submission');
const Offer = require('../models/Offer');
const { success, error } = require('../utils/apiResponse');

exports.scanQR = async (req, res, next) => {
  try {
    const qr = await QRCode.findById(req.params.qr_id);
    if (!qr) return error(res, 'Invalid QR code', 404);
    if (!qr.is_assigned || !qr.merchant_id) return error(res, 'QR code not assigned to any shop', 400);

    const merchant = await Merchant.findOne({ user_id: qr.merchant_id })
      .populate('user_id', 'name phone');
    if (!merchant) return error(res, 'Shop not found', 404);
    if (merchant.status !== 'active') return error(res, 'This shop is currently inactive', 400);

    if (merchant.current_month_submissions >= merchant.monthly_submission_cap) {
      return error(res, 'This shop has reached its monthly submission limit', 400);
    }

    const now = new Date();
    const offers = await Offer.find({
      is_active: true,
      start_date: { $lte: now },
      end_date: { $gte: now },
      $or: [
        { area_filter: { $size: 0 } },
        { area_filter: merchant.area },
      ],
    });

    success(res, {
      merchant: {
        shop_name: merchant.shop_name,
        owner_name: merchant.user_id.name,
        area: merchant.area,
        city: merchant.city,
      },
      offers,
      qr_code_id: qr._id,
      merchant_user_id: qr.merchant_id,
      promoter_id: qr.promoter_id,
    });
  } catch (err) { next(err); }
};

exports.submitForm = async (req, res, next) => {
  try {
    const { name, phone, offer_id, qr_code_id, merchant_id, promoter_id, bill_value } = req.body;
    if (!name || !phone || !offer_id || !qr_code_id) {
      return error(res, 'All fields are required', 400);
    }

    const merchant = await Merchant.findOne({ user_id: merchant_id });
    if (merchant && merchant.current_month_submissions >= merchant.monthly_submission_cap) {
      return error(res, 'Monthly submission limit reached for this shop', 400);
    }

    let profilePhotoUrl = '';
    let billImageUrl = '';
    if (req.files) {
      if (req.files.profile_photo) profilePhotoUrl = `/uploads/${req.files.profile_photo[0].filename}`;
      if (req.files.bill_image) billImageUrl = `/uploads/${req.files.bill_image[0].filename}`;
    }

    const customer = await Customer.create({
      name,
      phone,
      profile_photo_url: profilePhotoUrl,
      bill_image_url: billImageUrl,
      merchant_id,
      promoter_id,
      selected_offer_id: offer_id,
      qr_code_id,
    });

    await Submission.create({
      customer_id: customer._id,
      merchant_id,
      promoter_id,
      qr_code_id,
      offer_id,
      bill_image_url: billImageUrl,
      bill_value: bill_value || 0,
    });

    if (merchant) {
      merchant.current_month_submissions += 1;
      await merchant.save();
    }

    success(res, { customer }, 'Submission successful! You are now in the prize pool.', 201);
  } catch (err) { next(err); }
};
