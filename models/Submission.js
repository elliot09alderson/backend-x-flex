const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  merchant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  promoter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  qr_code_id: { type: mongoose.Schema.Types.ObjectId, ref: 'QRCode' },
  offer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
  bill_image_url: { type: String },
  bill_value: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
