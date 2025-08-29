const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    signedUrl: { type: String, default: null },
    status: { type: String, enum: ['pending', 'signed'], default: 'pending' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileHash: { type: String, default: null }, // optional
  },
  { timestamps: true }
);

// Optional: remove unique index if causing issues
// DocumentSchema.index({ uploadedBy: 1, fileHash: 1 }, { unique: true });

module.exports = mongoose.model('Document', DocumentSchema);
