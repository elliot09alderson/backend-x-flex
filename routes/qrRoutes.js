const router = require('express').Router();
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const qc = require('../controllers/qrController');

router.post('/generate', protect, roleGuard('promoter', 'area_manager'), qc.generate);
router.post('/assign/:qr_id/:merchant_id', protect, roleGuard('promoter', 'area_manager'), qc.assign);
router.get('/my-codes', protect, roleGuard('promoter', 'area_manager'), qc.getMyCodes);
router.get('/:id', qc.getById);

module.exports = router;
