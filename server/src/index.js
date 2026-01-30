import http from 'http';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import prisma from './lib/prisma.js';
import { registerSocketHandlers, setIO } from './lib/socket.js';
import './jobs/dailySummary.js';
import app from './app.js';

dotenv.config();

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: [
      process.env.CLIENT_URL,
      'http://localhost:3000',
      'https://taskflow-client.onrender.com',
      'https://task-flow-khyn.vercel.app'
    ].filter(Boolean),
    methods: ['GET', 'POST'],
  },
});

registerSocketHandlers(io);
setIO(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`TaskFlow API running on http://localhost:${PORT}`);
  } catch (err) {
    console.error('DB connection failed:', err.message);
  }
});
