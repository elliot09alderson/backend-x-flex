const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan_type: { type: String, enum: ['basic', 'premium'], required: true },
  plan_price: { type: Number, required: true },
  monthly_submission_cap: { type: Number, default: 100 },
  current_month_submissions: { type: Number, default: 0 },
  area: { type: String, trim: true },
  city: { type: String, trim: true },
  shop_name: { type: String, required: true, trim: true },
  shop_category: { type: String, trim: true },
  assigned_qr_code_id: { type: mongoose.Schema.Types.ObjectId, ref: 'QRCode' },
  onboarded_by_promoter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  payment_id: { type: String },
  payment_status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
}, { timestamps: true });

module.exports = mongoose.model('Merchant', merchantSchema);
