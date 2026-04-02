const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  offer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
  title: { type: String, required: true, trim: true },
  banner_image_url: { type: String, default: '' },
  filters: {
    areas: [String],
    shop_categories: [String],
    plan_types: [{ type: String, enum: ['basic', 'premium'] }],
    min_submission_volume: { type: Number, default: 0 },
    purchase_value_range: { min: { type: Number, default: 0 }, max: { type: Number, default: 999999 } },
    date_range: { start: Date, end: Date },
  },
  target_audience: { type: String, enum: ['customer', 'merchant'], default: 'customer' },
  winner_selection_algorithm: { type: String, enum: ['random_draw', 'first_n'], default: 'random_draw' },
  first_n_count: { type: Number, default: 1 },
  eligibility_rules: { type: String, trim: true },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  is_locked: { type: Boolean, default: false },
  status: { type: String, enum: ['draft', 'active', 'completed'], default: 'draft' },
}, { timestamps: true });

module.exports = mongoose.model('Contest', contestSchema);
