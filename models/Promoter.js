const mongoose = require('mongoose');

const promoterSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employee_id: { type: String, unique: true, required: true },
  referred_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  direct_shops: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  direct_promoters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  total_shops_count: { type: Number, default: 0 },
  total_promoters_count: { type: Number, default: 0 },
  max_shops_allowed: { type: Number, default: 0 },
  max_promoters_allowed: { type: Number, default: 0 },
  rank: { type: String, enum: ['promoter', 'area_manager'], default: 'promoter' },
  commission_earned: { type: Number, default: 0 },
  referral_code: { type: String, unique: true, sparse: true, default: null },
  id_card_url: { type: String, default: '' },
  payment_id: { type: String },
  payment_status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
}, { timestamps: true });

module.exports = mongoose.model('Promoter', promoterSchema);
