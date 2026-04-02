const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  profile_photo_url: { type: String, default: '' },
  bill_image_url: { type: String, default: '' },
  merchant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  promoter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  selected_offer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
  qr_code_id: { type: mongoose.Schema.Types.ObjectId, ref: 'QRCode' },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
