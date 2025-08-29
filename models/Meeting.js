const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema(
  {
    title: {
       type: String, 
       required: true 
      },
    start: { 
      type: Date, 
      required: true
     },
    end: { 
      type: Date, 
      required: true },
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['scheduled', 'cancelled', 'completed'],
      default: 'scheduled',
    },
    videoLink: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Meeting', MeetingSchema);


