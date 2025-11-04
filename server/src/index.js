import http from 'http';
import path from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';
import { fileURLToPath } from 'url';

import prisma from './lib/prisma.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';
import usersRoutes from './routes/users.js';
import { registerSocketHandlers, setIO } from './lib/socket.js';
import './jobs/dailySummary.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:3000'].filter(Boolean);
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ ok: true, name: 'TaskFlow API', version: '0.1.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', usersRoutes);

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: [process.env.CLIENT_URL, 'http://localhost:3000'].filter(Boolean),
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
