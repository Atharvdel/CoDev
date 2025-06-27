const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Actions');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000", 
      "https://syn-code-one.vercel.app"  // ✅ Removed trailing slash
    ],
    methods: ["GET", "POST"],
    credentials: true  // ✅ Added this for better CORS support
  }
});

// Store users by socketId, not globally
const userSocketMap = {}; // { socketId: username }
const roomLanguages = {};

function getAllConnectedClients(roomId) {
  const room = io.sockets.adapter.rooms.get(roomId);
  if (!room) return [];
  
  return Array.from(room).map(socketId => ({
    socketId,
    username: userSocketMap[socketId] || 'Anonymous'
  }));
}

// Check if username is already taken in a room
function isUsernameAvailable(roomId, username, excludeSocketId = null) {
  const clients = getAllConnectedClients(roomId);
  return !clients.some(client => 
    client.username === username && client.socketId !== excludeSocketId
  );
}

// ✅ Health check routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'SynCode Server is running!', 
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    console.log(`Join attempt: ${username} -> room ${roomId}`);
    
    // Check if username is already taken in this room
    if (!isUsernameAvailable(roomId, username)) {
      console.log(`Username ${username} already taken in room ${roomId}`);
      socket.emit('username_taken', { 
        message: `Username "${username}" is already taken in this room.` 
      });
      return;
    }

    // Store username for this specific socket
    userSocketMap[socket.id] = username;
    socket.join(roomId);

    // Initialize room language if not set
    if (!roomLanguages[roomId]) {
      roomLanguages[roomId] = 'javascript';
    }

    console.log(`${username} (${socket.id}) successfully joined room ${roomId}`);

    const clients = getAllConnectedClients(roomId);
    
    // ✅ Emit to the entire room (simpler approach)
    io.to(roomId).emit(ACTIONS.JOINED, {
      clients,
      username,
      socketId: socket.id,
      currentLanguage: roomLanguages[roomId],
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on('language_change', ({ roomId, language, username }) => {
    roomLanguages[roomId] = language;
    socket.in(roomId).emit('language_change', { language, username });
  });

  socket.on('disconnecting', () => {
    const username = userSocketMap[socket.id];
    const rooms = [...socket.rooms];
    
    console.log(`${username} (${socket.id}) disconnecting from rooms:`, rooms);
    
    rooms.forEach((roomId) => {
      if (roomId !== socket.id) { // Skip the socket's own room
        socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
          socketId: socket.id,
          username: username,
        });

        // Clean up room language if empty
        setTimeout(() => {
          const remainingClients = getAllConnectedClients(roomId);
          if (remainingClients.length === 0) {
            delete roomLanguages[roomId];
            console.log(`Cleaned up empty room: ${roomId}`);
          }
        }, 1000);
      }
    });
    
    // Clean up user data
    delete userSocketMap[socket.id];
    console.log(`${username} (${socket.id}) disconnected and cleaned up`);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ SynCode Server running on port ${PORT}`);
  console.log(`✅ CORS enabled for: http://localhost:3000, https://syn-code-one.vercel.app`);
});
