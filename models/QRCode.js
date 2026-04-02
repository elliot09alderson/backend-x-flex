const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  merchant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  promoter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  is_assigned: { type: Boolean, default: false },
  qr_image_url: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('QRCode', qrCodeSchema);
