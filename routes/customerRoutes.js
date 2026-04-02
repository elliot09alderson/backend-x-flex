const router = require('express').Router();
const upload = require('../middleware/upload');
const { scanQR, submitForm } = require('../controllers/customerController');

router.get('/scan/:qr_id', scanQR);
router.post('/submit', upload.fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'bill_image', maxCount: 1 },
]), submitForm);

module.exports = router;
