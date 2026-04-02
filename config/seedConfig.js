const SystemConfig = require('../models/SystemConfig');
const { defaults } = require('../services/configService');
const User = require('../models/User');

const seedConfig = async () => {
  for (const [key, value] of Object.entries(defaults)) {
    const exists = await SystemConfig.findOne({ key });
    if (!exists) {
      await SystemConfig.create({ key, value, description: key.replace(/_/g, ' ') });
    }
  }
  console.log('System config seeded');

  const adminExists = await User.findOne({ role: 'admin' });
  if (!adminExists) {
    await User.create({
      name: 'Admin',
      phone: '9999999999',
      password: 'admin123',
      role: 'admin',
      status: 'active',
    });
    console.log('Default admin created (phone: 9999999999, password: admin123)');
  }
};

module.exports = seedConfig;
