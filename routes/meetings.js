const express = require('express');
const router = express.Router();
const crypto = require('crypto'); // for unique meeting links
const Meeting = require('../models/Meeting');
const Availability = require('../models/Availability');
const auth = require('../middleware/auth');

// Add or Update Availability
router.post('/availability/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { date, slots } = req.body;
    if (!date || !slots || !Array.isArray(slots)) {
      return res.status(400).json({ msg: 'Invalid data' });
    }

    let availability = await Availability.findOne({ user: userId, date });
    if (availability) {
      slots.forEach((newSlot) => {
        const exists = availability.slots.some(
          (s) => s.start === newSlot.start && s.end === newSlot.end
        );
        if (!exists) availability.slots.push(newSlot);
      });
      await availability.save();
    } else {
      availability = new Availability({ user: userId, date, slots });
      await availability.save();
    }

    res.json({ msg: 'Availability saved', availability });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get Availability for a User
router.get('/availability/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const docs = await Availability.find({ user: userId }).select('-__v');
    res.json(docs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get My Meetings
router.get('/my', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const meetings = await Meeting.find({ participants: { $in: [userId] } })
      .populate('participants', 'email profile.name')
      .sort({ start: 1 });
    res.json(meetings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create a Meeting
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { participantId, slot, title } = req.body;

    if (!participantId || !slot?.start || !slot?.end || !title) {
      return res.status(400).json({ msg: 'Missing fields' });
    }

    const startDate = new Date(slot.start);
    const endDate = new Date(slot.end);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ msg: 'Invalid slot dates' });
    }

    // Check overlapping meetings
    const conflict = await Meeting.findOne({
      participants: { $in: [userId, participantId] },
      start: { $lt: endDate },
      end: { $gt: startDate },
    });

    if (conflict) return res.status(400).json({ msg: 'Slot already booked' });

    // Generate real Jitsi video call link
    const videoLink = `https://meet.jit.si/${crypto.randomUUID()}-${Date.now()}`;

    const meeting = new Meeting({
      title,
      start: startDate,
      end: endDate,
      participants: [userId, participantId],
      createdBy: userId,
      videoLink,
    });

    await meeting.save();
    await meeting.populate('participants', 'email profile.name');

    res.status(201).json({ msg: 'Meeting created', meeting });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
