const router = require('express').Router();
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const pc = require('../controllers/promoterController');

router.post('/register', protect, roleGuard('promoter', 'area_manager'), pc.register);
router.post('/activate', protect, roleGuard('promoter', 'area_manager'), pc.activatePromoter);
router.get('/profile', protect, roleGuard('promoter', 'area_manager'), pc.getProfile);
router.get('/id-card', protect, roleGuard('promoter', 'area_manager'), pc.getIdCard);
router.get('/network/shops', protect, roleGuard('promoter', 'area_manager'), pc.getNetworkShops);
router.get('/network/promoters', protect, roleGuard('promoter', 'area_manager'), pc.getNetworkPromoters);
router.get('/earnings', protect, roleGuard('promoter', 'area_manager'), pc.getEarnings);
router.get('/area-manager-progress', protect, roleGuard('promoter', 'area_manager'), pc.getAreaManagerProgress);

module.exports = router;
