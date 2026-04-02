const User = require('../models/User');
const { success, error } = require('../utils/apiResponse');

exports.register = async (req, res, next) => {
  try {
    const { name, phone, password, email, address, role } = req.body;
    if (!name || !phone || !password) {
      return error(res, 'Name, phone, and password are required', 400);
    }
    if (!['merchant', 'promoter'].includes(role)) {
      return error(res, 'Invalid role', 400);
    }
    const exists = await User.findOne({ phone });
    if (exists) return error(res, 'Phone number already registered', 400);

    const user = await User.create({ name, phone, password, email, address, role, status: 'active' });
    const token = user.getSignedToken();
    success(res, { user: { _id: user._id, name: user.name, phone: user.phone, role: user.role }, token }, 'Registration successful', 201);
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return error(res, 'Phone and password are required', 400);

    const user = await User.findOne({ phone }).select('+password');
    if (!user) return error(res, 'Invalid credentials', 401);
    if (!await user.matchPassword(password)) return error(res, 'Invalid credentials', 401);

    const token = user.getSignedToken();
    success(res, {
      user: { _id: user._id, name: user.name, phone: user.phone, role: user.role, avatar_url: user.avatar_url },
      token
    }, 'Login successful');
  } catch (err) { next(err); }
};

exports.getMe = async (req, res, next) => {
  try {
    success(res, { user: req.user });
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, address } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (address) updates.address = address;
    if (req.file) updates.avatar_url = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    success(res, { user });
  } catch (err) { next(err); }
};
