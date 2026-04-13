const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { nanoid } = require('nanoid');

// Create a new room
router.post('/', async (req, res) => {
  try {
    const roomId = nanoid(8);
    const room = await Room.create({ roomId });
    res.status(201).json({ roomId: room.roomId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get room by ID
router.get('/:roomId', async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;