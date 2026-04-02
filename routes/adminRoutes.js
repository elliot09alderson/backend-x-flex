const router = require('express').Router();
const { protect } = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const upload = require('../middleware/upload');
const ac = require('../controllers/adminController');

router.use(protect, roleGuard('admin'));

// Dashboard
router.get('/stats', ac.getDashboardStats);

// Offers
router.get('/offers', ac.getOffers);
router.post('/offers', ac.createOffer);
router.put('/offers/:id', ac.updateOffer);
router.delete('/offers/:id', ac.deleteOffer);

// Banners
router.post('/banners', upload.single('banner'), ac.uploadBanner);

// Config
router.get('/config', ac.getConfigs);
router.put('/config/:key', ac.updateConfig);

// Promoters
router.get('/promoters', ac.getPromoters);
router.put('/promoters/:id/limit', ac.setPromoterLimit);
router.put('/promoters/:id/activate', ac.activatePromoter);
router.put('/promoters/:id/deactivate', ac.deactivatePromoter);
router.post('/promoters/:id/referral-code', ac.generateReferralCode);
router.post('/promoters/:id/recharge', ac.rechargePromoter);

// Merchants
router.get('/merchants', ac.getMerchants);
router.put('/merchants/:id', ac.updateMerchant);

// Contests
router.get('/contests', ac.getContests);
router.post('/contests', ac.createContest);
router.put('/contests/:id', ac.updateContest);
router.post('/contests/:id/draw', ac.triggerDraw);
router.get('/contests/:id/entries', ac.getContestEntries);

// Winners
router.get('/winners', ac.getWinners);
router.put('/winners/:id/publish', ac.publishWinner);

// Leaderboards
router.get('/leaderboard/shops', ac.shopLeaderboard);
router.get('/leaderboard/promoters', ac.promoterLeaderboard);

module.exports = router;
