const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema({
  contest_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  merchant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  prize: { type: String, trim: true },
  prize_value: { type: Number, default: 0 },
  selected_at: { type: Date, default: Date.now },
  is_public: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Winner', winnerSchema);
