'use strict';

const path = require('path');
const fs = require('fs');
const multer = require('multer');

const GHANA_CARD_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'ghana_cards');

// Ensure upload directory exists
if (!fs.existsSync(GHANA_CARD_UPLOAD_DIR)) {
  fs.mkdirSync(GHANA_CARD_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, GHANA_CARD_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    const timestamp = Date.now();
    cb(null, `${baseName}_${timestamp}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed'), false);
  }
  cb(null, true);
};

const uploadGhanaCard = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = {
  uploadGhanaCard,
};

