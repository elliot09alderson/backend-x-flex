const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  razorpay_order_id: { type: String },
  razorpay_payment_id: { type: String },
  razorpay_signature: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  purpose: { type: String, enum: ['merchant_plan', 'promoter_registration'], required: true },
  status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
  paid_at: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
