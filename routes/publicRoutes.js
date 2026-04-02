const router = require('express').Router();
const { getBanners, getOffers, getWinners } = require('../controllers/publicController');

router.get('/banners', getBanners);
router.get('/offers', getOffers);
router.get('/winners', getWinners);

module.exports = router;
