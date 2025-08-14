// ====================================================
// --- File: server/socket.js (NEW FILE) ---
// ====================================================
const { Server } = require("socket.io");

let io;

const allowedOrigins = [
  "http://localhost:3000",
  "http://192.168.1.18:3000" // Add any other local network IPs you use
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"]
};

function initializeSocket(server) {
  io = new Server(server, {
    cors: corsOptions
  });

  io.on('connection', (socket) => {
    console.log('A user connected with socket id:', socket.id);
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

module.exports = { initializeSocket, getIO };
