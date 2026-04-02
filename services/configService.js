const SystemConfig = require('../models/SystemConfig');

const defaults = {
  commission_percentage: 10,
  area_manager_promoter_target: 30,
  area_manager_shop_target: 200,
  promoter_registration_fee: 500,
  basic_plan_price: 1000,
  premium_plan_price: 2500,
  basic_plan_cap: 100,
  default_max_shops_per_promoter: 50,
};

const getConfig = async (key) => {
  const config = await SystemConfig.findOne({ key });
  if (config) return config.value;
  return defaults[key] || null;
};

const getAllConfigs = async () => {
  const configs = await SystemConfig.find();
  const result = { ...defaults };
  configs.forEach(c => { result[c.key] = c.value; });
  return result;
};

const setConfig = async (key, value, description, userId) => {
  return await SystemConfig.findOneAndUpdate(
    { key },
    { value, description, updated_by: userId },
    { upsert: true, new: true }
  );
};

module.exports = { getConfig, getAllConfigs, setConfig, defaults };
