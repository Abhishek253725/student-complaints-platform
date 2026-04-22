const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// ✅ Allowed Origins (FIXED)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://student-complaints-platform.vercel.app', // ✅ YOUR REAL FRONTEND
  process.env.CLIENT_URL
].filter(Boolean);

// ✅ CORS middleware (FIXED & simplified)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.log('❌ CORS blocked:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// ✅ Socket.io (FIXED)
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// ✅ Routes (CORRECT)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/votes', require('./routes/votes'));
app.use('/api/ai', require('./routes/ai'));

// ✅ Socket connection
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

app.set('io', io);

// ✅ Test route
app.get('/', (req, res) => {
  res.json({ message: 'VoiceRank API running 🚀' });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});