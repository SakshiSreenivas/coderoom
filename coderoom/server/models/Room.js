const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: { type: String, unique: true },
  language: { type: String, default: 'javascript' },
  code: { type: String, default: '// Start coding together...\n' },
  createdAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', roomSchema);