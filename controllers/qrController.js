const QRCode = require('../models/QRCode');
const Promoter = require('../models/Promoter');
const Merchant = require('../models/Merchant');
const { success, error } = require('../utils/apiResponse');
const { generateQRImage, generateUniqueCode } = require('../services/qrService');

exports.generate = async (req, res, next) => {
  try {
    const promoter = await Promoter.findOne({ user_id: req.user._id });
    if (!promoter) return error(res, 'Promoter not found', 404);
    if (promoter.status !== 'active') return error(res, 'Your account is not active', 403);

    const qrCount = await QRCode.countDocuments({ promoter_id: req.user._id });
    if (qrCount >= promoter.max_shops_allowed) {
      return error(res, `You have reached your QR limit (${promoter.max_shops_allowed}). Contact admin.`, 403);
    }

    const code = generateUniqueCode();
    const qr = await QRCode.create({ code, promoter_id: req.user._id });
    const qrImageUrl = await generateQRImage(qr._id);
    qr.qr_image_url = qrImageUrl;
    await qr.save();

    success(res, { qr }, 'QR code generated', 201);
  } catch (err) { next(err); }
};

exports.assign = async (req, res, next) => {
  try {
    const { qr_id, merchant_id } = req.params;
    const qr = await QRCode.findById(qr_id);
    if (!qr) return error(res, 'QR code not found', 404);
    if (qr.promoter_id.toString() !== req.user._id.toString()) {
      return error(res, 'Not your QR code', 403);
    }
    if (qr.is_assigned) return error(res, 'QR already assigned', 400);

    const merchant = await Merchant.findOne({ user_id: merchant_id });
    if (!merchant) return error(res, 'Merchant not found', 404);

    qr.merchant_id = merchant_id;
    qr.is_assigned = true;
    await qr.save();

    merchant.assigned_qr_code_id = qr._id;
    await merchant.save();

    success(res, { qr }, 'QR assigned to merchant');
  } catch (err) { next(err); }
};

exports.getMyCodes = async (req, res, next) => {
  try {
    const codes = await QRCode.find({ promoter_id: req.user._id })
      .populate('merchant_id', 'name phone')
      .sort({ createdAt: -1 });
    success(res, { codes, total: codes.length });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const qr = await QRCode.findById(req.params.id)
      .populate('merchant_id', 'name phone')
      .populate('promoter_id', 'name phone');
    if (!qr) return error(res, 'QR code not found', 404);
    success(res, { qr });
  } catch (err) { next(err); }
};
