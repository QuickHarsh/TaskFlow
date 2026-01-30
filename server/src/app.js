import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import messageRoutes from './routes/messages.js';
import notificationRoutes from './routes/notifications.js';
import usersRoutes from './routes/users.js';

const app = express();

const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:3000',
    'https://taskflow-client.onrender.com',
    'https://task-flow-khyn.vercel.app'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));

app.use(morgan('dev'));
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

export default app;
