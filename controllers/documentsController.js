const Document = require('../models/Document');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Upload document
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    if (!req.user || !req.user.id) return res.status(401).json({ success: false, message: 'User not authenticated' });

    // Optional: generate hash of file
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const doc = new Document({
      fileName: req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      uploadedBy: req.user.id,
      fileHash,
      status: 'pending',
    });

    await doc.save();

    res.json({
      success: true,
      documentId: doc._id,
      fileUrl: doc.fileUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};

// Get all documents for user
exports.getDocuments = async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ success: false, message: 'User not authenticated' });
    const docs = await Document.find({ uploadedBy: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, documents: docs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Fetch failed' });
  }
};

// Sign document
exports.signDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { signature } = req.body;

    if (!signature) return res.status(400).json({ success: false, message: 'No signature provided' });
    if (!req.user || !req.user.id) return res.status(401).json({ success: false, message: 'User not authenticated' });

    const doc = await Document.findOne({ _id: id, uploadedBy: req.user.id });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    const base64Data = signature.replace(/^data:image\/png;base64,/, '');
    const signedFileName = `signed-${Date.now()}-${doc._id}.png`;
    const signedFilePath = path.join(__dirname, '..', 'uploads', signedFileName);
    fs.writeFileSync(signedFilePath, base64Data, 'base64');

    doc.signedUrl = `/uploads/${signedFileName}`;
    doc.status = 'signed';
    await doc.save();

    res.json({ success: true, fileUrl: doc.signedUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Signing failed' });
  }
};
