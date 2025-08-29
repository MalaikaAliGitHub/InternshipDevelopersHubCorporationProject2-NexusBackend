const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const {
  uploadDocument,
  getDocuments,
  signDocument,
} = require('../controllers/documentsController');

const router = express.Router();

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const allowedMimeTypes = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const fileFilter = (req, file, cb) => {
  allowedMimeTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error('File type not allowed'), false);
};

const upload = multer({ storage, fileFilter });

// Routes
router.post('/upload', auth, upload.single('file'), uploadDocument);
router.get('/', auth, getDocuments);
router.post('/sign/:id', auth, signDocument);

module.exports = router;
