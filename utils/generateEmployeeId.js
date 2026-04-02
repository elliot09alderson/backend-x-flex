const Promoter = require('../models/Promoter');

const generateEmployeeId = async () => {
  const last = await Promoter.findOne().sort({ createdAt: -1 }).select('employee_id');
  if (!last || !last.employee_id) return 'XFLX-0001';
  const num = parseInt(last.employee_id.split('-')[1]) + 1;
  return `XFLX-${String(num).padStart(4, '0')}`;
};

module.exports = generateEmployeeId;
