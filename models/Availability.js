const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // ISO date string day boundary and slots in that day
    date: { type: String, required: true }, // e.g., '2025-08-20'
    slots: [
      {
        start: { type: String, required: true }, // 'HH:mm'
        end: { type: String, required: true },   // 'HH:mm'
      }
    ],
  },
  { timestamps: true }
);

AvailabilitySchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Availability', AvailabilitySchema);


