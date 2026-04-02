const router = require('express').Router();
const upload = require('../middleware/upload');
const { uploadImage } = require('../controllers/uploadController');

router.post('/image', upload.single('image'), uploadImage);

module.exports = router;
