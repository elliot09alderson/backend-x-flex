const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  banner_image_url: { type: String, default: '' },
  prize_value: { type: Number, default: 0 },
  prize_description: { type: String, trim: true },
  area_filter: [{ type: String }],
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  is_active: { type: Boolean, default: true },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
