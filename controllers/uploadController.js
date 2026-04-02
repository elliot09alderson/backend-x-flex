const { success, error } = require('../utils/apiResponse');

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return error(res, 'No file uploaded', 400);
    success(res, { url: `/uploads/${req.file.filename}` }, 'File uploaded');
  } catch (err) { next(err); }
};
