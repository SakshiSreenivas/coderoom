const Room = require('../models/Room');

// In-memory room state
const rooms = new Map();

// Debounced save to MongoDB
const saveTimers = new Map();
const debouncedSave = (roomId) => {
  if (saveTimers.has(roomId)) clearTimeout(saveTimers.get(roomId));
  saveTimers.set(roomId, setTimeout(async () => {
    const room = rooms.get(roomId);
    if (room) {
      await Room.findOneAndUpdate(
        { roomId },
        { code: room.code, language: room.language, lastActiveAt: new Date() },
        { upsert: true }
      );
    }
  }, 2000));
};

// Random cursor colors
const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];
const getColor = (index) => COLORS[index % COLORS.length];

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join room
    socket.on('join-room', async ({ roomId, userName }) => {
      socket.join(roomId);

      // Load from DB if not in memory
      if (!rooms.has(roomId)) {
        const saved = await Room.findOne({ roomId });
        rooms.set(roomId, {
          code: saved?.code || '// Start coding together...\n',
          language: saved?.language || 'javascript',
          participants: []
        });
      }

      const room = rooms.get(roomId);

      // Add participant
      const participantIndex = room.participants.length;
      const participant = {
        socketId: socket.id,
        name: userName,
        color: getColor(participantIndex),
        cursor: null
      };
      room.participants.push(participant);

      // Send current state to joiner
      socket.emit('room-state', {
        code: room.code,
        language: room.language,
        participants: room.participants
      });

      // Tell everyone else
      socket.to(roomId).emit('participant-joined', participant);
      console.log(`${userName} joined room ${roomId}`);
    });

    // Code change
    socket.on('code-change', ({ roomId, code }) => {
      const room = rooms.get(roomId);
      if (room) room.code = code;
      socket.to(roomId).emit('code-updated', { code });
      debouncedSave(roomId);
    });

    // Cursor move
    socket.on('cursor-move', ({ roomId, cursor }) => {
      socket.to(roomId).emit('cursor-updated', {
        socketId: socket.id,
        cursor
      });
    });

    // Language change
    socket.on('language-change', ({ roomId, language }) => {
      const room = rooms.get(roomId);
      if (room) room.language = language;
      io.to(roomId).emit('language-updated', { language });
      debouncedSave(roomId);
    });

    // Typing indicator
    socket.on('typing-start', ({ roomId, name }) => {
      socket.to(roomId).emit('user-typing', { socketId: socket.id, name });
    });

    socket.on('typing-stop', ({ roomId }) => {
      socket.to(roomId).emit('user-stop-typing', { socketId: socket.id });
    });

    // Chat
    socket.on('send-chat', ({ roomId, message }) => {
      socket.to(roomId).emit('chat-message', message);
    });

    // Disconnect
    socket.on('disconnect', () => {
      rooms.forEach((room, roomId) => {
        const before = room.participants.length;
        room.participants = room.participants
          .filter(p => p.socketId !== socket.id);
        if (room.participants.length < before) {
          socket.to(roomId).emit('participant-left', { socketId: socket.id });
        }
      });
      console.log('User disconnected:', socket.id);
    });

  });
};