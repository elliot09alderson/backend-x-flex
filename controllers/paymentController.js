const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Payment = require('../models/Payment');
const { success, error } = require('../utils/apiResponse');

exports.createOrder = async (req, res, next) => {
  try {
    const { amount, purpose } = req.body;
    if (!amount || !purpose) return error(res, 'Amount and purpose required', 400);

    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    const payment = await Payment.create({
      user_id: req.user ? req.user._id : null,
      razorpay_order_id: order.id,
      amount,
      purpose,
      status: 'created',
    });

    success(res, { order_id: order.id, amount, currency: 'INR', payment_id: payment._id }, 'Order created', 201);
  } catch (err) { next(err); }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return error(res, 'Payment verification failed', 400);
    }

    const payment = await Payment.findOneAndUpdate(
      { razorpay_order_id },
      { razorpay_payment_id, razorpay_signature, status: 'paid', paid_at: new Date() },
      { new: true }
    );

    success(res, { payment }, 'Payment verified');
  } catch (err) { next(err); }
};

exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return error(res, 'Payment not found', 404);
    success(res, { payment });
  } catch (err) { next(err); }
};
