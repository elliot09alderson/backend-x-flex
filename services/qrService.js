const QRCodeLib = require('qrcode');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const generateQRImage = async (qrCodeId) => {
  const url = `${process.env.FRONTEND_URL}/scan/${qrCodeId}`;
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const filename = `qr-${qrCodeId}.png`;
  const filepath = path.join(uploadsDir, filename);

  await QRCodeLib.toFile(filepath, url, {
    width: 400,
    margin: 2,
    color: { dark: '#1a1a2e', light: '#ffffff' },
  });

  return `/uploads/${filename}`;
};

const generateUniqueCode = () => {
  return uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase();
};

module.exports = { generateQRImage, generateUniqueCode };
