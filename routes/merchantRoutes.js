const router = require('express').Router();
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const mc = require('../controllers/merchantController');

router.post('/register', protect, roleGuard('merchant'), mc.register);
router.post('/activate', protect, roleGuard('merchant'), mc.activateMerchant);
router.get('/profile', protect, roleGuard('merchant'), mc.getProfile);
router.get('/submission-status', protect, roleGuard('merchant'), mc.getSubmissionStatus);
router.get('/customers', protect, roleGuard('merchant'), mc.getCustomers);
router.get('/winners', protect, roleGuard('merchant'), mc.getWinners);
router.get('/stats', protect, roleGuard('merchant'), mc.getStats);
router.get('/contests', protect, roleGuard('merchant'), mc.getContests);

module.exports = router;
