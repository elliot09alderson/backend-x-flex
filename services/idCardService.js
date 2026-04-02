const fs = require('fs');
const path = require('path');

const generateIdCardHTML = (promoter, user) => {
  return `<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 100%; max-width: 400px; margin: 0 auto; font-family: 'Segoe UI', Arial, sans-serif; }
  .card { width: 100%; aspect-ratio: 5/7; background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
    border-radius: 20px; padding: 30px; color: white; position: relative; overflow: hidden; }
  .card::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%); }
  .header { text-align: center; margin-bottom: 20px; position: relative; }
  .company { font-size: 22px; font-weight: 800; letter-spacing: 3px;
    background: linear-gradient(90deg, #e94560, #c23616); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .subtitle { font-size: 10px; letter-spacing: 2px; color: #888; margin-top: 4px; }
  .avatar-container { text-align: center; margin: 20px 0; }
  .avatar { width: 100px; height: 100px; border-radius: 50%; border: 3px solid #e94560;
    object-fit: cover; background: #333; }
  .info { margin-top: 15px; }
  .info-row { display: flex; justify-content: space-between; padding: 10px 0;
    border-bottom: 1px solid rgba(255,255,255,0.1); }
  .info-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
  .info-value { font-size: 14px; font-weight: 600; color: #fff; }
  .badge { text-align: center; margin-top: 20px; }
  .badge span { background: linear-gradient(90deg, #e94560, #c23616); padding: 6px 20px;
    border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 1px; }
  .footer { position: absolute; bottom: 15px; left: 0; right: 0; text-align: center;
    font-size: 9px; color: #555; }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <div class="company">X-FLEX PVT LTD</div>
    <div class="subtitle">OFFICIAL IDENTITY CARD</div>
  </div>
  <div class="avatar-container">
    <img class="avatar" src="${user.avatar_url || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23333%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2260%22 text-anchor=%22middle%22 fill=%22%23888%22 font-size=%2240%22>${user.name.charAt(0)}</text></svg>'}" alt="Avatar" />
  </div>
  <div class="info">
    <div class="info-row"><span class="info-label">Employee ID</span><span class="info-value">${promoter.employee_id}</span></div>
    <div class="info-row"><span class="info-label">Name</span><span class="info-value">${user.name}</span></div>
    <div class="info-row"><span class="info-label">Contact</span><span class="info-value">${user.phone}</span></div>
    <div class="info-row"><span class="info-label">Address</span><span class="info-value">${user.address || 'N/A'}</span></div>
  </div>
  <div class="badge"><span>${promoter.rank === 'area_manager' ? 'AREA MANAGER' : 'PROMOTER'}</span></div>
  <div class="footer">This card is the property of X-flex Pvt Ltd</div>
</div>
</body>
</html>`;
};

const generateIdCard = async (promoter, user) => {
  const html = generateIdCardHTML(promoter, user);
  const filename = `idcard-${promoter.employee_id}.html`;
  const filepath = path.join(__dirname, '..', 'uploads', filename);
  fs.writeFileSync(filepath, html);
  return `/uploads/${filename}`;
};

module.exports = { generateIdCard, generateIdCardHTML };
