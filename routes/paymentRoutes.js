const router = require('express').Router();
const { createOrder, verifyPayment, getPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-order', protect, createOrder);
router.post('/verify', verifyPayment);
router.get('/:id', protect, getPayment);

module.exports = router;
